import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const query = req.nextUrl.searchParams.get("query");

    if (!query || query.trim() === "") {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
    }

    let whereClause: any = {
      name: {
        contains: query.trim(),
        mode: "insensitive",
      },
    };

    // 🧠 If user is Employee or HR with company → filter by company
    // If paid user (no company) → search all products
    if (session && session.user && (session.user.role === "EMPLOYEE" || session.user.role === "HR")) {
      const companyId = await prisma.user
        .findUnique({
          where: { id: session.user.id },
          select: { companyId: true },
        })
        .then((user) => user?.companyId);

      // Only filter by company if they have one (org employees). Paid users see all products.
      if (companyId) {
        whereClause = {
          ...whereClause,
          companies: {
            some: {
              id: companyId,
            },
          },
        };
      }
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        variants: true,
        vendor: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!products || products.length === 0) {
      return NextResponse.json({ error: "No products found" }, { status: 404 });
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
