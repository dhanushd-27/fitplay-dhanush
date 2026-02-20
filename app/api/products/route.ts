import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { ProductCreateInputObjectSchema } from "@/lib/generated/zod/schemas";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN" || session.user.email !== process.env.ADMIN_EMAIL) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        if (!Array.isArray(body)) {
            return NextResponse.json({ error: "Expected an array of products" }, { status: 400 });
        }

        const createdProducts = [];

        for (const [idx, product] of body.entries()) {
            const parsed = ProductCreateInputObjectSchema.safeParse(product);
            if (!parsed.success) {
                console.error(`Product at index ${idx} failed validation:`, parsed.error.format());
                return NextResponse.json(
                    { error: `Product at index ${idx} failed validation`, details: parsed.error.format() },
                    { status: 400 }
                );
            }

            const created = await prisma.product.create({
                data: parsed.data
            });
            createdProducts.push(created);
        }

        return NextResponse.json({ success: true, products: createdProducts });
    } catch (err) {
        console.error("Error creating products:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(req.url);
        const sortBy = searchParams.get("sortBy") || "name";
        const sortOrder = searchParams.get("sortOrder") || "asc";

        // Define allowed sort fields for security
        const allowedSortFields = ["name", "price", "createdAt", "updatedAt"];
        const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "name";
        const safeSortOrder = sortOrder === "desc" ? "desc" : "asc";

        let products;

        if (!session || !session.user || session.user.role === "ADMIN") {
            products = await prisma.product.findMany({
                orderBy: {
                    [safeSortBy]: safeSortOrder,
                },
                include: {
                    variants: true,
                    vendor: {
                        select: {
                            name: true,
                        },
                    },
                    category: true,
                    subCategory: true,
                },
            });
        } else if (session.user.role === "EMPLOYEE") {
            const companyId = await prisma.user
                .findUnique({
                    where: { id: session.user.id },
                    select: { companyId: true },
                })
                .then((user) => user?.companyId);

            if (!companyId) {
                
                products = await prisma.product.findMany({
                    orderBy: {
                        [safeSortBy]: safeSortOrder,
                    },
                    include: {
                        variants: true,
                        vendor: {
                            select: {
                                name: true,
                            },
                        },
                        category: true,
                        subCategory: true,
                    },
                });
            } else {
                products = await prisma.product.findMany({
                    where: { companies: { some: { id: companyId } } },
                orderBy: {
                    [safeSortBy]: safeSortOrder,
                },
                include: {
                    variants: true,
                    vendor: {
                        select: {
                            name: true,
                        },
                    },
                    category: true,
                    subCategory: true,
                },
            });
        } }
        else if (session.user.role === "HR") {
            // HR users should see ALL products to manage visibility
            products = await prisma.product.findMany({
                orderBy: {
                    [safeSortBy]: safeSortOrder,
                },
                include: {
                    variants: true,
                    vendor: {
                        select: {
                            name: true,
                        },
                    },
                    category: true,
                    subCategory: true,
                    companies: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
        }
        return NextResponse.json({ message: "Products retrieved successfully", data: products });
    } catch (error) {
        return NextResponse.json({ message: "Error retrieving products", error }, { status: 500 });
    }
}
