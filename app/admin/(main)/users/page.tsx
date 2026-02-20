"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserPlus, 
  Edit3, 
  Trash2,
  Download, 
  Search, 
  Filter,
  Wallet,
  Building2,
  Mail,
  Plus,
  Minus
} from "lucide-react";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  company: {
    name: string;
  } | null;
  wallet: {
    balance: number| null;
    expiryDate: string | null;
  };
  verified: boolean;
  claimed: boolean;
  createdAt: string;
}

interface CreditTransaction {
  type: 'ADD' | 'REMOVE';
  amount: number;
  reason: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function UserManagementPage() {
  const { mutate: globalMutate } = useSWRConfig();
  const {
    data: userData,
    error: swrError,
    isLoading,
  } = useSWR("/api/admin/users", fetcher);

  const { data: companiesData } = useSWR("/api/companies", fetcher);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddDemoUserOpen, setIsAddDemoUserOpen] = useState(false);
  const [isCreditOpen, setIsCreditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{id: string, name: string} | null>(null);
  const [updating, setUpdating] = useState(false);
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
const [companyForm, setCompanyForm] = useState({
  name: "",
  address: "",
});
const [creatingCompany, setCreatingCompany] = useState(false);

  
  // Form data for adding/editing users
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'EMPLOYEE',
    companyId: '',
    gender: '',
    address: ''
  });

  // Form data for demo users
  const [demoUserForm, setDemoUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    gender: '',
    address: ''
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  // Credit transaction state
  const [creditTransaction, setCreditTransaction] = useState<CreditTransaction>({
    type: 'ADD',
    amount: 0,
    reason: ''
  });

  const users = userData?.users || [];
  const stats = userData?.stats || { total: 0, hr: 0, employees: 0, verified: 0 };

  // Filter and sort users
  const filteredUsers = users
    .filter((user: User) => {
      const companyName = (user.company?.name || "").toLowerCase();
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           companyName.includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesVerification = verificationFilter === "all" || 
                  (verificationFilter === "verified" && user.verified) ||
                  (verificationFilter === "unverified" && !user.verified);
      const matchesUserType = userTypeFilter === "all" ||
                 (userTypeFilter === "paid" && !user.company) ||
                 (userTypeFilter === "company" && !!user.company);

      return matchesSearch && matchesRole && matchesVerification && matchesUserType;
    })
    .sort((a: User, b: User) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "email":
          return a.email.localeCompare(b.email);
        case "company":
          return (a.company?.name || "").localeCompare(b.company?.name || "");
        case "credits": {
  const aBalance = a.wallet?.balance ?? 0;
  const bBalance = b.wallet?.balance ?? 0;
  return bBalance - aBalance;
}

        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });



  const handleCreditTransaction = async () => {
    if (!selectedUser || creditTransaction.amount <= 0 || !creditTransaction.reason.trim()) {
      toast.error("Please fill all fields with valid values");
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/credits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: creditTransaction.type,
          amount: creditTransaction.amount,
          reason: creditTransaction.reason,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update credits");
      }

      await globalMutate("/api/admin/users");
      toast.success(`Credits ${creditTransaction.type === 'ADD' ? 'added' : 'removed'} successfully`);
      setIsCreditOpen(false);
      setSelectedUser(null);
      setCreditTransaction({ type: 'ADD', amount: 0, reason: '' });
    } catch (error) {
      toast.error("Failed to update credits");
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };
  const handleCreateCompany = async () => {
  if (!companyForm.name || !companyForm.address) return;

  try {
    setCreatingCompany(true);

    const res = await fetch("/api/companies/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(companyForm),
    });

    if (!res.ok) throw new Error("Failed to create company");

    setCompanyForm({ name: "", address: "" });
    await globalMutate('/api/companies');
      toast.success('company created successfully');
    setIsAddCompanyOpen(false);

    // 🔄 refresh company list (important)
      
   

  } catch (err) {
    console.error(err);
  } finally {
    setCreatingCompany(false);
  }
};


  const handleAddUser = async () => {
    if (!userForm.name || !userForm.email || !userForm.phone || !userForm.password || !userForm.companyId || !userForm.role) {
      toast.error("Please fill all required fields");
      return;
    }

    if (userForm.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setUpdating(true);
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create user');
      }

      await globalMutate('/api/admin/users');
      toast.success('User created successfully');
      setIsAddUserOpen(false);
      setUserForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'EMPLOYEE',
        companyId: '',
        gender: '',
        address: ''
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create user');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddDemoUser = async () => {
    if (!demoUserForm.name || !demoUserForm.email || !demoUserForm.phone || !demoUserForm.password) {
      toast.error("Please fill all required fields");
      return;
    }

    if (demoUserForm.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setUpdating(true);
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: demoUserForm.name,
          email: demoUserForm.email,
          phone: demoUserForm.phone,
          password: demoUserForm.password,
          role: 'EMPLOYEE',
          isDemo: true,
          companyId: null,
          gender: demoUserForm.gender || null,
          address: demoUserForm.address || null
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create demo user');
      }

      await globalMutate('/api/admin/users');
      toast.success('Demo user created successfully with 10,000 free credits!');
      setIsAddDemoUserOpen(false);
      setDemoUserForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        gender: '',
        address: ''
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create demo user');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setUserToDelete({ id: userId, name: userName });
    setIsDeleteOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      await globalMutate('/api/admin/users');
      toast.success('User deleted successfully');
      setIsDeleteOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
    } finally {
      setUpdating(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: '', // Don't pre-fill password for security
      role: user.role,
      companyId: user.companyId,
      gender: user.gender || '',
      address: user.address || ''
    });
    setIsEditOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser || !userForm.name || !userForm.email) {
      toast.error("Please fill required fields");
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userForm.name,
          email: userForm.email
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      await globalMutate('/api/admin/users');
      toast.success('User updated successfully');
      setIsEditOpen(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error('Failed to update user');
    } finally {
      setUpdating(false);
    }
  };

  const handleExportUsers = async () => {
    try {
      const response = await fetch("/api/admin/users/export");
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `users-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Users exported successfully");
    } catch (error) {
      toast.error("Failed to export users");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage user accounts, credits, and permissions</p>
        </div>
       <div className="flex flex-col items-end gap-2 space-y-1 md:flex-row md:items-center md:space-y-0 md:space-x-2">

          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700">
                <UserPlus className="h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account with wallet
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    placeholder="Enter user name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Select value={userForm.role} onValueChange={(value) => setUserForm({ ...userForm, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMPLOYEE">Employee</SelectItem>
                      <SelectItem value="HR">HR Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="company">Company *</Label>
                  <Select value={userForm.companyId} onValueChange={(value) => setUserForm({ ...userForm, companyId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companiesData?.companies?.map((company: any) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleAddUser} 
                    disabled={updating}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {updating ? 'Creating...' : 'Create User'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddUserOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDemoUserOpen} onOpenChange={setIsAddDemoUserOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <UserPlus className="h-4 w-4" />
                Add Demo User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white">
              <DialogHeader>
                <DialogTitle>Add Demo User</DialogTitle>
                <DialogDescription>
                  Create a demo account with 10,000 free credits for testing
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="demo-name">Name *</Label>
                  <Input
                    id="demo-name"
                    value={demoUserForm.name}
                    onChange={(e) => setDemoUserForm({ ...demoUserForm, name: e.target.value })}
                    placeholder="Enter user name"
                  />
                </div>
                <div>
                  <Label htmlFor="demo-email">Email *</Label>
                  <Input
                    id="demo-email"
                    type="email"
                    value={demoUserForm.email}
                    onChange={(e) => setDemoUserForm({ ...demoUserForm, email: e.target.value })}
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <Label htmlFor="demo-phone">Phone *</Label>
                  <Input
                    id="demo-phone"
                    value={demoUserForm.phone}
                    onChange={(e) => setDemoUserForm({ ...demoUserForm, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="demo-password">Password *</Label>
                  <Input
                    id="demo-password"
                    type="password"
                    value={demoUserForm.password}
                    onChange={(e) => setDemoUserForm({ ...demoUserForm, password: e.target.value })}
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <Label htmlFor="demo-gender">Gender</Label>
                  <Select value={demoUserForm.gender} onValueChange={(value) => setDemoUserForm({ ...demoUserForm, gender: value })}>
                    <SelectTrigger id="demo-gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='MALE'>Male</SelectItem>
                      <SelectItem value='FEMALE'>Female</SelectItem>
                      <SelectItem value='OTHER'>Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="demo-address">Address</Label>
                  <Input
                    id="demo-address"
                    value={demoUserForm.address}
                    onChange={(e) => setDemoUserForm({ ...demoUserForm, address: e.target.value })}
                    placeholder="Enter address"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleAddDemoUser} 
                    disabled={updating}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {updating ? 'Creating...' : 'Create Demo User'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddDemoUserOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddCompanyOpen} onOpenChange={setIsAddCompanyOpen}>
  <DialogTrigger asChild>
    <Button className="flex items-center gap-2">
      <Building2 className="h-4 w-4" />
      Create Company
    </Button>
  </DialogTrigger>

  <DialogContent className="max-w-md bg-white">
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
          onClick={() => setIsAddCompanyOpen(false)}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>

          
          <Button 
            onClick={handleExportUsers}
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Users
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">HR Managers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hr}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employees</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.employees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verified}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-48">
              <Label>Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="HR">HR Managers</SelectItem>
                  <SelectItem value="EMPLOYEE">Employees</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-48">
              <Label>User Type</Label>
              <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="company">Company Users</SelectItem>
                  <SelectItem value="paid">Paid Users (no company)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-48">
              <Label>Verification Status</Label>
              <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-48">
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="credits">Credits</SelectItem>
                  <SelectItem value="created">Date Created</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user: User) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.role === 'HR' ? 'default' : 'secondary'}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.company?.name || '-'}</TableCell>
                    <TableCell className="font-semibold">
                      {user.wallet?.balance ?? 0} credits
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Badge 
                          variant={user.verified ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {user.verified ? 'Verified' : 'Unverified'}
                        </Badge>
                        <Badge 
                          variant={user.claimed ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {user.claimed ? 'Claimed' : 'Pending'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          title="Edit User"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          title="Delete User"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        
                        <Dialog open={isEditOpen && selectedUser?.id === user.id} onOpenChange={setIsEditOpen}>
                          <DialogTrigger asChild>
                            <Button className="hidden">Hidden</Button>
                          </DialogTrigger>
                          <DialogContent className="bg-white">
                            <DialogHeader>
                              <DialogTitle>Edit User</DialogTitle>
                              <DialogDescription>
                                Update user information. Changes will be logged for audit purposes.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                  id="edit-name"
                                  value={userForm.name}
                                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                                  placeholder="Enter user name"
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                  id="edit-email"
                                  type="email"
                                  value={userForm.email}
                                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                  placeholder="Enter email address"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2 pt-4">
                              <Button 
                                onClick={handleUpdateUser}
                                disabled={updating}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                              >
                                {updating ? "Updating..." : "Update User"}
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => setIsEditOpen(false)}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog open={isCreditOpen && selectedUser?.id === user.id} onOpenChange={setIsCreditOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                              className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
                            >
                              <Wallet className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-white">
                            <DialogHeader>
                              <DialogTitle>Manage Credits</DialogTitle>
                              <DialogDescription>
                                Add or remove credits for {selectedUser?.name}. Current balance: {selectedUser?.wallet?.balance ?? 0} credits
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Action</Label>
                                <Select 
                                  value={creditTransaction.type} 
                                  onValueChange={(value: 'ADD' | 'REMOVE') => 
                                    setCreditTransaction({...creditTransaction, type: value})
                                  }
                                >
                                  <SelectTrigger className="col-span-3">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="ADD">
                                      <div className="flex items-center gap-2">
                                        <Plus className="h-4 w-4 text-green-600" />
                                        Add Credits
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="REMOVE">
                                      <div className="flex items-center gap-2">
                                        <Minus className="h-4 w-4 text-red-600" />
                                        Remove Credits
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Amount</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  placeholder="Enter amount"
                                  value={creditTransaction.amount}
                                  onChange={(e) => setCreditTransaction({
                                    ...creditTransaction, 
                                    amount: parseInt(e.target.value) || 0
                                  })}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Reason</Label>
                                <Input
                                  placeholder="Reason for credit adjustment"
                                  value={creditTransaction.reason}
                                  onChange={(e) => setCreditTransaction({
                                    ...creditTransaction, 
                                    reason: e.target.value
                                  })}
                                  className="col-span-3"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setIsCreditOpen(false);
                                  setCreditTransaction({ type: 'ADD', amount: 0, reason: '' });
                                }}
                              >
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleCreditTransaction}
                                disabled={updating || creditTransaction.amount <= 0 || !creditTransaction.reason.trim()}
                                className={creditTransaction.type === 'ADD' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                              >
                                {updating ? "Processing..." : `${creditTransaction.type === 'ADD' ? 'Add' : 'Remove'} Credits`}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete user &quot;{userToDelete?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={confirmDeleteUser}
              disabled={updating}
              variant="destructive"
              className="flex-1"
            >
              {updating ? "Deleting..." : "Delete User"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}