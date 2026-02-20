"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Power,
  CheckCircle,
  XCircle,
  Building2,
  Globe,
  Phone,
  Mail,
  Key,
  Settings,
  Copy,
  RefreshCw,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Mock vendor data from figma-admin
const vendorsData = [
  {
    id: 1,
    name: "WellFit Equipment Co.",
    category: "Fitness Equipment",
    status: "active",
    integration: "API",
    products: 45,
    totalOrders: 234,
    revenue: 125000,
    contact: "john@wellfit.com",
    phone: "+91 98765 43210",
    joinedDate: "2024-01-15",
    website: "www.wellfit.com",
  },
  {
    id: 2,
    name: "NutriLife Solutions",
    category: "Nutrition",
    status: "active",
    integration: "Manual",
    products: 89,
    totalOrders: 456,
    revenue: 203000,
    contact: "sarah@nutrilife.com",
    phone: "+91 87654 32109",
    joinedDate: "2024-02-20",
    website: "www.nutrilife.com",
  },
  {
    id: 3,
    name: "MindWell Therapy",
    category: "Mental Health",
    status: "pending",
    integration: "API",
    products: 12,
    totalOrders: 45,
    revenue: 35000,
    contact: "dr.smith@mindwell.com",
    phone: "+91 76543 21098",
    joinedDate: "2024-03-10",
    website: "www.mindwell.com",
  },
  {
    id: 4,
    name: "FlexYoga Studio",
    category: "Wellness Programs",
    status: "inactive",
    integration: "Manual",
    products: 23,
    totalOrders: 123,
    revenue: 67000,
    contact: "contact@flexyoga.com",
    phone: "+91 65432 10987",
    joinedDate: "2023-11-05",
    website: "www.flexyoga.com",
  },
];

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [isEditVendorOpen, setIsEditVendorOpen] = useState(false);
  const [isViewProductsOpen, setIsViewProductsOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [vendorProducts, setVendorProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  
  // Clear form when dialog opens
  const handleOpenAddVendor = () => {
    setVendorForm({
      name: "",
      category: "",
      email: "",
      phone: "",
      website: "",
      integrationType: "",
      description: ""
    });
    setIsAddVendorOpen(true);
  };
  
  // Open edit vendor dialog
  const handleOpenEditVendor = (vendor: any) => {
    setVendorForm({
      name: vendor.name,
      category: vendor.category || "",
      email: vendor.contact,
      phone: vendor.phone,
      website: vendor.website || "",
      integrationType: vendor.integration === "API" ? "api" : "manual",
      description: ""
    });
    setSelectedVendor(vendor);
    setIsEditVendorOpen(true);
  };
  
  const [isApiManagementOpen, setIsApiManagementOpen] = useState(false);

  // Form state for add vendor
  const [vendorForm, setVendorForm] = useState({
    name: "",
    category: "",
    email: "",
    phone: "",
    website: "",
    integrationType: "",
    description: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch vendors from API
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch('/api/vendors');
        if (response.ok) {
          const vendorData = await response.json();
          
          // Transform API data to match the expected format
          const transformedVendors = vendorData.map((vendor: any, index: number) => ({
            id: vendor.id,
            name: vendor.name,
            category: vendor.categories && vendor.categories.length > 1 
              ? `${vendor.categories.length} Categories` 
              : vendor.primaryCategory || "General",
            status: vendor.status || "active",
            integration: vendor.integrationType || "Manual",
            products: vendor.productCount || 0,
            totalOrders: vendor.totalOrders || 0,
            revenue: vendor.totalRevenue || 0,
            contact: vendor.email,
            phone: vendor.phone || "N/A",
            joinedDate: new Date(vendor.createdAt).toISOString().split('T')[0],
            website: vendor.website || "",
            categories: vendor.categories || [],
          }));
          
          setVendors(transformedVendors);
        } else {
          console.error('Failed to fetch vendors, using fallback data');
          // Use mock data as fallback
          setVendors(vendorsData);
        }
      } catch (error) {
        console.error('Error fetching vendors:', error);
        // Use mock data as fallback
        setVendors(vendorsData);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (data.categories) {
          setCategories(data.categories.map((cat: any) => ({ id: cat.id, name: cat.name })));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Handle form input changes
  const handleFormChange = (field: string, value: string) => {
    setVendorForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form submission
  const handleSubmitVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare vendor data for API
      const vendorData = {
        name: vendorForm.name,
        category: vendorForm.category,
        email: vendorForm.email,
        phone: vendorForm.phone,
        website: vendorForm.website,
        integrationType: vendorForm.integrationType,
        description: vendorForm.description
      };

      // Call API to create vendor
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vendorData),
      });

      if (response.ok) {
        const newVendor = await response.json();
        
        // Add to local state with proper formatting
        const formattedVendor = {
          id: newVendor.id,
          name: newVendor.name,
          category: newVendor.category,
          status: "pending",
          integration: newVendor.integrationType === "api" ? "API" : "Manual",
          products: 0,
          totalOrders: 0,
          revenue: 0,
          contact: newVendor.email,
          phone: newVendor.phone,
          joinedDate: new Date().toISOString().split('T')[0],
          website: newVendor.website,
        };

        setVendors(prev => [...prev, formattedVendor]);

        // Reset form
        setVendorForm({
          name: "",
          category: "",
          email: "",
          phone: "",
          website: "",
          integrationType: "",
          description: ""
        });

        // Close dialog
        setIsAddVendorOpen(false);

        // Show success message
        toast.success('Vendor added successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add vendor');
      }
    } catch (error) {
      console.error('Error adding vendor:', error);
      toast.error('Failed to add vendor. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle vendor delete
  const handleDeleteVendor = async (vendorId: string) => {
    // Show confirmation toast
    toast.warning('Are you sure you want to delete this vendor?', {
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            const response = await fetch(`/api/vendors/${vendorId}`, {
              method: 'DELETE'
            });

            if (response.ok) {
              setVendors(prev => prev.filter(v => v.id !== vendorId));
              toast.success('Vendor deleted successfully!');
            } else {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Failed to delete vendor');
            }
          } catch (error) {
            console.error('Error deleting vendor:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to delete vendor. Please try again.');
          }
        }
      }
    });
  };

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/vendors/${selectedVendor.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: vendorForm.name,
          email: vendorForm.email,
          phone: vendorForm.phone,
        }),
      });

      if (response.ok) {
        const updatedVendor = await response.json();
        setVendors(prev => prev.map(v => v.id === selectedVendor.id ? {
          ...v,
          name: updatedVendor.name,
          contact: updatedVendor.email,
          phone: updatedVendor.phone,
        } : v));
        
        setIsEditVendorOpen(false);
        setSelectedVendor(null);
        toast.success('Vendor updated successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update vendor');
      }
    } catch (error) {
      console.error('Error updating vendor:', error);
      toast.error('Failed to update vendor. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle vendor status toggle
  const handleToggleVendorStatus = async (vendorId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const response = await fetch(`/api/vendors/${vendorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setVendors(prev => prev.map(v => 
          v.id === vendorId ? { ...v, status: newStatus } : v
        ));
        toast.success(`Vendor ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
      } else {
        throw new Error('Failed to update vendor status');
      }
    } catch (error) {
      console.error('Error updating vendor status:', error);
      toast.error('Failed to update vendor status. Please try again.');
    }
  };

  const handleViewProducts = async (vendor: any) => {
    setSelectedVendor(vendor);
    setIsViewProductsOpen(true);
    setProductsLoading(true);
    setVendorProducts([]);

    try {
      // Validate vendor ID to prevent duplication
      if (!vendor || !vendor.id || typeof vendor.id !== 'string') {
        console.error('Invalid vendor object or ID:', vendor);
        toast.error('Invalid vendor selected');
        return;
      }

      // Clean and validate the ID
      const cleanId = vendor.id.trim();
      
      const url = `/api/vendors/${cleanId}/products`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        setVendorProducts(data.products || []);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to fetch vendor products. Status:', response.status, 'Error:', errorData);
        
        if (response.status === 503) {
          toast.error('Database connection issue. Please try again later.');
        } else {
          toast.error(`Failed to load vendor products: ${errorData.error || response.status}`);
        }
      }
    } catch (error) {
      console.error('Error fetching vendor products:', error);
      toast.error('Network error: Failed to load vendor products');
    } finally {
      setProductsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
            Active
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
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getIntegrationBadge = (integration: string) => {
    return integration === "API" ? (
      <Badge variant="default" className="bg-blue-100 text-blue-700">
        API
      </Badge>
    ) : (
      <Badge variant="outline">Manual</Badge>
    );
  };

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || vendor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (vendorId: number, newStatus: string) => {
    setVendors((prev) =>
      prev.map((vendor) =>
        vendor.id === vendorId ? { ...vendor, status: newStatus } : vendor
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Vendors Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your vendor partners and their integrations
          </p>
        </div>
        <Dialog open={isAddVendorOpen} onOpenChange={setIsAddVendorOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleOpenAddVendor}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-white shadow-xl border border-gray-200">
            <DialogHeader>
              <DialogTitle>Add New Vendor</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitVendor}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="vendor-name">Vendor Name</Label>
                <Input 
                  id="vendor-name" 
                  placeholder="Enter vendor name" 
                  value={vendorForm.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor-category">Category</Label>
                <Select value={vendorForm.category} onValueChange={(value) => handleFormChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor-email">Contact Email</Label>
                <Input
                  id="vendor-email"
                  type="email"
                  placeholder="vendor@example.com"
                  value={vendorForm.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor-phone">Phone Number</Label>
                <Input 
                  id="vendor-phone" 
                  placeholder="+91 00000 00000" 
                  value={vendorForm.phone}
                  onChange={(e) => {
                    // Allow only digits and limit to 10 characters
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    handleFormChange('phone', value);
                  }}
                  maxLength={10}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor-website">Website</Label>
                <Input 
                  id="vendor-website" 
                  placeholder="www.vendor.com" 
                  value={vendorForm.website}
                  onChange={(e) => handleFormChange('website', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="integration-type">Integration Type</Label>
                <Select value={vendorForm.integrationType} onValueChange={(value) => handleFormChange('integrationType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select integration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="api">API Integration</SelectItem>
                    <SelectItem value="manual">Manual Fulfillment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="vendor-description">Description</Label>
                <Textarea
                  id="vendor-description"
                  placeholder="Brief description about the vendor"
                  value={vendorForm.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddVendorOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={isSubmitting || !vendorForm.name || !vendorForm.email || !vendorForm.phone}
              >
                {isSubmitting ? 'Adding...' : 'Add Vendor'}
              </Button>
            </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="py-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Vendors</p>
                <p className="text-xl font-semibold">
                  {vendors.filter((v) => v.status === "active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="py-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <XCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Approval</p>
                <p className="text-xl font-semibold">
                  {vendors.filter((v) => v.status === "pending").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="py-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">API Integrated</p>
                <p className="text-xl font-semibold">
                  {vendors.filter((v) => v.integration === "API").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="py-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-xl font-semibold">
                  {vendors.reduce((sum, v) => sum + v.products, 0)}
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
            <CardTitle>All Vendors</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading vendors...</p>
              </div>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Integration</TableHead>
                  <TableHead className="text-right">Products</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">
                          {vendor.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                          <Mail className="h-3 w-3" />
                          {vendor.contact}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{vendor.category}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(vendor.status)}</TableCell>
                    <TableCell>
                      {getIntegrationBadge(vendor.integration)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {vendor.products}
                    </TableCell>
                    <TableCell className="text-right">
                      {vendor.totalOrders}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{vendor.revenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEditVendor(vendor)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Vendor
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewProducts(vendor)}>
                            <Globe className="h-4 w-4 mr-2" />
                            View Products ({vendor.products})
                          </DropdownMenuItem>
                          {vendor.integration === "API" && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedVendor(vendor);
                                setIsApiManagementOpen(true);
                              }}
                            >
                              <Key className="h-4 w-4 mr-2" />
                              Manage API Keys
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {vendor.status === "active" ? (
                            <DropdownMenuItem
                              onClick={() => handleToggleVendorStatus(vendor.id, vendor.status)}
                              className="text-red-600"
                            >
                              <Power className="h-4 w-4 mr-2" />
                              Deactivate
                            </DropdownMenuItem>
                          ) : vendor.status === "pending" ? (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleToggleVendorStatus(vendor.id, vendor.status)}
                                className="text-emerald-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleVendorStatus(vendor.id, vendor.status)}
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleToggleVendorStatus(vendor.id, vendor.status)}
                              className="text-emerald-600"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteVendor(vendor.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          )}
        </CardContent>
      </Card>

      {/* API Key Management Dialog */}
      <Dialog open={isApiManagementOpen} onOpenChange={setIsApiManagementOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Key Management - {selectedVendor?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* API Configuration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">API Configuration</h4>
                <Badge className="bg-blue-100 text-blue-700">
                  {selectedVendor?.integration} Integration
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="api-endpoint">API Endpoint URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="api-endpoint"
                      placeholder="https://api.vendor.com/v1"
                      defaultValue="https://api.unicommerce.com/v1"
                    />
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="Enter API key"
                      defaultValue="uk_live_xxxxxxxxxxxxxxxxxx"
                    />
                    <Button variant="outline" size="sm" title="Copy API Key">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" title="Regenerate Key">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-secret">API Secret</Label>
                  <div className="flex gap-2">
                    <Input
                      id="api-secret"
                      type="password"
                      placeholder="Enter API secret"
                      defaultValue="sk_live_xxxxxxxxxxxxxxxxxx"
                    />
                    <Button variant="outline" size="sm" title="Copy Secret">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Webhook Configuration */}
            <div className="space-y-4">
              <h4 className="font-medium">Webhook Configuration</h4>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://fitplay.life/api/webhooks/vendor"
                    defaultValue="https://fitplay.life/api/webhooks/unicommerce"
                    readOnly
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook-events">Webhook Events</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="order-created"
                        defaultChecked
                      />
                      <Label htmlFor="order-created" className="text-sm">
                        Order Created
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="order-updated"
                        defaultChecked
                      />
                      <Label htmlFor="order-updated" className="text-sm">
                        Order Updated
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="stock-updated"
                        defaultChecked
                      />
                      <Label htmlFor="stock-updated" className="text-sm">
                        Stock Updated
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="product-updated" />
                      <Label htmlFor="product-updated" className="text-sm">
                        Product Updated
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sync Status */}
            <div className="space-y-4">
              <h4 className="font-medium">Sync Status</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Last Sync</span>
                    <Badge
                      variant="outline"
                      className="border-emerald-500 text-emerald-600"
                    >
                      Active
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">2 hours ago</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Products Synced</span>
                    <Badge variant="outline">{selectedVendor?.products}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    All products up to date
                  </p>
                </div>
              </div>
            </div>

            {/* Test Connection */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1">
                <Settings className="h-4 w-4 mr-2" />
                Test Connection
              </Button>
              <Button variant="outline" className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Force Sync
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsApiManagementOpen(false)}
            >
              Cancel
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              Save Configuration
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Vendor Dialog */}
      <Dialog open={isEditVendorOpen} onOpenChange={setIsEditVendorOpen}>
        <DialogContent className="max-w-2xl bg-white shadow-xl border border-gray-200">
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-vendor-name">Vendor Name</Label>
                <Input 
                  id="edit-vendor-name" 
                  placeholder="Enter vendor name" 
                  value={vendorForm.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-vendor-email">Contact Email</Label>
                <Input
                  id="edit-vendor-email"
                  type="email"
                  placeholder="vendor@example.com"
                  value={vendorForm.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-vendor-phone">Phone Number</Label>
                <Input 
                  id="edit-vendor-phone" 
                  placeholder="+91 00000 00000" 
                  value={vendorForm.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditVendorOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={isSubmitting || !vendorForm.name || !vendorForm.email || !vendorForm.phone}
              >
                {isSubmitting ? 'Updating...' : 'Update Vendor'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Products Dialog */}
      <Dialog open={isViewProductsOpen} onOpenChange={setIsViewProductsOpen}>
        <DialogContent className="max-w-6xl bg-white shadow-xl border border-gray-200">
          <DialogHeader>
            <DialogTitle>
              {selectedVendor?.name} Products ({vendorProducts.length})
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {productsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading products...</p>
              </div>
            ) : vendorProducts.length > 0 ? (
              <div className="space-y-4">
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Qty Sold</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendorProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                {product.imageUrl ? (
                                  <img 
                                    src={product.imageUrl} 
                                    alt={product.name}
                                    className="w-10 h-10 rounded-lg object-cover"
                                  />
                                ) : (
                                  <Building2 className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{product.name}</p>
                                <p className="text-sm text-gray-500 truncate max-w-xs">{product.description}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-semibold">₹{product.price}</p>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <p className="text-xs text-gray-500 line-through">₹{product.originalPrice}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              product.stock > 10 
                                ? 'bg-green-100 text-green-800'
                                : product.stock > 0 
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}>
                              {product.stock} units
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={product.status === 'ACTIVE' ? 'default' : 'secondary'}>
                              {product.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">{product.totalOrders}</TableCell>
                          <TableCell className="font-semibold text-emerald-600">₹{product.totalRevenue?.toLocaleString() || '0'}</TableCell>
                          <TableCell className="text-center">{product.totalQuantitySold}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No products found for this vendor</p>
                <p className="text-sm text-gray-400 mt-1">Products will appear here once they are added to the system</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
