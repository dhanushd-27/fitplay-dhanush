"use client";

import { useState, useEffect, useCallback } from "react";
import { Fragment } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  Calendar,
  DollarSign,
  ShoppingCart,
  RefreshCw,
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";


interface AnalyticsData {
  overview: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  };
  ordersByStatus: Record<string, number>;
  revenueOverTime: Array<{
    date: string;
    revenue: number;
    formattedDate: string;
  }>;
  topClients: Array<{
    name: string;
    revenue: number;
    orderCount: number;
  }>;
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  rawData: {
    orders: Array<{
      id: string;
      clientName: string;
      status: string;
      amount: number;
      createdAt: string;
      itemCount: number;
    }>;
  };
}

const COLORS = ['#10b981', '#059669', '#047857', '#065f46', '#064e3b'];

export default function HRAnalytics() {
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
const [drawerOpen, setDrawerOpen] = useState(false);

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [exportLoading, setExportLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);


  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/order-filters?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        const errorData = await response.json().catch(() => ({ error: "Failed to load analytics" }));
        console.error("Analytics API error:", errorData);
        toast.error(`Failed to load analytics data: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExport = async (type: "csv" | "pdf", exportType: string) => {
    setExportLoading(true);
    try {
      const params = new URLSearchParams({
        type: exportType,
        period: period,
      });

      const apiEndpoint = type === "csv" 
        ? exportType === "transactions" 
          ? "/api/credits-analytics/export-csv"
          : "/api/analytics/export-csv"
        : "/api/analytics/export-pdf";

      const response = await fetch(`${apiEndpoint}?${params}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Export failed" }));
        throw new Error(errorData.error || "Export failed");
      }

      // Get filename from Content-Disposition header or create default
      const contentDisposition = response.headers.get("Content-Disposition");
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
        : `hr-${exportType}-${new Date().toISOString().split("T")[0]}.${type === "csv" ? "xlsx" : "pdf"}`;

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`${exportType.charAt(0).toUpperCase() + exportType.slice(1)} exported successfully!`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error(`Export failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setExportLoading(false);
    }
  };

  const exportOptions = [
    {
      title: "Company Orders Overview",
      description: "Export comprehensive overview of company orders",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      exportType: "overview",
      availableFormats: ["csv", "pdf"],
    },
    {
      title: "Orders Data",
      description: "Detailed export of all company orders",
      icon: ShoppingCart,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      exportType: "orders",
      availableFormats: ["csv", "pdf"],
    },
    {
      title: "Top Employees",
      description: "Most active employees by order volume",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      exportType: "topClients",
      availableFormats: ["csv", "pdf"],
    },
    {
      title: "Popular Products",
      description: "Most ordered products in your company",
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      exportType: "topProducts",
      availableFormats: ["csv", "pdf"],
    },
    {
      title: "Credit Transactions",
      description: "All credit transactions and wallet usage",
      icon: FileText,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      exportType: "transactions",
      availableFormats: ["csv"],
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">HR Analytics Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-gray-500 mb-4">Failed to load analytics data</div>
          <Button onClick={fetchAnalytics} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const orderStatusData = Object.entries(analytics.ordersByStatus).map(([status, count]) => ({
    name: status,
    value: count
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HR Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Company insights and performance metrics</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(analytics.overview.totalRevenue)}
                </div>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-emerald-600 mr-1" />
              <span className="text-sm text-emerald-600 font-medium">Company Total</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <div className="text-2xl font-bold text-gray-900">
                  {analytics.overview.totalOrders.toLocaleString()}
                </div>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-emerald-600 mr-1" />
              <span className="text-sm text-emerald-600 font-medium">Employee Orders</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(analytics.overview.averageOrderValue)}
                </div>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-emerald-600 mr-1" />
              <span className="text-sm text-emerald-600 font-medium">Per Order</span>
            </div>
          </CardContent>
        </Card>
      </div>
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
  <DrawerContent className="ml-auto w-full sm:max-w-lg bg-amber-100">
    <DrawerHeader>
      <DrawerTitle>Order Details</DrawerTitle>
      <DrawerDescription>
        Order ID: <span className="font-mono">{selectedOrder?.id}</span>
      </DrawerDescription>
    </DrawerHeader>

    {selectedOrder && (
      <div className="p-4 space-y-4">

        {/* Order meta */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Employee</p>
            <p>{selectedOrder.clientName || "N/A"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Amount</p>
            <p>{formatCurrency(selectedOrder.amount)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Status</p>
            <Badge>{selectedOrder.status}</Badge>
          </div>
          <div>
            <p className="text-muted-foreground">Date</p>
            <p>{new Date(selectedOrder.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Items */}
        <div>
          <h4 className="font-semibold mb-2">Order Items</h4>

          <div className="space-y-2">
            {selectedOrder.items?.map((item: any) => (
              <div
                key={item.id}
                className="flex justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">
                    {item.product?.name || "Product"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(item.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    )}
  </DrawerContent>
</Drawer>


      {/* Charts and Analytics */}
     <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
  <TabsList className="grid w-full grid-cols-3 bg-muted p-1 rounded-lg">
    <TabsTrigger
      value="overview"
      className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
    >
      Overview
    </TabsTrigger>
    <TabsTrigger
      value="orders"
      className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
    >
      Orders
    </TabsTrigger>
    <TabsTrigger
      value="products"
      className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
    >
      Products
    </TabsTrigger>
  </TabsList>



        <TabsContent value="overview" className="space-y-6">
          {/* Export Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Export Overview Data</span>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleExport("csv", "overview")}
                    disabled={exportLoading}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Excel
                  </Button>
                  <Button
                    onClick={() => handleExport("pdf", "overview")}
                    disabled={exportLoading}
                    variant="outline"
                    size="sm"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Company Revenue Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.revenueOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="formattedDate" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Order Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Company Orders</span>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleExport("csv", "orders")}
                    disabled={exportLoading}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Excel
                  </Button>
                  <Button
                    onClick={() => handleExport("pdf", "orders")}
                    disabled={exportLoading}
                    variant="outline"
                    size="sm"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Order ID</th>
                      <th className="text-left py-3 px-4">Employee</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Items</th>
                      <th className="text-left py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
  {analytics.rawData.orders.map((order) => {
    const isExpanded = expandedOrderId === order.id;

    return (
      <Fragment key={order.id}>
        {/* MAIN ROW */}
        <tr
          className="border-b cursor-pointer hover:bg-muted/50"
          onClick={() =>
            setExpandedOrderId(isExpanded ? null : order.id)
          }
        >
          <td className="py-3 px-4 font-mono text-sm">{order.id}</td>
          <td className="py-3 px-4">{order.clientName || "N/A"}</td>
          <td className="py-3 px-4">
            <Badge className={statusColors[order.status] || "bg-gray-100 text-gray-800"}>
  {order.status}
</Badge>

          </td>
          <td className="py-3 px-4">{formatCurrency(order.amount)}</td>
          <td className="py-3 px-4">{order.itemCount}</td>
          <td className="py-3 px-4 text-sm text-gray-600">
            {new Date(order.createdAt).toLocaleDateString()}
          </td>
        </tr>

        {/* 👇 EXPANDED ROW (BELOW CLICKED ROW) */}
        {isExpanded && (
          <tr className="bg-muted/30">
            <td colSpan={6} className="p-4">
              <div className="rounded-lg border bg-background">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left">Product</th>
                      <th className="px-3 py-2 text-left">Variant</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Price</th>
                      <th className="px-3 py-2 text-right">Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-3 py-2 flex items-center gap-3">
                          <img
                            src={item.product.image || "/placeholder.png"}
                            alt={item.product.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                          <span>{item.product.name}</span>
                        </td>

                        <td className="px-3 py-2">
                          {item.variant?.name || "-"}
                        </td>

                        <td className="px-3 py-2 text-right">
                          {item.quantity}
                        </td>

                        <td className="px-3 py-2 text-right">
                          {formatCurrency(item.price)}
                        </td>

                        <td className="px-3 py-2 text-right font-medium">
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        )}
      </Fragment>
    );
  })}
</tbody>

                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          {/* Products Export Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Export Products & Employee Data</span>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleExport("csv", "topProducts")}
                    disabled={exportLoading}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Products
                  </Button>
                  <Button
                    onClick={() => handleExport("csv", "topClients")}
                    disabled={exportLoading}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Employees
                  </Button>
                  <Button
                    onClick={() => handleExport("csv", "transactions")}
                    disabled={exportLoading}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Credits
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Products by Quantity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.topProducts.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quantity" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Employee Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topClients.slice(0, 5).map((client, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-gray-600">{client.orderCount} orders</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(client.revenue)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>


      </Tabs>
    </div>
  );
}