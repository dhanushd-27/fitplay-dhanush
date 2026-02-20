import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const secret = req.headers.get("CRON_SECRET");
        if (secret !== process.env.CRON_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Calculate the cutoff time (24 hours ago)
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Delete wallets first (due to foreign key constraint)
        const deleted = await prisma.wallet.deleteMany({
            where: {
                user: {
                    claimed: false,
                    createdAt: { lt: cutoff },
                },
            },
        });

        // Then delete users
        const deletedUsers = await prisma.user.deleteMany({
            where: {
                claimed: false,
                createdAt: { lt: cutoff },
            },
        });
        return NextResponse.json({ 
            message: `Deleted ${deletedUsers.count} unclaimed users and ${deleted.count} wallets`,
            deletedUsers: deletedUsers.count,
            deletedWallets: deleted.count
        });
    } catch (error) {
        console.error("Cron job error:", error);
        const message =
            error instanceof Error ? error.message : typeof error === "string" ? error : "Couldn't Delete Unclaimed Users";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
