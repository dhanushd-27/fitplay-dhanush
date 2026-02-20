import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'excel';

    // Get all products with essential information
    const products = await prisma.product.findMany({
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
        subCategory: true,
        variants: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get order items separately to calculate sales data
    const orderItemsData = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        price: true,
      },
      _count: {
        id: true,
      },
    });

    // Calculate real ratings and sales
    const exportData = products.map((product) => {
      const avgRating = product.avgRating ? product.avgRating.toFixed(1) : '0.0';
      
      // Find order data for this product
      const orderData = orderItemsData.find(item => item.productId === product.id);
      const totalSold = orderData?._sum.quantity || 0;
      const totalRevenue = orderData?._sum.price || 0;
      
      return {
        'Product ID': product.id,
        'Product Name': product.name,
        'SKU': product.sku,
        'Vendor Name': product.vendor?.name || 'No Vendor',
        'Vendor Email': product.vendor?.email || 'N/A',
        'Category': product.category?.name || 'N/A',
        'Sub Category': product.subCategory?.name?.replace(/_/g, ' ') || 'N/A',
        'Description': product.description?.substring(0, 100) + (product.description?.length > 100 ? '...' : '') || '',
        'Current Stock': product.availableStock,
        'Stock Status': product.availableStock <= 5 ? 'Critical' : product.availableStock <= 10 ? 'Low Stock' : 'In Stock',
        'Average Rating': avgRating,
        'Total Reviews': product.noOfReviews || 0,
        'Total Sold': totalSold,
        'Total Revenue (Credits)': totalRevenue,
        'Variants Count': product.variants.length,
        'Created Date': new Date(product.createdAt).toLocaleDateString(),
        'Last Updated': new Date(product.updatedAt).toLocaleDateString(),
        'Status': product.availableStock > 0 ? 'Active' : 'Out of Stock',
      };
    });

    if (format === 'excel') {
      // Handle empty data case
      if (exportData.length === 0) {
        const emptyWorkbook = XLSX.utils.book_new();
        const emptyData = [
          ['No Products Found'],
          ['Generated on', new Date().toLocaleDateString()],
          ['Total Products', 0]
        ];
        const emptyWorksheet = XLSX.utils.aoa_to_sheet(emptyData);
        XLSX.utils.book_append_sheet(emptyWorkbook, emptyWorksheet, 'Products Report');
        
        const buffer = XLSX.write(emptyWorkbook, { type: 'buffer', bookType: 'xlsx' });
        
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename=products-report-${new Date().toISOString().split('T')[0]}.xlsx`,
          },
        });
      }
      
      // Create professional Excel file
      const workbook = XLSX.utils.book_new();
      
      // Create summary data
      const summaryData = [
        ['Products Export Report'],
        ['Generated on', new Date().toLocaleDateString()],
        ['Total Products', products.length],
        ['In Stock Products', products.filter(p => p.availableStock > 0).length],
        ['Out of Stock Products', products.filter(p => p.availableStock === 0).length],
        ['Low Stock Products', products.filter(p => p.availableStock > 0 && p.availableStock <= 10).length],
        ['Average Rating', products.length > 0 ? (products.reduce((sum, p) => sum + (p.avgRating || 0), 0) / products.length).toFixed(2) : '0.00'],
        [], // Empty row
      ];
      
      // Create detailed products worksheet - ensure proper array structure
      const detailedData = [
        ...summaryData,
        [], // Another empty row before headers
        Object.keys(exportData[0] || {}), // Headers row
        ...exportData.map(obj => Object.values(obj)) // Data rows
      ];
      
      const worksheet = XLSX.utils.aoa_to_sheet(detailedData);
      
      // Style the worksheet
      worksheet['!cols'] = [
        { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 25 },
        { wch: 20 }, { wch: 15 }, { wch: 30 }, { wch: 12 }, { wch: 12 },
        { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 12 },
        { wch: 15 }, { wch: 15 }, { wch: 12 }
      ];
      
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Products Report');
      
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename=products-report-${new Date().toISOString().split('T')[0]}.xlsx`,
        },
      });
      
    } else if (format === 'pdf') {
      // For now, create a detailed CSV that can be easily converted to PDF
      // In the future, we can integrate a proper PDF generation library
      
      const csvHeaders = Object.keys(exportData[0] || {}).join(',');
      const csvRows = exportData.map(product => 
        Object.values(product).map(value => 
          typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        ).join(',')
      );
      
      const csvContent = [
        '# FitPlay Products Report',
        `# Generated on: ${new Date().toLocaleDateString()}`,
        `# Total Products: ${products.length}`,
        '',
        csvHeaders,
        ...csvRows
      ].join('\n');

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=products-report-${new Date().toISOString().split('T')[0]}.csv`,
        },
      });
    }

    return NextResponse.json(
      { error: "Invalid format. Use 'excel' or 'pdf'" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}