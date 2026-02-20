"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  MoreHorizontal,
  Check,
  X,
  Truck,
  Eye,
  Download,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  AlertCircle,
  Calendar,
  User,
  Building2,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import useSWR from "swr";
import { toast } from "sonner";

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => res.json());

const OrdersManagement = () => {
  const router = useRouter();
  const { data, error, isLoading, mutate } = useSWR("/api/orders", fetcher);

  const CATEGORY_NAME_TO_FILTER: Record<string, string> = {
  "INR": "inr",
  "Credits": "credits",
};

  // Transform API data to match component expectations
  const orders = (data?.orders || []).map((order: any) => ({
    id: order.id,
    employee: {
      name: order.user?.name || "Unknown",
      email: order.user?.email || "Unknown",
      company: order.user?.company?.name || "Unknown",
    },
    products: order.items.map((item: any) => ({
      name:
        item.variant?.product?.name || item.product?.name || "Unknown Product",
      quantity: item.quantity,
      credits: item.price,
    })),
    totalCredits: order.amount,
    inrAmount: Math.floor(order.amount / 2),
    paymentMode: order.isCashPayment?"INR":"Credits",
    status: order.status.toLowerCase(),
    orderDate: order.createdAt,
    approvedDate: null, // TODO: Add these fields to API
    dispatchedDate: null,
    deliveredDate: null,
    trackingId: null,
    notes: "",
  }));
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateAction, setUpdateAction] = useState("");
  const [updateRemarks, setUpdateRemarks] = useState("");
  const [updateOrderId, setUpdateOrderId] = useState("");
  const [updateOrderStatus, setUpdateOrderStatus] = useState("");
  const [currentOrderStatus, setCurrentOrderStatus] = useState("");
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<any>(null);

  // Export functionality
  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      const formatLabel = format === 'excel' ? 'Excel' : 'PDF';
      toast.loading(`Preparing Orders ${formatLabel} export...`, { id: 'export-loading' });

      // Build query parameters for filtering
      const params = new URLSearchParams({
        format,
        searchTerm: searchTerm || '',
        statusFilter: statusFilter !== 'all' ? statusFilter : '',
        paymentFilter: paymentFilter !== 'all' ? paymentFilter : '',
        dateFilter: dateFilter !== 'all' ? dateFilter : ''
      });

      const response = await fetch(`/api/orders/export?${params}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `orders-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success(`Orders ${formatLabel} export completed successfully!`, { id: 'export-loading' });
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-600"
          >
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
            Approved
          </Badge>
        );
      case "dispatched":
        return (
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">
            Dispatched
          </Badge>
        );
      case "delivered":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
            Delivered
          </Badge>
        );
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentBadge = (paymentMode: string) => {
    switch (paymentMode) {
      case "Credits":
        return (
          <Badge
            variant="outline"
            className="border-emerald-500 text-emerald-600"
          >
            Credits Only
          </Badge>
        );
      case "INR":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-600">
            INR Only
          </Badge>
        );
      case "mixed":
        return (
          <Badge
            variant="outline"
            className="border-purple-500 text-purple-600"
          >
            Mixed Payment
          </Badge>
        );
      default:
        return <Badge variant="outline">{paymentMode}</Badge>;
    }
  };


  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.employee.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const matchesPayment =
      paymentFilter === "all" || CATEGORY_NAME_TO_FILTER[order.paymentMode] === paymentFilter;
      

    let matchesDate = true;
    if (dateFilter !== "all") {
      const orderDate = new Date(order.orderDate);
      const now = new Date();
      switch (dateFilter) {
        case "today":
          matchesDate = orderDate.toDateString() === now.toDateString();
          break;
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = orderDate >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = orderDate >= monthAgo;
          break;
      }
    }

    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  const openUpdateModal = (
    orderId: string,
    action: string,
    currentStatus?: string
  ) => {
    setUpdateOrderId(orderId);
    setUpdateAction(action);
    setUpdateRemarks("");
    setCurrentOrderStatus(currentStatus || "");
    setUpdateOrderStatus(currentStatus || "");
    setIsUpdateModalOpen(true);
  };

  const handleOrderAction = async (
    orderId: string,
    action: string,
    remarks?: string,
    status?: string
  ) => {
    try {
      const response = await fetch(`/api/orders/order?id=${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ action, remarks, status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update order");
      }

      toast.success(`Order ${action}d successfully`);
      mutate();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    }
  };

  const confirmOrderUpdate = async () => {
    await handleOrderAction(
      updateOrderId,
      updateAction,
      updateRemarks,
      updateOrderStatus
    );
    setIsUpdateModalOpen(false);
    setUpdateRemarks("");
    setUpdateOrderId("");
    setUpdateAction("");
    setUpdateOrderStatus("");
    setCurrentOrderStatus("");
  };

  const handleBulkAction = async (action: string) => {
    if (selectedOrders.length === 0) return;
    // For now, just refresh the data
    mutate();
    setSelectedOrders([]);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-80 mt-2 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-8 mt-1 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-36 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 p-4">
              <div className="flex gap-4">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="h-4 bg-gray-200 rounded animate-pulse flex-1"
                  ></div>
                ))}
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4">
                  <div className="flex gap-4">
                    <div className="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-36 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-14 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-600 text-lg font-semibold mb-2">
              Error Loading Orders
            </div>
            <div className="text-gray-600 mb-4">
              {error.message || "An error occurred"}
            </div>
            <Button onClick={() => mutate()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Orders Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage employee redemptions and order lifecycle
          </p>
        </div>
        <div className="flex gap-3">
          {selectedOrders.length > 0 && (
            <>
              <Button
                variant="outline"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                onClick={() => handleBulkAction("approve")}
              >
                <Check className="h-4 w-4 mr-2" />
                Approve Selected ({selectedOrders.length})
              </Button>
              <Button
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-50"
                onClick={() => handleBulkAction("dispatch")}
              >
                <Truck className="h-4 w-4 mr-2" />
                Dispatch Selected ({selectedOrders.length})
              </Button>
            </>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="py-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-xl font-semibold">
                  {statusCounts.pending || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="py-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-xl font-semibold">
                  {statusCounts.approved || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="py-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Truck className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Dispatched</p>
                <p className="text-xl font-semibold">
                  {statusCounts.dispatched || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="py-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Package className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-xl font-semibold">
                  {statusCounts.delivered || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="py-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-xl font-semibold">
                  {statusCounts.cancelled || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>All Orders</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders, employees, companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="dispatched">Dispatched</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="credits">Credits Only</SelectItem>
                  <SelectItem value="inr">INR Only</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-w-full">
            <Table className="w-full table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">
                    <Checkbox
                      checked={
                        selectedOrders.length === filteredOrders.length &&
                        filteredOrders.length > 0
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedOrders(filteredOrders.map((o) => o.id));
                        } else {
                          setSelectedOrders([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead className="w-28">Order ID</TableHead>
                  <TableHead className="w-32">Employee</TableHead>
                  <TableHead className="hidden lg:table-cell w-24">Company</TableHead>
                  <TableHead className="w-32">Products</TableHead>
                  <TableHead className="text-right w-20">Total</TableHead>
                  <TableHead className="w-20">Payment</TableHead>
                  <TableHead className="w-20">Status</TableHead>
                  <TableHead className="hidden xl:table-cell w-24">Date</TableHead>
                  <TableHead className="text-center w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedOrders((prev) => [...prev, order.id]);
                          } else {
                            setSelectedOrders((prev) =>
                              prev.filter((id) => id !== order.id)
                            );
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="link"
                        className="font-medium text-emerald-600 p-0 h-auto text-xs"
                        onClick={() => setSelectedOrderForDetails(order)}
                      >
                        <div className="truncate max-w-[100px] text-xs">
                          {order.id}
                        </div>
                      </Button>
                      {order.trackingId && (
                        <div className="text-xs text-gray-500 truncate">
                          Track: {order.trackingId}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[120px]">
                        <div className="font-medium text-xs truncate">{order.employee.name}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {order.employee.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1 max-w-[80px]">
                        <Building2 className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className="text-xs truncate">
                          {order.employee.company}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs max-w-[110px]">
                        {order.products.slice(0, 1).map((product, index) => (
                          <div key={index} className="flex justify-between mb-1">
                            <span className="truncate flex-1 mr-1">{product.name}</span>
                            <span className="text-gray-500 flex-shrink-0 text-xs">
                              ×{product.quantity}
                            </span>
                          </div>
                        ))}
                        {order.products.length > 1 && (
                          <div className="text-gray-400 text-xs">
                            +{order.products.length - 1} more
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-xs">
                        <div className="font-medium">
                          {order.totalCredits.toLocaleString()}
                        </div>
                        <div className="text-gray-500">credits</div>
                        {order.paymentMode !== "credits" && (
                          <div className="text-gray-500">
                            ₹{order.inrAmount.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">{getPaymentBadge(order.paymentMode)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">{getStatusBadge(order.status)}</div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <div className="text-xs">
                        {formatDate(order.orderDate)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-0.5 justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() =>
                            router.push(`/admin/orders/${order.id}`)
                          }
                          title="View Order Details"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-7 w-7 p-0">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {order.status === "pending" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    openUpdateModal(
                                      order.id,
                                      "approve",
                                      order.status
                                    )
                                  }
                                  className="text-emerald-600"
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Approve Order
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    openUpdateModal(
                                      order.id,
                                      "reject",
                                      order.status
                                    )
                                  }
                                  className="text-red-600"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Reject Order
                                </DropdownMenuItem>
                              </>
                            )}
                            {order.status === "approved" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  openUpdateModal(
                                    order.id,
                                    "dispatch",
                                    order.status
                                  )
                                }
                                className="text-purple-600"
                              >
                                <Truck className="h-4 w-4 mr-2" />
                                Mark as Dispatched
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                openUpdateModal(
                                  order.id,
                                  "update",
                                  order.status
                                )
                              }
                              className="text-blue-600"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Update Order
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download Invoice
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                No orders found matching your criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Update Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {updateAction === "approve" && "Approve Order"}
              {updateAction === "reject" && "Reject Order"}
              {updateAction === "dispatch" && "Mark as Dispatched"}
              {updateAction === "update" && "Update Order"}
            </DialogTitle>
            <DialogDescription>
              {updateAction === "approve" &&
                "Are you sure you want to approve this order? You can add optional remarks below."}
              {updateAction === "reject" &&
                "Are you sure you want to reject this order? Please provide a reason for rejection."}
              {updateAction === "dispatch" &&
                "Mark this order as dispatched. You can add tracking information or notes below."}
              {updateAction === "update" &&
                "Update the order status and add remarks or notes for this order."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {updateAction === "update" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={updateOrderStatus}
                  onValueChange={setUpdateOrderStatus}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="DISPATCHED">Dispatched</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="remarks" className="text-right">
                Remarks
              </Label>
              <Textarea
                id="remarks"
                placeholder={
                  updateAction === "approve"
                    ? "Optional approval notes..."
                    : updateAction === "reject"
                    ? "Reason for rejection..."
                    : updateAction === "dispatch"
                    ? "Dispatch notes or tracking info..."
                    : "Add remarks or notes for this order..."
                }
                className="col-span-3"
                value={updateRemarks}
                onChange={(e) => setUpdateRemarks(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUpdateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmOrderUpdate}
              className={
                updateAction === "approve"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : updateAction === "reject"
                  ? "bg-red-600 hover:bg-red-700"
                  : updateAction === "dispatch"
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }
            >
              {updateAction === "approve" && "Approve Order"}
              {updateAction === "reject" && "Reject Order"}
              {updateAction === "dispatch" && "Mark as Dispatched"}
              {updateAction === "update" && "Update Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog 
        open={!!selectedOrderForDetails} 
        onOpenChange={() => setSelectedOrderForDetails(null)}
      >
        <DialogContent className="max-w-[95vw] lg:max-w-4xl max-h-[90vh] overflow-hidden bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-600" />
              Order Details - {selectedOrderForDetails?.id}
            </DialogTitle>
            <DialogDescription>
              Complete order information and management options
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrderForDetails && (
            <div className="grid gap-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Order Header Info */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Employee Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="space-y-1">
                      <p className="font-medium">{selectedOrderForDetails.employee.name}</p>
                      <p className="text-sm text-gray-500">{selectedOrderForDetails.employee.email}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Building2 className="h-3 w-3" />
                        {selectedOrderForDetails.employee.company}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Order Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="text-gray-500">Ordered:</span> {new Date(selectedOrderForDetails.orderDate).toLocaleDateString()}
                      </div>
                      {selectedOrderForDetails.approvedDate && (
                        <div className="text-sm">
                          <span className="text-gray-500">Approved:</span> {new Date(selectedOrderForDetails.approvedDate).toLocaleDateString()}
                        </div>
                      )}
                      {selectedOrderForDetails.dispatchedDate && (
                        <div className="text-sm">
                          <span className="text-gray-500">Dispatched:</span> {new Date(selectedOrderForDetails.dispatchedDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Order Status</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="space-y-2">
                      {getStatusBadge(selectedOrderForDetails.status)}
                      {selectedOrderForDetails.trackingId && (
                        <div className="text-sm">
                          <span className="text-gray-500">Tracking:</span> {selectedOrderForDetails.trackingId}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Products Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ordered Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table className="min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Credits per Unit</TableHead>
                        <TableHead className="text-right">Total Credits</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrderForDetails.products.map((product: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell className="text-center">{product.quantity}</TableCell>
                          <TableCell className="text-right">{product.credits}</TableCell>
                          <TableCell className="text-right font-medium">
                            {product.credits * product.quantity}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-gray-50">
                        <TableCell colSpan={3} className="font-semibold">Total Order Value</TableCell>
                        <TableCell className="text-right font-bold text-emerald-600">
                          {selectedOrderForDetails.totalCredits} credits
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  </div>
                </CardContent>
              </Card>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Button 
                  variant="outline"
                  onClick={() => {
                    // Export single order
                    toast.info("Exporting order details...");
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Order
                </Button>
                <Button 
                  onClick={() => {
                    setUpdateOrderId(selectedOrderForDetails.id);
                    setCurrentOrderStatus(selectedOrderForDetails.status);
                    setSelectedOrderForDetails(null);
                    setIsUpdateModalOpen(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Update Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersManagement;
