import useSWR from 'swr';
import { ProductModelType } from '@/lib/generated/zod/schemas';

export const fetchProducts = async (): Promise<ProductModelType[]> => {
  // Skip during build time
  if (typeof window === 'undefined') {        
    return [];
  }  
  
  const response = await fetch('/api/products').then(res => res.json());
  return response.data;
};

export const useProducts = () => {
  const { data, error, isLoading, mutate } = useSWR<ProductModelType[]>(
    typeof window !== 'undefined' ? 'products' : null,
    fetchProducts,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      revalidateIfStale: false, // Don't auto-refresh stale data
      dedupingInterval: 300000, // 5 minute deduplication for stability
      focusThrottleInterval: 300000, // 5 minute throttle
      errorRetryCount: 5,
      errorRetryInterval: 2000,
      loadingTimeout: 15000,
     
      keepPreviousData: true, // Keep previous data while loading new data
      refreshInterval: 0, // Disable automatic refresh to prevent flickering
    }
  );

  return {
    products: data || [],
    isLoading,
    error,
    mutate,
  };
};
