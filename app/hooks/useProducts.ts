import useSWRInfinite from "swr/infinite";
import { ProductModelType } from "@/lib/generated/zod/schemas";

interface PaginatedProductsResponse {
  message: string;
  data: ProductModelType[];
  metadata: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const fetchProducts = async (
  url: string
): Promise<PaginatedProductsResponse | null> => {
  // Skip during build time
  if (typeof window === "undefined") {
    return null;
  }

  const response = await fetch(url).then((res) => res.json());
  return response;
};

export const useProducts = (limit = 20) => {
  const getKey = (
    pageIndex: number,
    previousPageData: PaginatedProductsResponse | null
  ) => {
    // reached the end
    if (previousPageData && previousPageData.data.length === 0) return null;

    // add the cursor to the API endpoint
    return `/api/products?page=${pageIndex + 1}&limit=${limit}`;
  };

  const { data, error, isLoading, mutate, size, setSize, isValidating } =
    useSWRInfinite<PaginatedProductsResponse | null>(getKey, fetchProducts, {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      revalidateFirstPage: false,
      dedupingInterval: 300000,
      focusThrottleInterval: 300000,
      errorRetryCount: 5,
      errorRetryInterval: 2000,
      keepPreviousData: true,
      refreshInterval: 0,
    });

  const products = data ? data.flatMap((page) => page?.data || []) : [];
  const isLoadingMore =
    isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0]?.data?.length === 0;
  const isReachingEnd =
    isEmpty || (data && (data[data.length - 1]?.data?.length ?? 0) < limit);

  return {
    products,
    isLoading,
    isLoadingMore,
    isReachingEnd,
    size,
    setSize,
    error,
    mutate,
  };
};
