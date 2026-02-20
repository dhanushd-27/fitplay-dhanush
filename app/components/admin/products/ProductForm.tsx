"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Upload, Image as ImageIcon } from "lucide-react";
import { Category, SubCategory } from "@/lib/generated/prisma";
import { toast } from "sonner";
import { UploadDropzone } from "@/lib/uploadthing";

interface ProductFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: any) => void;
  editingProduct: any;
}

// Static allowed values (UI-design master list)
const categories = [
  "Fitness & Gym Equipment",
  "Nutrition & Health Foods",
  "Diagnostics & Preventive Health",
  "Ergonomic & Workspace Comfort Products",
  "Health & Wellness Services",
];

const categorySlugMap: Record<string, string> = {
  "Fitness & Gym Equipment": "Fitness_And_Gym_Equipment",
  "Nutrition & Health Foods": "Nutrition_And_Health_Foods",
  "Diagnostics & Preventive Health": "Diagnostics_And_Preventive_Health",
  "Ergonomic & Workspace Comfort Products": "Ergonomic_And_Workspace_Comfort_Products",
  "Health & Wellness Services": "Health_And_Wellness_Services",
};

// Subcategories by category
const subcategories: Record<string, string[]> = {
  Fitness_And_Gym_Equipment: [
    "Weights & Adjustable Dumbbells",
    "Yoga & Fitness Mats",
    "Crossfit Gear (Resistance bands, ropes)",
    "Gym Essentials (Shakers, Bag, Wristbands)",
  ],

  Nutrition_And_Health_Foods: [
    "Protein Powder",
    "Creatine / Preworkout",
    "Daily Vitamins",
    "Protein Bars",
    "Muscle & Performance Supplements",
    "General Health & Digestive Care",
  ],

  Diagnostics_And_Preventive_Health: [
    "Diagnostics",
    "Monitoring Devices",
    "Fitness Wearables",
    "Pharmacy Vouchers / Discount Coupons",
  ],

  Ergonomic_And_Workspace_Comfort_Products: [
    "Office Chairs",
    "Work Desks",
    "Massage & Recovery Tools",
    "Sleep Essentials",
    "Accessories",
  ],

  Health_And_Wellness_Services: [
    "Nutrition / Diet Consultation",
    "Mental Health & Emotional Wellness",
    "Yoga, Meditation, Mindfulness",
    "Gym & Fitness Subscriptions",
    "Career & Growth Counselling",
  ],
};

// Friendly category name mapping
const getFriendlyCategoryName = (category: string) =>
  category
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

export function ProductForm({
  isOpen,
  onOpenChange,
  onSubmit,
  editingProduct,
}: ProductFormProps) {
  const [formData, setFormData] = useState<any>({
    name: "",
    description: "",
    vendorName: "",
    sku: "",
    availableStock: "",
    category: "",
    subCategory: "",
    images: [],
    variants: [],
  });

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [variants, setVariants] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedVendor, setSelectedVendor] = useState("");


  // Fetch vendors on component mount
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch("/api/admin/vendors");
        if (response.ok) {
          const data = await response.json();
          setVendors(data.vendors || []);
        }
      } catch (error) {
        console.error("Failed to fetch vendors:", error);
      }
    };

    fetchVendors();
  }, []);

  // Update form data when editingProduct changes
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || "",
        description: editingProduct.description || "",
        vendorName: editingProduct.vendorName || "",
        sku: editingProduct.sku || "",
        availableStock: editingProduct.availableStock?.toString() || "",
        category: editingProduct.category?.name || "",
        subCategory: editingProduct.subCategory?.name || "",
        images: editingProduct.images || [],
        variants: editingProduct.variants || [],
      });
      const prettyCategory =
        Object.keys(categorySlugMap).find(
          (pretty) => categorySlugMap[pretty] === editingProduct.category?.name
        ) || editingProduct.category?.name;

      setSelectedCategory(prettyCategory || "");
      setSelectedSubcategory(editingProduct.subCategory?.name || "");

      setSelectedVendor(editingProduct.vendorId || "");
      setVariants(editingProduct.variants || []);
    } else {
      // Reset form for new product
      setFormData({
        name: "",
        description: "",
        vendorName: "",
        sku: "",
        availableStock: "",
        category: "",
        subCategory: "",
        images: [],
        variants: [],
      });
      setSelectedCategory("");
      setSelectedSubcategory("");
      setSelectedVendor("");
    }
  }, [editingProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!selectedCategory || !formData.name.trim()) {
      toast.error("Please fill in product name and category");
      return;
    }

    if (!selectedVendor && !formData.vendorName?.trim()) {
      toast.error("Please select a vendor or enter vendor name");
      return;
    }

    try {

      const productData = {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        description: formData.description?.trim() || "",
        category: selectedCategory,
        subCategory: selectedSubcategory || null, // stays human-friendly
        vendorId: selectedVendor || null,
        vendorName:
          !selectedVendor && formData.vendorName?.trim()
            ? formData.vendorName.trim()
            : null,
        availableStock: parseInt(formData.availableStock) || 0,
        images: formData.images,
        variants: variants
          .map((variant) => ({
            variantCategory: variant.variantCategory.trim(),
            variantValue: variant.variantValue.trim(),
            sku: variant.sku?.trim() || "",
            mrp: parseInt(variant.mrp) || 0,
          }))
          .filter(
            (variant) =>
              variant.variantCategory && variant.variantValue && variant.mrp > 0
          ),
      };

      await onSubmit(productData);

      // Reset form after successful submission
      resetForm();
    } catch (error) {
      console.error("ProductForm submit error:", error);
      toast.error("Failed to save product");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      vendorName: "",
      sku: "",
      availableStock: "",
      category: "",
      subCategory: "",
      images: [],
      variants: [],
    });
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedVendor("");
    setVariants([]);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  // Update formData when selectedCategory changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory("");
    setFormData({ ...formData, category, subCategory: "" });
  };

  // Update formData when selectedSubcategory changes
  const handleSubcategoryChange = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
    setFormData({ ...formData, subCategory: subcategory });
  };

  // Variants management functions
  const addVariant = () => {
    const newVariant = {
      id: Date.now().toString(),
      variantCategory: "",
      variantValue: "",
      sku: "",
      mrp: "",
    };
    setVariants([...variants, newVariant]);
  };

  const updateVariant = (index: number, field: string, value: string) => {
    const updatedVariants = variants.map((variant, i) =>
      i === index ? { ...variant, [field]: value } : variant
    );
    setVariants(updatedVariants);
    setFormData({ ...formData, variants: updatedVariants });
  };

  const removeVariant = (index: number) => {
    const updatedVariants = variants.filter((_, i) => i !== index);
    setVariants(updatedVariants);
    setFormData({ ...formData, variants: updatedVariants });
  };

  // Initialize variants when editing product
  useEffect(() => {
    if (editingProduct?.variants) {
      setVariants(editingProduct.variants);
    } else {
      setVariants([]);
    }
  }, [editingProduct]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-4 py-4 bg-white"
        >
          <div className="space-y-2">
            <Label htmlFor="product-name">Product Name</Label>
            <Input
              id="product-name"
              placeholder="Enter product name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-sku">SKU</Label>
            <Input
              id="product-sku"
              placeholder="Product SKU"
              value={formData.sku}
              onChange={(e) =>
                setFormData({ ...formData, sku: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-vendor">Vendor</Label>
            <div className="space-y-2">
              <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mb-2">
                Or enter vendor name manually:
              </p>
              <Input
                id="product-vendor"
                placeholder="Enter vendor name (if not in list)"
                value={formData.vendorName}
                onChange={(e) =>
                  setFormData({ ...formData, vendorName: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-category">Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {getFriendlyCategoryName(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-subcategory">Subcategory</Label>
            <Select
              disabled={!selectedCategory}
              value={selectedSubcategory}
              onValueChange={handleSubcategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subcategory" />
              </SelectTrigger>
              <SelectContent>
                {selectedCategory &&
                  subcategories[categorySlugMap[selectedCategory]]?.map(
                    (subcategory) => (
                      <SelectItem key={subcategory} value={subcategory}>
                        {subcategory}
                      </SelectItem>
                    )
                  )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-stock">Stock Quantity</Label>
            <Input
              id="product-stock"
              type="number"
              placeholder="Available quantity"
              value={formData.availableStock}
              onChange={(e) =>
                setFormData({ ...formData, availableStock: e.target.value })
              }
              required
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="product-description">Description</Label>
            <Textarea
              id="product-description"
              placeholder="Product description"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>

          <div className="col-span-2 space-y-2">
            <Label htmlFor="product-images">Product Images</Label>
            <div className="space-y-4">
              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
  <UploadDropzone
    endpoint="imageUploader"
    onClientUploadComplete={(res) => {
      setFormData({
        ...formData,
        images: [
          ...(formData.images || []),
          ...res.map((f) => f.ufsUrl),
        ],
      });
      toast.success("Images uploaded");
    }}
    onUploadError={(error) => {
      toast.error(error.message);
    }}
  />
</div>

              {/* Existing Images from formData */}
              {formData.images && formData.images.length > 0 && (
                <div>
                  <Label className="text-sm text-gray-600">
                    Existing Images
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                    {formData.images.map((image: string, index: number) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Existing ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = formData.images.filter(
                              (_: any, i: number) => i !== index
                            );
                            setFormData({ ...formData, images: newImages });
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* URL Input as fallback */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">
                  Or add image by URL
                </Label>
                <Input
                  type="url"
                  placeholder="Enter image URL"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      if (input.value.trim()) {
                        setFormData({
                          ...formData,
                          images: [
                            ...(formData.images || []),
                            input.value.trim(),
                          ],
                        });
                        input.value = "";
                      }
                    }
                  }}
                />
                <p className="text-xs text-gray-500">
                  Press Enter to add image URL
                </p>
              </div>
            </div>
          </div>

          {/* Variants Section */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Product Variants
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addVariant}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Variant
              </Button>
            </div>

            {variants.length > 0 && (
              <div className="space-y-3">
                {variants.map((variant, index) => (
                  <Card
                    key={variant.id || index}
                    className="p-4 bg-gray-50 border border-gray-200"
                  >
                    <div className="flex items-end gap-4">
                      <div className="flex-1 grid grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`variant-category-${index}`}>
                            Category
                          </Label>
                          <Input
                            id={`variant-category-${index}`}
                            placeholder="e.g., Size, Color"
                            value={variant.variantCategory}
                            onChange={(e) =>
                              updateVariant(
                                index,
                                "variantCategory",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`variant-value-${index}`}>
                            Value
                          </Label>
                          <Input
                            id={`variant-value-${index}`}
                            placeholder="e.g., S, M, L"
                            value={variant.variantValue}
                            onChange={(e) =>
                              updateVariant(
                                index,
                                "variantValue",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`variant-sku-${index}`}>
                            Variant SKU
                          </Label>
                          <Input
                            id={`variant-sku-${index}`}
                            placeholder="Variant SKU"
                            value={variant.sku || ""}
                            onChange={(e) =>
                              updateVariant(index, "sku", e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`variant-mrp-${index}`}>
                            MRP (₹)
                          </Label>
                          <Input
                            id={`variant-mrp-${index}`}
                            type="number"
                            placeholder="Price"
                            value={variant.mrp}
                            onChange={(e) =>
                              updateVariant(index, "mrp", e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeVariant(index)}
                        className="mb-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {variants.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>
                  No variants added yet. Click "Add Variant" to create product
                  variations.
                </p>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="col-span-2 flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
              disabled={false}
            >
              {editingProduct ? "Update Product" : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}