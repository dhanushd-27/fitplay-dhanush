"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Package, Calendar, User, Tag, Banknote } from "lucide-react";
import { getLowestCredits, getLowestMRP } from "@/lib/utils";

interface ProductDetailDialogProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailDialog({
  product,
  isOpen,
  onClose,
}: ProductDetailDialogProps) {
  if (!product) return null;

  const getStatusBadge = (status: string) => {
    const isActive = product.availableStock > 0;
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="border-b pb-4 mb-6">
          <DialogTitle className="text-2xl font-bold text-gray-900">{product.name}</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Images */}
          <div className="space-y-4">
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                  <Package className="h-5 w-5 text-blue-600" />
                  Product Images
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {product.images && product.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {product.images.map((image: string, index: number) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={image}
                          alt={`${product.name} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            {/* Basic Info */}
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-lg text-gray-800">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4">
                <div className="flex justify-between">
                  <span className="font-medium">SKU:</span>
                  <Badge variant="outline">{product.sku}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  {getStatusBadge(product.status || "active")}
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Stock:</span>
                  <div className="flex items-center gap-2">
                    <span>{product.availableStock}</span>
                    {getStockBadge(product.availableStock)}
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Vendor Info */}
            {product.vendor && (
              <Card className="shadow-sm border border-gray-200">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                    <User className="h-5 w-5 text-green-600" />
                    Vendor Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Name:</span>
                    <span>{product.vendor.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span className="text-sm">{product.vendor.email}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Category Info */}
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
          </div>
        </div>

        {/* Description */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-lg text-gray-800">Description</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-gray-700 leading-relaxed">
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
                Product Variants
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.variants.map((variant: any, index: number) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
                    <div className="font-semibold text-gray-900">{variant.name || `Variant ${index + 1}`}</div>
                    <div className="flex justify-between text-sm">
                      <span>Credits:</span>
                      <span className="font-medium">{variant.mrp} credits</span>
                    </div>
                    {variant.discountedPrice && (
                      <div className="flex justify-between text-sm">
                        <span>Discounted:</span>
                        <span className="font-medium text-green-600">{variant.discountedPrice} credits</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Stock:</span>
                      <span className="font-medium">{variant.stock || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timestamps */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
              <Calendar className="h-5 w-5 text-blue-600" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Created:</span>
              <span>{new Date(product.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Last Updated:</span>
              <span>{new Date(product.updatedAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}