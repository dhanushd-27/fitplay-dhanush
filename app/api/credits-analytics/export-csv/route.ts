import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        if (session.user.role !== "HR")
            return NextResponse.json({ error: "HR access only" }, { status: 403 });

        const { searchParams } = new URL(request.url);
        const fromDate = searchParams.get("fromDate");
        const toDate = searchParams.get("toDate");
        const period = searchParams.get("period") || "30d";

        const hr = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { companyId: true }
        });

        if (!hr?.companyId)
            return NextResponse.json({ error: "HR company not found" }, { status: 400 });

        return exportTransactions(hr.companyId, fromDate, toDate, period);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to export transactions" }, { status: 500 });
    }
}

async function buildDateFilter(fromDate: string | null, toDate: string | null, period: string) {
    const dateFilter: any = {};
    if (fromDate) dateFilter.gte = new Date(fromDate);
    if (toDate) dateFilter.lte = new Date(toDate);

    if (!fromDate && !toDate) {
        const now = new Date();
        const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
        dateFilter.gte = new Date(now.getTime() - days * 86400000);
        dateFilter.lte = now;
    }
    return dateFilter;
}

async function exportTransactions(companyId: string, fromDate: string | null, toDate: string | null, period: string) {
    const dateFilter = await buildDateFilter(fromDate, toDate, period);

    const users = await prisma.user.findMany({
        where: { companyId },
        select: { id: true }
    });

    const userIds = users.map(u => u.id);

    const transactions = await prisma.transactionLedger.findMany({
        where: {
            userId: { in: userIds },
            isDemo: false,
            createdAt: dateFilter
        },
        include: {
            user: { select: { name: true, email: true } },
            order: true
        },
        orderBy: { createdAt: "desc" }
    });

    const data = transactions.map(t => ({
        TransactionID: t.id,
        User: t.user?.name || "N/A",
        Email: t.user?.email || "",
        Amount: t.amount,
        Credit: t.isCredit ? "Yes" : "No",
        Mode: t.modeOfPayment,
        Type: t.transactionType || "N/A",
        OrderLinked: t.order ? t.order.id : "None",
        Date: new Date(t.createdAt).toLocaleString()
    }));

    return buildExcel(data, "company-transactions");
}

function buildExcel(rows: any[], prefix: string) {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    const filename = `${prefix}_${new Date().toISOString().split("T")[0]}.xlsx`;

    return new NextResponse(buffer, {
        headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="${filename}"`
        }
    });
}
