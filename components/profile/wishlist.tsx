"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface WishlistItem {
  id: string;
  productId: string;
  title: string;
  image: string;
  brand: string;
  credits: number;
  variantValue?: string;
  mrp?: number;
  dateAdded: string;
}

interface AddToCartResult {
  wasUpdated: boolean;
  newQuantity: number;
  isNewItem: boolean;
}

interface WishlistProps {
  wishlistItems: WishlistItem[];
  onAddToCart: (product: any, selectedVariant?: string) => AddToCartResult;
  onAddAllToCart: () => void;
  onRemoveFromWishlist: (id: string) => void;
  onSetCartAnimation: (animate: boolean) => void;
}

export default function Wishlist({
  wishlistItems,
  onAddToCart,
  onAddAllToCart,
  onRemoveFromWishlist,
  onSetCartAnimation,
}: WishlistProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <Heart className="w-5 h-5 mr-2 inline text-pink-500" />
            My Wishlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          {wishlistItems.length > 0 && (
            <div className="mb-4">
              <Button
                variant="default"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={onAddAllToCart}
              >
                Add All to Cart
              </Button>
            </div>
          )}
          {wishlistItems.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              Your wishlist is empty.
            </div>
          ) : (
            <div className="space-y-4">
              {wishlistItems.map((wish) => (
                <div
                  key={wish.id}
                  className="flex items-center justify-between border border-gray-100 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-4">
                    <Image
                      src={wish.image}
                      alt={wish.title}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{wish.title}</p>
                      <p className="text-xs text-gray-500">
                        {wish.brand} • Added on {wish.dateAdded}
                        {wish.variantValue && ` • ${wish.variantValue}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-bold text-emerald-600">
                      {wish.credits} credits
                    </span>
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => {
                        const mockProduct = {
                          id: wish.productId,
                          name: wish.title,
                          images: [wish.image],
                          vendorName: wish.brand,
                          variants: wish.variantValue
                            ? [
                                {
                                  variantValue: wish.variantValue,
                                  mrp: wish.mrp || wish.credits / 2,
                                },
                              ]
                            : [],
                        };
                        const result = onAddToCart(
                          mockProduct,
                          wish.variantValue
                        );
                        onSetCartAnimation(true);
                        setTimeout(() => onSetCartAnimation(false), 600);

                        if (result.wasUpdated) {
                          toast.success(`${wish.title} quantity updated!`, {
                            description: `Now you have ${result.newQuantity} in your cart.`,
                            duration: 3000,
                          });
                        } else if (result.isNewItem) {
                          toast.success(`${wish.title} added to cart!`, {
                            description: `${wish.credits} credits`,
                            duration: 3000,
                          });
                        }
                      }}
                    >
                      Add to Cart
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => onRemoveFromWishlist(wish.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
