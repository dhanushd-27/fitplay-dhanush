import useSWR from "swr";

interface Order {
  id: string;
  userId: string;
  amount: number;
   isCashPayment?: boolean | null;

  status: string;
  phNumber?: string | null;
  address?: string | null;
  deliveryInstructions?: string | null;
  transactionId?: string | null;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    orderId: string;
    productId: string;
    variantId?: string | null;
    quantity: number;
    price: number;
    createdAt: string;
    updatedAt: string;
    variant?: {
      id: string;
      variantCategory: string;
      variantValue: string;
      mrp: number;
      credits?: string | null;
      availableStock?: number | null;
      productId: string;
      createdAt: string;
      updatedAt: string;
      product: {
        id: string;
        name: string;
        images: string[];
        description: string;
        discount?: number | null;
        sku: string;
        availableStock: number;
        category: string;
        avgRating?: number | null;
        noOfReviews?: number | null;
        createdAt: string;
        updatedAt: string;
        specifications?: any;
        subCategory?: string | null;
        vendorId?: string | null;
      };
    } | null;
  }>;
  user: {
    id: string;
    name: string;
    email: string;
    company: {
      name: string;
    };
  };
}

export const fetchOrders = async (): Promise<Order[]> => {
  const response = await fetch("/api/orders").then((res) => res.json());
  return response.orders || [];
};

export const useOrders = () => {
  const { data, error, isLoading, mutate } = useSWR<Order[]>(
    typeof window !== "undefined" ? "orders" : null,
    fetchOrders,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      revalidateIfStale: true,
      dedupingInterval: 30000,
      focusThrottleInterval: 30000,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      loadingTimeout: 10000,
      fallbackData: [],
    }
  );

  return {
    orders: data || [],
    isLoading,
    error,
    mutate,
  };
};
