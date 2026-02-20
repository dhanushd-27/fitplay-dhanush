"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Search,
  Users,
  Mail,
  Phone,
  Calendar,
  Wallet,
  Plus,
  Minus,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  gender?: string;
  verified: boolean;
  claimed: boolean;
  createdAt: string;
  wallet?: {
    balance: number;
    expiryDate: string;
  };
}

export default function HREmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const[remark,setRemark] = useState("");
  const [creditLoading, setCreditLoading] = useState(false);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setEmployees(data.users || []))
      .finally(() => setLoading(false));
  }, []);

 const filteredAndSortedEmployees = useMemo(() => {
  let list = [...employees];

  // 🚫 Hide HR by default
  list = list.filter((e) => e.role !== "HR");

  // 🔍 Search
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    list = list.filter(
      (e) =>
        e.name.toLowerCase().includes(term) ||
        e.email.toLowerCase().includes(term) ||
        e.phone.includes(term)
    );
  }

  // ✅ Status filter
  if (statusFilter === "verified") {
    list = list.filter((e) => e.verified && e.claimed);
  }
  if (statusFilter === "unverified") {
    list = list.filter((e) => !e.verified);
  }
  if (statusFilter === "unclaimed") {
    list = list.filter((e) => !e.claimed);
  }

  // 🔃 Sorting
  list.sort((a, b) => {
    switch (sortBy) {
      case "email":
        return a.email.localeCompare(b.email);
      case "credits":
        return (b.wallet?.balance || 0) - (a.wallet?.balance || 0);
      case "date":
        return (
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        );
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return list;
}, [employees, searchTerm, statusFilter, sortBy]);


  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.verified && e.claimed).length,
    pending: employees.filter((e) => !e.verified || !e.claimed).length,
    totalCredits: employees.reduce((s, e) => s + (e.wallet?.balance || 0), 0),
  };

  const handleCreditUpdate = async () => {
    if (!selectedEmployee || !creditAmount) {
      toast.error("Please enter a valid wallet amount");
      return;
    }
    if(!remark){
       toast.error("Enter Remak");
       return;
    }

    const amount = parseFloat(creditAmount);
    if (isNaN(amount)) {
      toast.error("Please enter a valid number");
      return;
    }

    setCreditLoading(true);
    try {
      const response = await fetch("/api/wallets", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedEmployee.id,
          creditAmount: amount,
          remark:remark
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Wallet ${amount > 0 ? 'credited' : 'debited'} successfully!`);
        
        // Update local state
        setEmployees(prev => 
          prev.map(emp => 
            emp.id === selectedEmployee.id
              ? {
                  ...emp,
                  wallet: {
                    ...emp.wallet,
                    balance: data.data.newBalance,
                  } as any,
                }
              : emp
          )
        );
        
        setCreditDialogOpen(false);
        setCreditAmount("");
        setSelectedEmployee(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to update wallet");
      }
    } catch (error) {
      toast.error("Failed to update wallet");
    } finally {
      setCreditLoading(false);
    }
  };

if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </CardHeader>
              <CardContent>
                <div className="h-6 bg-gray-200 rounded w-12"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Employee Management</h1>
        <p className="text-gray-600">View and manage all users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          ["Total Users", stats.total],
          ["Active Users", stats.active],
          ["Pending", stats.pending],
          ["Total Credits", stats.totalCredits],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
   <Card>
  <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-4">

    {/* Search */}
    <div className="relative md:col-span-2 space-y-1">
      <p className="text-sm font-bold text-gray-900">
        Search
      </p>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          className="pl-9"
          placeholder="Search name, email, phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>

    {/* Verification Filter */}
    <div className="space-y-1">
      <p className="text-sm font-bold text-gray-900">
        Verification Status
      </p>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Filter Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Users</SelectItem>
          <SelectItem value="verified">Verified & Claimed</SelectItem>
          <SelectItem value="unverified">Unverified</SelectItem>
          <SelectItem value="unclaimed">Unclaimed</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Sort */}
    <div className="space-y-1">
      <p className="text-sm font-bold text-gray-900">
        Sort By
      </p>

      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger>
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Name</SelectItem>
          <SelectItem value="email">Email</SelectItem>
          <SelectItem value="credits">Credits</SelectItem>
          <SelectItem value="date">Date Created</SelectItem>
        </SelectContent>
      </Select>
    </div>

  </CardContent>
</Card>


      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredAndSortedEmployees.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <div className="font-medium">{e.name}</div>
                    <div className="text-sm text-gray-500">{e.email}</div>
                  </TableCell>

                  <TableCell className="space-y-1">
                    <Badge variant={e.verified ? "default" : "destructive"}>
                      {e.verified ? "Verified" : "Unverified"}
                    </Badge>
                    <Badge variant={e.claimed ? "default" : "secondary"}>
                      {e.claimed ? "Claimed" : "Pending"}
                    </Badge>
                  </TableCell>

                  <TableCell>{e.wallet?.balance || 0}</TableCell>

                  <TableCell>
                    {new Date(e.createdAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedEmployee(e);
                            setCreditDialogOpen(true);
                          }}
                        >
                          Manage Wallet
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    {/* Wallet Dialog (unchanged) */}
<Dialog open={creditDialogOpen} onOpenChange={setCreditDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-gray-200 shadow-xl">
          <DialogHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 -m-6 mb-4 p-6 rounded-t-lg border-b">
            <DialogTitle className="text-xl font-bold text-emerald-800">Manage Employee Wallet</DialogTitle>
            <DialogDescription className="text-emerald-700">
              {selectedEmployee && (
                <div className="space-y-2 mt-2">
                  <div>Update wallet balance for <strong className="text-emerald-800">{selectedEmployee.name}</strong></div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-emerald-200">
                    <span className="text-sm">Current Balance: </span>
                    <strong className="text-lg text-emerald-700">{selectedEmployee.wallet?.balance?.toLocaleString() || 0} credits</strong>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6 bg-gray-50 -mx-6 px-6">
            <div className="space-y-3">
              <Label htmlFor="creditAmount" className="text-sm font-semibold text-gray-700">
                Wallet Amount (use negative number to deduct)
              </Label>
              <Input
                id="creditAmount"
                type="number"
                placeholder="Enter amount (e.g., 1000 or -500)"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                className="w-full border-2 border-gray-200 focus:border-emerald-500 bg-white shadow-sm"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">Quick Actions</Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-700 font-medium"
                  onClick={() => setCreditAmount("1000")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add 1000
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-700 font-medium"
                  onClick={() => setCreditAmount("5000")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add 5000
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-red-50 border-red-200 hover:bg-red-100 text-red-700 font-medium"
                  onClick={() => setCreditAmount("-1000")}
                >
                  <Minus className="h-4 w-4 mr-2" />
                  Deduct 1000
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-3">
  <Label htmlFor="remark" className="text-sm font-semibold text-gray-700">
    Remark / Reason <span className="text-red-500">*</span>
  </Label>
  <Input
    id="remark"
    type="text"
    placeholder="e.g. Monthly wellness credits"
    value={remark}
    onChange={(e) => setRemark(e.target.value)}
    className="w-full border-2 border-gray-200 focus:border-emerald-500 bg-white shadow-sm"
  />
</div>

          <DialogFooter className="bg-white -mx-6 -mb-6 px-6 py-4 border-t border-gray-200 rounded-b-lg">
            <div className="flex justify-end gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => {
                  setCreditDialogOpen(false);
                  setCreditAmount("");
                  setSelectedEmployee(null);
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreditUpdate}
                disabled={creditLoading || !creditAmount || !remark.trim()}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg font-semibold px-6"
              >
                {creditLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4 mr-2" />
                    Update Wallet
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
         </div>
  );
}

