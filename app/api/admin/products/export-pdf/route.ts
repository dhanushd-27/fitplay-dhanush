// import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import prisma from '@/lib/prisma';
// import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
// import { authOptions } from '@/lib/auth';

// export async function GET(request: NextRequest) {
//   const session = await getServerSession(authOptions);
//   if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

//   const role = session.user.role;
//   if (role !== 'ADMIN') {
//     return NextResponse.json({ error: 'Access denied' }, { status: 403 });
//   }

//   try {
//     // Get all products with essential information
//     const products = await prisma.product.findMany({
//       include: {
//         vendor: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//           },
//         },
//         category: true,
//         subCategory: true,
//         variants: true,
//       },
//       orderBy: {
//         createdAt: 'desc',
//       },
//     });

//     // Get order items separately to calculate sales data
//     const orderItemsData = await prisma.orderItem.groupBy({
//       by: ['productId'],
//       _sum: {
//         quantity: true,
//         price: true,
//       },
//       _count: {
//         id: true,
//       },
//     });

//     // Create PDF document
//     const pdfDoc = await PDFDocument.create();
//     const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
//     const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

//     let page = pdfDoc.addPage([595, 842]); // A4 size
//     let y = 800;
//     const margin = 40;
//     const lineHeight = 14;

//     // Header
//     page.drawText('Products Export Report', { 
//       x: margin, 
//       y, 
//       size: 18, 
//       font: bold,
//       color: rgb(0.1, 0.1, 0.1)
//     });
//     y -= 30;

//     page.drawText(`Generated on: ${new Date().toLocaleDateString()}`, { 
//       x: margin, 
//       y, 
//       size: 11, 
//       font 
//     });
//     y -= lineHeight;

//     page.drawText(`Total Products: ${products.length}`, { 
//       x: margin, 
//       y, 
//       size: 11, 
//       font 
//     });
//     y -= lineHeight;

//     const inStockCount = products.filter(p => p.availableStock > 0).length;
//     page.drawText(`In Stock Products: ${inStockCount}`, { 
//       x: margin, 
//       y, 
//       size: 11, 
//       font 
//     });
//     y -= lineHeight;

//     const outOfStockCount = products.filter(p => p.availableStock === 0).length;
//     page.drawText(`Out of Stock Products: ${outOfStockCount}`, { 
//       x: margin, 
//       y, 
//       size: 11, 
//       font 
//     });
//     y -= 30;

//     // Products list
//     page.drawText('Product Details:', { 
//       x: margin, 
//       y, 
//       size: 14, 
//       font: bold 
//     });
//     y -= 25;

//     for (const product of products) {
//       // Check if we need a new page
//       if (y < 100) {
//         page = pdfDoc.addPage([595, 842]);
//         y = 800;
//       }

//       // Find order data for this product
//       const orderData = orderItemsData.find(item => item.productId === product.id);
//       const totalSold = orderData?._sum.quantity || 0;
//       const totalRevenue = orderData?._sum.price || 0;

//       // Product header
//       page.drawText(`${product.name} (SKU: ${product.sku})`, { 
//         x: margin, 
//         y, 
//         size: 12, 
//         font: bold,
//         color: rgb(0.2, 0.2, 0.6)
//       });
//       y -= lineHeight;

//       // Vendor info
//       page.drawText(`Vendor: ${product.vendor?.name || 'No Vendor'} | Email: ${product.vendor?.email || 'N/A'}`, { 
//         x: margin + 10, 
//         y, 
//         size: 10, 
//         font 
//       });
//       y -= lineHeight;

//       // Category info
//       page.drawText(`Category: ${product.category?.name || 'N/A'} | Sub: ${product.subCategory?.name?.replace(/_/g, ' ') || 'N/A'}`, { 
//         x: margin + 10, 
//         y, 
//         size: 10, 
//         font 
//       });
//       y -= lineHeight;

//       // Stock and sales info
//       const stockStatus = product.availableStock <= 5 ? 'Critical' : product.availableStock <= 10 ? 'Low Stock' : 'In Stock';
//       const stockColor = product.availableStock <= 5 ? rgb(0.8, 0.2, 0.2) : product.availableStock <= 10 ? rgb(0.8, 0.6, 0.2) : rgb(0.2, 0.6, 0.2);
      
//       page.drawText(`Stock: ${product.availableStock} units (${stockStatus}) | Sold: ${totalSold} units | Revenue: Rs.${totalRevenue}`, { 
//         x: margin + 10, 
//         y, 
//         size: 10, 
//         font,
//         color: stockColor
//       });
//       y -= lineHeight;

//       // Rating and variants
//       const avgRating = product.avgRating ? product.avgRating.toFixed(1) : '0.0';
//       page.drawText(`Rating: ${avgRating}/5 (${product.noOfReviews || 0} reviews) | Variants: ${product.variants.length}`, { 
//         x: margin + 10, 
//         y, 
//         size: 10, 
//         font 
//       });
//       y -= lineHeight;

//       // Description (truncated)
//       if (product.description) {
//         const desc = product.description.length > 80 ? 
//           product.description.substring(0, 80) + '...' : 
//           product.description;
//         page.drawText(`Description: ${desc}`, { 
//           x: margin + 10, 
//           y, 
//           size: 9, 
//           font,
//           color: rgb(0.4, 0.4, 0.4)
//         });
//         y -= lineHeight;
//       }

//       // Dates
//       page.drawText(`Created: ${new Date(product.createdAt).toLocaleDateString()} | Updated: ${new Date(product.updatedAt).toLocaleDateString()}`, { 
//         x: margin + 10, 
//         y, 
//         size: 9, 
//         font,
//         color: rgb(0.5, 0.5, 0.5)
//       });
//       y -= 20; // Extra space between products
//     }

//     // Generate PDF buffer
//     const pdfBytes = await pdfDoc.save();
//     const pdfBuffer = Buffer.from(pdfBytes);

//     return new NextResponse(pdfBuffer, {
//       status: 200,
//       headers: {
//         'Content-Type': 'application/pdf',
//         'Content-Disposition': `attachment; filename=products-report-${new Date().toISOString().split('T')[0]}.pdf`,
//       },
//     });

//   } catch (error) {
//     console.error('PDF Export Error:', error);
//     return NextResponse.json(
//       { error: 'Failed to generate PDF report', details: error instanceof Error ? error.message : 'Unknown error' },
//       { status: 500 }
//     );
//   }
// }


import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = session.user.role;
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    // Fetch all products with relations
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

    // Get order items data for sales statistics
    const orderItemsData = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        price: true,
      },
    });

    // Create a map for quick lookup
    const salesMap = new Map(
      orderItemsData.map(item => [
        item.productId,
        {
          totalSold: item._sum.quantity || 0,
          totalRevenue: item._sum.price || 0,
        }
      ])
    );

    // Statistics
    const inStockCount = products.filter(p => p.availableStock > 0).length;
    const outOfStockCount = products.filter(p => p.availableStock === 0).length;

    // Generate HTML for PDF
    const html = generateProductTableHTML(products, salesMap, {
      totalProducts: products.length,
      inStockCount,
      outOfStockCount,
    });

    const browser = await puppeteer.launch({
  args: chromium.args,
  executablePath: await chromium.executablePath(),
  headless: true,
});


    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=product-catalog-${new Date().toISOString().split('T')[0]}.pdf`,
      },
    });

  } catch (error) {
    console.error('PDF Export Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function generateProductTableHTML(
  products: any[],
  salesMap: Map<string, { totalSold: number; totalRevenue: number }>,
  stats: { totalProducts: number; inStockCount: number; outOfStockCount: number }
) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const productRows = products.map(product => {
    const sales = salesMap.get(product.id) || { totalSold: 0, totalRevenue: 0 };
    const stockStatus = getStockStatus(product.availableStock);
    const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '';
    const avgRating = product.avgRating ? product.avgRating.toFixed(1) : '0.0';
    const description = product.description 
      ? (product.description.length > 100 
          ? product.description.substring(0, 100) + '...' 
          : product.description)
      : 'No description';

    return `
      <tr>
        <td class="image-cell">
          ${imageUrl 
            ? `<img src="${imageUrl}" alt="${product.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect width=%22100%22 height=%22100%22 fill=%22%23ddd%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22%3ENo Image%3C/text%3E%3C/svg%3E'" />` 
            : `<div class="no-image">No Image</div>`
          }
        </td>
        <td class="product-info">
          <div class="product-name">${escapeHtml(product.name)}</div>
          <div class="product-detail"><strong>SKU:</strong> ${escapeHtml(product.sku)}</div>
          <div class="product-detail"><strong>Category:</strong> ${product.category?.name || 'N/A'}</div>
          <div class="product-detail"><strong>Sub-Category:</strong> ${product.subCategory?.name?.replace(/_/g, ' ') || 'N/A'}</div>
          <div class="product-description">${escapeHtml(description)}</div>
        </td>
        <td class="stock-info">
          <div class="stock-value">${product.availableStock} units</div>
          <div class="stock-status ${stockStatus.class}">${stockStatus.text}</div>
          <div class="product-detail">Discount: ${product.discount || 0}%</div>
        </td>
        <td class="sales-info">
          <div class="product-detail"><strong>Rating:</strong> ${avgRating}/5</div>
          <div class="product-detail"><strong>Reviews:</strong> ${product.noOfReviews || 0}</div>
          <div class="product-detail"><strong>Variants:</strong> ${product.variants.length}</div>
          <div class="sales-value"><strong>Sold:</strong> ${sales.totalSold}</div>
          <div class="sales-value"><strong>Revenue:</strong> ₹${sales.totalRevenue.toFixed(2)}</div>
        </td>
        <td class="vendor-info">
          <div class="vendor-name">${product.vendor?.name || 'No Vendor'}</div>
          <div class="vendor-email">${product.vendor?.email || 'N/A'}</div>
          <div class="product-detail" style="margin-top: 8px;"><strong>Created:</strong><br/>${new Date(product.createdAt).toLocaleDateString()}</div>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', 'Helvetica', sans-serif;
          font-size: 10px;
          color: #333;
          background: white;
        }
        
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 3px solid #2563eb;
          margin-bottom: 20px;
        }
        
        .header h1 {
          font-size: 24px;
          color: #1e40af;
          margin-bottom: 10px;
        }
        
        .header-info {
          display: flex;
          justify-content: space-around;
          margin-top: 15px;
          font-size: 11px;
        }
        
        .stat-box {
          padding: 8px 15px;
          background: #f3f4f6;
          border-radius: 4px;
        }
        
        .stat-box strong {
          color: #1e40af;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        
        th {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          color: white;
          padding: 12px 8px;
          text-align: left;
          font-size: 11px;
          font-weight: bold;
          border: 1px solid #1e40af;
        }
        
        td {
          padding: 10px 8px;
          border: 1px solid #e5e7eb;
          vertical-align: top;
        }
        
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        
        tr:hover {
          background-color: #f3f4f6;
        }
        
        .image-cell {
          width: 100px;
          text-align: center;
        }
        
        .image-cell img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 6px;
          border: 2px solid #e5e7eb;
        }
        
        .no-image {
          width: 80px;
          height: 80px;
          background: #f3f4f6;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          font-size: 9px;
          border: 2px solid #e5e7eb;
          margin: 0 auto;
        }
        
        .product-info {
          width: 30%;
        }
        
        .product-name {
          font-size: 12px;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 6px;
        }
        
        .product-detail {
          font-size: 9px;
          color: #6b7280;
          margin-bottom: 3px;
        }
        
        .product-description {
          font-size: 9px;
          color: #6b7280;
          margin-top: 6px;
          font-style: italic;
          line-height: 1.3;
        }
        
        .stock-info {
          width: 15%;
          text-align: center;
        }
        
        .stock-value {
          font-size: 13px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 6px;
        }
        
        .stock-status {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 9px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .stock-status.in-stock {
          background: #d1fae5;
          color: #065f46;
        }
        
        .stock-status.low-stock {
          background: #fed7aa;
          color: #92400e;
        }
        
        .stock-status.out-of-stock {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .sales-info {
          width: 18%;
        }
        
        .sales-value {
          font-size: 10px;
          margin-bottom: 4px;
        }
        
        .vendor-info {
          width: 15%;
        }
        
        .vendor-name {
          font-weight: bold;
          color: #1e40af;
          font-size: 10px;
          margin-bottom: 4px;
        }
        
        .vendor-email {
          font-size: 9px;
          color: #6b7280;
          word-break: break-all;
        }
        
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 9px;
          color: #9ca3af;
          padding-top: 15px;
          border-top: 2px solid #e5e7eb;
        }
        
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📦 Product Catalog Export</h1>
        <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">
          Generated on ${currentDate}
        </div>
        <div class="header-info">
          <div class="stat-box">
            <strong>Total Products:</strong> ${stats.totalProducts}
          </div>
          <div class="stat-box">
            <strong>In Stock:</strong> ${stats.inStockCount}
          </div>
          <div class="stat-box">
            <strong>Out of Stock:</strong> ${stats.outOfStockCount}
          </div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Product Information</th>
            <th>Stock Status</th>
            <th>Performance</th>
            <th>Vendor & Dates</th>
          </tr>
        </thead>
        <tbody>
          ${productRows}
        </tbody>
      </table>
      
      <div class="footer">
        <p>This is a computer-generated document. No signature required.</p>
        <p>© ${new Date().getFullYear()} - Product Catalog Management System</p>
      </div>
    </body>
    </html>
  `;
}

function getStockStatus(stock: number): { text: string; class: string } {
  if (stock === 0) return { text: 'Out of Stock', class: 'out-of-stock' };
  if (stock <= 5) return { text: 'Critical', class: 'out-of-stock' };
  if (stock <= 10) return { text: 'Low Stock', class: 'low-stock' };
  return { text: 'In Stock', class: 'in-stock' };
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}