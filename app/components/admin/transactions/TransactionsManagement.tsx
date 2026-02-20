"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Download,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCcw,
  Calendar,
  Building2,
  User,
  CreditCard,
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import DatePickerWithRange from "@/components/date-picker-with-range";
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => res.json());

const TransactionsManagement = () => {
  const router = useRouter();
  const { data, error, isLoading } = useSWR(
    "/api/admin/wallet-transactions",
    fetcher
  );
  const transactions = data?.transactions || [];
  const [searchTerm, setSearchTerm] = useState("");

  const handleViewDetails = (transaction: any) => {
    // Navigate to transaction detail page in the same tab
    router.push(`/admin/transactions/${transaction.id}`);
  };
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [dateRange, setDateRange] = useState<any>(null);

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      toast.info(`Exporting transactions as ${format === 'excel' ? 'Excel' : 'PDF'}...`);
      
      const params = new URLSearchParams({
        format,
        searchTerm,
        typeFilter,
        statusFilter,
        companyFilter,
      });

      const response = await fetch(`/api/transactions/export?${params}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Transactions exported as ${format === 'excel' ? 'Excel' : 'PDF'} successfully`);
    } catch (error) {
      console.error('Error exporting transactions:', error);
      toast.error(`Failed to export transactions as ${format === 'excel' ? 'Excel' : 'PDF'}`);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "credit_redemption":
        return (
          <Badge
            variant="outline"
            className="border-emerald-500 text-emerald-600"
          >
            <ArrowDownLeft className="h-3 w-3 mr-1" />
            Credit Redemption
          </Badge>
        );
      case "inr_payment":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-600">
            <CreditCard className="h-3 w-3 mr-1" />
            INR Payment
          </Badge>
        );
      case "credit_allocation":
        return (
          <Badge
            variant="outline"
            className="border-purple-500 text-purple-600"
          >
            <ArrowUpRight className="h-3 w-3 mr-1" />
            Credit Allocation
          </Badge>
        );
      case "refund":
        return (
          <Badge
            variant="outline"
            className="border-orange-500 text-orange-600"
          >
            <RefreshCcw className="h-3 w-3 mr-1" />
            Refund
          </Badge>
        );
      case "credit_purchase":
        return (
          <Badge
            variant="outline"
            className="border-indigo-500 text-indigo-600"
          >
            <Coins className="h-3 w-3 mr-1" />
            Credit Purchase
          </Badge>
        );
      case "mixed_payment":
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-600"
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Mixed Payment
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
            Completed
          </Badge>
        );
      case "processed":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
            Processed
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-600"
          >
            Pending
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAmountDisplay = (transaction: any) => {
    if (
      transaction.type === "credit_redemption" ||
      transaction.type === "credit_allocation"
    ) {
      return `${transaction.amount.toLocaleString()} credits`;
    } else if (transaction.type === "credit_purchase") {
      return `₹${transaction.amount.toLocaleString()}`;
    } else {
      return `₹${transaction.amount.toLocaleString()}`;
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const empCompany = transaction.employee.company || "Individual";
    const matchesSearch =
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.employee.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      empCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || transaction.status === statusFilter;
    const empCompanyForFilter = transaction.employee.company || "Individual";
    const matchesCompany =
      companyFilter === "all" || empCompanyForFilter === companyFilter;

    let matchesDate = true;
    if (dateRange?.from && dateRange?.to) {
      const transactionDate = new Date(transaction.date);
      matchesDate =
        transactionDate >= dateRange.from && transactionDate <= dateRange.to;
    }

    return (
      matchesSearch &&
      matchesType &&
      matchesStatus &&
      matchesCompany &&
      matchesDate
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const companies = [...new Set(transactions.map((t) => t.employee.company || "Individual"))];

  // Calculate totals
  const totalCreditsRedeemed = transactions
    .filter((t) => t.type === "credit_redemption" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalINRTransactions = transactions
    .filter(
      (t) =>
        (t.type === "inr_payment" || t.type === "credit_purchase") &&
        t.status === "completed"
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRefunds = transactions
    .filter((t) => t.type === "refund" && t.status === "processed")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCreditsAllocated = transactions
    .filter((t) => t.type === "credit_allocation" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Transactions Management
          </h1>
          <p className="text-gray-600 mt-2">
            Track credits, payments, and refunds across the platform
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Sync Transactions
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-emerald-500 py-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <ArrowDownLeft className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Credits Redeemed</p>
                <p className="text-xl font-semibold">
                  {totalCreditsRedeemed.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 py-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">INR Transactions</p>
                <p className="text-xl font-semibold">
                  ₹{totalINRTransactions.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 py-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ArrowUpRight className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Credits Allocated</p>
                <p className="text-xl font-semibold">
                  {totalCreditsAllocated.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 py-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <RefreshCcw className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Refunds Processed</p>
                <p className="text-xl font-semibold">
                  {totalRefunds.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Credits returned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>All Transactions</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-44">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Transaction Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="credit_redemption">
                    Credit Redemption
                  </SelectItem>
                  <SelectItem value="inr_payment">INR Payment</SelectItem>
                  <SelectItem value="credit_allocation">
                    Credit Allocation
                  </SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                  <SelectItem value="credit_purchase">
                    Credit Purchase
                  </SelectItem>
                  <SelectItem value="mixed_payment">Mixed Payment</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="processed">Processed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger className="w-full sm:w-44">
                  <Building2 className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">Loading transactions...</div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-600">Error loading transactions</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow 
                      key={transaction.id}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleViewDetails(transaction)}
                    >
                      <TableCell>
                        <div className="font-medium text-emerald-600">
                          {transaction.id}
                        </div>
                        {transaction.orderId && (
                          <div className="text-xs text-gray-500">
                            Order: {transaction.orderId}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            {transaction.employee.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.employee.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {transaction.employee.company || 'Individual'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p
                            className="text-sm text-gray-900 truncate"
                            title={transaction.description}
                          >
                            {transaction.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium">
                          {getAmountDisplay(transaction)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {transaction.method.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(transaction.date)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          {!isLoading && !error && filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <Coins className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                No transactions found matching your criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsManagement;
