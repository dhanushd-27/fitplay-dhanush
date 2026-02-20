import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export interface CartItem {
  productId: string;
  title: string;
  brand: string;
  credits: number;
  image: string;
  quantity: number;
  variantKey: string; // Unique key: variantId for variants, productId for non-variants
  variantId?: string; // Store the variant ID for API (null for non-variants)
}

export const cartItemsAtom = atomWithStorage<CartItem[]>('cartItems', []);

export const getCartItemQuantityAtom = atom(
  (get) => (productId: string, variantId?: string): number => {
    const cartItems = get(cartItemsAtom);

    if (variantId) {
      // For variant products, find by variantId
      const item = cartItems.find(item => item.variantKey === variantId);
      return item ? item.quantity : 0;
    } else {
      // For non-variant products, find by productId
      const item = cartItems.find(item => item.variantKey === productId);
      return item ? item.quantity : 0;
    }
  }
);

export const clearCartAtom = atom(null, (get, set) => {
  set(cartItemsAtom, []);
});

export const addToCartAtom = atom(
  null,
  (get, set, { product, selectedVariant, variantId }: { product: any; selectedVariant?: string; variantId?: string }) => {
    const currentItems = get(cartItemsAtom);

    // Create a unique key: variantId for variants, productId for non-variants
    const variantKey = variantId || product.id;

    // Check if this exact variant already exists in cart
    const existingItem = currentItems.find(item =>
      item.variantKey === variantKey
    );

    const result = {
      wasUpdated: false,
      isNewItem: false,
      newQuantity: 1,
      item: null as any
    };

    if (existingItem) {
      // If exists, increment quantity
      result.wasUpdated = true;
      result.newQuantity = existingItem.quantity + 1;
      result.item = { ...existingItem, quantity: result.newQuantity };

      const updatedItems = currentItems.map(item =>
        item.variantKey === variantKey
          ? { ...item, quantity: result.newQuantity }
          : item
      );

      set(cartItemsAtom, updatedItems);
    } else {
      // If new variant, add to cart with quantity 1
      result.isNewItem = true;
      const newItem: CartItem = {
        productId: product.id,
        title: product.name,
        brand: product.brand || 'FitPlay',
        credits: selectedVariant && product.variants?.length
          ? getSelectedVariantPrice(product, selectedVariant) * 2
          : (product.price || product.variants?.[0]?.mrp || 0) * 2,
        image: product.images?.[0] || '',
        quantity: 1,
        variantKey,
        variantId
      };
      result.item = newItem;

      set(cartItemsAtom, [...currentItems, newItem]);
    }

    return result;
  }
);

// Helper function to get selected variant price
function getSelectedVariantPrice(product: any, selectedVariant: string) {
  if (!product.variants?.length) return product.price || 0;

  // Find the variant that matches the selected variant
  const matchingVariant = product.variants.find((variant: any) =>
    variant.variantValue === selectedVariant
  );

  return matchingVariant?.mrp || product.variants[0]?.mrp || 0;
}

export const removeFromCartAtom = atom(
  null,
  (get, set, itemKey: string) => {
    const currentItems = get(cartItemsAtom);
    const itemToRemove = currentItems.find(item => item.variantKey === itemKey);

    if (itemToRemove) {
      const updatedItems = currentItems.filter(item => item.variantKey !== itemKey);
      set(cartItemsAtom, updatedItems);
      return itemToRemove;
    }

    return null;
  }
);

export const updateCartQuantityAtom = atom(
  null,
  (get, set, { variantKey, quantity }: { variantKey: string, quantity: number }) => {
    const currentItems = get(cartItemsAtom);
    const itemExists = currentItems.find(item => item.variantKey === variantKey);

    if (!itemExists) {
      return null;
    }

    if (quantity <= 0) {
      const updatedItems = currentItems.filter(item => item.variantKey !== variantKey);
      set(cartItemsAtom, updatedItems);
      return { action: 'removed', item: itemExists };
    }

    // Update the quantity
    const updatedItems = currentItems.map(item =>
      item.variantKey === variantKey ? { ...item, quantity } : item
    );
    set(cartItemsAtom, updatedItems);

    const updatedItem = updatedItems.find(item => item.variantKey === variantKey);
    return { action: 'updated', item: updatedItem };
  }
);

export const updateCartQuantityByProductAtom = atom(
  null,
  (get, set, { productId, quantity, variantId }: {
    productId: string;
    quantity: number;
    variantId?: string;
  }) => {
    const currentItems = get(cartItemsAtom);

    // Find the item by variantKey (variantId or productId)
    const variantKey = variantId || productId;
    const existingItem = currentItems.find(item => item.variantKey === variantKey);

    if (!existingItem) {
      return { action: 'not_found', productId } as const;
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      const updatedItems = currentItems.filter(item => item.variantKey !== variantKey);
      set(cartItemsAtom, updatedItems);
      return { action: 'removed', item: existingItem } as const;
    } else {
      // Update the quantity
      const updatedItems = currentItems.map(item =>
        item.variantKey === variantKey
          ? { ...item, quantity }
          : item
      );
      set(cartItemsAtom, updatedItems);

      const updatedItem = { ...existingItem, quantity };
      return { action: 'updated', item: updatedItem } as const;
    }
  }
);

export const cartCountAtom = atom((get) => {
  const items = get(cartItemsAtom);
  return items.reduce((total, item) => total + item.quantity, 0);
});

export const cartAnimationAtom = atom(false);

export const userCreditsAtom = atomWithStorage<number>('userCredits', 500);

export const purchaseCreditsAtom = atom(
  null, // no read value needed
  (get, set, creditsToAdd: number) => {
    const currentCredits = get(userCreditsAtom);
    const newTotal = currentCredits + creditsToAdd;
    set(userCreditsAtom, newTotal);
    return newTotal;
  }
);

// Wishlist atoms
export interface WishlistItem {
  id: string;
  productId: string;
  title: string;
  brand: string;
  credits: number;
  image: string;
  variantValue?: string;
  mrp?: number;
  dateAdded: string;
}

export const wishlistItemsAtom = atomWithStorage<WishlistItem[]>('wishlistItems', []);

export const addToWishlistAtom = atom(
  null,
  (get, set, product: any, selectedVariant?: string) => {
    const currentItems = get(wishlistItemsAtom);
    const variantKey = selectedVariant ? `${product.id}-${selectedVariant}` : product.id;

    // Check if already in wishlist
    const existingItem = currentItems.find(item =>
      selectedVariant ? item.id === variantKey : item.productId === product.id
    );

    if (existingItem) {
      return { wasAdded: false, message: 'Already in wishlist' };
    }

    // Get variant price
    const getSelectedVariantPrice = (prod: any, variant: string) => {
      if (!prod.variants?.length) return prod.price || 0;
      const matchingVariant = prod.variants.find((v: any) =>
        v.variantValue === variant
      );
      return matchingVariant?.mrp || prod.variants[0]?.mrp || 0;
    };

    const variantPrice = selectedVariant && product.variants?.length
      ? getSelectedVariantPrice(product, selectedVariant)
      : (product.price || product.variants?.[0]?.mrp || 0);

    const newItem: WishlistItem = {
      id: variantKey,
      productId: product.id,
      title: product.name,
      brand: product.vendorName || 'FitPlay',
      credits: variantPrice * 2,
      image: product.images?.[0] || '',
      variantValue: selectedVariant,
      mrp: variantPrice,
      dateAdded: new Date().toISOString().split('T')[0]
    };

    set(wishlistItemsAtom, [...currentItems, newItem]);
    return { wasAdded: true, message: 'Added to wishlist' };
  }
);

export const removeFromWishlistAtom = atom(
  null,
  (get, set, itemId: string) => {
    const currentItems = get(wishlistItemsAtom);
    const updatedItems = currentItems.filter(item => item.id !== itemId);
    set(wishlistItemsAtom, updatedItems);
    return { wasRemoved: true };
  }
);

export const isInWishlistAtom = atom(
  (get) => (productId: string, variantValue?: string): boolean => {
    const wishlistItems = get(wishlistItemsAtom);
    const variantKey = variantValue ? `${productId}-${variantValue}` : productId;
    return variantValue
      ? wishlistItems.some(item => item.id === variantKey)
      : wishlistItems.some(item => item.productId === productId);
  }
);

export const clearWishlistAtom = atom(null, (get, set) => {
  set(wishlistItemsAtom, []);
});
