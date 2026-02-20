"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  Package,
  Eye,
  EyeOff,
  Filter,
  LayoutGrid,
  Table as TableIcon,
  Coins,
} from "lucide-react";
import { toast } from "sonner";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { cn } from "@/lib/utils";
import { useUser } from '@/app/hooks/useUser';

interface Variant {
  id: string;
  variantCategory: string;
  variantValue: string;
  mrp: number;
  credits: string | null;
  availableStock: number | null;
}

interface Product {
  id: string;
  name: string;
  images: string[];
  category: { name: string } | null;
  availableStock: number;
  companies: { id: string; name: string }[];
  vendor?: { name: string };
  variants: Variant[];
}

interface Company {
  id: string;
  name: string;
}

type ViewMode = "card" | "table";

export default function HRProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedVisibility, setSelectedVisibility] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const{user} = useUser();
  
 // or however you get session
const companyId = user?.companyId;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, companiesRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/companies"),
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        // Ensure each product has a companies array and variants array, default to empty if missing
        const productsWithDefaults = (productsData.data || productsData.products || []).map((product: any) => ({
          ...product,
          companies: product.companies || [],
          variants: product.variants || []
        }));
        setProducts(productsWithDefaults);
      }

      if (companiesRes.ok) {
        const companiesData = await companiesRes.json();
        setCompanies(companiesData.companies || companiesData.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

 const updateProductVisibility = async (productId: string, visible: boolean) => {
  try {
    const response = await fetch("/api/prod-visibility", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId,
        companyId,   // send only ONE company
        visible,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update visibility");
    }

    // Update local state safely
    setProducts(prev =>
      prev.map(product => {
        if (product.id !== productId) return product;

        let updatedCompanies = [...(product.companies || [])];

        if (visible) {
          // Add this company if not already added
          if (!updatedCompanies.some(c => c.id === companyId)) {
            updatedCompanies.push({
              id: companyId,
              name: user.company?.name || "Your Company",
            });
          }
        } else {
          // Remove only this company
          updatedCompanies = updatedCompanies.filter(
            c => c.id !== companyId
          );
        }

        return { ...product, companies: updatedCompanies };
      })
    );

    toast.success(`Product ${visible ? "enabled" : "disabled"} successfully`);
  } catch (error) {
    toast.error("Failed to update product visibility");
  }
};


  // Get credit range for a product
const getCreditRange = (
  product: Product
): { min: number; max: number; display: string } => {
  if (!product.variants || product.variants.length === 0) {
    return { min: 0, max: 0, display: "N/A" };
  }

  const credits = product.variants
    .map(v => (v.mrp ? v.mrp * 2 : 0))
    .filter(c => c > 0);

  if (credits.length === 0) {
    return { min: 0, max: 0, display: "N/A" };
  }

  const min = Math.min(...credits);
  const max = Math.max(...credits);

  return {
    min,
    max,
    display: min === max ? `${min}` : `${min} - ${max}`,
  };
};

const filteredProducts = products.filter(product => {
  const matchesSearch =
    product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product?.vendor?.name?.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesCategory =
    selectedCategory === "all" ||
    product?.category?.name === selectedCategory;

  // Visibility filter logic
  const isVisible =
  product?.companies?.some(c => c.id === companyId) ?? false;

  const matchesVisibility =
    selectedVisibility === "all" ||
    (selectedVisibility === "visible" && isVisible) ||
    (selectedVisibility === "hidden" && !isVisible);

  // ✅ Corrected Price Range Filter (ANY variant match)
  const credits =
    product?.variants
      ?.map(v => (v.mrp ? v.mrp * 2 : 0))
      .filter(c => c > 0) ?? [];

  const matchesPriceRange = (() => {
    if (selectedPriceRange === "all") return true;
    if (credits.length === 0) return false;

    return credits.some(credit => {
      switch (selectedPriceRange) {
        case "under-1000":
          return credit < 1000;

        case "1000-3000":
          return credit >= 1000 && credit <= 3000;

        case "3000-5000":
          return credit > 3000 && credit <= 5000;

        case "above-5000":
          return credit > 5000;

        default:
          return true;
      }
    });
  })();

  return (
    matchesSearch &&
    matchesCategory &&
    matchesVisibility &&
    matchesPriceRange
  );
});


  const categories = Array.from(new Set(products.map(p => p?.category?.name).filter(Boolean)));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200"></div>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
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
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Product Visibility
        </h1>
        <p className="text-gray-600">
          Control which products are available to your company employees
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </div>
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === "card" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("card")}
                className={cn(
                  "h-8",
                  viewMode === "card" && "bg-white shadow-sm"
                )}
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Card
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className={cn(
                  "h-8",
                  viewMode === "table" && "bg-white shadow-sm"
                )}
              >
                <TableIcon className="w-4 h-4 mr-2" />
                Table
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* First Row: Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search products or vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Second Row: Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Price Ranges</option>
                <option value="under-1000">Under 1,000 Credits</option>
                <option value="1000-3000">1,000 - 3,000 Credits</option>
                <option value="3000-5000">3,000 - 5,000 Credits</option>
                <option value="above-5000">Above 5,000 Credits</option>
              </select>
              
              <select
                value={selectedVisibility}
                onChange={(e) => setSelectedVisibility(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Products</option>
                <option value="visible">Visible Only</option>
                <option value="hidden">Hidden Only</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table View */}
      {viewMode === "table" && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Credits Range</TableHead>
                 
                  <TableHead>Status</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 
                {filteredProducts.map((product) => {
                   
                 
                const isVisible =
  product?.companies?.some(c => c.id === companyId) ?? false;

                  const creditRange = getCreditRange(product);
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="w-16 h-16 relative overflow-hidden bg-gray-100 rounded-md">
                          <ImageWithFallback
                            src={product?.images?.[0] || "/placeholder.png"}
                            alt={product?.name || "Product"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {product?.name || "Unknown Product"}
                      </TableCell>
                      <TableCell>
                        {(product?.category?.name || "").replace(/_/g, " ")}
                      </TableCell>
                      <TableCell>
                        {product?.vendor?.name || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Coins className="w-4 h-4 text-amber-600" />
                          <span className="font-medium text-amber-700">
                            {creditRange.display}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant={(product?.availableStock || 0) > 0 ? "default" : "secondary"}>
                          {(product?.availableStock || 0) > 0 ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {isVisible ? (
                            <Eye className="w-4 h-4 text-green-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="text-sm">
                            {isVisible ? "Visible" : "Hidden"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          onClick={() => updateProductVisibility(product?.id || "", !isVisible)}
                          className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
                            isVisible 
                              ? "bg-emerald-600 border-emerald-700" 
                              : "bg-gray-300 border-gray-400"
                          )}
                        >
                          <span className="sr-only">Toggle product visibility</span>
                          <span
                            className={cn(
                              "inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out",
                              isVisible ? "translate-x-6" : "translate-x-1"
                            )}
                          />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Card View (existing) */}
      {viewMode === "card" && (
        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-6">
          {filteredProducts.map((product) => {
            const isVisible = (product?.companies || []).length > 0;
            const creditRange = getCreditRange(product);
            
            return (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                {/* Product Image */}
                <div className="aspect-square relative overflow-hidden bg-gray-100">
                  <ImageWithFallback
                    src={product?.images?.[0] || "/placeholder.png"}
                    alt={product?.name || "Product"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant={(product?.availableStock || 0) > 0 ? "default" : "secondary"}>
                      {(product?.availableStock || 0) > 0 ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </div>
                  {/* Credit Badge */}
                  <div className="absolute bottom-2 left-2">
                    <Badge className="bg-amber-600 hover:bg-amber-700 text-white flex items-center space-x-1">
                      <Coins className="w-3 h-3" />
                      <span>{creditRange.display}</span>
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="line-clamp-2 text-base">
                    {product?.name || "Unknown Product"}
                  </CardTitle>
                  <CardDescription className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {(product?.category?.name || "").replace(/_/g, " ")}
                      </span>
                     
                    </div>
                    {product?.vendor?.name && (
                      <div className="text-sm text-gray-600">
                        by {product.vendor.name}
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {isVisible ? (
                        <Eye className="w-4 h-4 text-green-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm font-medium">
                        {isVisible ? "Visible to Employees" : "Hidden from Employees"}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => updateProductVisibility(product?.id || "", !isVisible)}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
                        isVisible 
                          ? "bg-emerald-600 border-emerald-700" 
                          : "bg-gray-300 border-gray-400"
                      )}
                    >
                      <span className="sr-only">Toggle product visibility</span>
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out",
                          isVisible ? "translate-x-6" : "translate-x-1"
                        )}
                      />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 text-center">
              Try adjusting your search or filter criteria
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}