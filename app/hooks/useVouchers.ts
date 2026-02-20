import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface Voucher {
  id: string;
  code: string;
  description?: string;
  credits: number;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
  companies: Array<{
    id: string;
    name: string;
  }>;
  redemptions: Array<{
    id: string;
    userId: string;
    redeemedAt: string;
  }>;
}

export interface VouchersResponse {
  vouchers: Voucher[];
}

export function useVouchers() {
  const { data, error, isLoading, mutate } = useSWR<VouchersResponse>(
    '/api/voucher',
    fetcher
  );

  return {
    vouchers: data?.vouchers || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export async function createVoucher(voucherData: {
  companyId: string;
  code: string;
  credits: number;
  description?: string;
  expiryDate: string;
}) {
  const response = await fetch('/api/voucher/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(voucherData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create voucher');
  }

  return response.json();
}

export async function redeemVoucher(voucherCode: string) {
  const response = await fetch('/api/voucher/redeem', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ voucherCode }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to redeem voucher');
  }

  return response.json();
}

export async function getSingleVoucher(voucherId: string) {
  const response = await fetch(`/api/voucher/create?voucherId=${voucherId}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch voucher');
  }

  return response.json();
}

export async function updateVoucher(voucherData: {
  voucherId: string;
  companyId?: string;
  code?: string;
  credits?: number;
  description?: string;
  expiryDate?: string;
}) {
  const response = await fetch('/api/voucher/create', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(voucherData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update voucher');
  }

  return response.json();
}

export async function deleteVoucher(voucherId: string) {
  const response = await fetch(`/api/voucher/create?voucherId=${voucherId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete voucher');
  }

  return response.json();
}