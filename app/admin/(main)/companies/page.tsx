"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR, { useSWRConfig } from "swr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Building2,
  Users,
  ShoppingCart,
  Package,
  CreditCard,
  MoreHorizontal,
  Plus,
  Minus,
  Wallet,
  Trash2,
  Edit2,
  RefreshCw,
  DollarSign,
  Search,
  Eye,
  EyeOff,
  Coins,
} from "lucide-react";
import { ImageWithFallback } from "@/components/ImageWithFallback";

const fetcher = (url: string) => fetch(url).then((res) => res.json());


function EmployeesDrawer({ company, users, open, onOpenChange, mutateAll }: any) {
  const companyUsers = useMemo(() => 
    (users || []).filter((u: any) => u.companyId === company?.id),
    [users, company?.id]
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteEmployee = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete employee');
      toast.success('Employee deleted');
      if (mutateAll) mutateAll();
    } catch (err) {
      toast.error((err as Error).message || 'Failed to delete employee');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl bg-white max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Employees - {company?.name}</DialogTitle>
          <DialogDescription>View and manage company employees ({companyUsers.length} total)</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyUsers.length > 0 ? (
                  companyUsers.map((u: any) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.phone}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{u.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.verified ? "default" : "secondary"}>
                          {u.verified ? "Verified" : "Unverified"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem className="text-red-600" onClick={() => deleteEmployee(u.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              {deletingId === u.id ? 'Deleting...' : 'Delete'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No employees found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <DialogFooter className="px-6 py-4 border-t">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// Orders Management Drawer Component
function OrdersDrawer({ company, open, onOpenChange }: any) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchOrders();
    }
  }, [open]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        const companyOrders = (data.orders || []).filter((o: any) => o.user?.companyId === company?.id);
        setOrders(companyOrders);
      }
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl bg-white max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Orders - {company?.name}</DialogTitle>
          <DialogDescription>
            View all orders from this company ({orders.length} total)
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length > 0 ? (
                      orders.map((o: any) => (
                        <TableRow key={o.id}>
                          <TableCell className="font-medium">{o.id.slice(0, 8)}</TableCell>
                          <TableCell>{o.user?.name}</TableCell>
                          <TableCell className="font-semibold">₹{o.amount?.toLocaleString()}</TableCell>
                          <TableCell>{o.items?.length || 0}</TableCell>
                          <TableCell>
                            <Badge variant={o.status === 'DELIVERED' ? 'default' : o.status === 'PENDING' ? 'secondary' : 'destructive'}>
                              {o.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                          No orders found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

        <DialogFooter className="px-6 py-4 border-t">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Products Visibility Dialog Component
function ProductsDrawer({ company, open, onOpenChange }: any) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        const prods = (data.data || data.products || []).map((p: any) => ({
          ...p,
          companies: p.companies || [],
          variants: p.variants || [],
          companyIds: (p.companies || []).map((c: any) => (c?.id || c?._id || (typeof c === 'string' ? c : null))).filter(Boolean),
        }));
        setProducts(prods);
      }
    } catch (error) {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const updateProductVisibility = async (productId: string, enable: boolean) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const existingCompanyIds = product.companyIds || (product.companies || []).map((c: any) => (c?.id || c?._id || c?.companyId || (typeof c === 'string' ? c : null))).filter(Boolean);
      const newCompanyIds = enable
        ? Array.from(new Set([...existingCompanyIds, company.id]))
        : existingCompanyIds.filter((id: string) => id !== company.id);

      const res = await fetch('/api/prod-visiblity', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, companyIds: newCompanyIds }),
      });

      if (!res.ok) throw new Error('Failed to update visibility');

      // update local state for immediate UI feedback
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, companyIds: newCompanyIds } : p));
      toast.success(`Product ${enable ? 'enabled' : 'disabled'} successfully`);
    } catch (err) {
      toast.error("Failed to update product visibility");
    }
  };

  const categories = Array.from(new Set(products.map(p => p?.category?.name).filter(Boolean)));
  
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p?.category?.name === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl bg-white max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Product Visibility - {company?.name}</DialogTitle>
          <DialogDescription>
            Manage which products are visible to this company ({filteredProducts.length} of {products.length})
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Filters */}
          <div className="px-6 space-y-3 border-b pb-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48"
                title="Filter products by category"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {(category || '').replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product List */}
          <div className="px-6 flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Image</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product: any) => {
                      const isVisible = (product?.companyIds || []).includes(company?.id);
                      const creditRange = (product?.variants || []).length > 0 ? ((product.variants[0].mrp || 0) * 2) : 0;
                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="w-16 h-16 relative overflow-hidden bg-gray-100 rounded-md">
                              <ImageWithFallback
                                src={product?.images?.[0] || '/placeholder.png'}
                                alt={product?.name || 'Product'}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{product?.name || 'Unknown Product'}</TableCell>
                          <TableCell>{(product?.category?.name || '').replace(/_/g, ' ')}</TableCell>
                          <TableCell>{product?.vendor?.name || '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Coins className="w-4 h-4 text-amber-600" />
                              <span className="font-medium text-amber-700">{creditRange || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {isVisible ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                              <span className="text-sm">{isVisible ? 'Visible' : 'Hidden'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <button
                              onClick={() => updateProductVisibility(product?.id || '', !isVisible)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full border-2 transition-colors ${isVisible ? 'bg-emerald-600 border-emerald-700' : 'bg-gray-300 border-gray-400'}`}
                            >
                              <span className="sr-only">Toggle product visibility</span>
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ${isVisible ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex justify-center py-12 text-gray-500">
                <p>No products found</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Transactions Drawer Component
function TransactionsDrawer({ company, open, onOpenChange }: any) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTransactions();
    }
  }, [open]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/wallet-transactions');
      if (res.ok) {
        const data = await res.json();
        const companyTx = (data.transactions || []).filter((t: any) => t.user?.company?.id === company?.id);
        setTransactions(companyTx);
      }
    } catch (error) {
      toast.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl bg-white max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Transactions - {company?.name}</DialogTitle>
          <DialogDescription>
            View all wallet transactions from this company ({transactions.length} total)
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length > 0 ? (
                      transactions.map((t: any) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">{t.id.slice(0, 8)}</TableCell>
                          <TableCell>{t.user?.name}</TableCell>
                          <TableCell className="font-semibold">₹{t.amount?.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{t.transactionType}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={t.status === 'COMPLETED' ? 'default' : 'secondary'}>
                              {t.status || 'PENDING'}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

        <DialogFooter className="px-6 py-4 border-t">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Company Edit Dialog Component
function CompanyDialog({ open, onOpenChange, company, onSave }: any) {
  const [form, setForm] = useState<any>({ name: '', address: '', linkedin: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (company && open) {
      setForm({ name: company.name || '', address: company.address || '', linkedin: company.linkedin || '' });
    }
  }, [company, open]);

  const handleSave = async () => {
    if (!form.name) {
      toast.error("Company name is required");
      return;
    }

    setLoading(true);
    try {
      if (company?.id) {
        const res = await fetch(`/api/companies/${company.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Failed to update company');
        toast.success('Company updated successfully');
        onSave();
        onOpenChange(false);
      }
    } catch (err) {
      toast.error((err as Error).message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-white">
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
          <DialogDescription>Update company information</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="comp-name">Company Name *</Label>
            <Input
              id="comp-name"
              placeholder="Enter company name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comp-address">Address *</Label>
            <Input
              id="comp-address"
              placeholder="Enter company address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comp-linkedin">LinkedIn Profile</Label>
            <Input
              id="comp-linkedin"
              placeholder="LinkedIn URL (optional)"
              value={form.linkedin}
              onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? 'Updating...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CompaniesManagementPage() {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { data: companiesRes } = useSWR("/api/companies", fetcher);
  const { data: usersRes } = useSWR("/api/admin/users", fetcher);
  const { data: txRes } = useSWR("/api/admin/wallet-transactions", fetcher);
  const { data: ordersRes } = useSWR("/api/orders", fetcher);
  const { data: productsRes } = useSWR("/api/products", fetcher);

  const companies = companiesRes?.companies || companiesRes?.data || [];
  const users = usersRes?.users || [];
  const transactions = txRes?.transactions || [];
  const orders = ordersRes?.orders || [];
  const products = (productsRes?.data || productsRes?.products || []).map((p: any) => ({
    ...p,
    companies: p.companies || [],
    companyIds: (p.companies || []).map((c: any) => (c?.id || c?._id || c?.companyId || (typeof c === 'string' ? c : null))).filter(Boolean),
  }));

  const [searchTerm, setSearchTerm] = useState("");
  
  // Dialog states
  const [employeesDrawerOpen, setEmployeesDrawerOpen] = useState(false);
  const [ordersDrawerOpen, setOrdersDrawerOpen] = useState(false);
  const [productsDrawerOpen, setProductsDrawerOpen] = useState(false);
  const [transactionsDrawerOpen, setTransactionsDrawerOpen] = useState(false);
  const [editCompanyOpen, setEditCompanyOpen] = useState(false);
  const [createCompanyOpen, setCreateCompanyOpen] = useState(false);
  
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [companyForm, setCompanyForm] = useState({ name: "", address: "" });
  const [creatingCompany, setCreatingCompany] = useState(false);
  const filtered = useMemo(() => {
    return companies.filter((c: any) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [companies, searchTerm]);

  const companyMetrics = (company: any) => {
   
    const companyUsers = users.filter((u: any) => u.companyId === company.id);
    const hrCount = companyUsers.filter((u: any) => u.role === 'HR').length;
    const companyOrders = orders.filter((o: any) => o.user?.companyId === company.id);
    const companyTx = transactions.filter((t: any) => t.user?.company?.id === company.id);
    const activeProducts = products.filter((p: any) => (p.companyIds || []).includes(company.id));

    return {
      employees: companyUsers.length,
      hrCount,
      orders: companyOrders.length,
      products: activeProducts.length,
      transactions: companyTx.length,
      totalSpent: companyOrders.reduce((sum: number, o: any) => sum + (o.amount || 0), 0),
    };
  };

  const stats = useMemo(() => {
    const totalCompanies = companies.length;
    const totalEmployees = users.length;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.amount || 0), 0);

    return {
      totalCompanies,
      totalEmployees,
      totalOrders,
      totalRevenue,
    };
  }, [companies, users, orders]);

  const handleEditCompany = (company: any) => {
    setSelectedCompany(company);
    setEditCompanyOpen(true);
  };

  const handleCreateCompany = async () => {
    if (!companyForm.name || !companyForm.address) {
      toast.error("Please fill in all fields");
      return;
    }

    setCreatingCompany(true);
    try {
      const res = await fetch("/api/companies/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companyForm),
      });

      if (!res.ok) throw new Error("Failed to create company");

      setCompanyForm({ name: "", address: "" });
      await mutate('/api/companies');
      toast.success('Company created successfully');
      setCreateCompanyOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create company");
    } finally {
      setCreatingCompany(false);
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company?')) return;
    try {
      const res = await fetch(`/api/companies/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete company');
      toast.success('Company deleted successfully');
      mutate('/api/companies');
    } catch (err) {
      toast.error('Failed to delete company');
    }
  };

  const openDrawer = (company: any, drawerType: string) => {
    setSelectedCompany(company);
    switch (drawerType) {
      case 'employees':
        setEmployeesDrawerOpen(true);
        break;
      case 'orders':
        setOrdersDrawerOpen(true);
        break;
      case 'products':
        setProductsDrawerOpen(true);
        break;
      case 'transactions':
        setTransactionsDrawerOpen(true);
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Company Management</h1>
          <p className="text-gray-600 mt-2">
            Manage all companies, employees, orders, and products
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={createCompanyOpen} onOpenChange={setCreateCompanyOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Create Company
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-4xl bg-white">
              <DialogHeader>
                <DialogTitle>Create Company</DialogTitle>
                <DialogDescription>
                  Add a new company to the system
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="company-name">Company Name *</Label>
                  <Input
                    id="company-name"
                    value={companyForm.name}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, name: e.target.value })
                    }
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <Label htmlFor="company-address">Company Address *</Label>
                  <Input
                    id="company-address"
                    value={companyForm.address}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, address: e.target.value })
                    }
                    placeholder="Enter company address"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleCreateCompany}
                    disabled={creatingCompany}
                    className="flex-1"
                  >
                    {creatingCompany ? "Creating..." : "Create Company"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateCompanyOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <button
            onClick={() => mutate('/api/companies')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh companies"
            aria-label="Refresh companies"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Companies
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-50">
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalCompanies}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Active organizations
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Employees
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-50">
              <Users className="w-4 h-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalEmployees}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Across all companies
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Orders
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-50">
              <ShoppingCart className="w-4 h-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalOrders}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              From all employees
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-50">
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ₹{(stats.totalRevenue /  100000).toFixed(1)}L
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Total spending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search companies by name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Companies Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-center">Employees</TableHead>
                  <TableHead className="text-center">HRs</TableHead>
                  <TableHead className="text-center">Orders</TableHead>
                  
                  <TableHead className="text-center">Products</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length > 0 ? (
                  filtered.map((company: any) => {
                    const metrics = companyMetrics(company);
                    return (
                      <TableRow key={company.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                              <Building2 className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div className="font-medium">{company.name}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {company.address || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{metrics.employees}</Badge>
                        </TableCell>
                         <TableCell className="text-center">
                          <Badge variant="secondary">{metrics.hrCount}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{metrics.orders}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{metrics.products}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{metrics.transactions}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuItem onClick={() => openDrawer(company, 'employees')}>
                                <Users className="h-4 w-4 mr-2" />
                                Manage Employees
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDrawer(company, 'orders')}>
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                View Orders
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDrawer(company, 'products')}>
                                <Package className="h-4 w-4 mr-2" />
                                Product Visibility
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDrawer(company, 'transactions')}>
                                <CreditCard className="h-4 w-4 mr-2" />
                                View Transactions
                              </DropdownMenuItem>
                              <div className="my-1" />
                              <DropdownMenuItem onClick={() => handleEditCompany(company)}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit Company
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteCompany(company.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Company
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-gray-500">
                        <Building2 className="h-12 w-12 mx-auto mb-2 opacity-30" />
                        <p>No companies found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Drawers */}
      <EmployeesDrawer
        company={selectedCompany}
        users={users}
        open={employeesDrawerOpen}
        onOpenChange={setEmployeesDrawerOpen}
        mutateAll={() => {
          mutate('/api/admin/users');
          mutate('/api/companies');
        }}
      />

      <OrdersDrawer
        company={selectedCompany}
        open={ordersDrawerOpen}
        onOpenChange={setOrdersDrawerOpen}
      />

      <ProductsDrawer
        company={selectedCompany}
        open={productsDrawerOpen}
        onOpenChange={setProductsDrawerOpen}
      />

      <TransactionsDrawer
        company={selectedCompany}
        open={transactionsDrawerOpen}
        onOpenChange={setTransactionsDrawerOpen}
      />

      {/* Company Edit Dialog */}
      <CompanyDialog
        open={editCompanyOpen}
        onOpenChange={setEditCompanyOpen}
        company={selectedCompany}
        onSave={() => mutate('/api/companies')}
      />
    </div>
  );
}
