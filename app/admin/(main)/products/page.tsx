"use client";

import React, { useState } from "react";
import { Plus, Download, FileSpreadsheet, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
} from "@/app/hooks/useAdminProducts";
import {
  ProductStats,
  ProductFilters,
  ProductTable,
  ProductForm,
  ProductLoadingSkeleton,
} from "@/app/components/admin/products";
import { Product, Variant } from "@/lib/generated/prisma";

export default function AdminProductsPage() {
  const { products, isLoading, error, mutate } = useAdminProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const CATEGORY_NAME_TO_FILTER: Record<string, string> = {
  "Fitness & Gym Equipment": "Fitness_And_Gym_Equipment",
  "Nutrition & Health Foods": "Nutrition_And_Health",
  "Diagnostics & Preventive Health": "Diagnostics_And_Prevention",
  "Ergonomics & Workspace Comfort": "Ergonomics_And_Workspace_Comfort",
  "Health & Wellness Services": "Health_And_Wellness_Services",
};


  const filteredProducts = products
    .filter((product: any) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.vendor?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      
     const matchesCategory =
  categoryFilter === "all" ||
  CATEGORY_NAME_TO_FILTER[product.category?.name] === categoryFilter;

      
      const matchesStatus = 
        statusFilter === "all" || 
        (statusFilter === "active" && product.availableStock > 0) ||
        (statusFilter === "inactive" && product.availableStock === 0);
      
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "low" && product.availableStock > 0 && product.availableStock <= 10) ||
        (stockFilter === "out" && product.availableStock === 0) ||
        (stockFilter === "in_stock" && product.availableStock > 10);
      
      return matchesSearch && matchesCategory && matchesStatus && matchesStock;
    })
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "credits":
          // Sort by lowest variant price
          const aCredits = a.variants?.length > 0 ? Math.min(...a.variants.map((v: any) => v.mrp || 0)) : 0;
          const bCredits = b.variants?.length > 0 ? Math.min(...b.variants.map((v: any) => v.mrp || 0)) : 0;
          return bCredits - aCredits;
        case "stock":
          return b.availableStock - a.availableStock;
        case "rating":
          const aRating = a.avgRating || 0;
          const bRating = b.avgRating || 0;
          return bRating - aRating;
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });



  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsAddProductOpen(true);
  };

  const handleDelete = async (id: string) => {
    // Use toast with confirmation buttons instead of browser confirm
    toast.error(
      <div className="space-y-2">
        <p>Are you sure you want to delete this product?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                await deleteAdminProduct(id);
                toast.success("Product deleted successfully!");
                mutate(); // Refresh the products list
                toast.dismiss();
              } catch (err: any) {
                console.error("Error deleting product:", err);
                const errorMessage = err.message || "Failed to delete product";
                toast.error(errorMessage);
              }
            }}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        duration: 10000, // 10 seconds to decide
        id: `delete-${id}`, // Unique ID to prevent multiple toasts
      }
    );
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      toast.loading(`Preparing ${format === 'excel' ? 'Excel' : 'PDF'} export...`);
      
      // Use different API endpoints based on format
      const apiEndpoint = format === 'pdf' 
        ? '/api/admin/products/export-pdf' 
        : `/api/admin/products/export?format=${format}`;
      
      const response = await fetch(apiEndpoint, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Export failed: ${response.status} - ${errorText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `products-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.dismiss();
      const formatNames = { excel: 'Excel', pdf: 'PDF' };
      toast.success(`Products exported as ${formatNames[format]} successfully`);
    } catch (error) {
      toast.dismiss();
      toast.error(`Failed to export products as ${format === 'excel' ? 'Excel' : 'PDF'}`);
      console.error('Export error:', error);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      // Validate required fields
      if (!formData.name?.trim()) {
        toast.error("Product name is required");
        return;
      }
      
      if (!formData.sku?.trim()) {
        toast.error("SKU is required");
        return;
      }
      
      if (!formData.category) {
        toast.error("Category is required");
        return;
      }

      const variants = (formData.variants || []).map((variant: any) => ({
        variantCategory: variant.variantCategory,
        variantValue: variant.variantValue,
        sku: variant.sku || '',
        mrp: parseInt(variant.mrp) || 0,
        id: variant.id,
      })).filter((v: any) => v.variantCategory && v.variantValue && v.mrp > 0);

      const productData = {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        description: formData.description?.trim() || '',
        category: formData.category,
        subCategory: formData.subCategory || null,
        availableStock: parseInt(formData.availableStock) || 0,
        images: formData.images || [],
        vendorId: formData.vendorId || null,
        vendorName: formData.vendorName?.trim() || null,
        variants: variants,
      };

      let result;
      if (editingProduct) {
        result = await updateAdminProduct(editingProduct.id, {
          ...productData,
          variants: variants.length > 0 ? {
            deleteMany: {},
            create: variants.map(({ id, ...variant }) => variant),
          } : { deleteMany: {} },
        });
        toast.success("Product updated successfully!");
      } else {
        // For creating new products, send variants directly in the main data
        result = await createAdminProduct(productData);
        toast.success("Product created successfully!");
      }

      // Refresh the products list
      mutate();
      
      setIsAddProductOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      console.error("Error saving product:", err);
      const errorMessage = err.message || "Failed to save product. Please check all fields and try again.";
      toast.error(errorMessage);
    }
  };

  if (isLoading) return <ProductLoadingSkeleton />;
  if (error)
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">
            Error Loading Products
          </div>
          <div className="text-gray-600">{error.message}</div>
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Products Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your product catalog across all vendors
          </p>
        </div>
        <div className="flex gap-3">
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
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => {
              setEditingProduct(null); // Clear editing state first
              setTimeout(() => {
                setIsAddProductOpen(true); // Then open dialog after state clears
              }, 0);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <ProductStats products={products} />

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Product Catalog</CardTitle>
            <ProductFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              stockFilter={stockFilter}
              onStockFilterChange={setStockFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {/* Product Table */}
            <ProductTable
              products={filteredProducts}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </CardContent>
      </Card>

      {/* Product Form Dialog */}
      <ProductForm
        isOpen={isAddProductOpen}
        onOpenChange={setIsAddProductOpen}
        onSubmit={handleSubmit}
        editingProduct={editingProduct}
      />
    </div>
  );
}
