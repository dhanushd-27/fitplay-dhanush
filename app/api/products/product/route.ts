import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const requiredFields = ["name", "sku", "availableStock", "category", "description"];
    const missing = requiredFields.filter((f) => !body[f]);
    if (missing.length) {
      return NextResponse.json(
        { message: `Missing: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const {
      vendorName,
      vendorId,
      variants,
      category,
      subCategory,
      ...data
    } = body;

    let resolvedVendorId: string | null = null;

    if (vendorId) {
      resolvedVendorId = vendorId;
    } else if (vendorName) {
      const vendor = await prisma.vendor.findFirst({ where: { name: vendorName } });
      if (!vendor) {
        return NextResponse.json(
          { message: `Vendor '${vendorName}' not found` },
          { status: 400 }
        );
      }
      resolvedVendorId = vendor.id;
    }

    const categoryRecord = await prisma.category.findFirst({
      where: { name: category },
    });
    if (!categoryRecord) {
      return NextResponse.json(
        { message: `Category '${category}' not found` },
        { status: 400 }
      );
    }

    let resolvedSubCategoryId: string | null = null;

    if (subCategory) {
      const subRecord = await prisma.subCategory.findFirst({
        where: { name: subCategory, categoryId: categoryRecord.id },
      });

      if (!subRecord) {
        return NextResponse.json(
          { message: `Subcategory '${subCategory}' not valid in '${category}'` },
          { status: 400 }
        );
      }

      resolvedSubCategoryId = subRecord.id;
    }

    const created = await prisma.product.create({
      data: {
        ...data,
        vendorId: resolvedVendorId,
        categoryId: categoryRecord.id,
        subCategoryId: resolvedSubCategoryId,
        variants: Array.isArray(variants) && variants.length
          ? {
              create: variants.map((v: any) => ({
                variantCategory: v.variantCategory,
                variantValue: v.variantValue,
                mrp: v.mrp,
                sku: v.sku ?? null,
                credits: v.credits ?? null,
                availableStock: v.availableStock ?? null,
              })),
            }
          : undefined,
      },
      include: { vendor: true, category: true, subCategory: true, variants: true },
    });

    return NextResponse.json({ message: "Product created", data: created }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal Error", error: String(err) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");

    if (id) {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          variants: true,
          vendor: { select: { name: true } },
          category: true,
          subCategory: true,
        },
      });

      if (!product) return NextResponse.json({ message: "Not Found" }, { status: 404 });

      return NextResponse.json({ message: "Fetched", data: product });
    }

    const products = await prisma.product.findMany({
      include: {
        vendor: true,
        variants: true,
        category: true,
        subCategory: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ message: "Fetched", data: products });
  } catch (err) {
    return NextResponse.json({ message: "Fetch error", error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ message: "Product ID required" }, { status: 400 });

    await prisma.variant.deleteMany({ where: { productId: id } });
    const deleted = await prisma.product.delete({ where: { id } });

    return NextResponse.json({ message: "Deleted", data: deleted });
  } catch (err) {
    return NextResponse.json({ message: "Delete error", error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ message: "Product ID required" }, { status: 400 });
    }

    const {
      vendorName,
      vendorId,
      category,
      subCategory,
      variants,
      ...updateData
    } = body;

    let resolvedVendorId: string | null = vendorId || null;

    if (!resolvedVendorId && vendorName) {
      const vendor = await prisma.vendor.findFirst({ where: { name: vendorName } });
      if (!vendor) {
        return NextResponse.json(
          { message: `Vendor '${vendorName}' not found` },
          { status: 400 }
        );
      }
      resolvedVendorId = vendor.id;
    }

    let resolvedCategoryId: string | null = null;
    if (category) {
      const cat = await prisma.category.findFirst({ where: { name: category } });
      if (!cat) {
        return NextResponse.json(
          { message: `Category '${category}' not found` },
          { status: 400 }
        );
      }
      resolvedCategoryId = cat.id;
    }

    let resolvedSubCategoryId: string | null = null;
    if (subCategory && resolvedCategoryId) {
      const sub = await prisma.subCategory.findFirst({
        where: { name: subCategory, categoryId: resolvedCategoryId },
      });
      if (!sub) {
        return NextResponse.json(
          { message: "Invalid subcategory" },
          { status: 400 }
        );
      }
      resolvedSubCategoryId = sub.id;
    }

    const updated = await prisma.product.update({
      where: { id: body.id },
      data: {
        ...updateData,
        vendorId: resolvedVendorId,
        categoryId: resolvedCategoryId ?? undefined,
        subCategoryId: resolvedSubCategoryId ?? undefined,
        ...(Array.isArray(variants)
          ? {
              variants: {
                deleteMany: { productId: body.id },
                create: variants.map((v: any) => ({
                  variantCategory: v.variantCategory,
                  variantValue: v.variantValue,
                  mrp: v.mrp,
                  sku: v.sku ?? null,
                  credits: v.credits ?? null,
                  availableStock: v.availableStock ?? null,
                })),
              },
            }
          : {}),
      },
      include: {
        vendor: true,
        category: true,
        subCategory: true,
        variants: true,
      },
    });

    return NextResponse.json({ message: "Updated", data: updated });
  } catch (err) {
    return NextResponse.json(
      { message: "Update error", error: String(err) },
      { status: 500 }
    );
  }
}
