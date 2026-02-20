import useSWR from 'swr';
import { ProductModelType } from '@/lib/generated/zod/schemas';

const fetchProduct = async (id: string): Promise<ProductModelType | null> => {
  const response = await fetch(`/api/products/product?id=${id}`).then(res => res.json());
  return response.data
};

export const useProduct = (id: string) => {
  const { data, error, isLoading, mutate } = useSWR<ProductModelType | null>(
    id ? `product/${id}` : null,
    () => fetchProduct(id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      revalidateIfStale: true,
      dedupingInterval: 30000, // 30 seconds deduplication for individual products
      focusThrottleInterval: 30000,
      errorRetryCount: 3,
      errorRetryInterval: 3000,
      loadingTimeout: 8000,
    }
  );

  return {
    product: data,
    isLoading,
    error,
    mutate,
  };
};
