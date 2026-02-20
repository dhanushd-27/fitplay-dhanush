import { Product, Variant } from "./generated/prisma";

export interface ProductWithVariant extends Product {
    variants: Variant[]
}
