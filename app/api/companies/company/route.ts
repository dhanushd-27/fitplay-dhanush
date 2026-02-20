import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma"


export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, id: userId } = session.user;

    const body = await req.json();
    const { companyId: bodyCompanyId, productIds } = body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: "productIds array is required" }, { status: 400 });
    }

    let companyId: string;

    if (role === "ADMIN") {
      if (!bodyCompanyId) {
        return NextResponse.json({ error: "companyId is required for Admin" }, { status: 400 });
      }
      companyId = bodyCompanyId;
    } else if (role === "HR") {
      const hrUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true },
      });

      if (!hrUser) {
        return NextResponse.json({ error: "HR user not found" }, { status: 404 });
      }

      companyId = hrUser.companyId;
    } else {
      return NextResponse.json({ error: "Only Admin or HR can select products" }, { status: 403 });
    }

    // ✅ Check if the company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { products: true },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // ✅ Filter out products already linked to avoid duplicates
    const existingProductIds = new Set(company.products.map((p) => p.id));
    const newProductIds = productIds.filter((pid: string) => !existingProductIds.has(pid));

    if (newProductIds.length === 0) {
      return NextResponse.json({ message: "No new products to add" }, { status: 200 });
    }

    // ✅ Connect products to company
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        products: {
          connect: newProductIds.map((pid: string) => ({ id: pid })),
        },
      },
      include: { products: true },
    });

    return NextResponse.json({
      message: "Products selected successfully",
      company: {
        id: updatedCompany.id,
        name: updatedCompany.name,
        products: updatedCompany.products,
      },
    });
  } catch (error) {
    console.error("Error selecting products:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500 }
    );
  }
}

