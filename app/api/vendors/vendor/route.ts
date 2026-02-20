import { VendorCreateInputObjectSchema, VendorUpdateInputObjectSchema } from "@/lib/generated/zod/schemas";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@/lib/generated/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }
        const body = await req.json();

        // Validate input with Zod
        const parsed = VendorCreateInputObjectSchema.parse(body);

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(parsed.password, 10);

        const vendor = await prisma.vendor.create({
            data: {
                ...parsed,
                password: hashedPassword,
            },
        });

        return new NextResponse(JSON.stringify(vendor), {
            status: 201,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: any) {
        console.error("Error creating vendor:", error);

        if (error.name === "ZodError") {
            return new NextResponse(JSON.stringify({ error: error.errors }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                // Unique constraint violation
                return new NextResponse(
                    JSON.stringify({ error: "Vendor with this email or phone already exists" }),
                    { status: 409, headers: { "Content-Type": "application/json" } }
                );
            }
        }

        return new NextResponse(JSON.stringify({ error: "Failed to create vendor" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }
        const vendorId = req.nextUrl.searchParams.get('vendorId');
        if (!vendorId) {
            return new NextResponse(JSON.stringify({ error: "Vendor ID is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const vendor = await prisma.vendor.findUnique({
            where: { id: vendorId },
        });

        if (!vendor) {
            return new NextResponse(JSON.stringify({ error: "Vendor not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new NextResponse(JSON.stringify(vendor), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error fetching vendor:", error);
        return new NextResponse(JSON.stringify({ error: "Failed to fetch vendor" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        const vendorId = req.nextUrl.searchParams.get('vendorId');
        if (!vendorId) {
            return new NextResponse(JSON.stringify({ error: "Vendor ID is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const vendor = await prisma.vendor.delete({
            where: { id: vendorId },
        });

        return new NextResponse(JSON.stringify(vendor), {
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

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }
        
        const vendorId = req.nextUrl.searchParams.get('vendorId');
        if (!vendorId) {
            return new NextResponse(JSON.stringify({ error: "Vendor ID is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const body = await req.json();
        // Validate input with Zod
        const parsed = VendorUpdateInputObjectSchema.parse(body);
        if (parsed.password) {
            throw new Error("Password update is not allowed through this endpoint");
        }

        const vendor = await prisma.vendor.update({
            where: { id: vendorId },
            data: parsed,
        });

        return new NextResponse(JSON.stringify(vendor), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: any) {
        console.error("Error updating vendor:", error);

        if (error.name === "ZodError") {
            return new NextResponse(JSON.stringify({ error: error.errors }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }
    } return new NextResponse(JSON.stringify({ error: "Failed to update vendor" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
    });
}