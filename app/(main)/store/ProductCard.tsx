"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ImageWithFallback";

interface ProductCardProps {
  product: any;
  quantity: number;
  onAddToCart: (product: any) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

export default function ProductCard({
  product,
  quantity,
  onAddToCart,
  onUpdateQuantity,
}: ProductCardProps) {
  const QuantitySelector = () => {
    if (quantity === 0) {
      return (
        <Button
          size="sm"
          onClick={() => onAddToCart(product)}
          className="w-full bg-emerald-500 hover:bg-emerald-600 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          Add to Cart
        </Button>
      );
    }

    return (
      <div className="flex items-center border border-emerald-300 rounded-lg bg-emerald-50 w-full">
        <Button
          onClick={() =>
            onUpdateQuantity(product.id, Math.max(0, quantity - 1))
          }
          size="sm"
          className="flex-1 bg-transparent hover:bg-emerald-100 text-emerald-700 transition-colors"
        >
          -
        </Button>
        <span className="flex-1 text-emerald-800 font-medium text-center border-x border-emerald-200">
          {quantity}
        </span>
        <Button
          onClick={() => onUpdateQuantity(product.id, quantity + 1)}
          size="sm"
          className="flex-1 bg-transparent hover:bg-emerald-100 text-emerald-700 transition-colors"
        >
          +
        </Button>
      </div>
    );
  };

  return (
    <Card className="group relative py-0 gap-0 overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] border-2 border-gray-100 rounded-2xl">
      <CardHeader className="p-0">
        <Link href={`/product/${product.id}`}>
          <div className="relative w-full h-48">
            <ImageWithFallback
              src={product.images[0] || "/placeholder.png"}
              alt={product.name}
              className="aspect-square absolute w-full h-full"
            />
            {/* {product.discount && (
              <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-md">
                {product.discount}% OFF
              </span>
            )} */}
          </div>
        </Link>
      </CardHeader>

      {/* Content */}
      <CardContent className="p-6 py-0 space-y-4">
        <CardTitle className="text-base font-semibold leading-tight line-clamp-2">
          {product.name}
        </CardTitle>

        {/* Rating */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
          {product.avgRating?.toFixed(1) ?? "0.0"}{" "}
          <span className="ml-1 text-xs">({product.noOfReviews ?? 0})</span>
        </div>

        {/* Price */}
        <div className="flex flex-col gap-1">
          <p className="text-lg font-bold text-foreground">
            {product.price * 2} credits
          </p>
          <p className="text-sm text-muted-foreground line-through">
            ₹{product.price}
          </p>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="p-6 pt-0">
        <QuantitySelector />
      </CardFooter>
    </Card>
  );
}
