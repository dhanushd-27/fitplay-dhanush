
'use client';
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, History, Settings, Plus } from "lucide-react";
import { CreditPurchase } from "@/components/CreditPurchase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Script from "next/script";


interface DashboardStats {
  creditsRemaining: number;
  creditsUsed: number;
}

export interface WalletTransaction {
  date: string;
  type: string;
  amount: number;
  balance: number;
  description: string;
}

interface WalletProps {
  dashboardStats: DashboardStats;
  walletHistory: WalletTransaction[];
  
}

export default function WalletComponent({
  dashboardStats,
  walletHistory,
}: WalletProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Script  src="https://checkout.razorpay.com/v1/checkout.js"></Script>
      <div className="flex justify-end">
       {/* <Dialog>
    <DialogTrigger asChild>
      <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        <Plus className="w-4 h-4 mr-2" />
        Add Credits
      </button>
    </DialogTrigger>

    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Top Up Wallet</span>
        </DialogTitle>
      </DialogHeader>

      <CreditPurchase
        currentCredits={dashboardStats.creditsRemaining}
        requiredCredits={0}
        onPurchaseComplete={() => window.location.reload()}
     

        
      />
    </DialogContent>
  </Dialog> */}
  

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <button
      onClick={() => setOpen(true)}
      className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 mt-4"
    >
      <Plus className="w-4 h-4 mr-2" />
      Add Credits
    </button>
  </DialogTrigger>

 <DialogContent className="max-w-lg p-0 overflow-hidden bg-white rounded-lg shadow-lg p-5">

    <DialogHeader>
      <DialogTitle className="flex items-center space-x-2">
        <Plus className="w-5 h-5" />
        <span>Top Up Wallet</span>
      </DialogTitle>
    </DialogHeader>
<div className="p-6">
    <CreditPurchase
      currentCredits={dashboardStats.creditsRemaining}
      requiredCredits={0}
      onPurchaseComplete={() => window.location.reload()}
      onClose={() => setOpen(false)}       // ✅ CLOSE DIALOG
    />
    </div>
  </DialogContent>
</Dialog>

  </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
      
 

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 text-center">
            <Wallet className="w-8 h-8 mx-auto mb-3 text-blue-600" />
            <div className="text-2xl font-bold text-blue-800">
              {dashboardStats.creditsRemaining}
            </div>
            <div className="text-sm text-blue-600">Available Credits</div>
          </CardContent>
        </Card>
        <Card
  onClick={() => setOpen(true)}
  className="cursor-pointer bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-md transition-shadow"
>
  <CardContent className="p-6 text-center">
    <Plus className="w-8 h-8 mx-auto mb-3 text-green-600" />
    <div className="text-2xl font-bold text-green-700">
      Add Credits
    </div>
    <div className="text-sm text-green-600">
      Top up your balance
    </div>
  </CardContent>
</Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6 text-center">
            <Settings className="w-8 h-8 mx-auto mb-3 text-purple-600" />
            <div className="text-2xl font-bold text-purple-800">
              {dashboardStats.creditsRemaining + dashboardStats.creditsUsed}
            </div>
            <div className="text-sm text-purple-600">Total Allocated</div>
          </CardContent>
        </Card>
      </div>
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <History className="w-5 h-5 text-emerald-600" />
      Transaction History
    </CardTitle>
  </CardHeader>

  <CardContent className="space-y-4">
    {/* ================= MOBILE VIEW ================= */}
    <div className="space-y-3 md:hidden">
      {walletHistory.map((transaction, index) => {
        const isCredit = transaction.type === "CREDIT";

        return (
          <div
            key={index}
            className="border rounded-xl p-4 bg-white shadow-sm"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">
                {transaction.date}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  isCredit
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {isCredit ? "Credit Added" : "Credit Used"}
              </span>
            </div>

            <div className="text-sm text-gray-700 mb-2">
              {transaction.description || "—"}
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-gray-500">Amount</p>
                <p
                  className={`font-semibold ${
                    isCredit ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isCredit ? "+" : "-"}
                  {Math.abs(transaction.amount)} credits
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-500">Balance</p>
                <p className="font-medium text-gray-800">
                  {transaction.balance}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>

    {/* ================= DESKTOP VIEW ================= */}
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-50 text-sm">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-600">
              Date
            </th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">
              Type
            </th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">
              Reference
            </th>
            <th className="px-4 py-3 text-right font-medium text-gray-600">
              Amount
            </th>
            <th className="px-4 py-3 text-right font-medium text-gray-600">
              Balance
            </th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {walletHistory.map((transaction, index) => {
            const isCredit = transaction.type === "CREDIT";

            return (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-700">
                  {transaction.date}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isCredit
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {isCredit ? "Credit Added" : "Credit Used"}
                  </span>
                </td>

                <td className="px-4 py-3 text-sm text-gray-600">
                  {transaction.description || "—"}
                </td>

                <td
                  className={`px-4 py-3 text-right font-semibold ${
                    isCredit ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isCredit ? "+" : "-"}
                  {Math.abs(transaction.amount)} credits
                </td>

                <td className="px-4 py-3 text-right text-sm text-gray-700">
                  {transaction.balance}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </CardContent>
</Card>

      

     
    </div>
  );
}
