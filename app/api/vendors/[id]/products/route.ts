import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id: string | undefined;
  
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const resolvedParams = await params;
    id = resolvedParams.id;

    // Validate and clean the ID (prevent duplication issues)
    if (!id || typeof id !== 'string') {
      return new NextResponse(JSON.stringify({ message: "Invalid vendor ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Log the ID for debugging

    // Get vendor with products and order data
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            orderItems: {
              include: {
                order: {
                  select: {
                    id: true,
                    createdAt: true,
                    amount: true,
                    status: true
                  }
                }
              }
            },
            category: true,
            subCategory: true,
          }
        }
      }
    });

    if (!vendor) {
      return new NextResponse(JSON.stringify({ message: "Vendor not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Transform products to include order statistics
    const productsWithStats = vendor.products.map(product => {
      const orders = product.orderItems.map(item => item.order);
      const uniqueOrders = new Set(orders.map(order => order.id));
      const totalOrders = uniqueOrders.size;
      const totalRevenue = product.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const totalQuantitySold = product.orderItems.reduce((sum, item) => sum + item.quantity, 0);

      // Get the first image from the images array
      const imageUrl = product.images && product.images.length > 0 ? product.images[0] : null;

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.variants?.[0]?.mrp || 0, // Use variant price or 0
        originalPrice: product.variants?.[0]?.mrp || 0,
        category: product.category?.name || 'Uncategorized', // Category is enum in schema
        imageUrl: imageUrl,
        status: 'ACTIVE', // Default status since not in schema
        stock: product.availableStock || 0,
        createdAt: product.createdAt,
        totalOrders,
        totalRevenue,
        totalQuantitySold
      };
    });

    return new NextResponse(JSON.stringify({
      vendor: {
        id: vendor.id,
        name: vendor.name,
        email: vendor.email
      },
      products: productsWithStats,
      totalProducts: productsWithStats.length
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching vendor products:", error);
    console.error("Full error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      vendorId: id || 'unknown'
    });
    
    // Check if it's a database connection error
    const isDbConnectionError = error instanceof Error && 
      (error.message.includes("Can't reach database server") || 
       error.message.includes("database server") ||
       error.message.includes("connection"));
    
    return new NextResponse(JSON.stringify({ 
      error: isDbConnectionError ? "Database connection error" : "Failed to fetch vendor products",
      details: error instanceof Error ? error.message : 'Unknown error',
      isConnectionError: isDbConnectionError
    }), {
      status: isDbConnectionError ? 503 : 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}