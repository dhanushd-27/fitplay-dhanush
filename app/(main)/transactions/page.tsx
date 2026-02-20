"use client";

import React from "react";
import { useWallet } from "@/app/hooks/useWallet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  CreditCard,
  Wallet,
  Building2,
  Package,
  Coins,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const TransactionsPage = () => {
  const { walletHistory, wallet, isLoading, error } = useWallet();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Transactions</h1>
          <p className="text-gray-600 mt-2">
            View your wallet transactions and purchases
          </p>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                Failed to load transactions. Please try again later.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getTransactionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "credit":
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case "purchase":
        return <ShoppingCart className="h-5 w-5 text-blue-600" />;
      default:
        return <CreditCard className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTransactionBadge = (type: string, amount: number) => {
    if (type === "Credit") {
      return (
        <Badge className="bg-green-100 text-green-700">
          <TrendingUp className="h-3 w-3 mr-1" />
          Credit Added
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-600">
          <ShoppingCart className="h-3 w-3 mr-1" />
          Purchase
        </Badge>
      );
    }
  };

  const formatAmount = (amount: number) => {
    return amount >= 0 ? `+${amount}` : amount.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Transactions</h1>
        <p className="text-gray-600 mt-2">
          View your wallet transactions and purchases
        </p>
      </div>

      {/* Wallet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500 py-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wallet className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Balance</p>
                <p className="text-xl font-semibold">
                  {wallet?.balance.toLocaleString() || 0} credits
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 py-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Coins className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Credits Used</p>
                <p className="text-xl font-semibold">
                  {walletHistory
                    .filter((tx) => tx.amount < 0)
                    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
                    .toLocaleString()}{" "}
                  credits
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 py-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-xl font-semibold">{walletHistory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Balance After</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {walletHistory.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {getTransactionBadge(
                        transaction.type,
                        transaction.amount
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(transaction.type)}
                        <span className="text-sm text-gray-900">
                          {transaction.description}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-medium ${
                          transaction.amount >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatAmount(transaction.amount)} credits
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-gray-900">
                        {transaction.balance.toLocaleString()} credits
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {walletHistory.length === 0 && (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No transactions found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsPage;
