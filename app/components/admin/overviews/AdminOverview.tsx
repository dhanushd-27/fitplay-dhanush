"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  Package,
  ShoppingCart,
  Coins,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Star,
  Plus,
  UserPlus,
  BarChart3,
  Settings,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => res.json());

const AdminOverview = () => {
  // Fetch real data from APIs
  const { data: analyticsData, isLoading: analyticsLoading } = useSWR(
    "/api/analytics/order-filters?period=30",
    fetcher
  );
  const { data: vendorsData, isLoading: vendorsLoading } = useSWR(
    "/api/admin/vendors",
    fetcher
  );
  const { data: usersData, isLoading: usersLoading } = useSWR(
    "/api/admin/users",
    fetcher
  );
  const { data: ordersData, isLoading: ordersLoading } = useSWR(
    "/api/orders",
    fetcher
  );

  const isLoading = analyticsLoading || vendorsLoading || usersLoading || ordersLoading;

  // Calculate real stats from API data
  const analytics = analyticsData || {};
  const vendors = vendorsData?.vendors || [];
  const users = usersData?.users || [];
  const orders = ordersData?.orders || [];

  // Calculate today's orders
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todaysOrders = orders.filter((order: any) => 
    new Date(order.createdAt) >= todayStart
  );

  // Generate chart data from real orders
  const generateMonthlyData = () => {
    if (!orders.length) return [];
    
    const monthlyData: { [key: string]: { orders: number; revenue: number } } = {};
    const last6Months = [];
    
    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      last6Months.push({ monthKey, yearMonth });
      monthlyData[yearMonth] = { orders: 0, revenue: 0 };
    }

    // Aggregate order data by month
    orders.forEach((order: any) => {
      const orderDate = new Date(order.createdAt);
      const yearMonth = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[yearMonth]) {
        monthlyData[yearMonth].orders += 1;
        monthlyData[yearMonth].revenue += order.amount || 0;
      }
    });

    return last6Months.map(({ monthKey, yearMonth }) => ({
      month: monthKey,
      orders: monthlyData[yearMonth].orders,
      revenue: monthlyData[yearMonth].revenue,
    }));
  };

  const monthlyData = generateMonthlyData();

  // Generate category data from analytics
  const generateCategoryData = () => {
    if (!analytics.categoryDistribution) return [];
    
    const colors = ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5"];
    const total = Object.values(analytics.categoryDistribution).reduce((sum: number, count: any) => sum + count, 0);
    
    return Object.entries(analytics.categoryDistribution).map(([name, count], index) => ({
      name,
      value: total > 0 ? Math.round(((count as number) / total) * 100) : 0,
      color: colors[index % colors.length]
    }));
  };

  const categoryData = generateCategoryData();

  // Helper function to calculate time ago
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  // Generate recent activities from real data
  const generateRecentActivities = () => {
    const activities = [];
    
    // Recent orders
    const recentOrders = orders.slice(0, 3);
    recentOrders.forEach((order: any, index: number) => {
      const timeAgo = getTimeAgo(order.createdAt);
      activities.push({
        id: `order-${index}`,
        type: "order",
        message: `New order from ${order.user?.name || 'Customer'} (₹${order.amount})`,
        time: timeAgo,
        status: order.status === 'COMPLETED' ? 'success' : order.status === 'PENDING' ? 'pending' : 'info'
      });
    });

    // Low stock products
    if (analytics.inventoryStatus?.lowStock > 0) {
      activities.push({
        id: 'low-stock',
        type: 'product',
        message: `Low stock alert: ${analytics.inventoryStatus.lowStock} products running low`,
        time: 'Recent',
        status: 'warning'
      });
    }

    // Pending orders
    const pendingOrders = orders.filter((order: any) => order.status === 'PENDING').length;
    if (pendingOrders > 0) {
      activities.push({
        id: 'pending-orders',
        type: 'approval',
        message: `${pendingOrders} orders pending approval`,
        time: 'Recent',
        status: 'pending'
      });
    }

    return activities.slice(0, 6); // Limit to 6 activities
  };

  const recentActivities = generateRecentActivities();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-56 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here's what's happening with FitPlay.life today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Vendors
            </CardTitle>
            <Building2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{vendors.length}</div>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              Active vendors
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Products
            </CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {analytics.overview?.totalProducts || 0}
            </div>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              Total products
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Orders Today
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{todaysOrders.length}</div>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              Today's orders
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Orders
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {analytics.overview?.totalOrders || 0}
            </div>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              All time orders
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{users.length}</div>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              Registered users
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Revenue
            </CardTitle>
            <Star className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ₹{(analytics.overview?.totalRevenue || 0).toLocaleString()}
            </div>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              Total revenue
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders & Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Orders & Revenue Trend (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value, name) => [
                    name === "Revenue"
                      ? `₹${value.toLocaleString()}`
                      : value,
                    name,
                  ]}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="orders"
                  fill="#10b981"
                  name="Orders"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#059669"
                  strokeWidth={2}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Product Categories Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No category data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities & Pending Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {activity.type === "vendor" && (
                      <Building2 className="h-4 w-4 text-blue-600" />
                    )}
                    {activity.type === "order" && (
                      <ShoppingCart className="h-4 w-4 text-purple-600" />
                    )}
                    {activity.type === "product" && (
                      <Package className="h-4 w-4 text-orange-600" />
                    )}
                    {activity.type === "approval" && (
                      <Clock className="h-4 w-4 text-yellow-600" />
                    )}
                    {activity.type === "integration" && (
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    )}
                    {activity.type === "system" && (
                      <Star className="h-4 w-4 text-indigo-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                  <Badge
                    variant={
                      activity.status === "success"
                        ? "default"
                        : activity.status === "warning"
                        ? "destructive"
                        : activity.status === "info"
                        ? "secondary"
                        : "outline"
                    }
                    className={
                      activity.status === "success"
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        : ""
                    }
                  >
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {/* Add New Product */}
              <Link href="/admin/products" className="block">
                <Button className="w-full justify-start bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Product
                </Button>
              </Link>

              {/* Manage Users */}
              <Link href="/admin/users" className="block">
                <Button variant="outline" className="w-full justify-start border-blue-600 text-blue-600 hover:bg-blue-50">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </Link>

              {/* Create Invite */}
              <Link href="/admin/invites" className="block">
                <Button variant="outline" className="w-full justify-start border-purple-600 text-purple-600 hover:bg-purple-50">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create User Invite
                </Button>
              </Link>

              {/* View Analytics */}
              <Link href="/admin/analytics" className="block">
                <Button variant="outline" className="w-full justify-start border-orange-600 text-orange-600 hover:bg-orange-50">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </Link>

              {/* Manage Orders */}
              <Link href="/admin/orders" className="block">
                <Button variant="outline" className="w-full justify-start border-teal-600 text-teal-600 hover:bg-teal-50">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  View All Orders
                </Button>
              </Link>

              {/* Manage Vouchers */}
              <Link href="/admin/vouchers" className="block">
                <Button variant="outline" className="w-full justify-start border-pink-600 text-pink-600 hover:bg-pink-50">
                  <Star className="h-4 w-4 mr-2" />
                  Manage Vouchers
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-sm">API Status: Healthy</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-sm">Database: Connected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                (analytics.inventoryStatus?.lowStock || 0) > 0 ? 'bg-yellow-500' : 'bg-emerald-500'
              }`}></div>
              <span className="text-sm">
                {(analytics.inventoryStatus?.lowStock || 0) > 0 
                  ? `Low Stock: ${analytics.inventoryStatus.lowStock} items`
                  : 'Inventory: Healthy'}
              </span>
            </div>
          </div>
          
          {analytics.inventoryStatus && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Inventory Overview</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-emerald-600">
                    {analytics.inventoryStatus.inStock || 0}
                  </div>
                  <div className="text-gray-600">In Stock</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-600">
                    {analytics.inventoryStatus.lowStock || 0}
                  </div>
                  <div className="text-gray-600">Low Stock</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">
                    {analytics.inventoryStatus.outOfStock || 0}
                  </div>
                  <div className="text-gray-600">Out of Stock</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;
