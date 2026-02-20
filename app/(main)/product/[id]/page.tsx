"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { toast } from "sonner";
import {
  addToCartAtom,
  cartAnimationAtom,
  addToWishlistAtom,
  removeFromWishlistAtom,
  isInWishlistAtom,
} from "@/lib/store";
import { useSetAtom, useAtomValue } from "jotai";
import { useProduct } from "@/app/hooks/useProduct";

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const addToCart = useSetAtom(addToCartAtom);
  const setCartAnimation = useSetAtom(cartAnimationAtom);
  const addToWishlist = useSetAtom(addToWishlistAtom);
  const removeFromWishlist = useSetAtom(removeFromWishlistAtom);
  const isInWishlist = useAtomValue(isInWishlistAtom);
  const { product, isLoading, error } = useProduct(id);

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");

  // Auto-select first variant when product loads
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0 && !selectedVariant) {
      const firstVariant = product.variants[0] as any;
      setSelectedVariant(firstVariant.variantValue);
      setSelectedVariantId(firstVariant.id);
    }
  }, [product, selectedVariant]);

  // Helper function to format category names
  const formatCategoryName = (category: string) => {
    if (!category) return 'Product';
    return category
      .replace(/_/g, " ") // Replace underscores with spaces
      .split(" ")
      .map((word) => word && word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : '')
      .filter(word => word.length > 0)
      .join(" "); // Capitalize each word
  };

  // Helper functions to get selected variant MRP and credits
  const getSelectedVariantMRP = () => {
    if (!product || !product?.variants?.length) return 0;

    if (!selectedVariant) {
      return (product.variants[0] as any)?.mrp || 0;
    }

    // Find the variant that matches the selected variant
    const matchingVariant = product.variants.find(
      (variant: any) => variant.variantValue === selectedVariant
    );

    return (
      (matchingVariant as any)?.mrp || (product.variants[0] as any)?.mrp || 0
    );
  };

  const getSelectedVariantCredits = () => {
    return getSelectedVariantMRP() * 2;
  };

  const selectedVariantMRP = getSelectedVariantMRP();
  const selectedVariantCredits = getSelectedVariantCredits();

  const handleAddToCart = () => {
    if (!product) return;

    // Determine the correct variantId to use
    let variantIdToUse = selectedVariantId;
    if (!variantIdToUse && product.variants && product.variants.length > 0) {
      // For products with variants but none selected, use the first variant
      variantIdToUse = (product.variants[0] as any).id;
    }

    for (let i = 0; i < quantity; i++) {
      const result = addToCart({
        product,
        selectedVariant:
          selectedVariant ||
          (product.variants && product.variants.length > 0
            ? (product.variants[0] as any).variantValue
            : ""),
        variantId: variantIdToUse,
      });
      setCartAnimation(true);
      setTimeout(() => setCartAnimation(false), 600);

      // Show custom toast notification
      if (result.wasUpdated) {
        toast.success(`${product.name} quantity updated!`, {
          description: `Now you have ${result.newQuantity} in your cart.`,
          duration: 3000,
        });
      } else if (result.isNewItem) {
        toast.success(`${product.name} added to cart!`, {
          description: `${
            selectedVariantCredits * quantity
          } credits - Great choice for your wellness journey!`,
          duration: 3000,
        });
      }
    }
  };

  const handleWishlistToggle = () => {
    if (!product) return;

    const isInWish = isInWishlist(product.id, selectedVariant);

    if (isInWish) {
      // Remove from wishlist
      const variantKey = selectedVariant
        ? `${product.id}-${selectedVariant}`
        : product.id;
      removeFromWishlist(variantKey);
      toast.success(`${product.name} removed from wishlist!`, {
        duration: 2000,
      });
    } else {
      // Add to wishlist
      const result = addToWishlist(product, selectedVariant);
      if (result.wasAdded) {
        toast.success(`${product.name} added to wishlist!`, {
          duration: 2000,
        });
      } else {
        toast.info(result.message, {
          duration: 2000,
        });
      }
    }
  };

  // Handle loading and error states
  if (isLoading || (!product && !error)) {
    return (
      <div className="min-h-screen">
        <section className="bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950 pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <div className="text-center">
              {/* <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Loading <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Product</span>
              </h1> */}
            </div>
          </div>
        </section>
        <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 min-h-screen -mt-8 pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                <h1 className="text-emerald-600 text-lg ">Loading product...</h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <section className="bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950 pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Product <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Error</span>
              </h1>
            </div>
          </div>
        </section>
        <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 min-h-screen -mt-8 pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-16">
              <p className="text-red-600 mb-6 text-lg">
                Error loading product: {error.message}
              </p>
              <Link href="/store">
                <Button
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg"
                >
                  Back to Store
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <section className="bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950 pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Product <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Not Found</span>
              </h1>
            </div>
          </div>
        </section>
        <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 min-h-screen -mt-8 pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-16">
              <p className="text-emerald-600 mb-6 text-lg">Product not found</p>
              <Link href="/store">
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg">
                  Back to Store
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

 

  return (
    <div className="min-h-screen">
      {/* Green Header Section */}
      <section className="bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950 pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-emerald-200 mb-6">
            <Link
              href="/store"
              className="hover:text-white flex items-center transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Store
            </Link>
            <span>/</span>
            <span>{formatCategoryName(product.category?.name || '')}</span>
            <span>/</span>
            <span className="text-white font-medium">{product?.name || 'Product'}</span>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 min-h-screen -mt-4 pt-8">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Product Images */}
        <div className="space-y-3">
        <div className="aspect-square border border-gray-200 overflow-hidden">
  <ImageWithFallback
    src={product?.images?.[selectedImage] || ''}
    alt={product?.name || 'Product'}
    className="w-full h-auto object-cover"
  />
</div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {(product?.images || []).map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`flex-shrink-0 aspect-square w-16 h-16 rounded border-2 transition-colors ${
                  selectedImage === index
                    ? "border-emerald-500"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <ImageWithFallback
                  src={image}
                  alt={`${product?.name || 'Product'} view ${index + 1}`}
                  className="aspect-square bg-gray-100"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          {/* Title and Brand */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {product?.vendorName?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-700">
                    {product?.vendorName || 'Sova Health'}
                  </p>
                  <p className="text-xs text-gray-500">Trusted Wellness Partner</p>
                </div>
              </div>
             
            </div>
            <h1 className="text-2xl md:text-3xl text-gray-900 font-bold leading-tight mb-2">
              {product.name}
            </h1>
          </div>



          {/* Price */}
          <div className="py-2">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-gray-900">
                {selectedVariantCredits} credits
              </span>
              <span className="text-lg text-gray-500 line-through">
                ₹{selectedVariantMRP}
              </span>
            </div>
            {selectedVariant && (
              <p className="text-sm text-emerald-600 mt-1">
                Price for: <span className="font-medium">{selectedVariant}</span>
              </p>
            )}
            <p className="text-sm text-gray-600 mt-1">
              Use your company wellness credits
            </p>
          </div>

          {/* Variant Selection */}
          {product.variants && product.variants.length > 0 && (
            <div className="py-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Choose Your Option:
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {product.variants.map((variant: any) => (
                  <div
                    key={variant.variantValue}
                    onClick={() => {
                      setSelectedVariant(variant.variantValue);
                      setSelectedVariantId(variant.id);
                    }}
                    className={`
                      relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                      ${selectedVariant === variant.variantValue
                        ? 'border-emerald-500 bg-emerald-50 shadow-md ring-2 ring-emerald-500/20'
                        : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-sm'
                      }
                    `}
                  >
                    {selectedVariant === variant.variantValue && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <div className="text-center">
                      <div className={`font-semibold text-sm mb-1 ${
                        selectedVariant === variant.variantValue 
                          ? 'text-emerald-700' 
                          : 'text-gray-700'
                      }`}>
                        {variant.variantValue}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                        selectedVariant === variant.variantValue
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {variant.credits || (variant.mrp * 2)} credits
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="py-2">
            <p className="text-sm text-gray-700 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Quantity and Add to Cart */}
          <div className="py-2">
            <div className="flex items-center space-x-4 mb-4">
              <label className="text-sm font-medium text-gray-900">
                Quantity:
              </label>
              <div className="flex items-center border border-gray-300 rounded">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 hover:bg-gray-50 text-gray-600"
                >
                  -
                </button>
                <span className="px-3 py-1 border-x border-gray-300 min-w-[40px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 hover:bg-gray-50 text-gray-600"
                >
                  +
                </button>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleAddToCart}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 mb-3"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart - {selectedVariantCredits * quantity} credits
            </Button>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className={`flex-1 border-gray-300 hover:bg-gray-50 ${
                  isInWishlist(product?.id || "", selectedVariant)
                    ? "text-red-600 border-red-300 hover:bg-red-50"
                    : "text-gray-700"
                }`}
                onClick={handleWishlistToggle}
              >
                <Heart
                  className={`w-4 h-4 mr-1 ${
                    isInWishlist(product?.id || "", selectedVariant)
                      ? "fill-current"
                      : ""
                  }`}
                />
                {isInWishlist(product?.id || "", selectedVariant)
                  ? "Saved"
                  : "Save"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>
          </div>

          {/* Product Details Sections */}
          <div className="mt-8 space-y-6">
            {/* Specifications - Only show if specifications exist and are not empty */}
            {product.specifications &&
            typeof product.specifications === "object" &&
            product.specifications !== null &&
            Object.keys(product.specifications).length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Specifications
                </h3>
                <div className="space-y-2">
                  {Object.entries(
                    product.specifications as Record<string, string>
                  ).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between text-sm py-1"
                    >
                      <span className="text-gray-600">{key}</span>
                      <span className="text-gray-900 font-medium">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Partner Info */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-4 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{product?.vendorName?.charAt(0)?.toUpperCase() || 'S'}</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {product?.vendorName || 'Sova Health'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Trusted Wellness Partner
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {product?.vendorName || 'Sova Health'} has been providing premium wellness
                products for over 15 years, helping millions achieve their
                health goals.
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <div>{product.noOfReviews || "500+"} Products</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      

      {/* Support */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Need Help?</h3>
        <p className="text-sm text-gray-600 mb-3">
          Our wellness experts are here to help you make the right choice
        </p>
        <Link href="/support">
          <Button
            variant="outline"
            size="sm"
            className="border-emerald-500 text-emerald-600 hover:bg-emerald-600 hover:text-white"
          >
            Contact Support
          </Button>
        </Link>
      </div>
        </div>
      </div>
    </div>
  );
}
