import { mutate } from 'swr';

// Prefetch individual product data
export const prefetchProduct = async (id: string) => {
  // Skip prefetch during build time
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const baseUrl = window.location.origin;
    const response = await fetch(`${baseUrl}/api/products/product?id=${id}`);
    const data = await response.json();
    
    // Update the SWR cache with the fetched data
    mutate(`product-${id}`, data.data, false);
    
    return data.data;
  } catch (error) {
    console.error(`Failed to prefetch product ${id}:`, error);
    return null;
  }
};

// Prefetch multiple products by IDs
export const prefetchProductsByIds = async (ids: string[]) => {
  const promises = ids.map(id => prefetchProduct(id));
  return Promise.all(promises);
};
