import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { createSaleOrder } from "../../orders/unicommerce";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) throw new Error("RESEND_API_KEY is not defined");
const resend = new Resend(resendApiKey);

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Demo users are not allowed to create paid orders
        if ((session.user as any).isDemo) {
            return NextResponse.json({ error: "Demo users cannot create orders/payments" }, { status: 403 });
        }

        const body = await req.json();
        const {
            items,
            userId: requestedUserId,
            phNumber: providedPhNumber,
            address: providedAddress,
            address2: providedAddress2,
            city: providedCity,
            state: providedState,
            pincode: providedPincode,
            deliveryInstructions,
            remarks,
        } = body;

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
        // 2️⃣ FETCH ORDER FROM OUR DB (CashPayment)
        // -------------------------------------------------------------------
        const cashPayment = await prisma.cashPayment.findUnique({
            where: { razorpayOrderId: razorpay_order_id },
        });

        if (!cashPayment) {
            return NextResponse.json({ error: "CashPayment record not found" }, { status: 404 });
        }

        // Prevent double-credit
        if (cashPayment.paymentStatus === "paid") {
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

        // Create Order now that payment is verified

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "items are required" }, { status: 400 });
        }

        let userId: string;
        if (session.user.role === "ADMIN" || session.user.role === "HR") {
            userId = requestedUserId || session.user.id;
        } else {
            userId = session.user.id;
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { wallet: true },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        let finalPhNumber: string | null = null;
        let finalAddress: string | null = null;
        const finalDeliveryInstructions: string | null = deliveryInstructions ?? null;

        if (session.user.role === "ADMIN") {
            if (!providedPhNumber || !providedAddress) {
                return NextResponse.json(
                    { error: "Admin must provide phNumber and address" },
                    { status: 400 }
                );
            }
            finalPhNumber = providedPhNumber;
            finalAddress = providedAddress;
        } else {
            finalPhNumber = providedPhNumber || user.phone;
            finalAddress = providedAddress || user.address || null;
        }
        let totalAmount = 0;
        const orderItemsData: any[] = [];
        for (const item of items) {
            const variant = await prisma.variant.findUnique({
                where: { id: item.variantId },
                include: { product: true },
            });

            if (!variant || !variant.product) {
                return NextResponse.json(
                    { error: `Variant with id ${item.variantId} not found` },
                    { status: 404 }
                );
            }

            if ((variant.availableStock ?? 0) < item.quantity) {
                return NextResponse.json(
                    { error: `Not enough stock for variant ${variant.variantValue}` },
                    { status: 400 }
                );
            }

            const mrp = variant.mrp;
            const discountPercent = variant.product.discount ?? 0;
            const discountedPrice = Math.max(
                mrp - Math.floor((mrp * discountPercent) / 100),
                0
            );
            const lineTotal = discountedPrice * item.quantity;
            totalAmount += lineTotal;

            orderItemsData.push({
                productId: variant.product.id,
                variantId: variant.id,
                quantity: item.quantity,
                price: discountedPrice,
            });
        }

        const date = new Date();
        const yyyy = date.getFullYear().toString();
        const mm = (date.getMonth() + 1).toString().padStart(2, "0");
        const dd = date.getDate().toString().padStart(2, "0");
        // Use a per-user sequential 6-digit counter: first order -> 000001, then 000002, ...
        const userOrderCount = await prisma.order.count({ where: { userId: user.id } });
        const nextSeq = userOrderCount + 1;
        // ensure 6 digits padded with leading zeros
        const lastSix = nextSeq.toString().padStart(6, "0");
        const orderId = `FP-${yyyy}${mm}${dd}-${lastSix}`;

        const existingOrder = await prisma.order.findFirst({
            where: { id: orderId },
        });
        if (existingOrder) {
            return NextResponse.json(
                { error: "Order ID conflict, please try again" },
                { status: 500 }
            );
        }

        const userWallet = await prisma.wallet.findUnique({
            where: { userId: user.id },
        });

        if (!userWallet) {
            return NextResponse.json(
                { error: "User wallet not found" },
                { status: 404 }
            );
        }
        // --- Minimal transaction: create txn, order, decrement stock ---
        const txResult = await prisma.$transaction(async (tx) => {

            const transaction = await tx.transactionLedger.create({
                data: {
                    userId: user.id,
                    amount: totalAmount,
                    modeOfPayment: "Cash",
                    balanceAfterTxn: userWallet.balance,
                    isCredit: false,
                    transactionType: "PURCHASE",
                    walletId: userWallet.id,
                },
            });

            const order = await tx.order.create({
                data: {
                    id: orderId,
                    userId: user.id,
                    amount: totalAmount,
                    status: "PENDING",
                    transactionId: transaction.id,
                    phNumber: finalPhNumber,
                    address: providedAddress,
                    address2: providedAddress2,
                    city: providedCity,
                    state: providedState,
                    pinCode: providedPincode,
                    deliveryInstructions: finalDeliveryInstructions,
                    remarks: session.user.role === "ADMIN" ? remarks || null : null,
                    items: { create: orderItemsData },
                    isCashPayment: true,
                },
            });

            // decrement stock inside transaction
            for (const item of orderItemsData) {
                await tx.variant.update({
                    where: { id: item.variantId },
                    data: { availableStock: { decrement: item.quantity } },
                });
            }

            return { orderId: order.id };
        });

        // --- Re-fetch enriched order OUTSIDE transaction ---
        const enrichedOrder = await prisma.order.findUnique({
            where: { id: txResult.orderId },
            include: {
                items: {
                    include: {
                        product: { select: { name: true } },
                        variant: true,
                    },
                },
            },
        });

        if (!enrichedOrder) {
            // this should not happen, but guard anyway
            throw new Error("Order not found after creation");
        }

        // --- Build Unicommerce items payload ---
        const unicommerceItems = enrichedOrder.items.map((item: any, index: number) => ({
            variantSku: item.variant.sku,
            quantity: item.quantity,
            price: item.price,
        }));

        // --- Call Unicommerce OUTSIDE the transaction ---
        const resUnicommerce = await createSaleOrder(
            user.name,
            enrichedOrder.id,
            enrichedOrder.address ?? providedAddress ?? "",
            enrichedOrder.address2 ?? providedAddress2 ?? "",
            enrichedOrder.city ?? providedCity ?? "",
            enrichedOrder.state ?? providedState ?? "",
            enrichedOrder.pinCode ?? providedPincode ?? "",
            enrichedOrder.phNumber ?? finalPhNumber ?? "",
            user.email,
            unicommerceItems
        );

  

        if (resUnicommerce && resUnicommerce.successful === false) {
            console.error("Unicommerce order creation failed:", resUnicommerce);
            throw new Error("Unicommerce order creation failed");
        }

        // --- Prepare email using enrichedOrder (fresh) ---
        const orderSummaryTable = `
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
        <thead style="background-color: #f2f2f2;">
          <tr>
            <th align="left">Item</th>
            <th align="left">Variant</th>
            <th align="center">Qty</th>
            <th align="right">Price (Credits)</th>
            <th align="right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${enrichedOrder.items
                .map(
                    (item: any) => `
                <tr>
                  <td>${item.product.name}</td>
                  <td>${item.variant.variantValue}</td>
                  <td align="center">${item.quantity}</td>
                  <td align="right">${item.price}</td>
                  <td align="right">${item.price * item.quantity}</td>
                </tr>
              `
                )
                .join("")}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" align="right" style="font-weight: bold;">Grand Total</td>
            <td align="right" style="font-weight: bold;">${totalAmount} MRP</td>
          </tr>
        </tfoot>
      </table>
      <p><strong>Delivery Address:</strong> ${enrichedOrder.address ?? "Not Provided"}</p>
      <p><strong>Contact Number:</strong> ${enrichedOrder.phNumber ?? "Not Provided"}</p>
      ${finalDeliveryInstructions ? `<p><strong>Delivery Instructions:</strong> ${finalDeliveryInstructions}</p>` : ""}
    `;

        // --- Send email ---
        await resend.emails.send({
            from: "admin@fitplaysolutions.com",
            to: user.email,
            subject: "Order Summary - FitPlay Solutions",
            html: `
        <h2>Your Order Has Been Created Successfully!</h2>
        <p>Order ID: <strong>${enrichedOrder.id}</strong></p>
        ${orderSummaryTable}
        <p style="margin-top: 20px;">Thank you for your purchase! You can check your wallet and order history anytime in your account.</p>
      `,
        });

        // --- Return success response using enrichedOrder and updated wallet ---
        return NextResponse.json({
            message: "Order created successfully",
            order: enrichedOrder,
        });

    } catch (error) {
        return NextResponse.json(
            { error: "Can't create order", details: (error as Error).message },
            { status: 500 }
        );
    }
}
