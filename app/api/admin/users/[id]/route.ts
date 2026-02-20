import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function PATCH(
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

    const { name, email } = await request.json();
    const resolvedParams = await params;
    const userId = resolvedParams.id;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
      },
      include: {
        wallet: true,
        company: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const resolvedParams = await params;
    const userId = resolvedParams.id;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Delete user with transaction to handle related records
    await prisma.$transaction(async (tx) => {
      // Delete related records first
      await tx.voucherRedemption.deleteMany({
        where: { userId },
      });
      
      await tx.transactionLedger.deleteMany({
        where: { userId },
      });
      
      await tx.orderItem.deleteMany({
        where: {
          order: {
            userId,
          },
        },
      });
      
      await tx.order.deleteMany({
        where: { userId },
      });
      
      await tx.wallet.deleteMany({
        where: { userId },
      });

      await tx.walletTopUp.deleteMany({
        where: { userId },
      });
      
      // Finally delete the user
      await tx.user.delete({
        where: { id: userId },
      });
    });

    return NextResponse.json({
      message: "User deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    
    // Provide more specific error messages
    let errorMessage = "Internal server error";
    if (error?.code === "P2003") {
      errorMessage = "Cannot delete user due to existing references. Please remove related data first.";
    } else if (error?.code === "P2025") {
      errorMessage = "User not found or already deleted.";
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}