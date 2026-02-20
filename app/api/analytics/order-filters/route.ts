import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || (session.user.role !== "ADMIN" && session.user.role !== "HR")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const dateFrom = searchParams.get("dateFrom");
        const dateTo = searchParams.get("dateTo");
        const userId = searchParams.get("userId");

        const companyId =
            session.user.role === "HR"
                ? await prisma.user
                      .findUnique({
                          where: { id: session.user.id },
                          select: { companyId: true },
                      })
                      .then((u) => u?.companyId)
                : searchParams.get("companyId");

        const status = searchParams.get("status");
        const period = searchParams.get("period") || "30d";

        const dateFilter: { gte?: Date; lte?: Date } = {};
        if (dateFrom) dateFilter.gte = new Date(dateFrom);
        if (dateTo) dateFilter.lte = new Date(dateTo);

        if (!dateFrom && !dateTo) {
            const now = new Date();
            const daysBack =
                period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 30;
            dateFilter.gte = new Date(now.getTime() - daysBack * 86400000);
        }

        const orderFilters: any = {
            createdAt: dateFilter,
        };

        if (userId) orderFilters.userId = userId;
        if (status) orderFilters.status = status;
        if (session.user.role === "HR" && companyId) {
            // For HR, filter orders by users who belong to the HR's company
            orderFilters.user = {
                companyId: companyId
            };
        }

        const orders = await prisma.order.findMany({
            where: orderFilters,
            include: {
                user: { select: { id: true, name: true } },
                items: {
                    include: {
                        product: { select: { id: true, name: true, category: true } },
                        variant: { select: { id: true, variantCategory: true } },
                        
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        const isHR = session.user.role === "HR";

        if (isHR) {
            const analytics = {
                overview: {
                    totalOrders: orders.length,
                    totalRevenue: orders.reduce((sum, o) => sum + (o.amount || 0), 0),
                    averageOrderValue:
                        orders.length > 0
                            ? orders.reduce((sum, o) => sum + (o.amount || 0), 0) /
                              orders.length
                            : 0,
                },
                ordersByStatus: orders.reduce((acc: any, o: any) => {
                    acc[o.status] = (acc[o.status] || 0) + 1;
                    return acc;
                }, {}),
                revenueOverTime: generateTimeSeriesData(orders as any),
                topClients: getTopUsers(orders as any),
                topProducts: getTopProducts(orders as any),
                rawData: {
  orders: orders.map((o: any) => ({
    id: o.id,
    clientName: o.user?.name,
    status: o.status,
    amount: o.amount,
    createdAt: o.createdAt,
    itemCount: o.items?.length || 0,

    // ✅ SEND ITEMS TO FRONTEND
    items: o.items.map((item: any) => ({
      id: item.id,
      quantity: item.quantity,
      price: item.price,

      product: {
        id: item.product?.id,
        name: item.product?.name,
        image: item.product?.image || null,
      },

      variant: item.variant
        ? {
            id: item.variant.id,
            name: item.variant.variantCategory,
          }
        : null,
    })),
  })),
},

            };

            return NextResponse.json(analytics);
        }

        const inventory = await prisma.product.findMany({
            include: {
                companies: { select: { id: true, name: true } },
                category: true,
                subCategory: true,
            },
        });

        const inventoryDetails = await Promise.all(
            inventory.map(async (product) => {
                const variant = await prisma.variant.findFirst({
                    where: { productId: product.id },
                    orderBy: { mrp: "asc" },
                    select: { mrp: true },
                });
                return {
                    id: product.id,
                    name: product.name,
                    category: product.category?.name || "UNCATEGORIZED",
                    subCategory: product.subCategory?.name || "UNCATEGORIZED",
                    stockQuantity: product.availableStock,
                    unitPrice: variant?.mrp || 0,
                    companyNames: product.companies.map((c) => c.name).join(", "),
                };
            })
        );

        const analytics = {
            overview: {
                totalOrders: orders.length,
                totalRevenue: orders.reduce((sum, o) => sum + (o.amount || 0), 0),
                averageOrderValue:
                    orders.length > 0
                        ? orders.reduce((sum, o) => sum + (o.amount || 0), 0) /
                          orders.length
                        : 0,
                totalProducts: inventory.length,
                lowStockProducts: inventory.filter((p) => p.availableStock <= 10).length,
            },
            ordersByStatus: orders.reduce((acc: any, o: any) => {
                acc[o.status] = (acc[o.status] || 0) + 1;
                return acc;
            }, {}),
            revenueOverTime: generateTimeSeriesData(orders as any),
            topClients: getTopUsers(orders as any),
            topProducts: getTopProducts(orders as any),
            inventoryStatus: {
                inStock: inventory.filter((p) => p.availableStock > 10).length,
                lowStock: inventory.filter(
                    (p) => p.availableStock <= 10 && p.availableStock > 0
                ).length,
                outOfStock: inventory.filter((p) => p.availableStock === 0).length,
            },
            categoryDistribution: inventory.reduce((acc: any, p: any) => {
                const category = p.category?.name || "UNCATEGORIZED";
                acc[category] = (acc[category.name] || 0) + 1;
                return acc;
            }, {}),
           rawData: {
  orders: orders.map((o: any) => ({
    id: o.id,
    clientName: o.user?.name,
    status: o.status,
    amount: o.amount,
    createdAt: o.createdAt,
    itemCount: o.items?.length || 0,

    // ✅ SEND ITEMS TO FRONTEND
    items: o.items.map((item: any) => ({
      id: item.id,
      quantity: item.quantity,
      price: item.price,

      product: {
        id: item.product?.id,
        name: item.product?.name,
        image: item.product?.image || null,
      },

      variant: item.variant
        ? {
            id: item.variant.id,
            name: item.variant.variantCategory,
          }
        : null,
    })),
  })),
},

        };

        return NextResponse.json(analytics);
    } catch (error) {
        console.error("Analytics API error:", error);
        return NextResponse.json({ 
            message: "Internal Server Error", 
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}

function generateTimeSeriesData(orders: { createdAt: Date; amount: number }[]) {
    const dailyRevenue: any = {};
    orders.forEach((o) => {
        const date = new Date(o.createdAt).toISOString().split("T")[0];
        dailyRevenue[date] = (dailyRevenue[date] || 0) + (o.amount || 0);
    });
    return Object.entries(dailyRevenue)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, revenue]) => ({
            date,
            revenue,
            formattedDate: new Date(date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            }),
        }));
}

function getTopUsers(
    orders: { user: { id: string; name: string } | null; amount: number }[]
) {
    const userRevenue: any = {};
    orders.forEach((o) => {
        if (o.user) {
            const id = o.user.id;
            if (!userRevenue[id]) {
                userRevenue[id] = { name: o.user.name, revenue: 0, orderCount: 0 };
            }
            userRevenue[id].revenue += o.amount || 0;
            userRevenue[id].orderCount += 1;
        }
    });
    return Object.values(userRevenue)
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 10);
}

function getTopProducts(
    orders: { items: { product: { id: string; name: string }; quantity: number; price: number }[] }[]
) {
    const productSales: any = {};
    orders.forEach((o) => {
        o.items.forEach((item) => {
            if (item.product) {
                const id = item.product.id;
                if (!productSales[id]) {
                    productSales[id] = { name: item.product.name, quantity: 0, revenue: 0 };
                }
                productSales[id].quantity += item.quantity;
                productSales[id].revenue += item.quantity * item.price;
            }
        });
    });
    return Object.values(productSales)
        .sort((a: any, b: any) => b.quantity - a.quantity)
        .slice(0, 10);
}
