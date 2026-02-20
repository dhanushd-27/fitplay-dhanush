"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Variant {
  id: string;
  variantCategory: string;
  variantValue: string;
  mrp: number;
  credits?: string;
  product: any;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Product {
  id: string;
  name: string;
  images: string[];
  description: string;
  discount?: number;
  sku: string;
  availableStock: number;
  category: {
    id: string;
    name: string;
  } | null;
  subCategory?: {
    id: string;
    name: string;
  } | null;
  specifications?: any;
  avgRating?: number;
  noOfReviews?: number;
  variants: Variant[];
  vendor?: {
    id: string;
    name: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

import {
  Search,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  Filter,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { toast } from "sonner";
import { useAtomValue, useSetAtom } from "jotai";
import {
  addToCartAtom,
  cartAnimationAtom,
  getCartItemQuantityAtom,
  updateCartQuantityByProductAtom,
} from "@/lib/store";
import { useUser } from "@/app/hooks/useUser";
import { useProducts } from "@/app/hooks/useProducts";
import { useCategories } from "@/app/hooks/useCategories";
import { useEffect } from "react";
import { getLowestCredits, getLowestMRP } from "@/lib/utils";
import { ProductWithVariant } from "@/lib/types";

export default function WellnessStore() {
  const { isAuthenticated } = useUser();
  const { products, isLoading: productsLoading, error } = useProducts();
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const { categories, isLoading: categoriesLoading } = useCategories();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Track when products have loaded at least once to prevent flickering
  useEffect(() => {
    if (products.length > 0 && !hasLoadedOnce) {
      setHasLoadedOnce(true);
    }
  }, [products.length, hasLoadedOnce]);

  // Show loading when products are loading OR when no products are available yet
  const shouldShowLoading = productsLoading || (!hasLoadedOnce && products.length === 0);

  const addToCart = useSetAtom(addToCartAtom);
  const updateCartQuantityByProduct = useSetAtom(
    updateCartQuantityByProductAtom
  );
  const getCartItemQuantity = useAtomValue(getCartItemQuantityAtom);

  const setCartAnimation = useSetAtom(cartAnimationAtom);

  // Helper function to get the lowest priced variant
  const getLowestPricedVariant = (
    product: Product
  ): { id: string; value: string } | undefined => {
    if (!product.variants || product.variants.length === 0) return undefined;

    const lowestVariant = product.variants.reduce((lowest, current) => {
      const lowestMRP = lowest.mrp || 0;
      const currentMRP = current.mrp || 0;
      return currentMRP < lowestMRP ? current : lowest;
    });

    return { id: lowestVariant.id, value: lowestVariant.variantValue };
  };

  const handleAddToCart = (product: any) => {
    // Check if user is logged in
    if (!isAuthenticated) {
      toast.error("Login Required", {
        description: "You need to log in to add items to your cart.",
        duration: 5000,
        action: {
          label: "Login",
          onClick: () => {
            window.location.href = "/login";
          },
        },
      });
      return;
    }

    // Get the lowest priced variant automatically
    const lowestVariant = getLowestPricedVariant(product as Product);
    const result = addToCart({
      product,
      selectedVariant: lowestVariant?.value,
      variantId: lowestVariant?.id,
    });

    // Trigger cart animation
    setCartAnimation(true);
    setTimeout(() => setCartAnimation(false), 600);

    // Show custom toast notification
    if (result.wasUpdated) {
      toast.success(`${product.name} quantity updated!`, {
        description: `Now you have ${result.newQuantity} in your cart.`,
        duration: 3000,
      });
    } else if (result.isNewItem) {
      // Get lowest credits from variants
      const credits = getLowestCredits(product as Product);
      toast.success(`${product.name} added to cart!`, {
        description: `${credits} credits - Great choice for your wellness journey!`,
        duration: 3000,
      });
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);

  const [brandsOpen, setBrandsOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);

  // Generate dynamic categories from products
 
  const dynamicCategories = Array.from(
  new Set(
    products.map((product) => product.category?.name || "Uncategorized")
  )
).map((category) => ({
  value: category,
  label: category === "Uncategorized"
    ? "Uncategorized"
    : category
        .replace(/_/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" "),
  count: products.filter((p) => (p.category?.name || "Uncategorized") === category).length,
}));


  // Generate dynamic brands from products (using vendor.name as brand)
  const brands = Array.from(
    new Set(
      products.map((product) => (product as any).vendor?.name).filter(Boolean)
    )
  ).map((brand) => ({
    name: brand as string,
    count: products.filter((p) => (p as any).vendor?.name === brand).length,
  }));

  const priceRanges = [
    { value: "under-1000", label: "Under 1000 credits", min: 0, max: 1000 },
    { value: "1000-3000", label: "1000 - 3000 credits", min: 1000, max: 3000 },
    { value: "3000-5000", label: "3000 - 5000 credits", min: 3000, max: 5000 },
    { value: "above-5000", label: "Above 5000 credits", min: 5000, max: Infinity },
  ];

  // Categories are now fetched from API and stored in state

  const handleBrandChange = (brand: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands([...selectedBrands, brand]);
    } else {
      setSelectedBrands(selectedBrands.filter((b) => b !== brand));
    }
  };

  const handlePriceRangeChange = (range: string, checked: boolean) => {
    if (checked) {
      setSelectedPriceRanges([...selectedPriceRanges, range]);
    } else {
      setSelectedPriceRanges(selectedPriceRanges.filter((r) => r !== range));
    }
  };



  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((product as any).vendor?.name &&
        (product as any).vendor.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));
    const matchesCategory =
      selectedCategory === "all" || product.category?.name === selectedCategory;

    // Debug logging
    if (selectedCategory !== "all") {

    }
    const matchesBrand =
      selectedBrands.length === 0 ||
      ((product as any).vendor?.name &&
        selectedBrands.includes((product as any).vendor.name));

    // Price range filter (using lowest credits from variants)
    const productCredits = getLowestCredits(product as any);
    const matchesPriceRange =
      selectedPriceRanges.length === 0 ||
      selectedPriceRanges.some((rangeValue) => {
        const range = priceRanges.find((r) => r.value === rangeValue);
        if (!range) return false;
        return productCredits >= range.min && productCredits <= range.max;
      });

    return (
      matchesSearch &&
      matchesCategory &&
      matchesBrand &&
      matchesPriceRange
    );
  });

 

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low": {
        const aCredits = getLowestCredits(a as any);
        const bCredits = getLowestCredits(b as any);
        return aCredits - bCredits;
      }
      case "price-high": {
        const aCredits = getLowestCredits(a as any);
        const bCredits = getLowestCredits(b as any);
        return bCredits - aCredits;
      }
      case "rating":
        return (b.avgRating || 0) - (a.avgRating || 0);
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      default:
        return 0; // Featured - keep original order
    }
  });

  const QuantitySelector = ({ product }: { product: any }) => {
    const lowestVariant = getLowestPricedVariant(product as Product);
    const quantity = getCartItemQuantity(product.id, lowestVariant?.id);

    if (quantity === 0) {
      return (
        <Button
          size="sm"
          onClick={() => handleAddToCart(product)}
          className="w-full bg-emerald-500 hover:bg-emerald-600 transition-all duration-200 hover:scale-105 active:scale-95 text-white font-medium text-sm rounded-lg h-9"
        >
          Add to Cart
        </Button>
      );
    }

    return (
      <div className="flex items-center border border-emerald-300 rounded-lg bg-emerald-50 w-full h-9">
        <button
          onClick={() =>
            updateCartQuantityByProduct({
              productId: product.id,
              quantity: Math.max(0, quantity - 1),
              variantId: lowestVariant?.id,
            })
          }
          className="px-2 py-1 hover:bg-emerald-100 text-emerald-700 transition-all duration-200 flex-1 flex items-center justify-center rounded-l-lg"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="px-4 py-2 text-emerald-800 font-medium min-w-10 text-center border-x border-emerald-200">
          {quantity}
        </span>
        <button
          onClick={() =>
            updateCartQuantityByProduct({
              productId: product.id,
              quantity: Math.max(0, quantity + 1),
              variantId: lowestVariant?.id,
            })
          }
          className="px-2 py-1 hover:bg-emerald-100 text-emerald-700 transition-all duration-200 flex-1 flex items-center justify-center rounded-r-lg"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50">
      {/* Hero Header */}
      <div className="relative  overflow-hidden pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-400/20 via-transparent to-transparent"></div>

        <div className="relative max-w-full mx-auto px-3 sm:px-4 lg:px-6 py-3 lg:py-3">
          
        </div>

       
      </div>

      <div className="relative max-w-full mx-auto px-3 sm:px-4 lg:px-6 pt-12 pb-16 space-y-8">
        {/* Search and Filters Bar */}
       <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(16,185,129,0.12)] border border-emerald-100/60 p-6 transition-all duration-300">
  <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center">

    {/* 🔍 Search */}
    <div className="relative flex-1 group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 w-5 h-5 group-focus-within:text-emerald-600 transition-colors" />

      <Input
        placeholder="Search products, brands, categories..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="
          pl-12 py-4 text-base rounded-xl
          bg-gradient-to-r from-gray-50 to-emerald-50/40
          border border-gray-200
          text-gray-700 placeholder-gray-400
          focus:bg-white focus:border-emerald-500
          focus:ring-2 focus:ring-emerald-500/20
          focus:text-gray-900
          transition-all duration-300
          hover:border-emerald-300
        "
      />
    </div>

    {/* 🔽 Sort */}
    <div className="flex items-center gap-4 lg:w-auto">
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger
          className="
            w-full lg:w-56 py-4 rounded-xl
            bg-gradient-to-r from-gray-50 to-emerald-50/40
            border border-gray-200
            text-gray-700
            hover:border-emerald-300
            focus:bg-white focus:border-emerald-500
            focus:ring-2 focus:ring-emerald-500/20
            transition-all duration-300
          "
        >
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>

        <SelectContent className="rounded-xl border border-gray-200 shadow-lg">
          <SelectItem value="featured">Featured</SelectItem>
          <SelectItem value="price-low">Price: Low to High</SelectItem>
          <SelectItem value="price-high">Price: High to Low</SelectItem>
          <SelectItem value="rating">Highest Rated</SelectItem>
          <SelectItem value="newest">Newest</SelectItem>
        </SelectContent>
      </Select>
    </div>

  </div>
</div>


        {/* Category Banners */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            Shop by Category
          </h2>
          <div
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-4"
            role="tablist"
            aria-label="Product categories"
          >
            {categoriesLoading
              ? // Show skeleton loading for categories
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="group cursor-pointer">
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 aspect-square animate-pulse">
                      <div className="absolute inset-0 bg-gray-300"></div>
                    </div>
                    <div className="mt-2 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="mt-1 h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </div>
                ))
              : categories.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    role="tab"
                    aria-selected={selectedCategory === category.value}
                    aria-label={`Select ${category.label} category`}
                    className={`group cursor-pointer transition-all duration-300 ${
                      selectedCategory === category.value
                        ? "transform scale-105"
                        : "hover:transform hover:scale-105"
                    }`}
                    onClick={() => {

                      setSelectedCategory(category.value);
                    }}
                  >
                    <div
                      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 focus:outline-none ring-2 focus:ring-emerald-500 ring-offset-2 ${
                        selectedCategory === category.value
                          ? "ring-emerald-500 shadow-xl shadow-emerald-500/20 scale-105"
                          : "ring-transparent hover:ring-emerald-300 hover:shadow-lg"
                      }`}
                    >
                      {/* Image Container */}
                      <div className="aspect-square overflow-hidden bg-gray-100">
                        <ImageWithFallback
                          src={category.image}
                          alt={category.label}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {/* Overlay for selected state */}
                        {selectedCategory === category.value && (
                          <div className="absolute inset-0 bg-emerald-500/20" />
                        )}
                      </div>

                      {/* Category Label */}
                      <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-3">
                        <h3
                          className={`font-semibold text-sm text-white transition-colors line-clamp-2 text-center ${
                            selectedCategory === category.value
                              ? "text-emerald-200"
                              : "group-hover:text-emerald-200"
                          }`}
                        >
                          {category.label}
                        </h3>
                      </div>

                      {/* Selection Indicator */}
                      {selectedCategory === category.value && (
                        <div className="absolute top-3 right-3 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Sidebar - Filters */}
          <div className="w-full lg:w-72 shrink-0">


             <div className="block lg:hidden mb-4">
    <Button
      onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
      className="w-full bg-emerald-500 text-white"
    >
      <Filter className="w-4 h-4 mr-2" />
      Filters
    </Button>
  </div>
            <div
  className={`${
    mobileFiltersOpen ? "block" : "hidden"
  } lg:block bg-white rounded-xl border border-gray-200 p-5 lg:sticky top-24 shadow-sm`}
>

              {/* Filter Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-gray-900 text-base">
                    Refine Your Search
                  </h3>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {selectedBrands.length +
                    selectedPriceRanges.length +
                    (selectedCategory !== "all" ? 1 : 0)}{" "}
                  active
                </span>
              </div>

              {/* Price Range Filter */}
              <Collapsible open={priceOpen} onOpenChange={setPriceOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full mb-3 hover:text-emerald-600 transition-colors text-gray-700">
                  <h3 className="font-medium text-gray-900 text-sm">
                    Price Range
                  </h3>
                  {priceOpen ? (
                    <ChevronUp className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-emerald-600" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mb-5">
                  {priceRanges.map((range) => (
                    <div
                      key={range.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={range.value}
                        checked={selectedPriceRanges.includes(range.value)}
                        onCheckedChange={(checked) =>
                          handlePriceRangeChange(range.value, checked === true)
                        }
                        className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 border-gray-300 bg-gray-50"
                      />
                      <label
                        htmlFor={range.value}
                        className="text-xs text-gray-700 cursor-pointer flex-1"
                      >
                        {range.label}
                      </label>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>



              {/* Brands */}
              <Collapsible open={brandsOpen} onOpenChange={setBrandsOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full mb-3 hover:text-emerald-600 transition-colors text-gray-700">
                  <h3 className="font-medium text-gray-900 text-sm">Brands</h3>
                  {brandsOpen ? (
                    <ChevronUp className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-emerald-600" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2">
                  {brands.map((brand) => (
                    <div
                      key={brand.name}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={brand.name}
                        checked={selectedBrands.includes(brand.name)}
                        onCheckedChange={(checked) =>
                          handleBrandChange(brand.name, checked === true)
                        }
                        className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 border-gray-300 bg-gray-50"
                      />
                      <label
                        htmlFor={brand.name}
                        className="text-xs text-gray-700 cursor-pointer flex-1"
                      >
                        {brand.name}
                      </label>
                      <span className="text-xs text-gray-500">
                        ({brand.count})
                      </span>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              {/* Clear Filters */}
              {(selectedBrands.length > 0 ||
                selectedPriceRanges.length > 0 ||
                selectedCategory !== "all" ||
                searchTerm) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedBrands([]);
                    setSelectedPriceRanges([]);
                    setSelectedCategory("all");
                    setSearchTerm("");
                  }}
                  className="w-full mt-6 bg-gradient-to-r from-gray-50 to-emerald-50 border-emerald-300 text-emerald-700 hover:border-emerald-500 hover:text-emerald-800 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 text-sm font-medium transition-all duration-300 rounded-xl"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="bg-white rounded-2xl shadow-lg border p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex items-center justify-between">
                <p className="text-gray-600 font-medium">
                  {productsLoading ? (
                    "Loading products..."
                  ) : (
                    <>
                      Showing {sortedProducts.length} of {products.length}{" "}
                      products
                      {searchTerm && (
                        <span> for &ldquo;{searchTerm}&rdquo;</span>
                      )}
                      {selectedCategory !== "all" && (
                        <span> in {selectedCategory.replace(/_/g, " ")}</span>
                      )}
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Loading State */}
            {(shouldShowLoading || categoriesLoading) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="relative group animate-pulse">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 rounded-3xl blur opacity-25"></div>
                    <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200"></div>
                      <div className="p-6 space-y-4">
                        <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-3/4"></div>
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/2"></div>
                        <div className="h-6 bg-gradient-to-r from-emerald-200 to-emerald-300 rounded-lg w-1/3"></div>
                        <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-20">
                <div className="relative inline-block">
                  <div className="absolute -inset-4 bg-gradient-to-r from-red-400 via-pink-500 to-red-500 rounded-2xl blur opacity-20"></div>
                  <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
                    <p className="text-red-600 mb-6 text-lg font-medium">
                      Error loading products: {error.message}
                    </p>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-red-500 text-red-600 hover:bg-red-50 px-8 py-3"
                      onClick={() => window.location.reload()}
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Product Grid */}
            {!shouldShowLoading && !categoriesLoading && !error && sortedProducts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 mb-16">
                {sortedProducts.map((product, index) => (
                  <div key={`${product.id}-${index}`} className="group">
                    <Link href={`/product/${product.id}`} className="block">
                      <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 rounded-3xl blur-sm opacity-20 group-hover:opacity-40 transition-all duration-300"></div>
                        <div
                          // className="relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] overflow-hidden border border-gray-100 flex flex-col group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-emerald-50/30"
                        className="relative bg-white rounded-3xl shadow-lg 
hover:shadow-2xl transition-all duration-300 
overflow-hidden border border-gray-100 flex flex-col
h-auto lg:h-[440px]"

                        >
                          {/* Image Container */}
                          <div
                            className="relative overflow-hidden bg-gray-50 aspect-square"

                          >
                            <ImageWithFallback
                              src={product.images[0] || "/placeholder.png"}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {/* Stock Status */}
                            {/* {product.availableStock === 0 && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                  Out of Stock
                                </span>
                              </div>
                            )} */}

                          </div>

                          {/* Content Container with proper spacing */}
                          <div className="p-5 flex flex-col flex-grow space-y-3">
                            {/* Vendor Name */}
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-full">
                                {(product as any).vendor?.name || "FitPlay"}
                              </p>
                              {/* {product.availableStock <= 5 &&
                                product.availableStock > 0 && (
                                  <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-full">
                                    Only {product.availableStock} left
                                  </span>
                                )} */}
                            </div>

                            {/* Product Name - Flexible height container */}
                            <div
                              className="flex-grow min-h-[40px]"
                             
                            >
                              <h3 className="text-gray-900 font-bold text-base line-clamp-2 group-hover:text-emerald-700 transition-colors leading-snug">
                                {product.name}
                              </h3>
                            </div>

                            {/* Price Section */}
                            <div className="mt-auto mb-3">
                              <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-lg font-bold text-emerald-600">
                                  {getLowestCredits(product as any)}
                                </span>
                                <span className="text-xs font-medium text-emerald-600">
                                  credits
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 line-through">
                                  ₹{getLowestMRP(product as ProductWithVariant)}
                                </span>
                                {/* <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
                                  {Math.round(
                                    ((getLowestMRP(
                                      product as ProductWithVariant
                                    ) -
                                      getLowestCredits(
                                        product as ProductWithVariant
                                      ) /
                                        2) /
                                      getLowestMRP(
                                        product as ProductWithVariant
                                      )) *
                                      100
                                  )}
                                  % off
                                </span> */}
                              </div>
                            </div>

                            {/* Action Button */}
                            <div className="mt-2">
                              <div onClick={(e) => e.preventDefault()}>
                                <QuantitySelector product={product} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {!shouldShowLoading && !error && sortedProducts.length === 0 && (
              <div className="text-center py-20 mb-16">
                <div className="relative inline-block">
                  <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-500 rounded-2xl blur opacity-20"></div>
                  <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-gray-900 font-bold text-xl mb-2">
                      No Products Found
                    </h3>
                    <p className="text-gray-600 mb-6 text-base">
                      We couldn't find any products matching your search
                      criteria.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedBrands([]);
                          setSelectedPriceRanges([]);
                          setSelectedCategory("all");
                          setSearchTerm("");
                        }}
                        className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 px-6 py-2 font-medium"
                      >
                        Clear All Filters
                      </Button>
                      <Button
                        onClick={() => setSearchTerm("")}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 font-medium"
                      >
                        Browse All Products
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Spacing before footer */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}



