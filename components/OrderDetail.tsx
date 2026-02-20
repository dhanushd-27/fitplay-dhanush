"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  Phone,
  MessageSquare,
  Calendar,
  CreditCard,
  Truck,
  Eye,
  EyeOff,
} from "lucide-react";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { toast } from "sonner";

interface OrderDetailData {
  id: string;
  userId: string;
  amount: number;
  status: string;
  phNumber?: string | null;
  address?: string | null;
  deliveryInstructions?: string | null;
  remarks?: string | null;
  transactionId?: string | null;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    orderId: string;
    productId: string;
    variantId?: string | null;
    quantity: number;
    price: number;
    createdAt: string;
    updatedAt: string;
    variant?: {
      id: string;
      variantCategory: string;
      variantValue: string;
      mrp: number;
      credits?: string | null;
      availableStock?: number | null;
      productId: string;
      createdAt: string;
      updatedAt: string;
      product: {
        id: string;
        name: string;
        images: string[];
        description: string;
        discount?: number | null;
        sku: string;
        availableStock: number;
        category: { name: string } | null;
        avgRating?: number | null;
        noOfReviews?: number | null;
        createdAt: string;
        updatedAt: string;
        specifications?: any;
        subCategory?: { name: string } | null;
        vendorId?: string | null;
        vendor?: {
          id: string;
          name: string;
          email: string;
          phone?: string | null;
          address?: string | null;
          createdAt: string;
          updatedAt: string;
        } | null;
      };
    } | null;
    product: {
      id: string;
      name: string;
      images: string[];
      description: string;
      discount?: number | null;
      sku: string;
      availableStock: number;
      category: { name: string } | null;
      avgRating?: number | null;
      noOfReviews?: number | null;
      createdAt: string;
      updatedAt: string;
      specifications?: any;
      subCategory?: { name: string } | null;
      vendorId?: string | null;
      vendor?: {
        id: string;
        name: string;
        email: string;
        phone?: string | null;
        address?: string | null;
        createdAt: string;
        updatedAt: string;
      } | null;
    };
  }>;
  user: {
    id: string;
    name: string;
    email: string;
    company?: {
      name: string;
    } | null;
  };
}

interface OrderDetailProps {
  orderId?: string;
  isAdmin?: boolean;
  showBackButton?: boolean;
  backUrl?: string;
}

const OrderDetail = ({
  orderId: propOrderId,
  isAdmin: propIsAdmin,
  showBackButton = true,
  backUrl,
}: OrderDetailProps) => {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  // Determine order ID from props or params
  const orderId = propOrderId || (params.id as string);

  // Determine if user is admin from props or session
  const isAdmin =
    propIsAdmin !== undefined ? propIsAdmin : session?.user?.role === "ADMIN";

  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/orders/order?id=${orderId}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch order");
        }

        const data = await response.json();
        setOrder(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "DISPATCHED":
        return "bg-blue-100 text-blue-800";
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500";
      case "APPROVED":
        return "bg-green-500";
      case "DISPATCHED":
        return "bg-blue-500";
      case "DELIVERED":
        return "bg-emerald-500";
      case "CANCELLED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {showBackButton && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 space-y-8">
                <Card className="shadow-sm">
                  <CardHeader>
                    <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-24 bg-gray-200 animate-pulse rounded-xl"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-8">
                <Card className="shadow-sm">
                  <CardHeader>
                    <div className="h-6 w-24 bg-gray-200 animate-pulse rounded" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-4 bg-gray-200 animate-pulse rounded"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {showBackButton && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <h1 className="text-2xl font-bold">Order Details</h1>
                </div>
              </div>
            )}
            <Card className="shadow-sm">
              <CardContent className="flex items-center justify-center py-16">
                <div className="text-center max-w-md">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Order Not Found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {error || "The order you're looking for doesn't exist."}
                  </p>
                  {showBackButton && (
                    <Button onClick={handleBack} variant="outline">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Go Back
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
<div className="relative min-h-screen bg-gray-50/50">

  {/* ONLY NAVBAR GREEN BACKGROUND */}
  <div className="absolute top-0 left-0 w-full h-20 bg-emerald-700" />

  {/* PAGE CONTENT (UNCHANGED) */}
  <div className="relative pt-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {showBackButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                  className="self-start"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Order #{order.id}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isAdmin ? "Admin Order Details" : "Your Order Details"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                className={`${getStatusColor(
                  order.status
                )} text-sm px-4 py-2 font-medium`}
              >
                {order.status}
              </Badge>
            </div>
          </div>
        </div>
<div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="xl:col-span-2 space-y-8">
              {/* Order Items */}
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Package className="h-6 w-6" />
                    Order Items ({order.items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white transition-colors duration-200"
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                        <ImageWithFallback
                          src={
                            item.variant?.product?.images?.[0] ||
                            item.product?.images?.[0] ||
                            "/placeholder.png"
                          }
                          alt={
                            item.variant?.product?.name ||
                            item.product?.name ||
                            "Product"
                          }
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {item.variant?.product?.name ||
                            item.product?.name ||
                            "Unknown Product"}
                        </h4>
                        {item.variant && (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {item.variant.variantCategory}:{" "}
                              {item.variant.variantValue}
                            </Badge>
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                          <span>SKU: {item.product?.sku || "N/A"}</span>
                          {/* Show vendor info only to admin */}
                          {isAdmin && item.variant?.product?.vendor && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span>
                                Vendor: {item.variant.product.vendor.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right sm:text-left sm:flex sm:flex-col sm:items-end space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Qty:</span>
                          <Badge variant="secondary" className="font-semibold">
                            {item.quantity}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            Unit: {formatCurrency(item.price)}
                          </p>
                          <p className="font-semibold text-lg text-gray-900">
                            Total: {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Delivery Information */}
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Truck className="h-6 w-6" />
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {order.phNumber && (
                    <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <Phone className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-blue-900">
                          Phone Number
                        </p>
                        <p className="font-semibold text-blue-800">
                          {order.phNumber}
                        </p>
                      </div>
                    </div>
                  )}
                  {order.address && (
                    <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <MapPin className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-green-900">
                          Delivery Address
                        </p>
                        <p className="font-semibold text-green-800 whitespace-pre-line">
                          {order.address}
                        </p>
                      </div>
                    </div>
                  )}
                  {order.deliveryInstructions && (
                    <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <MessageSquare className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-purple-900">
                          Delivery Instructions
                        </p>
                        <p className="font-semibold text-purple-800 whitespace-pre-line">
                          {order.deliveryInstructions}
                        </p>
                      </div>
                    </div>
                  )}
                  {!order.phNumber &&
                    !order.address &&
                    !order.deliveryInstructions && (
                      <div className="text-center py-12">
                        <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">
                          No delivery information available
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Customer has not provided delivery details
                        </p>
                      </div>
                    )}
                </CardContent>
              </Card>

              {/* Admin Remarks - Only visible to admin */}
              {isAdmin && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Status & Remarks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${getStatusIcon(
                            order.status
                          )}`}
                        />
                        <span className="font-medium">Current Status:</span>
                        <Badge
                          className={`${getStatusColor(
                            order.status
                          )} text-sm px-3 py-1`}
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>

                    {order.remarks ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium text-blue-900 mb-1">
                              Latest Remarks
                            </h4>
                            <p className="text-blue-800 text-sm">
                              {order.remarks}
                            </p>
                            <p className="text-xs text-blue-600 mt-2">
                              Updated: {formatDate(order.updatedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <MessageSquare className="h-5 w-5 text-gray-400" />
                          <div>
                            <h4 className="font-medium text-gray-700 mb-1">
                              No Remarks
                            </h4>
                            <p className="text-sm text-gray-500">
                              No remarks have been added to this order yet.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                        <div>
                          <p className="text-xs text-yellow-800 font-medium">
                            Status History Note
                          </p>
                          <p className="text-xs text-yellow-700 mt-1">
                            Currently showing the latest status and remarks. For
                            detailed status history tracking, consider
                            implementing an OrderStatusHistory table to track
                            all status changes with timestamps.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Order Summary */}
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">
                        Subtotal:
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(order.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">
                        Shipping:
                      </span>
                      <span className="font-semibold text-green-600">Free</span>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                      <span className="font-bold text-lg text-gray-900">
                        Total:
                      </span>
                      <span className="font-bold text-xl text-gray-900">
                        {formatCurrency(order.amount)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information - Only visible to admin */}
              {isAdmin && (
                <Card className="shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <User className="h-6 w-6" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          Name
                        </p>
                        <p className="font-semibold text-blue-800">
                          {order.user.name}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm font-medium text-green-900 mb-1">
                          Email
                        </p>
                        <p className="font-semibold text-green-800">
                          {order.user.email}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm font-medium text-purple-900 mb-1">
                          Company
                        </p>
                        <p className="font-semibold text-purple-800">
                          {order.user.company?.name || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Timeline */}
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Calendar className="h-6 w-6" />
                    Order Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-blue-900">
                          Order Created
                        </p>
                        <p className="text-sm text-blue-700">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    {order.updatedAt !== order.createdAt && (
                      <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0" />
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-green-900">
                            Last Updated
                          </p>
                          <p className="text-sm text-green-700">
                            {formatDate(order.updatedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                    {order.transactionId && (
                      <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <CreditCard className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-purple-900">
                            Transaction ID
                          </p>
                          <p className="text-sm text-purple-700 font-mono">
                            {order.transactionId}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Status Information for Users */}
              {!isAdmin && (
                <Card className="shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <Truck className="h-6 w-6" />
                      Order Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`w-4 h-4 rounded-full ${getStatusIcon(
                            order.status
                          )}`}
                        />
                        <Badge
                          className={`${getStatusColor(
                            order.status
                          )} font-medium`}
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 font-medium">
                        {order.status === "PENDING" &&
                          "Your order is being reviewed by our team"}
                        {order.status === "APPROVED" &&
                          "Your order has been approved and is being prepared"}
                        {order.status === "DISPATCHED" &&
                          "Your order is on its way to you"}
                        {order.status === "DELIVERED" &&
                          "Your order has been successfully delivered"}
                        {order.status === "CANCELLED" &&
                          "Your order has been cancelled"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

        
      </div>
    </div>
  </div>
</div>
  );
};


    
  
  

export default OrderDetail;
