"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, DollarSign, AlertTriangle, Wallet } from "lucide-react";

interface UserWallet {
  id: string;
  email: string;
  name: string;
  role: string;
  company: string;
  balance: number;
  expiryDate: string | null;
}

interface WalletStatsProps {
  wallets: UserWallet[];
}

export function WalletStats({ wallets }: WalletStatsProps) {
  const totalUsers = wallets.length;
  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  const lowBalanceUsers = wallets.filter(
    (wallet) => wallet.balance < 1000
  ).length;
  const zeroBalanceUsers = wallets.filter(
    (wallet) => wallet.balance === 0
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="py-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-xl font-semibold">{totalUsers}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Balance</p>
              <p className="text-xl font-semibold">
                {totalBalance.toLocaleString()} credits
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Low Balance</p>
              <p className="text-xl font-semibold">{lowBalanceUsers} users</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Wallet className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Zero Balance</p>
              <p className="text-xl font-semibold">{zeroBalanceUsers} users</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
