import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, email, phone, status } = body;

    // Update vendor with all possible fields
    const updatedVendor = await prisma.vendor.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
      },
      include: {
        products: true
      }
    });

    return new NextResponse(JSON.stringify({
      ...updatedVendor,
      productCount: updatedVendor.products.length
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating vendor:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to update vendor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        const { id } = await params;

        // Check if vendor exists
        const vendor = await prisma.vendor.findUnique({
            where: { id },
            include: { products: true }
        });

        if (!vendor) {
            return new NextResponse(JSON.stringify({ message: "Vendor not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Check if vendor has products
        if (vendor.products.length > 0) {
            return new NextResponse(JSON.stringify({ 
                message: "Cannot delete vendor with existing products. Please reassign or delete products first." 
            }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Delete vendor
        await prisma.vendor.delete({
            where: { id }
        });

        return new NextResponse(JSON.stringify({ message: "Vendor deleted successfully" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error deleting vendor:", error);
        return new NextResponse(JSON.stringify({ error: "Failed to delete vendor" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}