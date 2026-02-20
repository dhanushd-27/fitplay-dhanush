import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || (session.user.role !== "HR")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const fromDate = searchParams.get("fromDate");
        const toDate = searchParams.get("toDate");
        const period = searchParams.get("period"); // "7", "30", "90"

        let startDate: Date | undefined;
        let endDate: Date | undefined;

        // Get HR user's company
        const hr = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { companyId: true },
        });

        if (!hr || !hr.companyId) {
            return NextResponse.json({ error: "HR user does not belong to any company" }, { status: 400 });
        }

        if (period) {
            const days = Number(period);
            if (![7, 30, 90].includes(days)) {
                return NextResponse.json({ error: "Invalid period" }, { status: 400 });
            }

            endDate = new Date();
            startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
        } else if (fromDate && toDate) {
            startDate = new Date(fromDate);
            endDate = new Date(toDate);
        }

        // Fetch all users under HR's company
        const users = await prisma.user.findMany({
            where: { companyId: hr.companyId },
            select: { id: true, name: true, email: true },
        });

        const userIds = users.map((u) => u.id);

        // Fetch all transactions for these users - exclude demo transactions
        const transactions = await prisma.transactionLedger.findMany({
            where: {
                userId: { in: userIds },
                isDemo: false,
                ...(startDate && endDate
                    ? { createdAt: { gte: startDate, lte: endDate } }
                    : {}),
            },
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: { name: true, email: true },
                },
            },
        });

        // Calculate credits used
        const creditsUsed = transactions
            .filter((t) => t.isCredit === true) // adjust if needed
            .reduce((sum, tx) => sum + tx.amount, 0);

        return NextResponse.json({
            companyId: hr.companyId,
            filters: {
                startDate: startDate ?? null,
                endDate: endDate ?? null,
            },
            stats: {
                totalUsers: users.length,
                creditsUsed,
            },
            transactions,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Something went wrong", details: err },
            { status: 500 }
        );
    }
}
