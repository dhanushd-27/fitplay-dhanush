import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const { voucherCode } = await req.json();

        const session = await getServerSession(authOptions);

        if (!session || !session.user || session.user.role === "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session?.user?.id;

        if (!userId || !voucherCode) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const voucher = await prisma.voucher.findUnique({
            where: { code: voucherCode },
        });

        if (!voucher) {
            return NextResponse.json({ error: "Invalid voucher" }, { status: 404 });
        }

        if (voucher.expiryDate < new Date()) {
            return NextResponse.json({ error: "Voucher expired" }, { status: 410 });
        }

        const alreadyRedeemed = await prisma.voucherRedemption.findUnique({
            where: { userId_voucherId: { userId, voucherId: voucher.id } },
        });

        if (alreadyRedeemed) {
            return NextResponse.json(
                { error: "Voucher already redeemed" },
                { status: 409 }
            );
        }

        const userWallet = await prisma.wallet.findUnique({ where: { userId } });

        if (!userWallet) {
            return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
        }

        const newBalance = userWallet.balance + voucher.credits;

        const walletUpdate = prisma.wallet.update({
            where: { userId },
            data: { balance: newBalance },
        });

        const redemptionRecord = prisma.voucherRedemption.create({
            data: {
                userId,
                voucherId: voucher.id,
            },
        });

        const transactionRecord = prisma.transactionLedger.create({
            data: {
                userId,
                amount: voucher.credits,
                balanceAfterTxn: newBalance,
                transactionType: "CREDIT",
                modeOfPayment: "Credits",
                isCredit: true,
                walletId: userWallet.id,
            },
        });

        await prisma.$transaction([
            walletUpdate,
            redemptionRecord,
            transactionRecord,
        ]);

        return NextResponse.json({
            message: "Voucher redeemed successfully",
            balance: newBalance,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
