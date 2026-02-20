import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { type, amount, reason } = await request.json();
    const resolvedParams = await params;
    const userId = resolvedParams.id;

    if (!type || !amount || !reason || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }

    // Get current wallet
    const currentWallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!currentWallet) {
      return NextResponse.json(
        { error: "Wallet not found" },
        { status: 404 }
      );
    }

    // Calculate new balance
    let newBalance;
    if (type === 'ADD') {
      newBalance = currentWallet.balance + amount;
    } else if (type === 'REMOVE') {
      newBalance = Math.max(0, currentWallet.balance - amount); // Don't allow negative balance
    } else {
      return NextResponse.json(
        { error: "Invalid transaction type" },
        { status: 400 }
      );
    }


    // Update wallet and create transaction record
    const [updatedWallet] = await prisma.$transaction([
      prisma.wallet.update({
        where: { userId },
        data: { balance: newBalance },
      }),
      prisma.transactionLedger.create({
        data: {
          userId,
          walletId: currentWallet.id,
          balanceAfterTxn: newBalance,
          amount: amount,
          modeOfPayment: 'Credits',
          transactionType: 'CREDIT',
          isCredit: type === 'ADD',
        },
      }),
    ]);

    return NextResponse.json({
      message: `Credits ${type === 'ADD' ? 'added' : 'removed'} successfully`,
      wallet: updatedWallet,
    });
  } catch (error) {
    console.error("Error updating credits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}