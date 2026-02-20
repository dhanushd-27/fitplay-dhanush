import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, name, email, phone } = body;
    const amountPaise = Math.max(Math.floor(Number(amount) * 100), 0);
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
        receipt: `guest_order_${Date.now()}`,
        payment_capture: 1,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: "Failed to create Razorpay order", details: text }, { status: 500 });
    }

    const razorpayOrder = await res.json();

    const cash = await prisma.cashPayment.create({
      data: {
        amount: amountPaise,
        paymentStatus: razorpayOrder.status,
        razorpayOrderId: razorpayOrder.id,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        attempts: razorpayOrder.attempts,
        createdAtRazorpay: new Date(razorpayOrder.created_at * 1000),
      },
    });

    return NextResponse.json({
      amount: razorpayOrder.amount,
      razorpayOrderId: razorpayOrder.id,
      currency: razorpayOrder.currency,
      key: keyId,
      cashId: cash.id,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error", details: (error as Error).message }, { status: 500 });
  }
}
