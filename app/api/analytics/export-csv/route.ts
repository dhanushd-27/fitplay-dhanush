import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const exportType = searchParams.get("type") || "overview";
        const dateFrom = searchParams.get("dateFrom");
        const dateTo = searchParams.get("dateTo");
        const status = searchParams.get("status");
        const period = searchParams.get("period") || "30d";

        let companyId = searchParams.get("companyId");

        // HR company restriction
        if (session.user.role === "HR") {
            const company = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { companyId: true }
            });
            companyId = company?.companyId || null;

            if (exportType === "inventory" || exportType === "categoryDistribution") {
                return NextResponse.json({ error: "HR cannot export inventory analytics" }, { status: 403 });
            }
        }

        // ROUTING
        if (exportType === "overview") {
            return await exportOverviewAnalytics(dateFrom, dateTo, period, status, companyId);
        }
        if (exportType === "orders") {
            return await exportOrdersAnalytics(dateFrom, dateTo, period, status, companyId);
        }
        if (exportType === "inventory") {
            return await exportInventoryAnalytics(companyId);
        }
        if (exportType === "topClients") {
            return await exportTopUsers(dateFrom, dateTo, period, status, companyId);
        }
        if (exportType === "topProducts") {
            return await exportTopProducts(dateFrom, dateTo, period, status, companyId);
        }

        return NextResponse.json({ error: "Invalid export type" }, { status: 400 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to export analytics" }, { status: 500 });
    }
}

async function buildOrdersFilter(dateFrom: string | null, dateTo: string | null, period: string, status: string | null, companyId?: string | null) {
    const dateFilter: any = {};

    if (dateFrom) dateFilter.gte = new Date(dateFrom);
    if (dateTo) dateFilter.lte = new Date(dateTo);

    // If only period provided → auto date range
    if (!dateFrom && !dateTo) {
        const now = new Date();
        const daysBack = period === "7d" ? 7 : period === "90d" ? 90 : 30;
        dateFilter.gte = new Date(now.getTime() - daysBack * 86400000);
    }

    const filters: any = { createdAt: dateFilter };

    if (companyId) filters.user = { companyId };
    if (status) filters.status = status;

    return filters;
}

// ----------------------------------
// 🟢 FIXED: Overview now returns full order list same as Orders export
// ----------------------------------
async function exportOverviewAnalytics(dateFrom: string | null, dateTo: string | null, period: string, status: string | null, companyId: string | null) {
    const filters = await buildOrdersFilter(dateFrom, dateTo, period, status, companyId);

    const orders = await prisma.order.findMany({
        where: filters,
        include: { 
            user: { select: { name: true, email: true, company: { select: { name: true } } } }, 
            items: { include: { product: { select: { name: true } } } }
        },
        orderBy: { createdAt: "desc" }
    });

    const data = orders.map((o) => ({
        "Order ID": o.id,
        "Client Name": o.user?.name || "N/A",
        "Client Email": o.user?.email || "N/A",
        "Company": o.user?.company?.name || "N/A",
        "Items Count": o.items.length,
        "Amount (Rs.)": o.amount,
        "Status": o.status,
        "Order Date": new Date(o.createdAt).toLocaleDateString(),
        "Products": o.items.map(item => item.product?.name).join(", ")
    }));

    return buildExcelResponse(data, "analytics-overview", "Analytics Overview", period);
}

async function exportOrdersAnalytics(dateFrom: string | null, dateTo: string | null, period: string, status: string | null, companyId: string | null | undefined) {
    const filters = await buildOrdersFilter(dateFrom, dateTo, period, status, companyId);

    const orders = await prisma.order.findMany({
        where: filters,
        include: { 
            user: { 
                select: { 
                    name: true, 
                    email: true, 
                    phone: true,
                    address: true,
                    company: { select: { name: true } }
                }
            }, 
            items: { 
                include: { 
                    product: { 
                        select: { 
                            name: true, 
                            sku: true,
                            category: {
                                select: { name: true }
                            }
                        }
                    }
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    // Create detailed order data matching PDF format
    const data: any[] = [];
    
    orders.forEach((order) => {
        order.items.forEach((item, index) => {
            data.push({
                "Order #": order.id,
                "Amount (Rs.)": index === 0 ? order.amount : "", // Show total only once per order
                "Date": index === 0 ? new Date(order.createdAt).toLocaleDateString() : "",
                "Client": index === 0 ? order.user?.name || "N/A" : "",
                "Status": index === 0 ? order.status : "",
                "Client Email": index === 0 ? order.user?.email || "" : "",
                "Client Phone": index === 0 ? order.user?.phone || "" : "",
                "Company": index === 0 ? order.user?.company?.name || "" : "",
                "Shipping Address": index === 0 ? order.user?.address || "" : "",
                "Product Name": item.product?.name || "N/A",
                "Product SKU": item.product?.sku || "",
                "Product Category": item.product?.category?.name || "",
                "Quantity": item.quantity,
                "Unit Price (Rs.)": Math.round(item.price || 0)
            });
        });
        
        // Add separator row between orders
        if (orders.indexOf(order) < orders.length - 1) {
            data.push({});
        }
    });

    return buildExcelResponse(data, "orders-analytics", "Orders Analytics", period);
}

async function exportInventoryAnalytics(companyId?: string | null) {
    const products = await prisma.product.findMany({
        where: companyId ? { companies: { some: { id: companyId } } } : {},
        include: { 
            companies: true, 
            variants: true,
            vendor: { select: { name: true } },
            category: true,
            subCategory: true
        }
    });

    const data = products.map((p) => ({
        "Product ID": p.id,
        "Product Name": p.name,
        "SKU": p.sku,
        "Category": p.category?.name || "",
        "Sub Category": p.subCategory?.name || "",
        "Vendor": p.vendor?.name || "No Vendor",
        "Current Stock": p.availableStock,
        "Stock Status": p.availableStock <= 10 ? "Low Stock" : p.availableStock <= 5 ? "Critical" : "In Stock",
        "Total Variants": p.variants.length,
        "Description": p.description?.substring(0, 100) + (p.description?.length > 100 ? "..." : "") || "",
        "Companies": p.companies.map((c) => c.name).join(", "),
        "Created Date": new Date(p.createdAt).toLocaleDateString(),
        "Last Updated": new Date(p.updatedAt).toLocaleDateString()
    }));

    return buildExcelResponse(data, "inventory-analytics", "Inventory Analytics");
}

async function exportTopUsers(dateFrom: string | null, dateTo: string | null, period: string, status: string | null, companyId: string | null | undefined) {
    const filters = await buildOrdersFilter(dateFrom, dateTo, period, status, companyId);

    const orders = await prisma.order.findMany({
        where: filters,
        include: { 
            user: { 
                include: {
                    company: { select: { name: true } },
                    wallet: { select: { balance: true } }
                }
            }
        }
    });

    const clients: Record<string, any> = {};

    orders.forEach((o) => {
        if (!o.user) return;
        
        if (!clients[o.user.id]) {
            clients[o.user.id] = {
                user: o.user,
                revenue: 0,
                orders: 0,
                lastOrderDate: o.createdAt,
                firstOrderDate: o.createdAt
            };
        }
        
        clients[o.user.id].revenue += o.amount || 0;
        clients[o.user.id].orders += 1;
        
        if (new Date(o.createdAt) > new Date(clients[o.user.id].lastOrderDate)) {
            clients[o.user.id].lastOrderDate = o.createdAt;
        }
        if (new Date(o.createdAt) < new Date(clients[o.user.id].firstOrderDate)) {
            clients[o.user.id].firstOrderDate = o.createdAt;
        }
    });

    const data = Object.values(clients)
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 50)
        .map((client: any, index: number) => ({
            "Rank": index + 1,
            "Client Name": client.user.name,
            "Email": client.user.email,
            "Phone": client.user.phone || "",
            "Company": client.user.company?.name || "",
            "Total Orders": client.orders,
            "Total Spent (Rs.)": client.revenue,
            "Avg Order Value (Rs.)": Math.round(client.revenue / client.orders),
            "Current Credits": client.user.wallet?.balance || 0,
            "First Order Date": new Date(client.firstOrderDate).toLocaleDateString(),
            "Last Order Date": new Date(client.lastOrderDate).toLocaleDateString(),
            "Customer Status": client.user.verified ? "Verified" : "Unverified",
            "Account Status": client.user.claimed ? "Claimed" : "Pending"
        }));

    return buildExcelResponse(data, "top-clients-analytics", "Top Clients Analytics");
}

async function exportTopProducts(dateFrom: string | null, dateTo: string | null, period: string, status: string | null, companyId: string | null | undefined) {
    const filters = await buildOrdersFilter(dateFrom, dateTo, period, status, companyId);

    const orders = await prisma.order.findMany({
        where: filters,
        include: { 
            items: { 
                include: { 
                    product: {
                        include: {
                            vendor: { select: { name: true } }
                        }
                    }
                }
            }
        }
    });

    const products: Record<string, any> = {};
    let totalRevenue = 0;

    orders.forEach((order) => {
        order.items.forEach((item) => {
            if (!item.product) return;
            
            const productId = item.product.id;
            const revenue = item.quantity * (item.price || 0);
            totalRevenue += revenue;
            
            if (!products[productId]) {
                products[productId] = {
                    product: item.product,
                    quantity: 0,
                    revenue: 0,
                    orders: new Set()
                };
            }
            
            products[productId].quantity += item.quantity;
            products[productId].revenue += revenue;
            products[productId].orders.add(order.id);
        });
    });

    const data = Object.values(products)
        .map((p: any) => ({
            ...p,
            uniqueOrders: p.orders.size,
            revenuePercentage: totalRevenue > 0 ? ((p.revenue / totalRevenue) * 100).toFixed(2) : "0.00"
        }))
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 50)
        .map((p: any, index: number) => ({
            "Rank": index + 1,
            "Product Name": p.product.name,
            "SKU": p.product.sku,
            "Category": p.product.category.name || "",
            "Sub Category": p.product.subCategory?.name || "",
            "Vendor": p.product.vendor?.name || "No Vendor",
            "Total Sold": p.quantity,
            "Total Revenue (Rs.)": p.revenue,
            "Unique Orders": p.uniqueOrders,
            "Revenue Share (%)": p.revenuePercentage,
            "Avg Revenue per Sale (Rs.)": p.quantity > 0 ? Math.round(p.revenue / p.quantity) : 0,
            "Current Stock": p.product.availableStock,
            "Stock Status": p.product.availableStock <= 10 ? "Low Stock" : "In Stock"
        }));

    return buildExcelResponse(data, "top-products-analytics", "Top Products Analytics");
}

function buildExcelResponse(rows: any[], filenamePrefix: string, title: string = "Report", period: string = "30d") {
    const workbook = XLSX.utils.book_new();
    const worksheetData: any[][] = [];
    
    // Add header section
    worksheetData.push([`${title} Export`]);
    worksheetData.push([`Period: ${period}`]);
    worksheetData.push([`Generated on: ${new Date().toLocaleString()}`]);
    worksheetData.push([]); // Empty row
    
    // Add summary metrics if available
    if (rows.length > 0) {
        worksheetData.push(["Key Performance Metrics"]);
        
        if (filenamePrefix.includes('order') || filenamePrefix.includes('overview')) {
            const totalOrders = rows.length;
            const totalRevenue = rows.reduce((sum: number, row: any) => sum + (row.Amount || 0), 0);
            const avgOrderValue = totalRevenue / totalOrders;
            const pendingOrders = rows.filter((row: any) => row.Status === 'PENDING').length;
            
            worksheetData.push([`Total Orders: ${totalOrders}`]);
            worksheetData.push([`Total Revenue: Rs.${totalRevenue.toLocaleString()}`]);
            worksheetData.push([`Average Order Value: Rs.${Math.round(avgOrderValue).toLocaleString()}`]);
            worksheetData.push([`Pending Orders: ${pendingOrders}`]);
        }
        
        worksheetData.push([]); // Empty row
    }
    
    // Add data section
    if (rows.length > 0) {
        worksheetData.push(["Detailed Data"]);
        worksheetData.push([]); // Empty row
        
        // Add column headers
        const headers = Object.keys(rows[0]);
        worksheetData.push(headers);
        
        // Add data rows
        rows.forEach(row => {
            const rowData = headers.map(header => row[header] || "");
            worksheetData.push(rowData);
        });
    }
    
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Style the worksheet
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    // Set column widths
    worksheet['!cols'] = [
        { width: 20 }, // OrderID
        { width: 25 }, // Client
        { width: 15 }, // Items
        { width: 15 }, // Amount
        { width: 15 }, // Status
        { width: 20 }, // Date
    ];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, "Analytics Report");
    
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    const filename = `${filenamePrefix}_${new Date().toISOString().split("T")[0]}.xlsx`;
    
    return new NextResponse(buffer, {
        headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="${filename}"`,
        },
    });
}
