"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  Settings,
  Tags,
  Percent,
  Gift,
  Bell,
  Key,
  Globe,
  Shield,
  Database,
  Mail,
  AlertTriangle,
  Users,
  Link,
  Copy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Mock data for settings
const categoriesData = [
  {
    id: 1,
    name: "Fitness Equipment",
    subcategories: [
      "Yoga & Pilates",
      "Resistance Training",
      "Cardio Equipment",
    ],
    status: "active",
  },
  {
    id: 2,
    name: "Nutrition",
    subcategories: ["Protein Supplements", "Vitamins", "Energy Bars"],
    status: "active",
  },
  {
    id: 3,
    name: "Mental Health",
    subcategories: ["Meditation", "Sleep Aids", "Stress Relief"],
    status: "active",
  },
  {
    id: 4,
    name: "Recovery",
    subcategories: ["Massage Tools", "Heat Therapy", "Cold Therapy"],
    status: "active",
  },
  {
    id: 5,
    name: "Wellness Programs",
    subcategories: ["Online Classes", "Coaching Sessions"],
    status: "inactive",
  },
];

const discountCodesData = [
  {
    id: 1,
    code: "WELCOME20",
    type: "percentage",
    value: 20,
    usage: 145,
    limit: 500,
    status: "active",
    expiryDate: "2024-06-30",
  },
  {
    id: 2,
    code: "FIRST100",
    type: "fixed",
    value: 100,
    usage: 89,
    limit: 200,
    status: "active",
    expiryDate: "2024-05-31",
  },
  {
    id: 3,
    code: "FITNESS50",
    type: "percentage",
    value: 15,
    usage: 234,
    limit: 1000,
    status: "active",
    expiryDate: "2024-12-31",
  },
  {
    id: 4,
    code: "EXPIRED10",
    type: "percentage",
    value: 10,
    usage: 50,
    limit: 100,
    status: "expired",
    expiryDate: "2024-02-28",
  },
];

const bundlesData = [
  {
    id: 1,
    name: "Starter Fitness Kit",
    products: ["Yoga Mat", "Resistance Bands"],
    credits: 1500,
    savings: 300,
    status: "active",
  },
  {
    id: 2,
    name: "Complete Nutrition Pack",
    products: ["Whey Protein", "Vitamins", "Energy Bars"],
    credits: 4500,
    savings: 700,
    status: "active",
  },
  {
    id: 3,
    name: "Mindfulness Bundle",
    products: ["Meditation Cushion", "Sleep Aid", "Guide Book"],
    credits: 2200,
    savings: 400,
    status: "active",
  },
];

export default function AdminSettingsPage() {
  const [categories, setCategories] = useState(categoriesData);
  const [discountCodes, setDiscountCodes] = useState(discountCodesData);
  const [bundles, setBundles] = useState(bundlesData);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddDiscountOpen, setIsAddDiscountOpen] = useState(false);
  const [isAddBundleOpen, setIsAddBundleOpen] = useState(false);
  const [isCreateInviteOpen, setIsCreateInviteOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteRole, setInviteRole] = useState("HR");

  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const res = await fetch("/api/companies");
        if (res.ok) {
          const data = await res.json();
          setCompanies(data);
        } else {
          console.error("Failed to fetch companies");
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  // Notification settings state
  const [notifications, setNotifications] = useState({
    lowStockAlert: true,
    newOrderNotification: true,
    vendorUpdates: true,
    systemMaintenance: false,
    weeklyReports: true,
    monthlyReports: true,
  });

  // Credit allocation settings
  const [creditSettings, setCreditSettings] = useState({
    defaultAllocation: 5000,
    maxAllocationPerEmployee: 10000,
    expiryPeriod: 365,
    rolloverEnabled: true,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
            Active
          </Badge>
        );
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-600 mt-2">
          Configure platform-wide options and manage system settings
        </p>
      </div>

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tags className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="discounts" className="flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Discounts
          </TabsTrigger>
          <TabsTrigger value="bundles" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Bundles
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="credits" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Credits
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        {/* Categories & Subcategories */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Categories & Subcategories</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage product categories and their subcategories
                  </p>
                </div>
                <Dialog
                  open={isAddCategoryOpen}
                  onOpenChange={setIsAddCategoryOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Category</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="category-name">Category Name</Label>
                        <Input
                          id="category-name"
                          placeholder="Enter category name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subcategories">
                          Subcategories (comma separated)
                        </Label>
                        <Textarea
                          id="subcategories"
                          placeholder="Subcategory 1, Subcategory 2, ..."
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="category-active" defaultChecked />
                        <Label htmlFor="category-active">Set as Active</Label>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setIsAddCategoryOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button className="bg-emerald-600 hover:bg-emerald-700">
                        Add Category
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                    <TableHead>Subcategories</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {category.subcategories.map((sub, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {sub}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(category.status)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-2 justify-center">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discount Codes */}
        <TabsContent value="discounts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Discount Codes & Vouchers</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage promotional codes and discount vouchers
                  </p>
                </div>
                <Dialog
                  open={isAddDiscountOpen}
                  onOpenChange={setIsAddDiscountOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Discount Code
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Discount Code</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="discount-code">Discount Code</Label>
                          <Input id="discount-code" placeholder="SAVE20" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="discount-type">Discount Type</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">
                                Percentage
                              </SelectItem>
                              <SelectItem value="fixed">
                                Fixed Amount (Credits)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="discount-value">Discount Value</Label>
                          <Input
                            id="discount-value"
                            type="number"
                            placeholder="20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="usage-limit">Usage Limit</Label>
                          <Input
                            id="usage-limit"
                            type="number"
                            placeholder="500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiry-date">Expiry Date</Label>
                        <Input id="expiry-date" type="date" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setIsAddDiscountOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button className="bg-emerald-600 hover:bg-emerald-700">
                        Create Code
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discountCodes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell className="font-medium">{code.code}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {code.type === "percentage"
                            ? "Percentage"
                            : "Fixed Credits"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {code.type === "percentage"
                          ? `${code.value}%`
                          : `${code.value} credits`}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="font-medium">{code.usage}</span>
                          <span className="text-gray-500"> / {code.limit}</span>
                        </div>
                      </TableCell>
                      <TableCell>{code.expiryDate}</TableCell>
                      <TableCell>{getStatusBadge(code.status)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-2 justify-center">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bundles */}
        <TabsContent value="bundles">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Product Bundles</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Create and manage product bundles with special pricing
                  </p>
                </div>
                <Dialog
                  open={isAddBundleOpen}
                  onOpenChange={setIsAddBundleOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Bundle
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Product Bundle</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="bundle-name">Bundle Name</Label>
                        <Input
                          id="bundle-name"
                          placeholder="Starter Fitness Kit"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bundle-products">
                          Products in Bundle
                        </Label>
                        <Textarea
                          id="bundle-products"
                          placeholder="List the products included..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bundle-credits">
                            Bundle Price (Credits)
                          </Label>
                          <Input
                            id="bundle-credits"
                            type="number"
                            placeholder="1500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bundle-savings">
                            Total Savings (Credits)
                          </Label>
                          <Input
                            id="bundle-savings"
                            type="number"
                            placeholder="300"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setIsAddBundleOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button className="bg-emerald-600 hover:bg-emerald-700">
                        Create Bundle
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bundle Name</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Savings</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bundles.map((bundle) => (
                    <TableRow key={bundle.id}>
                      <TableCell className="font-medium">
                        {bundle.name}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {bundle.products.map((product, index) => (
                            <div key={index}>{product}</div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {bundle.credits.toLocaleString()} credits
                      </TableCell>
                      <TableCell className="text-right text-emerald-600 font-medium">
                        {bundle.savings.toLocaleString()} credits
                      </TableCell>
                      <TableCell>{getStatusBadge(bundle.status)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-2 justify-center">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Invites</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Create invite links for new users (HR or employees)
                  </p>
                </div>
                <Dialog
                  open={isCreateInviteOpen}
                  onOpenChange={setIsCreateInviteOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Invite
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create User Invite</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(
                          e.target as HTMLFormElement
                        );
                        let companyName: string;
                        let companyAddress: string | undefined;
                        if (inviteRole === "HR") {
                          companyName = formData.get("companyName") as string;
                          companyAddress = formData.get(
                            "companyAddress"
                          ) as string;
                          if (!companyName || !companyAddress) {
                            alert(
                              "Company name and address are required for HR"
                            );
                            return;
                          }
                        } else {
                          companyName = selectedCompany;
                          if (!companyName) {
                            alert("Please select a company");
                            return;
                          }
                        }
                        const role = inviteRole;
                        const employeeCount = parseInt(
                          (formData.get("employeeCount") as string) || "0"
                        );

                        setInviteLoading(true);
                        try {
                          const res = await fetch(
                            "/api/auth/signup/create-invite",
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                companyName,
                                companyAddress,
                                role,
                                employeeCount:
                                  role === "EMPLOYEE"
                                    ? employeeCount
                                    : undefined,
                              }),
                            }
                          );

                          const data = await res.json();
                          if (res.ok) {
                            setInviteLink(data.signupLink);
                            setIsCreateInviteOpen(false);
                          } else {
                            alert(data.error || "Failed to create invite");
                          }
                        } catch (error) {
                          alert("Failed to create invite");
                        } finally {
                          setInviteLoading(false);
                        }
                      }}
                      className="space-y-4 py-4"
                    >
                      {inviteRole === "HR" ? (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="companyName">Company Name</Label>
                            <Input
                              id="companyName"
                              name="companyName"
                              placeholder="Enter company name"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="companyAddress">
                              Company Address
                            </Label>
                            <Input
                              id="companyAddress"
                              name="companyAddress"
                              placeholder="Enter company address"
                              required
                            />
                          </div>
                        </>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="companySelect">Select Company</Label>
                          <Select
                            value={selectedCompany}
                            onValueChange={setSelectedCompany}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select existing company" />
                            </SelectTrigger>
                            <SelectContent>
                              {loadingCompanies ? (
                                <SelectItem value="">Loading...</SelectItem>
                              ) : companies.length > 0 ? (
                                companies.map((company) => (
                                  <SelectItem
                                    key={company.id}
                                    value={company.name}
                                  >
                                    {company.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="" disabled>
                                  No companies found
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                          name="role"
                          value={inviteRole}
                          onValueChange={setInviteRole}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="HR">HR</SelectItem>
                            <SelectItem value="EMPLOYEE">
                              Employee(s)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {inviteRole === "EMPLOYEE" && (
                        <div className="space-y-2">
                          <Label htmlFor="employeeCount">
                            Number of Employees
                          </Label>
                          <Input
                            id="employeeCount"
                            name="employeeCount"
                            type="number"
                            min="1"
                            placeholder="Enter number of employees"
                            required
                          />
                        </div>
                      )}
                      <div className="flex justify-end gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateInviteOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          disabled={inviteLoading}
                        >
                          {inviteLoading ? "Creating..." : "Create Invite"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {inviteLink && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-800">
                        Invite Link Generated
                      </p>
                      <p className="text-xs text-emerald-600 break-all">
                        {inviteLink}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(inviteLink);
                        alert("Link copied to clipboard!");
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              <div className="text-center text-gray-500 mt-8">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No users created yet. Create your first invite above.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credit Allocation */}
        <TabsContent value="credits">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Global Credit Rules</CardTitle>
                <p className="text-sm text-gray-600">
                  Configure default credit allocation and policies
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="default-allocation">
                    Default Monthly Allocation (Credits)
                  </Label>
                  <Input
                    id="default-allocation"
                    type="number"
                    value={creditSettings.defaultAllocation}
                    onChange={(e) =>
                      setCreditSettings((prev) => ({
                        ...prev,
                        defaultAllocation: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-allocation">
                    Max Allocation Per Employee (Credits)
                  </Label>
                  <Input
                    id="max-allocation"
                    type="number"
                    value={creditSettings.maxAllocationPerEmployee}
                    onChange={(e) =>
                      setCreditSettings((prev) => ({
                        ...prev,
                        maxAllocationPerEmployee: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry-period">
                    Credit Expiry Period (Days)
                  </Label>
                  <Input
                    id="expiry-period"
                    type="number"
                    value={creditSettings.expiryPeriod}
                    onChange={(e) =>
                      setCreditSettings((prev) => ({
                        ...prev,
                        expiryPeriod: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="rollover-enabled"
                    checked={creditSettings.rolloverEnabled}
                    onCheckedChange={(checked) =>
                      setCreditSettings((prev) => ({
                        ...prev,
                        rolloverEnabled: checked,
                      }))
                    }
                  />
                  <Label htmlFor="rollover-enabled">
                    Enable Credit Rollover
                  </Label>
                </div>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Credit Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Credit Exchange Rate</CardTitle>
                <p className="text-sm text-gray-600">
                  Configure credit to INR conversion rates
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="credit-rate">1 Credit = ₹ (INR)</Label>
                  <Input
                    id="credit-rate"
                    type="number"
                    step="0.01"
                    defaultValue="0.5"
                  />
                  <p className="text-xs text-gray-500">
                    Current rate: 1 credit = ₹0.5
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-purchase">Minimum Credit Purchase</Label>
                  <Input id="min-purchase" type="number" defaultValue="1000" />
                  <p className="text-xs text-gray-500">
                    Minimum credits that can be purchased at once
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-purchase">Maximum Credit Purchase</Label>
                  <Input id="max-purchase" type="number" defaultValue="50000" />
                  <p className="text-xs text-gray-500">
                    Maximum credits that can be purchased at once
                  </p>
                </div>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Save className="h-4 w-4 mr-2" />
                  Update Exchange Rate
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Notifications</CardTitle>
                <p className="text-sm text-gray-600">
                  Configure automated system notifications
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="low-stock">Low Stock Alerts</Label>
                    <p className="text-sm text-gray-500">
                      Notify when products are running low
                    </p>
                  </div>
                  <Switch
                    id="low-stock"
                    checked={notifications.lowStockAlert}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        lowStockAlert: checked,
                      }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="new-orders">New Order Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Notify on new order placement
                    </p>
                  </div>
                  <Switch
                    id="new-orders"
                    checked={notifications.newOrderNotification}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        newOrderNotification: checked,
                      }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="vendor-updates">Vendor Updates</Label>
                    <p className="text-sm text-gray-500">
                      Notify on vendor status changes
                    </p>
                  </div>
                  <Switch
                    id="vendor-updates"
                    checked={notifications.vendorUpdates}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        vendorUpdates: checked,
                      }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenance">System Maintenance</Label>
                    <p className="text-sm text-gray-500">
                      Notify before scheduled maintenance
                    </p>
                  </div>
                  <Switch
                    id="maintenance"
                    checked={notifications.systemMaintenance}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        systemMaintenance: checked,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Report Notifications</CardTitle>
                <p className="text-sm text-gray-600">
                  Configure automated report deliveries
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weekly-reports">Weekly Reports</Label>
                    <p className="text-sm text-gray-500">
                      Send weekly analytics summary
                    </p>
                  </div>
                  <Switch
                    id="weekly-reports"
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        weeklyReports: checked,
                      }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="monthly-reports">Monthly Reports</Label>
                    <p className="text-sm text-gray-500">
                      Send monthly business insights
                    </p>
                  </div>
                  <Switch
                    id="monthly-reports"
                    checked={notifications.monthlyReports}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        monthlyReports: checked,
                      }))
                    }
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="report-emails">Report Recipients</Label>
                  <Textarea
                    id="report-emails"
                    placeholder="admin@fitplay.life, manager@fitplay.life"
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Comma-separated email addresses
                  </p>
                </div>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* API Keys & Integrations */}
        <TabsContent value="integrations">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Keys & Tokens</CardTitle>
                <p className="text-sm text-gray-600">
                  Manage third-party integrations and API access
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unicommerce-key">Unicommerce API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        id="unicommerce-key"
                        type="password"
                        placeholder="Enter API key"
                      />
                      <Button variant="outline" size="sm">
                        Test
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment-gateway">Payment Gateway Key</Label>
                    <div className="flex gap-2">
                      <Input
                        id="payment-gateway"
                        type="password"
                        placeholder="Enter gateway key"
                      />
                      <Button variant="outline" size="sm">
                        Test
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sms-api">SMS Service API</Label>
                    <div className="flex gap-2">
                      <Input
                        id="sms-api"
                        type="password"
                        placeholder="Enter SMS API key"
                      />
                      <Button variant="outline" size="sm">
                        Test
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-api">Email Service API</Label>
                    <div className="flex gap-2">
                      <Input
                        id="email-api"
                        type="password"
                        placeholder="Enter email API key"
                      />
                      <Button variant="outline" size="sm">
                        Test
                      </Button>
                    </div>
                  </div>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save API Keys
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <p className="text-sm text-gray-600">
                  General system and security settings
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Security Settings
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="two-factor">
                          Two-Factor Authentication
                        </Label>
                        <Switch id="two-factor" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="session-timeout">
                          Auto Session Timeout
                        </Label>
                        <Switch id="session-timeout" defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password-policy">Password Policy</Label>
                        <Select defaultValue="medium">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">
                              Low (8 characters)
                            </SelectItem>
                            <SelectItem value="medium">
                              Medium (8+ chars, numbers)
                            </SelectItem>
                            <SelectItem value="high">
                              High (8+ chars, numbers, symbols)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Data & Backup
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-backup">Automatic Backups</Label>
                        <Switch id="auto-backup" defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="backup-frequency">
                          Backup Frequency
                        </Label>
                        <Select defaultValue="daily">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="retention-period">
                          Data Retention (Days)
                        </Label>
                        <Input
                          id="retention-period"
                          type="number"
                          defaultValue="365"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save System Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
