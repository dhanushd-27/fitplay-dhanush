import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

function normalize(value: any) {
  return typeof value === "string" ? value : value?.name;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      include: {
        vendor: true,
        variants: true,
        category: true,
        subCategory: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    const {
      name,
      sku,
      availableStock,
      category,
      subCategory,
      vendorId,
      vendorName,
      variants,
      images,
      ...rest
    } = body;


    if (!name || !sku || availableStock === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: name, sku, availableStock" },
        { status: 400 }
      );
    }

    // Check if SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: `Product with SKU "${sku}" already exists. Please use a different SKU.` },
        { status: 400 }
      );
    }

    // Resolve vendor
    let finalVendorId = vendorId?.trim();
    if (!finalVendorId && vendorName) {
      const vendor = await prisma.vendor.findFirst({
        where: { name: vendorName.trim() },
      });
      if (!vendor) {
        return NextResponse.json(
          { error: `Vendor '${vendorName}' not found` },
          { status: 400 }
        );
      }
      finalVendorId = vendor.id;
    }

    // Resolve category and subcategory
    let categoryId = null;
    let subCategoryId = null;

    if (category) {
      // Find or create category
      let categoryRecord = await prisma.category.findFirst({
        where: { name: category },
      });
      
      if (!categoryRecord) {
        categoryRecord = await prisma.category.create({
          data: { name: category },
        });
      }
      categoryId = categoryRecord.id;

      // Find or create subcategory if provided
      if (subCategory) {
        let subCategoryRecord = await prisma.subCategory.findFirst({
          where: { 
            name: subCategory,
            categoryId: categoryId,
          },
        });
        
        if (!subCategoryRecord) {
          subCategoryRecord = await prisma.subCategory.create({
            data: { 
              name: subCategory,
              categoryId: categoryId,
            },
          });
        }
        subCategoryId = subCategoryRecord.id;
      }
    }

    const createData = {
      name,
      sku,
      availableStock: parseInt(availableStock),
      categoryId: categoryId,
      subCategoryId: subCategoryId,
      vendorId: finalVendorId || null,
      images: images || [],
      variants: variants?.length ? { create: variants } : undefined,
      ...rest,
    };
    

    const created = await prisma.product.create({
      data: createData,
      include: {
        vendor: true,
        variants: true,
        category: true,
        subCategory: true,
      },
    });

    return NextResponse.json(
      { message: "Product created successfully", product: created },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Error creating product:", err);
    
    // Handle Prisma unique constraint errors
    if (err.code === 'P2002') {
      const field = err.meta?.target?.[0] || 'field';
      return NextResponse.json(
        { error: `Product with this ${field} already exists. Please use a different ${field}.` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create product", details: String(err) },
      { status: 500 }
    );
  }
}


// ---------------- PATCH -------------------

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, category, subCategory, vendorId, vendorName, variants, ...rest } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const updateData: any = { ...rest };

    // Vendor handling
    let finalVendorId = vendorId?.trim();
    if (!finalVendorId && vendorName) {
      const vendor = await prisma.vendor.findFirst({
        where: { name: vendorName.trim() },
      });
      if (vendor) finalVendorId = vendor.id;
    }

    if (finalVendorId) {
      updateData.vendorId = finalVendorId;
    }

    // Category handling (relational fields)
    if (category !== undefined) {
      let categoryRecord = await prisma.category.findFirst({
        where: { name: category },
      });
      
      if (!categoryRecord) {
        categoryRecord = await prisma.category.create({
          data: { name: category },
        });
      }
      updateData.categoryId = categoryRecord.id;
    }

    if (subCategory !== undefined && category) {
      // Get the category ID first
      const categoryRecord = await prisma.category.findFirst({
        where: { name: category },
      });
      
      if (categoryRecord) {
        let subCategoryRecord = await prisma.subCategory.findFirst({
          where: { 
            name: subCategory,
            categoryId: categoryRecord.id,
          },
        });
        
        if (!subCategoryRecord) {
          subCategoryRecord = await prisma.subCategory.create({
            data: { 
              name: subCategory,
              categoryId: categoryRecord.id,
            },
          });
        }
        updateData.subCategoryId = subCategoryRecord.id;
      }
    }

    // Handle variants properly
    if (variants !== undefined) {
      updateData.variants = variants;
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        vendor: true,
        variants: true,
        category: true,
        subCategory: true,
      },
    });

    return NextResponse.json({ 
      message: "Product updated successfully", 
      product: updated 
    });
  } catch (err: any) {
    console.error("Error updating product:", err);
    return NextResponse.json(
      { error: "Failed to update product", details: String(err) },
      { status: 500 }
    );
  }
}


// ---------------- DELETE -------------------

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = new URL(req.url).searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Product deletion error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}
