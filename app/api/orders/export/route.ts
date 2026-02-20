import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from "@/lib/auth";
import * as XLSX from 'xlsx';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'excel';
    const searchTerm = searchParams.get('searchTerm') || '';
    const statusFilter = searchParams.get('statusFilter') || '';
    const paymentFilter = searchParams.get('paymentFilter') || '';
    const dateFilter = searchParams.get('dateFilter') || '';

    // Build where clause for filtering
    const whereClause: any = {};
    
    if (searchTerm) {
      whereClause.OR = [
        { id: { contains: searchTerm, mode: 'insensitive' } },
        { user: { name: { contains: searchTerm, mode: 'insensitive' } } },
        { user: { email: { contains: searchTerm, mode: 'insensitive' } } },
      ];
    }

    if (statusFilter) {
      whereClause.status = statusFilter.toUpperCase();
    }

    // Date filtering
    if (dateFilter && dateFilter !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          break;
        default:
          startDate = new Date(0);
      }

      whereClause.createdAt = {
        gte: startDate,
      };
    }

    // Fetch orders from database
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: {
          include: {
            company: {
              select: {
                name: true,
              },
            },
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
            variant: {
              include: {
                product: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform data for export
    const exportData = orders.map((order) => ({
      'Order ID': order.id,
      'Employee Name': order.user?.name || 'Unknown',
      'Employee Email': order.user?.email || 'Unknown',
      'Company': order.user?.company?.name || 'Unknown',
      'Products': order.items.map(item => 
        `${item.variant?.product?.name || item.product?.name || 'Unknown'} (Qty: ${item.quantity})`
      ).join('; '),
      'Total Credits': order.amount,
      'INR Amount': Math.floor(order.amount / 2),
      'Status': order.status,
      'Order Date': new Date(order.createdAt).toLocaleDateString(),
      'Delivery Address': order.address || 'N/A',
      'Phone Number': order.phNumber || 'N/A',
      'Delivery Instructions': order.deliveryInstructions || 'N/A',
      'Remarks': order.remarks || 'N/A',
    }));

    if (format === 'excel') {
      // Generate Excel file
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

      // Style the header row
      const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!worksheet[cellAddress]) continue;
        worksheet[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "CCCCCC" } },
        };
      }

      // Auto-fit columns
      const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.max(key.length, 15)
      }));
      worksheet['!cols'] = colWidths;

      const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename=orders-${new Date().toISOString().split('T')[0]}.xlsx`,
        },
      });
    } else if (format === 'pdf') {
      // Generate PDF using pdf-lib (same as analytics)
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      let page = pdfDoc.addPage([595, 842]); // A4 size
      let y = 800;
      const margin = 40;
      const lineHeight = 14;

      // Add title
      page.drawText('Orders Export', { x: margin, y, size: 18, font: bold });
      y -= 30;

      // Add date and count
      page.drawText(`Generated on: ${new Date().toLocaleDateString()}`, { x: margin, y, size: 12, font });
      y -= lineHeight;
      page.drawText(`Total Orders: ${exportData.length}`, { x: margin, y, size: 12, font });
      y -= 30;

      // Add orders data
      for (const orderData of exportData) {
        if (y < 100) {
          page = pdfDoc.addPage([595, 842]);
          y = 800;
        }

        // Order header
        page.drawText(`Order #${orderData['Order ID']} | ${orderData['Total Credits']} Credits | ${orderData['Order Date']}`, 
          { x: margin, y, size: 11, font: bold });
        y -= lineHeight;

        // Employee and Company info
        page.drawText(`Employee: ${orderData['Employee Name']}`, 
          { x: margin, y, size: 10, font });
        y -= lineHeight;
        
        page.drawText(`Company: ${orderData['Company']}`, 
          { x: margin, y, size: 10, font });
        y -= lineHeight;

        // Status
        page.drawText(`Status: ${orderData['Status']}`, 
          { x: margin, y, size: 10, font });
        y -= lineHeight;

        // Products (truncate if too long)
        const products = orderData['Products'].length > 80 ? 
          orderData['Products'].substring(0, 80) + '...' : 
          orderData['Products'];
        
        page.drawText(`Products: ${products}`, 
          { x: margin, y, size: 9, font });
        y -= lineHeight;

        y -= 10; // Extra spacing between orders
      }

      const pdfBytes = await pdfDoc.save();

      return new NextResponse(pdfBytes, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename=orders-${new Date().toISOString().split('T')[0]}.pdf`,
        },
      });
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 });

  } catch (error) {
    console.error("Error exporting orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}