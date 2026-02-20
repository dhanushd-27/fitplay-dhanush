import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { ProductWithVariant } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getLowestCredits = (product: ProductWithVariant) => getLowestMRP(product) * 2

export const getLowestMRP = (product: ProductWithVariant): number => {
    if (!product.variants || product.variants.length === 0) return 0;
    const mrps = product.variants
      .map((v) => v.mrp)
      .filter((mrp) => mrp != null);
    return mrps.length > 0 ? Math.min(...mrps) : 0;
  };
