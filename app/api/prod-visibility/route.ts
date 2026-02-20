import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "HR") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { productId, visible } = await req.json();

    if (!productId || typeof visible !== "boolean") {
      return NextResponse.json(
        { error: "productId and visible flag are required" },
        { status: 400 }
      );
    }

    const companyId = session.user.companyId;

    if (!companyId) {
      return NextResponse.json(
        { error: "HR does not belong to a company" },
        { status: 400 }
      );
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        companies: visible
          ? { connect: { id: companyId } }
          : { disconnect: { id: companyId } },
      },
      include: { companies: true },
    });

    return NextResponse.json({
      message: "Company visibility updated successfully",
      product: updated,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
