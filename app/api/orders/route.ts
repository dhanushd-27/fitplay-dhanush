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

    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get("userId");
    const showDemoOnly = searchParams.get("demoOnly") === "true";

    const whereClause: any = {};

    // Authorization: determine which user's orders to fetch
    let targetUserId: string;
    
    if (session.user.role === "ADMIN" || session.user.role === "HR") {
      // Admin/HR can view specific user's orders if provided, otherwise their own
      targetUserId = userIdParam || session.user.id;
    } else {
      // Regular users can only view their own orders
      targetUserId = session.user.id;
    }

    whereClause.userId = targetUserId;

    // Only filter by isDemoOrder if explicitly requested via ?demoOnly=true
    // Otherwise, return ALL orders (both demo and real) for the user
    if (showDemoOnly) {
      whereClause.isDemoOrder = true;
    }

    // ✅ THIS WAS MISSING IN YOUR FILE
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const sanitizedOrders =
      session.user.role === "ADMIN"
        ? orders
        : orders.map(({ remarks, ...rest }) => rest);

    return NextResponse.json({ orders: sanitizedOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
