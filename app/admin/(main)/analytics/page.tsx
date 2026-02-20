"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Download,
  RefreshCw,
  Calendar,
  FileText,
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from "sonner";

interface AnalyticsData {
  overview: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    totalProducts?: number;
    lowStockProducts?: number;
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
  inventoryStatus?: {
    inStock: number;
    lowStock: number;
    outOfStock: number;
  };
  categoryDistribution?: Record<string, number>;
  rawData: {
    orders: Array<{
      id: string;
      clientName: string;
      status: string;
      amount: number;
      createdAt: string;
      itemCount: number;
    }>;
    inventory?: Array<{
      id: string;
      name: string;
      category: string;
      stockQuantity: number;
      unitPrice: number;
      companyNames: string;
    }>;
  };
}

const COLORS = ['#10b981', '#059669', '#047857', '#065f46', '#064e3b'];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchAnalytics = useCallback(async (customStartDate?: string, customEndDate?: string) => {
    setLoading(true);
    try {
      let url = `/api/analytics/order-filters?period=${period}`;
      
      // Use custom dates if provided, otherwise use state dates
      const useStartDate = customStartDate || startDate;
      const useEndDate = customEndDate || endDate;
      
      // If both start and end dates are provided, use custom date range
      if (useStartDate && useEndDate) {
        url = `/api/analytics/order-filters?dateFrom=${useStartDate}&dateTo=${useEndDate}`;
      }
      

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
 
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  // Initial load and when period changes
  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  // Only fetch when BOTH dates are selected (not when individual dates change)
  useEffect(() => {
    if (startDate && endDate) {
      const timeoutId = setTimeout(() => {
        fetchAnalytics(startDate, endDate);
      }, 500); // 500ms delay after both dates are selected
      
      return () => clearTimeout(timeoutId);
    }
  }, [startDate, endDate, fetchAnalytics]);

  const handleExport = async (format: 'csv' | 'pdf', exportType?: string) => {
    try {
      const type = exportType || 'overview';
      const formatLabel = format === 'csv' ? 'Excel' : 'PDF';
      const typeLabel = {
        'overview': 'Overview',
        'orders': 'Orders',
        'topProducts': 'Products',
        'topClients': 'Clients',
        'inventory': 'Inventory'
      }[type] || type;
      
      toast.loading(`Preparing ${typeLabel} ${formatLabel} export...`, { id: 'export-loading' });
      
      const params = new URLSearchParams({
        type: type
      });
      
      // Use custom date range if both dates are provided, otherwise use period
      if (startDate && endDate) {
        params.append('dateFrom', startDate);
        params.append('dateTo', endDate);
      } else {
        params.append('period', period);
        
        // Add date range for orders if using period
        if (type === 'orders') {
          const now = new Date();
          const daysAgo = parseInt(period.replace('d', ''));
          const dateFrom = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
          params.set('dateFrom', dateFrom.toISOString().split('T')[0]);
          params.set('dateTo', now.toISOString().split('T')[0]);
        }
      }
      
      const response = await fetch(`/api/analytics/export-${format}?${params}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Fix file extension - CSV API returns Excel files
        const fileExtension = format === 'csv' ? 'xlsx' : format;
        
        // Generate filename with date range info
        let dateInfo = period;
        if (startDate && endDate) {
          dateInfo = `${startDate}_to_${endDate}`;
        }
        
        a.download = `analytics-${type}-${dateInfo}.${fileExtension}`;
        
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success(`${typeLabel} ${formatLabel} export completed successfully!`, { id: 'export-loading' });
      } else {
        const errorText = await response.text();
        console.error(`Export failed: ${response.status} ${response.statusText}`, errorText);
        toast.error(`Export failed: ${response.status} ${response.statusText}`, { id: 'export-loading' });
      }
    } catch (error) {
      console.error(`Failed to export ${format}:`, error);
      toast.error(`Failed to export ${format}: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: 'export-loading' });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="animate-pulse">
            <div className="h-8 w-80 bg-gray-200 rounded mb-2"></div>
            <div className="h-5 w-96 bg-gray-200 rounded"></div>
          </div>
          <div className="flex items-center gap-3 animate-pulse">
            <div className="h-10 w-32 bg-gray-200 rounded"></div>
            <div className="h-10 w-10 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Key Metrics Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                    <div className="h-8 w-32 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="flex items-center">
                  <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded mr-2"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="grid w-full grid-cols-4 gap-1 bg-gray-100 rounded-lg p-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>

          {/* Export Buttons Skeleton */}
          <div className="flex justify-end animate-pulse">
            <div className="flex gap-2">
              <div className="h-9 w-40 bg-gray-200 rounded"></div>
              <div className="h-9 w-40 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Charts Section Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1 Skeleton */}
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-48 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="h-8 w-8 bg-gray-200 rounded-full mx-auto mb-2"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chart 2 Skeleton */}
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-48 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
                    <div className="h-4 w-40 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Content Skeleton */}
          <Card className="animate-pulse">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="h-6 w-36 bg-gray-200 rounded"></div>
                <div className="flex gap-2">
                  <div className="h-9 w-32 bg-gray-200 rounded"></div>
                  <div className="h-9 w-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Table Header Skeleton */}
              <div className="overflow-x-auto">
                <div className="grid grid-cols-6 gap-4 border-b pb-3 mb-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
                {/* Table Rows Skeleton */}
                {[1, 2, 3, 4, 5].map((row) => (
                  <div key={row} className="grid grid-cols-6 gap-4 py-3 border-b">
                    {[1, 2, 3, 4, 5, 6].map((col) => (
                      <div key={col} className="h-4 bg-gray-100 rounded"></div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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

  // Prepare chart data
  const orderStatusData = Object.entries(analytics.ordersByStatus).map(([status, count]) => ({
    name: status,
    value: count
  }));

  const inventoryData = analytics.inventoryStatus ? [
    { name: 'In Stock', value: analytics.inventoryStatus.inStock, color: '#10b981' },
    { name: 'Low Stock', value: analytics.inventoryStatus.lowStock, color: '#f59e0b' },
    { name: 'Out of Stock', value: analytics.inventoryStatus.outOfStock, color: '#ef4444' },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive business insights and performance metrics</p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
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

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Start Date"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="End Date"
            />
            {(startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  // Fetch data with period-based filtering after clearing dates
                  fetchAnalytics();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear
              </Button>
            )}
          </div>
          
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <span className="text-sm text-emerald-600 font-medium">+12.5%</span>
              <span className="text-sm text-gray-600 ml-2">vs last period</span>
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
              <span className="text-sm text-emerald-600 font-medium">+8.2%</span>
              <span className="text-sm text-gray-600 ml-2">vs last period</span>
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
              <span className="text-sm text-emerald-600 font-medium">+4.3%</span>
              <span className="text-sm text-gray-600 ml-2">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <div className="text-2xl font-bold text-gray-900">
                  {analytics.overview.totalProducts?.toLocaleString() || 'N/A'}
                </div>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            {analytics.overview.lowStockProducts !== undefined && (
              <div className="mt-4 flex items-center">
                <TrendingDown className="h-4 w-4 text-orange-600 mr-1" />
                <span className="text-sm text-orange-600 font-medium">
                  {analytics.overview.lowStockProducts} low stock
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-2">
          <TabsList className="grid w-full grid-cols-4 bg-gray-50 rounded-lg p-1 h-12">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out
                         data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-emerald-600 
                         data-[state=active]:border-emerald-200 hover:bg-white/60 hover:text-gray-700
                         text-gray-600 border border-transparent"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="orders" 
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out
                         data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 
                         data-[state=active]:border-blue-200 hover:bg-white/60 hover:text-gray-700
                         text-gray-600 border border-transparent"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger 
              value="products" 
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out
                         data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-purple-600 
                         data-[state=active]:border-purple-200 hover:bg-white/60 hover:text-gray-700
                         text-gray-600 border border-transparent"
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger 
              value="clients" 
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out
                         data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-orange-600 
                         data-[state=active]:border-orange-200 hover:bg-white/60 hover:text-gray-700
                         text-gray-600 border border-transparent"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Clients</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="flex justify-end mb-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport('csv', 'overview')}>
                <Download className="w-4 h-4 mr-2" />
                Export Overview Excel
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('pdf', 'overview')}>
                <Download className="w-4 h-4 mr-2" />
                Export Overview PDF
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Over Time</CardTitle>
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

          {/* Inventory Status (if available) */}
          {analytics.inventoryStatus && (
            <Card>
              <CardHeader>
                <CardTitle>Inventory Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {inventoryData.map((item, index) => (
                    <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold" style={{ color: item.color }}>
                        {item.value}
                      </div>
                      <div className="text-sm text-gray-600">{item.name}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExport('csv', 'orders')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Orders Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport('pdf', 'orders')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Orders PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Order ID</th>
                      <th className="text-left py-3 px-4">Client</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Items</th>
                      <th className="text-left py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.rawData.orders.slice(0, 10).map((order) => (
                      <tr key={order.id} className="border-b">
                        <td className="py-3 px-4 font-mono text-sm">{order.id.slice(0, 8)}...</td>
                        <td className="py-3 px-4">{order.clientName || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <Badge className={statusColors[order.status] || 'bg-gray-100 text-gray-800'}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{formatCurrency(order.amount)}</td>
                        <td className="py-3 px-4">{order.itemCount}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-end mb-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport('csv', 'topProducts')}>
                <Download className="w-4 h-4 mr-2" />
                Export Products Excel
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('pdf', 'products')}>
                <FileText className="w-4 h-4 mr-2" />
                Export Products PDF
              </Button>
            </div>
          </div>
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
                <CardTitle>Product Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topProducts.slice(0, 5).map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-600">Qty: {product.quantity}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(product.revenue)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Top Clients by Revenue</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExport('csv', 'topClients')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Clients Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport('pdf', 'topClients')}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export Clients PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topClients.map((client, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
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
                      <div className="font-bold text-lg">{formatCurrency(client.revenue)}</div>
                      <div className="text-sm text-gray-600">Total Revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}