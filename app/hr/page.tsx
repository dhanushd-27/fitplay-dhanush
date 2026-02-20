"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  TrendingUp,
  Package,
  Building2,
  CreditCard,
  ShoppingCart,
  DollarSign,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
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
} from 'recharts';

interface DashboardStats {
  totalEmployees: number;
  activeProducts: number;
  monthlyOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

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

export default function HRDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeProducts: 0,
    monthlyOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  });
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch analytics data
      const analyticsRes = await fetch(`/api/analytics/order-filters?period=${period}`);
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
        
        // Fetch employees count
        const usersRes = await fetch("/api/users");
        const usersData = await usersRes.json();
        
        // Fetch products count
        const productsRes = await fetch("/api/products");
        const productsData = await productsRes.json();
        
        setStats({
          totalEmployees: usersData?.users?.length || 0,
          activeProducts: productsData?.data?.length || 0,
          monthlyOrders: analyticsData?.overview?.totalOrders || 0,
          totalRevenue: analyticsData?.overview?.totalRevenue || 0,
          averageOrderValue: analyticsData?.overview?.averageOrderValue || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const orderStatusData = analytics ? Object.entries(analytics.ordersByStatus).map(([status, count]) => ({
    name: status,
    value: count,
    color: status === 'DELIVERED' ? '#10b981' : status === 'PENDING' ? '#f59e0b' : status === 'CANCELLED' ? '#ef4444' : '#6b7280'
  })) : [];

  const recentOrders = analytics?.rawData?.orders?.slice(0, 5) || [];

  const handleNavigateToEmployees = () => {
    router.push('/hr/employees');
  };

  const handleNavigateToProducts = () => {
    router.push('/hr/products');
  };

  const handleNavigateToAnalytics = () => {
    router.push('/hr/analytics');
  };

  const statCards = [
    {
      title: "Total Employees",
      value: stats.totalEmployees,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Active company members",
      trend: null,
    },
    {
      title: "Active Products",
      value: stats.activeProducts,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Available for purchase",
      trend: null,
    },
    {
      title: "Monthly Orders",
      value: stats.monthlyOrders,
      icon: ShoppingCart,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Company orders this period",
      trend: stats.monthlyOrders > 0 ? "+" : null,
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      description: "Company spending",
      trend: stats.totalRevenue > 0 ? "+" : null,
      isFormatted: true,
    },
    {
      title: "Avg Order Value",
      value: formatCurrency(stats.averageOrderValue),
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      description: "Per order average",
      trend: null,
      isFormatted: true,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-6 bg-gray-200 rounded w-12 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {session?.user?.name}! Here's your company overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Building2 className="w-4 h-4" />
            <span>Company Portal</span>
          </div>
          <button
            onClick={fetchDashboardData}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow border-l-4 border-l-emerald-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stat.isFormatted ? stat.value : typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500">
                  {stat.description}
                </p>
                {stat.trend && (
                  <div className="flex items-center text-xs text-emerald-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span>Active</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Company Revenue Trend</CardTitle>
              <CardDescription>Revenue over time for your company</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.revenueOverTime}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="formattedDate" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Order Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status Distribution</CardTitle>
              <CardDescription>Current status of company orders</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activities & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        {analytics && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Recent Company Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOrders.length > 0 ? recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">{order.clientName || 'Unknown Employee'}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()} • {order.itemCount} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{formatCurrency(order.amount)}</p>
                      <Badge
                        variant={order.status === 'DELIVERED' ? 'default' : 
                               order.status === 'PENDING' ? 'secondary' :
                               order.status === 'CANCELLED' ? 'destructive' : 'outline'}
                        className="text-xs"
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-gray-500 text-center py-4">No recent orders</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div 
                onClick={handleNavigateToEmployees}
                className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Manage Employees</p>
                    <p className="text-sm text-blue-700">View and manage company team</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={handleNavigateToProducts}
                className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200 hover:bg-green-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Product Visibility</p>
                    <p className="text-sm text-green-700">Control product access</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={handleNavigateToAnalytics}
                className="flex items-center justify-between p-3 rounded-lg bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-purple-900">Analytics & Reports</p>
                    <p className="text-sm text-purple-700">View detailed insights</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}