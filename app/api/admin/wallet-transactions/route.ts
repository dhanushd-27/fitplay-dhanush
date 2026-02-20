import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "ADMIN" && session.user.role !== "HR") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const companyId = searchParams.get("companyId");

        // Build where clause - exclude demo transactions
        const where: any = {
            isDemo: false,
        };
        if (userId) {
            where.userId = userId;
        }
        if (companyId) {
            where.user = {
                companyId: companyId,
            };
        }

        const transactions = await prisma.transactionLedger.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        company: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                order: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Transform the data to match the expected format
        const transformedTransactions = transactions.map((transaction) => {
            // Determine transaction type based on isCredit and modeOfPayment
            let type = "credit_redemption";
            let description = "";
            let method = transaction.modeOfPayment.toLowerCase();

            const cashRupees = transaction.cashAmount ? transaction.cashAmount: 0;

            if (transaction.isCredit) {
                if (transaction.modeOfPayment === "Credits") {
                    type = "credit_allocation";
                    description = "Credits allocated to wallet";
                    method = "bulk_allocation";
                } else {
                    type = "credit_purchase";
                    description = `Purchased ${transaction.amount} credits`;
                }
            } else {
                if (transaction.order) {
                    type = "credit_redemption";
                    description = "Redeemed credits for order";
                } else if (transaction.cashAmount && transaction.cashAmount > 0) {
                    type = "mixed_payment";
                    description = `Mixed payment: ${transaction.amount} credits + ₹${cashRupees}`;
                    method = "mixed";
                } else {
                    type = "inr_payment";
                    description = "INR payment for order";
                }
            }

            return {
                id: transaction.id,
                employee: {
                    name: transaction.user.name,
                    email: transaction.user.email,
                    company: transaction.user.company?.name || null,
                },
                amount: transaction.amount,
                cashAmount: cashRupees,
                type,
                description,
                date: transaction.createdAt.toISOString(),
                status: "completed", // All completed transactions
                orderId: transaction.order?.id || null,
                method,
            };
        });

        return NextResponse.json({
            transactions: transformedTransactions,
            total: transformedTransactions.length,
        });
    } catch (error) {
        console.error("Error fetching wallet transactions:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}