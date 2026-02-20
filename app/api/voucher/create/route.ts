import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { companyId, code, credits, description, expiryDate } = body;

        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;


        if (!code || !credits || !expiryDate) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const voucher = await prisma.voucher.create({
            data: {
                code,
                description: description || null,
                credits: Number(credits),         // <-- FIX
                expiryDate: new Date(expiryDate),
                companies: {
                    connect: { id: companyId },
                },
            }
        });

        return NextResponse.json({
            message: "Voucher created successfully",
            voucher,
        });

    } catch (err) {
        console.error("Voucher Create Error:", err); // <-- Log actual error
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const role = session.user.role;
        const userId = session.user.id;

        const voucherId = req.nextUrl.searchParams.get("voucherId");
        if (!voucherId) {
            return NextResponse.json({ error: "voucherId is required" }, { status: 400 });
        }
        let vouchers;

        if (role === "ADMIN") {
            vouchers = await prisma.voucher.findUnique({
                where: { id: voucherId },
            });

            return NextResponse.json({ vouchers });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { companyId: true },
        });

        if (!user?.companyId) {
            return NextResponse.json({ error: "User not assigned to a company" }, { status: 400 });
        }

        vouchers = await prisma.voucher.findUnique({
            where: { id: voucherId },
            include: { companies: true },
        });

        if (!vouchers) {
            return NextResponse.json({ error: "Voucher not found" }, { status: 404 });
        }

        const belongsToCompany = vouchers.companies?.some(c => c.id === user.companyId);

        if (!belongsToCompany) {
            return NextResponse.json({ error: "Unauthorized:Not for this company" }, { status: 403 });
        }

        return NextResponse.json({ vouchers });
    } catch (error) {
        // console.error("Voucher Fetch Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}   

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const voucherId = req.nextUrl.searchParams.get("voucherId");
    if (!voucherId) {
      return NextResponse.json({ error: "voucherId is required" }, { status: 400 });
    }

    const voucherExists = await prisma.voucher.findUnique({
      where: { id: voucherId },
    });

    if (!voucherExists) {
      return NextResponse.json({ error: "Voucher not found" }, { status: 404 });
    }

    // find companies that have this voucher in their products relation
    const companiesWithProduct = await prisma.company.findMany({
      where: { products: { some: { id: voucherId } } },
      select: { id: true },
    });

    // prepare individual update operations to disconnect the relation (updateMany doesn't allow relational ops)
    const companyUpdates = companiesWithProduct.map((c) =>
      prisma.company.update({
        where: { id: c.id },
        data: { products: { disconnect: { id: voucherId } } },
      })
    );

    await prisma.$transaction([
      prisma.voucherRedemption.deleteMany({
        where: { voucherId },
      }),
      // spread the individual company update operations into the transaction
      ...companyUpdates,
      prisma.voucher.update({
        where: { id: voucherId },
        data: { companies: { set: [] } },
      }),
      prisma.voucher.delete({
        where: { id: voucherId },
      }),
    ]);

    return NextResponse.json({ message: "Voucher deleted successfully" });
  } catch (error) {
    console.error("Voucher Delete Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { companyId, voucherId, code, credits, description, expiryDate } = body;

        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!voucherId) {
            return NextResponse.json({ error: "voucherId is required" }, { status: 400 });
        }

        const updateData: any = {};
        if (code) updateData.code = code;
        if (companyId) {
            updateData.companies = {
                connect: { id: companyId },
            };
        }
        if (credits) updateData.credits = Number(credits);
        if (description) updateData.description = description;
        if (expiryDate) updateData.expiryDate = new Date(expiryDate);

        const updatedVoucher = await prisma.voucher.update({
            where: { id: voucherId },
            data: updateData,
        });

        return NextResponse.json({
            message: "Voucher updated successfully",
            voucher: updatedVoucher,
        });

    } catch (error) {
        console.error("Voucher Update Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}