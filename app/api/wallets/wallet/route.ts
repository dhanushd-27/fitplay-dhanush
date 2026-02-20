import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) throw new Error("RESEND_API_KEY is not defined");
const resend = new Resend(resendApiKey);

// Add credits to a signle employee in a company
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "HR") || session.user.email !== process.env.ADMIN_EMAIL) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { userId, amount } = body;

        if (!userId || !amount) {
            return NextResponse.json({ error: "userId and amount are required" }, { status: 400 });
        }

        const wallet = await prisma.wallet.findUnique({
            where: { userId },
        });

        if (!wallet) {
            return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
        }

        const updatedWallet = await prisma.wallet.update({
            where: { id: wallet.id },
            data: { balance: wallet.balance + amount },
        });

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        await resend.emails.send({
            from: "no-reply@fitplaysolutions.com",
            to: user.email,
            subject: "Wallet Updated Successfully",
            html: `<p>Credits have been added to your wallet successfully. New balance: ${updatedWallet.balance} credits.</p>`,
        });

        return NextResponse.json({ message: "Wallet updated successfully", wallet: updatedWallet });
    } catch (error) {
        return NextResponse.json({ error: "Can't update wallet", details: (error as Error).message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "HR") || session.user.email !== process.env.ADMIN_EMAIL) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = req.nextUrl.searchParams.get("userId");
        if (!userId) {
            return NextResponse.json({ error: "userId is required" }, { status: 400 });
        }

        const employee = await prisma.user.findUnique({
            where: { id: userId },
            include: { wallet: true },
        });

        if (!employee) {
            return NextResponse.json({ error: "No employee found" }, { status: 404 });
        }

        const wallet = employee.wallet;
        if (!wallet) {
            return NextResponse.json({ error: "No wallet found for this employee" }, { status: 404 });
        }

        return NextResponse.json({ wallet });
    } catch (error) {
        return NextResponse.json({ error: "Can't fetch wallet", details: (error as Error).message }, { status: 500 });
    }
}