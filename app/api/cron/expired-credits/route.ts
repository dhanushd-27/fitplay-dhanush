import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) throw new Error("RESEND_API_KEY is not defined");
const resend = new Resend(resendApiKey);

export async function GET(req: NextRequest) {
    try {
        const secret = req.headers.get("CRON_SECRET");
        if (secret !== process.env.CRON_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const emailRecipients = await prisma.user.findMany({
            where: {
                wallet: {
                    expiryDate: {
                        lt: new Date(),
                    },
                },
            },
            select: {
                email: true,
            },
        });

        const expired = await prisma.wallet.updateMany({
            where: {
                expiryDate: {
                    lt: new Date(),
                },
            },
            data: {
                balance: 0,
            },
        });

        if (expired.count !== 0) {

            for (const recipient of emailRecipients) {
                await resend.emails.send({
                    from: "no-reply@fitplaysolutions.com",
                    to: recipient.email,
                    subject: "Expired Wallet Credits",
                    html: `<p>Your wallet's credits are expired</p>`,
                });
            }
        }
        return NextResponse.json({ message: `Expired ${expired.count} wallet credits` });

    } catch (error) {
        const message =
            error instanceof Error ? error.message : typeof error === "string" ? error : "Couldn't delete expired credits";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}