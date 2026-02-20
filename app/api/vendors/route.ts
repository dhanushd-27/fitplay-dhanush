import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }
        const vendors = await prisma.vendor.findMany({
            include: {
                products: {
                    include: {
                        category: true,
                        orderItems: {
                            include: {
                                order: true
                            }
                        }
                    }
                }
            }
        });
        
        // Transform data to include product count, orders, revenue, and categories
        const vendorsWithCount = vendors.map(vendor => {
            const orderItems = vendor.products.flatMap(product => product.orderItems);
            const uniqueOrders = new Set(orderItems.map(item => item.order.id));
            const totalOrders = uniqueOrders.size;
            const totalRevenue = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            // Get unique categories from vendor's products
            const categories = [...new Set(vendor.products
                .filter(product => product.category)
                .map(product => product.category!.name)
            )];
            
            return {
                ...vendor,
                productCount: vendor.products.length,
                totalOrders,
                totalRevenue,
                categories: categories,
                primaryCategory: categories[0] || "General",
                products: vendor.products.length // Don't send full product data for performance
            };
        });
        
        return new NextResponse(JSON.stringify(vendorsWithCount), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error fetching vendors:", error);
        return new NextResponse(JSON.stringify({ error: "Failed to fetch vendors" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

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
        const { name, category, email, phone, website, integrationType, description } = body;

        // Validate required fields
        if (!name || !email) {
            return new NextResponse(JSON.stringify({ message: "Name and email are required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Check if phone already exists (since it's unique)
        if (phone) {
            const existingVendorWithPhone = await prisma.vendor.findUnique({
                where: { phone }
            });
            if (existingVendorWithPhone) {
                return new NextResponse(JSON.stringify({ message: "Phone number already exists" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                });
            }
        }

        // Generate a temporary password
        const hashedPassword = await bcrypt.hash('temp-password', 12);

        // Create vendor (only with fields that exist in the schema)
        const vendor = await prisma.vendor.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone: phone || `temp-${Date.now()}`, // Generate temp phone if not provided
            }
        });

        return new NextResponse(JSON.stringify(vendor), {
            status: 201,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error creating vendor:", error);
        return new NextResponse(JSON.stringify({ error: "Failed to create vendor" }), {
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

        const body = await req.json();
        const { id, status, name, category, email, phone, website, integrationType } = body;

        if (!id) {
            return new NextResponse(JSON.stringify({ message: "Vendor ID is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Update vendor
        const vendor = await prisma.vendor.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(name && { name }),
                ...(category && { category }),
                ...(email && { email }),
                ...(phone && { phone }),
                ...(website && { website }),
                ...(integrationType && { integrationType }),
            },
            include: {
                products: true
            }
        });

        return new NextResponse(JSON.stringify(vendor), {
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