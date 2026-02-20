import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all users with their wallets and companies
    const users = await prisma.user.findMany({
      include: {
        wallet: true,
        company: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get stats
    const stats = {
      total: users.length,
      hr: users.filter(user => user.role === "HR").length,
      employees: users.filter(user => user.role === "EMPLOYEE").length,
      verified: users.filter(user => user.verified).length,
    };

    return NextResponse.json({
      users,
      stats,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name, email, phone, password, role, companyId, gender, address, isDemo } = await request.json();

    // Validate required fields - companyId is not required for demo users
    if (!name || !email || !phone || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // If not a demo user, companyId is required
    if (!isDemo && !companyId) {
      return NextResponse.json(
        { error: "companyId is required for non-demo users" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phone },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or phone already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // If creating a demo user, enforce role as EMPLOYEE and mark isDemo
    const createData: any = {
      name,
      email,
      phone,
      password: hashedPassword,
      role: isDemo ? "EMPLOYEE" : role,
      companyId: isDemo ? null : companyId,
      gender: gender || null,
      address: address || null,
      verified: true, // Admin-created users are automatically verified
      isDemo: isDemo || false,
    };

    // Create user and wallet atomically, with 10,000 credits for demo users
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: createData,
        include: {
          company: {
            select: {
              name: true,
            },
          },
        },
      });

      // Create wallet for the user with 10,000 credits if demo user, else 0
      const walletBalance = isDemo ? 10000 : 0;
      const wallet = await tx.wallet.create({
        data: {
          userId: newUser.id,
          balance: walletBalance,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        },
      });

      // If demo user with initial credits, create a transaction ledger entry
      if (isDemo && walletBalance > 0) {
        await tx.transactionLedger.create({
          data: {
            userId: newUser.id,
            walletId: wallet.id,
            amount: walletBalance,
            modeOfPayment: "Credits",
            isCredit: true,
            transactionType: "CREDIT",
            isDemo: true,
            remark: "Initial demo account credits",
          },
        });
      }

      return newUser;
    });

    // Fetch user with wallet included
    const userWithWallet = await prisma.user.findUnique({
      where: { id: result.id },
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
      message: "User created successfully",
      user: userWithWallet,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}