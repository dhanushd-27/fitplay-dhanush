import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
       
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Block demo users from wallet top-ups
    if ((session.user as any).isDemo) {
      return NextResponse.json({ error: "Demo users cannot top-up wallet" }, { status: 403 });
    }

    const { amount, isCash } = await req.json();
    const amountPaise = Math.max(Math.floor(amount * 100), 0);
    if (!amountPaise) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

    const keyId = process.env.RAZORPAY_KEY_ID!;
    const keySecret = process.env.RAZORPAY_KEY_SECRET!;
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const res = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            amount: amountPaise,
            currency: "INR",
            receipt: `order_rcptid_${Date.now()}`,
            payment_capture: 1
        }),
    });

    if (!res.ok) {
        const text = await res.text();
        return NextResponse.json({ error: "Failed to create Razorpay order", details: text }, { status: 500 });
    }

    const razorpayOrder = await res.json();
    let order;

    if (isCash) {
        order = await prisma.cashPayment.create({
            data: {
                amount: amountPaise,
                paymentStatus: razorpayOrder.status,
                razorpayOrderId: razorpayOrder.id,
                currency: razorpayOrder.currency,
                receipt: razorpayOrder.receipt,
                attempts: razorpayOrder.attempts,
                createdAtRazorpay: new Date(razorpayOrder.created_at * 1000),
            }
        })
    }
    else {
        order = await prisma.walletTopUp.create({
            data: {
                userId: session.user.id,
                razorpayOrderId: razorpayOrder.id,
                amount: amountPaise,
                currency: razorpayOrder.currency,
                receipt: razorpayOrder.receipt,
                status: razorpayOrder.status,
                attempts: razorpayOrder.attempts,
                createdAtRazorpay: new Date(razorpayOrder.created_at * 1000),
            },
        });
    }

    return NextResponse.json({
        order: order.id,
        amount: razorpayOrder.amount,
        razorpayOrderId: razorpayOrder.id,
        currency: razorpayOrder.currency,
        key: keyId,
    });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error", details: (error as Error).message }, { status: 500 });
    }
}
