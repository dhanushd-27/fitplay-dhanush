import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const razorpay_payment_id = body.razorpay_payment_id;
    const razorpay_order_id = body.razorpay_order_id;
    const razorpay_signature = body.razorpay_signature;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return NextResponse.json({ error: "Missing Razorpay fields" }, { status: 400 });
    }

    // -------------------------------------------------------------------
    // 1️⃣ VERIFY SIGNATURE (VERY IMPORTANT)
    // -------------------------------------------------------------------
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

    if (expectedSignature !== razorpay_signature) {
        return NextResponse.json({ error: "Signature mismatch" }, { status: 400 });
    }

    // -------------------------------------------------------------------
    // 2️⃣ FETCH ORDER FROM OUR DB (WalletTopup)
    // -------------------------------------------------------------------
    const topup = await prisma.walletTopUp.findUnique({
        where: { razorpayOrderId: razorpay_order_id },
    });

    if (!topup) {
        return NextResponse.json({ error: "Topup record not found" }, { status: 404 });
    }

    // Prevent double-credit
    if (topup.status === "paid") {
        return NextResponse.json({ success: true, message: "Already verified" });
    }

    // -------------------------------------------------------------------
    // 3️⃣ VERIFY PAYMENT STATUS FROM RAZORPAY
    // -------------------------------------------------------------------
    const keyId = process.env.RAZORPAY_KEY_ID!;
    const keySecret = process.env.RAZORPAY_KEY_SECRET!;
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const paymentCheck = await fetch(
        `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
        {
            method: "GET",
            headers: { Authorization: `Basic ${auth}` },
        }
    );

    const paymentData = await paymentCheck.json();
    if (paymentData.status !== "captured") {
        return NextResponse.json(
            { error: "Payment not captured", status: paymentData.status },
            { status: 400 }
        );
    }

    // -------------------------------------------------------------------
    // 4️⃣ UPDATE WalletTopup → SUCCESS & CREDIT WALLET ATOMICALLY
    // -------------------------------------------------------------------
    const result = await prisma.$transaction(async (tx) => {
        // update topup status
        const updatedTopup = await tx.walletTopUp.update({
            where: { id: topup.id },
            data: {
                razorpayPaymentId: razorpay_payment_id,
                status: "paid",
            },
        });

        // find or create wallet
        let wallet = await tx.wallet.findUnique({
            where: { userId: session.user.id },
        });

        if (!wallet) {
            wallet = await tx.wallet.create({
                data: {
                    userId: session.user.id,
                    balance: 0,
                    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                },
            });
        }

        // create ledger entry
        const ledger = await tx.transactionLedger.create({
            data: {
                userId: session.user.id,
                amount: Math.round(topup.amount / 50),
                modeOfPayment: "Cash",
                isCredit: true,
                cashAmount: Math.round((topup.amount || 0) / 100),
                balanceAfterTxn: wallet.balance + Math.round(topup.amount / 50),  // since 1 INR = 2 Fitplay Coins
                transactionType: "CREDIT",
                walletId: wallet.id,
            },
        });

        // update wallet balance
        const updatedWallet = await tx.wallet.update({
            where: { id: wallet.id },
            data: { balance: wallet.balance + Math.round(topup.amount / 50) },
        });

        return { updatedTopup, ledger, updatedWallet };
    });

    // -------------------------------------------------------------------
    // 5️⃣ RETURN SUCCESS
    // -------------------------------------------------------------------
    return NextResponse.json({
        success: true,
        topupId: topup.id,
        paymentId: razorpay_payment_id,
        walletBalance: result.updatedWallet.balance,
    });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error", details: (error as Error).message }, { status: 500 });
    }
}
