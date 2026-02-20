import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import * as XLSX from 'xlsx';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'HR')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'excel';
    const searchTerm = searchParams.get('searchTerm') || '';
    const typeFilter = searchParams.get('typeFilter') || 'all';
    const statusFilter = searchParams.get('statusFilter') || 'all';
    const companyFilter = searchParams.get('companyFilter') || 'all';

    // Build where clause for filtering - exclude demo transactions
    const whereClause: any = {
      isDemo: false,
    };

    if (searchTerm) {
      whereClause.OR = [
        { user: { name: { contains: searchTerm, mode: 'insensitive' } } },
        { user: { email: { contains: searchTerm, mode: 'insensitive' } } },
        { id: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    if (companyFilter !== 'all') {
      whereClause.user = {
        ...whereClause.user,
        company: { name: companyFilter }
      };
    }

    // Fetch transactions from database
    const transactions = await prisma.transactionLedger.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            company: {
              select: {
                name: true
              }
            }
          }
        },
        order: {
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (format === 'excel') {
      // Excel Export
      const workbook = XLSX.utils.book_new();
      
      const worksheetData = [
        [
          'Transaction ID',
          'Employee Name', 
          'Employee Email',
          'Company',
          'Type',
          'Amount (Credits)',
          'Cash Amount',
          'Mode of Payment',
          'Is Credit',
          'Balance After Txn',
          'Order ID',
          'Created At'
        ],
        ...transactions.map(transaction => {
          // Transform type logic (same as existing API)
          let type = 'credit_redemption';
          if (transaction.isCredit) {
            if (transaction.modeOfPayment === 'Credits') {
              type = 'credit_allocation';
            } else {
              type = 'credit_purchase';
            }
          } else {
            if (transaction.order) {
              type = 'credit_redemption';
            } else if (transaction.cashAmount && transaction.cashAmount > 0) {
              type = 'mixed_payment';
            } else {
              type = 'inr_payment';
            }
          }
          
            const cashRupees = (transaction.cashAmount || 0) / 100;
            return [
            transaction.id,
            transaction.user?.name || 'N/A',
            transaction.user?.email || 'N/A', 
            transaction.user?.company?.name || 'N/A',
            type,
            transaction.amount || 0,
              cashRupees,
            transaction.modeOfPayment,
            transaction.isCredit ? 'Yes' : 'No',
            transaction.balanceAfterTxn || 0,
            transaction.order?.id || 'N/A',
            new Date(transaction.createdAt).toLocaleDateString()
          ];
        })
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      
      // Set column widths
      worksheet['!cols'] = [
        { width: 20 }, // Transaction ID
        { width: 20 }, // Employee Name
        { width: 25 }, // Employee Email
        { width: 20 }, // Company
        { width: 18 }, // Type
        { width: 15 }, // Credits
        { width: 15 }, // INR Amount
        { width: 12 }, // Status
        { width: 30 }, // Description
        { width: 15 }, // Transaction Date
        { width: 15 }  // Created At
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
      
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename=transactions-${new Date().toISOString().split('T')[0]}.xlsx`
        }
      });

    } else if (format === 'pdf') {
      // PDF Export using pdf-lib
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage([842, 595]); // A4 landscape
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Title
      page.drawText('Transactions Report', {
        x: 50,
        y: 540,
        size: 20,
        font: boldFont,
        color: rgb(0, 0, 0)
      });

      // Date
      page.drawText(`Generated on: ${new Date().toLocaleDateString()}`, {
        x: 50,
        y: 515,
        size: 10,
        font: font,
        color: rgb(0.5, 0.5, 0.5)
      });

      // Headers
      const headers = ['Transaction ID', 'Employee', 'Company', 'Type', 'Credits', 'INR', 'Status', 'Date'];
      const colWidths = [100, 100, 80, 80, 60, 60, 60, 80];
      let startX = 50;
      let currentY = 480;

      headers.forEach((header, index) => {
        page.drawText(header, {
          x: startX,
          y: currentY,
          size: 10,
          font: boldFont,
          color: rgb(0, 0, 0)
        });
        startX += colWidths[index];
      });

      // Draw header line
      page.drawLine({
        start: { x: 50, y: currentY - 5 },
        end: { x: 720, y: currentY - 5 },
        thickness: 1,
        color: rgb(0, 0, 0)
      });

      currentY -= 20;

      // Data rows
      transactions.slice(0, 25).forEach((transaction) => { // Limit to 25 rows for PDF
        if (currentY < 50) {
          page = pdfDoc.addPage([842, 595]);
          currentY = 540;
        }

        // Transform type logic
        let type = 'credit_redemption';
        if (transaction.isCredit) {
          if (transaction.modeOfPayment === 'Credits') {
            type = 'credit_allocation';
          } else {
            type = 'credit_purchase';
          }
        } else {
          if (transaction.order) {
            type = 'credit_redemption';
          } else if (transaction.cashAmount && transaction.cashAmount > 0) {
            type = 'mixed_payment';
          } else {
            type = 'inr_payment';
          }
        }

        startX = 50;
        const cashRupees = (transaction.cashAmount || 0) / 100;
        const rowData = [
          transaction.id.substring(0, 15) + '...',
          transaction.user?.name?.substring(0, 15) || 'N/A',
          transaction.user?.company?.name?.substring(0, 12) || 'N/A',
          type.substring(0, 12),
          (transaction.amount || 0).toString(),
          cashRupees.toString(),
          transaction.modeOfPayment.substring(0, 8),
          new Date(transaction.createdAt).toLocaleDateString()
        ];

        rowData.forEach((data, index) => {
          page.drawText(data, {
            x: startX,
            y: currentY,
            size: 8,
            font: font,
            color: rgb(0, 0, 0)
          });
          startX += colWidths[index];
        });

        currentY -= 15;
      });

      // Summary
      const totalCredits = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      const totalINR = transactions.reduce((sum, t) => sum + ((t.cashAmount || 0) / 100), 0);
      
      page.drawText(`Total Transactions: ${transactions.length}`, {
        x: 50,
        y: currentY - 20,
        size: 10,
        font: boldFont,
        color: rgb(0, 0, 0)
      });

      page.drawText(`Total Credits: ${totalCredits.toLocaleString()}`, {
        x: 250,
        y: currentY - 20,
        size: 10,
        font: boldFont,
        color: rgb(0, 0, 0)
      });

      page.drawText(`Total INR: Rs.${totalINR.toLocaleString()}`, {
        x: 450,
        y: currentY - 20,
        size: 10,
        font: boldFont,
        color: rgb(0, 0, 0)
      });

      const pdfBytes = await pdfDoc.save();

      return new NextResponse(pdfBytes, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename=transactions-${new Date().toISOString().split('T')[0]}.pdf`
        }
      });
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}