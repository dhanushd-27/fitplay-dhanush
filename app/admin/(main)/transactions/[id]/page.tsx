"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, User, CreditCard, Calendar, Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => res.json());

export default function TransactionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: transaction, error, isLoading } = useSWR(
    `/api/admin/wallet-transactions/${params.id}`,
    fetcher
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading transaction details...</div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">Failed to load transaction details</div>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <Badge className="bg-emerald-100 text-emerald-700">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-700">Failed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status || "Unknown"}</Badge>;
    }
  };

  const getTypeBadge = (isCredit: boolean) => {
    return isCredit ? (
      <Badge className="bg-green-100 text-green-700">Credit</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-700">Debit</Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transaction Details</h1>
            <p className="text-gray-600">Transaction ID: {transaction.id}</p>
          </div>
        </div>
        {getStatusBadge(transaction.status)}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Transaction Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Transaction ID</label>
                  <p className="font-mono text-emerald-600">{transaction.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <div className="mt-1">
                    {getTypeBadge(transaction.isCredit)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount</label>
                  <p className="text-lg font-semibold">
                    {transaction.isCredit ? '+' : '-'}{transaction.amount} credits
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Cash Amount</label>
                  <p className="font-medium">
                    {transaction.cashAmount ? `₹${transaction.cashAmount}` : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Balance After Transaction</label>
                  <p className="font-medium">{transaction.balanceAfterTxn || 'N/A'} credits</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Method</label>
                  <p className="capitalize">{transaction.modeOfPayment || 'N/A'}</p>
                </div>
              </div>
              {transaction.transactionType && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Transaction Type</label>
                  <p className="capitalize">{transaction.transactionType}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Information (if applicable) */}
          {transaction.order && (
            <Card>
              <CardHeader>
                <CardTitle>Related Order</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Order ID:</strong> {transaction.order.id}</p>
                  <p><strong>Order Status:</strong> {transaction.order.status}</p>
                  <p><strong>Order Amount:</strong> ₹{transaction.order.amount}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="font-medium">{transaction.user?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm text-gray-600">{transaction.user?.email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-sm text-gray-600">{transaction.user?.phone || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          {transaction.user?.company && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Company Name</label>
                  <p className="font-medium">{transaction.user.company.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-sm text-gray-600">{transaction.user.company.address}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-sm">{new Date(transaction.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-sm">{new Date(transaction.updatedAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}