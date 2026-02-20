"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Package,
  User,
  Tag,
  Banknote,
  Calendar,
  Star,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { getLowestCredits, getLowestMRP } from "@/lib/utils";

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  const fetchProduct = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/products/${id}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      
      const data = await response.json();
      setProduct(data.product);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const isActive = product?.availableStock > 0;
    return isActive ? (
      <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-700">Inactive</Badge>
    );
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (stock <= 10) {
      return <Badge className="bg-orange-100 text-orange-700">Low Stock</Badge>;
    } else if (stock <= 50) {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Medium Stock</Badge>;
    } else {
      return <Badge variant="outline" className="border-emerald-500 text-emerald-600">In Stock</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
          <p className="text-gray-500 mt-2">The product you're looking for doesn't exist.</p>
          <Button 
            onClick={() => router.push('/admin/products')} 
            className="mt-4"
          >
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/products')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-sm text-gray-500">SKU: {product.sku}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Product Images */}
        <div className="lg:col-span-1">
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                <Package className="h-5 w-5 text-blue-600" />
                Product Images
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {product.images && product.images.length > 0 ? (
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Thumbnail Gallery */}
                  {product.images.length > 1 && (
                    <div className="grid grid-cols-3 gap-2">
                      {product.images.slice(1).map((image: string, index: number) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={image}
                            alt={`${product.name} - Image ${index + 2}`}
                            className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Product Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg text-gray-800">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">SKU:</span>
                    <Badge variant="outline">{product.sku}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Status:</span>
                    {getStatusBadge(product.status || "active")}
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Stock:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{product.availableStock}</span>
                      {getStockBadge(product.availableStock)}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">

                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Credits:</span>
                    <span className="font-semibold text-lg">{getLowestCredits(product)} credits</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Price:</span>
                    <span className="font-semibold text-lg">₹{getLowestMRP(product)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vendor Information */}
          {product.vendor && (
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                  <User className="h-5 w-5 text-green-600" />
                  Vendor Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Name:</span>
                    <span className="font-medium">{product.vendor.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Email:</span>
                    <span className="text-sm">{product.vendor.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Category & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                  <Tag className="h-5 w-5 text-purple-600" />
                  Category
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <Badge variant="outline" className="text-sm">
                  {product.category?.name || product.categoryOld || 'Nutrition & Health Foods'}
                </Badge>
                {(product.subCategory?.name || product.subCategoryOld) && (
                  <Badge variant="outline" className="ml-2 text-sm">
                    {product.subCategory?.name || product.subCategoryOld}
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-600">Created:</span>
                  <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-600">Last Updated:</span>
                  <span>{new Date(product.updatedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Full Width Sections */}
      
      {/* Description */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-lg text-gray-800">Description</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-700 leading-relaxed text-base">
            {product.description || 'No description available.'}
          </p>
        </CardContent>
      </Card>

      {/* Variants */}
      {product.variants && product.variants.length > 0 && (
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
              <Banknote className="h-5 w-5 text-yellow-600" />
              Product Variants ({product.variants.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.variants.map((variant: any, index: number) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
                  <div className="font-semibold text-gray-900">
                    {variant.variantCategory}: {variant.variantValue}
                  </div>
                  <div className="space-y-2 text-sm">
                    {variant.sku && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">SKU:</span>
                        <span className="font-medium">{variant.sku}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Credits:</span>
                      <span className="font-medium">{variant.mrp * 2} credits</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">₹{variant.mrp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stock:</span>
                      <span className="font-medium">{variant.availableStock || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}