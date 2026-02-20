import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = session.user.role;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'orders';

  if (role === 'HR' && type !== 'orders')
    return NextResponse.json({ error: 'HR can export orders only' }, { status: 403 });

  if (role !== 'ADMIN' && role !== 'HR')
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });

  if (type === 'orders') return exportOrders(request);
  if (type === 'inventory') return exportInventory(request);
  if (type === 'products') return exportProducts(request);
  if (type === 'topClients') return exportTopClients(request);
  if (type === 'overview') return exportOverview(request);

  return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
}

async function exportOrders(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const userId = searchParams.get('userId');
  const companyId = searchParams.get('companyId');
  const status = searchParams.get('status');

  const filters: any = {};
  if (dateFrom || dateTo) {
    filters.createdAt = {};
    if (dateFrom) filters.createdAt.gte = new Date(dateFrom);
    if (dateTo) filters.createdAt.lte = new Date(dateTo);
  }
  if (userId) filters.userId = userId;
  if (companyId) {
    filters.user = { companyId: companyId };
  };
  if (status) filters.status = status;

  const orders = await prisma.order.findMany({
    where: filters,
    include: {
      user: true,
      items: { include: { product: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([595, 842]);
  let y = 800;
  const m = 40;
  const lh = 14;

  page.drawText('Orders Analytics Export', { x: m, y, size: 18, font: bold });
  y -= 30;

  for (const o of orders) {
    if (y < 80) {
      page = pdfDoc.addPage([595, 842]);
      y = 800;
    }

    const addr = o.address

    page.drawText(`Order #${o.id.slice(-8)} | Rs.${o.amount} | ${new Date(o.createdAt).toLocaleDateString()}`, { x: m, y, size: 11, font: bold });
    y -= lh;
    page.drawText(`Client: ${o.user?.name || 'N/A'} | Status: ${o.status}`, { x: m, y, size: 10, font });
    y -= lh;
    page.drawText(`Shipping: ${addr || 'N/A'}`, { x: m, y, size: 10, font });
    y -= lh;

    page.drawText(`Items:`, { x: m + 10, y, size: 10, font: bold });
    y -= lh;

    for (const i of o.items) {
      if (y < 60) {
        page = pdfDoc.addPage([595, 842]);
        y = 800;
      }
      page.drawText(`• ${i.product?.name || ''} | Qty: ${i.quantity} | Rs.${i.price}`, {
        x: m + 20,
        y,
        size: 9,
        font,
        color: rgb(0.2, 0.2, 0.2)
      });
      y -= lh;
    }

    y -= 20;
  }

  const pdf = await pdfDoc.save();
  const filename = `analytics_orders_${Date.now()}.pdf`;

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

async function exportInventory(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  const filters: any = {};
  if (companyId) {
    filters.companies = {
      some: { id: companyId }
    };
  }

  const products = await prisma.product.findMany({
    where: filters,
    include: { companies: true, variants: true, category: true, subCategory: true },
    orderBy: { name: 'asc' },
    take: 150
  });

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([595, 842]);
  let y = 800;
  const m = 40;
  const lh = 14;

  page.drawText('Inventory Analytics Export', { x: m, y, size: 18, font: bold });
  y -= 30;

  for (const p of products) {
    if (y < 80) {
      page = pdfDoc.addPage([595, 842]);
      y = 800;
    }

    const stock = p.availableStock;
    const variantPrice = p.variants && p.variants.length ? (p.variants[0].mrp ?? 0) : 0;
    const stockValue = variantPrice * stock;

    page.drawText(`${p.name}`, { x: m, y, size: 12, font: bold });
    y -= lh;
    page.drawText(`SKU: ${p.sku || 'N/A'} | Category: ${p.category?.name || 'N/A'}`, { x: m, y, size: 10, font });
    y -= lh;
    page.drawText(`Stock: ${stock} | Price: Rs.${variantPrice} | Value: Rs.${stockValue}`, { x: m, y, size: 10, font });
    y -= lh;
    page.drawText(`Companies: ${p.companies.map(c => c.name).join(', ')}`, { x: m, y, size: 10, font });
    y -= 25;
  }

  const pdf = await pdfDoc.save();
  const filename = `analytics_inventory_${Date.now()}.pdf`;

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

async function exportTopClients(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    let dateFilter = {};
    const now = new Date();
    if (period === '7d') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { gte: weekAgo };
    } else if (period === '30d') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { gte: monthAgo };
    } else if (period === '90d') {
      const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      dateFilter = { gte: quarterAgo };
    }

    const clients = await prisma.user.findMany({
      include: {
        orders: {
          where: {
            createdAt: dateFilter,
            status: { not: 'CANCELLED' }
          },
          include: {
            items: {
              include: {
                product: true,
                variant: true
              }
            }
          }
        }
      }
    });

    const topClients = clients
      .map(client => ({
        name: client.name || 'Unknown Client',
        email: client.email,
        orderCount: client.orders.length,
        totalRevenue: client.orders.reduce((sum, order) => {
          const orderTotal = order.items.reduce((itemSum, item) => {
            return itemSum + (item.quantity * item.price);
          }, 0);
          return sum + orderTotal;
        }, 0)
      }))
      .filter(client => client.totalRevenue > 0)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 50);

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let page = pdfDoc.addPage([595, 842]);
    let y = 800;
    const m = 40;
    const lh = 16;

    page.drawText('Top Clients Analytics Export', { x: m, y, size: 18, font: bold });
    y -= 30;
    page.drawText(`Period: ${period} | Generated: ${new Date().toLocaleDateString()}`, { x: m, y, size: 10, font });
    y -= 40;

    page.drawText('Rank', { x: m, y, size: 11, font: bold });
    page.drawText('Client Name', { x: m + 60, y, size: 11, font: bold });
    page.drawText('Email', { x: m + 200, y, size: 11, font: bold });
    page.drawText('Orders', { x: m + 350, y, size: 11, font: bold });
    page.drawText('Revenue', { x: m + 420, y, size: 11, font: bold });
    y -= 20;

    page.drawLine({
      start: { x: m, y: y + 5 },
      end: { x: 555, y: y + 5 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8)
    });
    y -= 10;

    topClients.forEach((client, index) => {
      if (y < 80) {
        page = pdfDoc.addPage([595, 842]);
        y = 800;
      }

      const rank = (index + 1).toString();
      const name = client.name.length > 25 ? client.name.substring(0, 22) + '...' : client.name;
      const email = client.email.length > 20 ? client.email.substring(0, 17) + '...' : client.email;
      const orders = client.orderCount.toString();
      const revenue = `Rs.${client.totalRevenue.toLocaleString()}`;

      page.drawText(rank, { x: m + 10, y, size: 10, font });
      page.drawText(name, { x: m + 60, y, size: 10, font });
      page.drawText(email, { x: m + 200, y, size: 9, font });
      page.drawText(orders, { x: m + 360, y, size: 10, font });
      page.drawText(revenue, { x: m + 420, y, size: 10, font });
      
      y -= lh;
    });

    if (y < 100) {
      page = pdfDoc.addPage([595, 842]);
      y = 800;
    }

    y -= 30;
    page.drawLine({
      start: { x: m, y: y + 10 },
      end: { x: 555, y: y + 10 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8)
    });
    y -= 20;

    const totalRevenue = topClients.reduce((sum, client) => sum + client.totalRevenue, 0);
    const totalOrders = topClients.reduce((sum, client) => sum + client.orderCount, 0);

    page.drawText('Summary:', { x: m, y, size: 12, font: bold });
    y -= 20;
    page.drawText(`Total Clients: ${topClients.length}`, { x: m, y, size: 10, font });
    y -= lh;
    page.drawText(`Total Orders: ${totalOrders}`, { x: m, y, size: 10, font });
    y -= lh;
    page.drawText(`Total Revenue: Rs.${totalRevenue.toLocaleString()}`, { x: m, y, size: 10, font });

    const pdf = await pdfDoc.save();
    const filename = `analytics_clients_${Date.now()}.pdf`;

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting top clients PDF:', error);
    return NextResponse.json(
      { error: 'Failed to export top clients PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function exportProducts(request: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      include: {
        vendor: true,
        variants: true,
        category: true,
        subCategory: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const m = 50;
    let y = 750;
    const lh = 15;

    page.drawText('Products Analytics Export', { x: m, y, size: 18, font: bold });
    y -= 30;

    page.drawText(`Generated on: ${new Date().toLocaleString()}`, { x: m, y, size: 10, font });
    y -= 30;

    // Column headers with better spacing
    page.drawText('Name', { x: m, y, size: 12, font: bold });
    page.drawText('SKU', { x: m + 120, y, size: 12, font: bold });
    page.drawText('Category', { x: m + 250, y, size: 12, font: bold });
    page.drawText('Stock', { x: m + 380, y, size: 12, font: bold });
    page.drawText('Vendor', { x: m + 430, y, size: 12, font: bold });
    
    page.drawLine({
      start: { x: m, y: y - 5 },
      end: { x: 545, y: y - 5 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8)
    });
    y -= 20;

    products.forEach((product) => {
      if (y < 100) {
        const newPage = pdfDoc.addPage([595.28, 841.89]);
        y = 750;
      }

      // Truncate text to prevent overlapping
      const name = product.name.length > 18 ? product.name.substring(0, 18) + '...' : product.name;
      const sku = (product.sku || 'N/A').length > 15 ? (product.sku || 'N/A').substring(0, 15) + '...' : (product.sku || 'N/A');
      const category = (product.category?.name.replace(/_/g, ' ') || 'N/A').length > 18 ? 
        (product.category?.name.replace(/_/g, ' ') || 'N/A').substring(0, 18) + '...' : 
        (product.category?.name.replace(/_/g, ' ') || 'N/A');
      const stock = product.availableStock.toString();
      const vendor = (product.vendor?.name || 'N/A').length > 12 ? 
        (product.vendor?.name || 'N/A').substring(0, 12) + '...' : 
        (product.vendor?.name || 'N/A');

      page.drawText(name, { x: m, y, size: 9, font });
      page.drawText(sku, { x: m + 120, y, size: 9, font });
      page.drawText(category, { x: m + 250, y, size: 9, font });
      page.drawText(stock, { x: m + 380, y, size: 9, font });
      page.drawText(vendor, { x: m + 430, y, size: 9, font });

      y -= lh;
    });

    y -= 10;
    page.drawLine({
      start: { x: m, y },
      end: { x: 545, y },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8)
    });
    y -= 20;

    const totalProducts = products.length;
    const totalStock = products.reduce((sum, product) => sum + product.availableStock, 0);
    const lowStockProducts = products.filter(p => p.availableStock < 5).length;

    page.drawText('Summary:', { x: m, y, size: 12, font: bold });
    y -= 20;
    page.drawText(`Total Products: ${totalProducts}`, { x: m, y, size: 10, font });
    y -= lh;
    page.drawText(`Total Stock: ${totalStock}`, { x: m, y, size: 10, font });
    y -= lh;
    page.drawText(`Low Stock Products (< 5): ${lowStockProducts}`, { x: m, y, size: 10, font });

    const pdf = await pdfDoc.save();
    const filename = `analytics_products_${Date.now()}.pdf`;

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting products PDF:', error);
    return NextResponse.json(
      { error: 'Failed to export products PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function exportOverview(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      include: {
        items: {
          include: {
            variant: true
          }
        }
      }
    });

    const products = await prisma.product.findMany();
    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    });

    const totalRevenue = orders.reduce((sum, order) => {
      return sum + order.items.reduce((orderSum, item) => orderSum + (item.variant?.mrp || 0) * item.quantity, 0);
    }, 0);
    
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const activeProducts = products.length;
    const newUsers = users.length;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const m = 50;
    let y = 750;
    const lh = 20;

    page.drawText('Analytics Overview Export', { x: m, y, size: 18, font: bold });
    y -= 30;

    page.drawText(`Period: ${period}`, { x: m, y, size: 12, font });
    y -= lh;
    page.drawText(`Generated on: ${new Date().toLocaleString()}`, { x: m, y, size: 10, font });
    y -= 40;

    page.drawText('Key Performance Metrics', { x: m, y, size: 14, font: bold });
    y -= 30;

    page.drawText(`Total Revenue: Rs.${totalRevenue.toLocaleString()}`, { x: m, y, size: 12, font });
    y -= lh;
    page.drawText(`Total Orders: ${totalOrders}`, { x: m, y, size: 12, font });
    y -= lh;
    page.drawText(`Average Order Value: Rs.${avgOrderValue.toFixed(2)}`, { x: m, y, size: 12, font });
    y -= lh;
    page.drawText(`Active Products: ${activeProducts}`, { x: m, y, size: 12, font });
    y -= lh;
    page.drawText(`New Users (${period}): ${newUsers}`, { x: m, y, size: 12, font });
    y -= 40;

    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    page.drawText('Order Status Breakdown', { x: m, y, size: 14, font: bold });
    y -= 30;

    Object.entries(statusCounts).forEach(([status, count]) => {
      page.drawText(`${status}: ${count} orders`, { x: m, y, size: 12, font });
      y -= lh;
    });

    const pdf = await pdfDoc.save();
    const filename = `analytics_overview_${Date.now()}.pdf`;

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting overview PDF:', error);
    return NextResponse.json(
      { error: 'Failed to export overview PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
