import useSWR from 'swr';

interface WalletData {
  wallet: {
    balance: number;
    expiryDate: string;
  };
  dashboardStats: {
    creditsRemaining: number;
    creditsUsed: number;
  };
  walletHistory: Array<{
    id: string;
    date: string;
    type: string;
    amount: number;
    balance: number;
    description: string;
  }>;
}

export const fetchWallet = async (): Promise<WalletData> => {
  const response = await fetch('/api/wallets?personal=true');
  if (!response.ok) {
    throw new Error('Failed to fetch wallet data');
  }
  return response.json();
};

export const useWallet = () => {
  const { data, error, isLoading, mutate } = useSWR<WalletData>(
    typeof window !== 'undefined' ? 'wallet' : null,
    fetchWallet,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      revalidateIfStale: true,
      dedupingInterval: 30000, // 30 seconds
      focusThrottleInterval: 30000,
      errorRetryCount: 2,
      errorRetryInterval: 5000,
      loadingTimeout: 10000,
    }
  );

  return {
    wallet: data?.wallet,
    dashboardStats: data?.dashboardStats,
    walletHistory: data?.walletHistory || [],
    isLoading,
    error,
    mutate,
    credits: data?.dashboardStats?.creditsRemaining || 0,
  };
};