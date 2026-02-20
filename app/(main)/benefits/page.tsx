"use client";

import {
  Calendar,
  Clock,
  CreditCard,
  Gift,
  TrendingUp,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";

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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function BenefitsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user?.role === "ADMIN") {
      router.push("/admin");
    }
  }, [session, status, router]);

  const {
    data: walletData,
    error,
    isLoading,
  } = useSWR<WalletData>(
    session?.user ? "/api/wallets?personal=true" : null,
    fetcher
  );

  const creditBalance = walletData
    ? {
        total:
          walletData.dashboardStats.creditsRemaining +
          walletData.dashboardStats.creditsUsed,
        used: walletData.dashboardStats.creditsUsed,
        remaining: walletData.dashboardStats.creditsRemaining,
        expiryDate: walletData.wallet.expiryDate.split("T")[0], // Format to YYYY-MM-DD
      }
    : {
        total: 0,
        used: 0,
        remaining: 0,
        expiryDate: "",
      };

  const redeemableItems = [
    {
      id: 1,
      title: "Gym Membership - Premium",
      provider: "FitZone",
      credits: 200,
      originalPrice: "₹23,999",
      category: "Fitness",
      validUntil: "2024-12-31",
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 2,
      title: "Health Screening Package",
      provider: "WellCare Labs",
      credits: 150,
      originalPrice: "₹15,999",
      category: "Health",
      validUntil: "2024-11-30",
      image:
        "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 3,
      title: "Nutrition Consultation",
      provider: "NutriMax",
      credits: 80,
      originalPrice: "₹9,999",
      category: "Nutrition",
      validUntil: "2024-10-31",
      image:
        "https://images.unsplash.com/photo-1493770348161-369560ae357d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 4,
      title: "Ergonomic Assessment",
      provider: "WorkWell",
      credits: 100,
      originalPrice: "₹11,999",
      category: "Workplace",
      validUntil: "2024-12-15",
      image:
        "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    },
  ];

  const creditHistory =
    walletData?.walletHistory.map((transaction) => ({
      date: transaction.date,
      type:
        transaction.type === "Credit"
          ? "Allocated"
          : transaction.type === "Purchase"
          ? "Used"
          : "Bonus",
      amount: transaction.amount,
      description: transaction.description,
      status: "completed",
    })) || [];

  const usagePercentage =
    creditBalance.total > 0
      ? (creditBalance.used / creditBalance.total) * 100
      : 0;

  if (status === "loading" || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>

        {/* Credit Cards Skeleton */}
        <div className="grid md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress Bar Skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Redeemable Items Skeleton */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-gray-200 p-0 overflow-hidden"
              >
                <div className="aspect-square bg-gray-200 animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Grid Skeleton */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Credit History Skeleton */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 border border-gray-100 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Company Info Skeleton */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="h-5 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                <div className="space-y-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-4 bg-gray-200 rounded animate-pulse"
                    ></div>
                  ))}
                </div>
              </div>
              <div>
                <div className="h-5 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="h-6 bg-gray-200 rounded w-12 mx-auto mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="h-6 bg-gray-200 rounded w-8 mx-auto mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="h-5 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded mb-3 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">
            Failed to load wallet data. Please try again.
          </div>
        </div>
      </div>
    );
  }

  // Sample/demo data for non-logged-in users
  const demoCreditBalance = {
    total: 500,
    used: 100,
    remaining: 400,
    expiryDate: "2024-12-31",
  };

  const demoCreditHistory = [
    {
      date: "2024-01-15",
      type: "Allocated",
      amount: 500,
      description: "Annual wellness credits allocated",
      status: "completed",
    },
    {
      date: "2024-02-10",
      type: "Used",
      amount: -80,
      description: "Nutrition consultation with NutriMax",
      status: "completed",
    },
    {
      date: "2024-03-05",
      type: "Used",
      amount: -20,
      description: "Wellness product purchase",
      status: "completed",
    },
  ];

  const demoUsagePercentage =
    (demoCreditBalance.used / demoCreditBalance.total) * 100;

  return (
    <div className="relative flex justify-center">
      {/* Full Page Content (Blurred when not logged in) */}
      <div
        className={`${
          !session?.user ? "filter blur-xs pointer-events-none opacity-70" : ""
        }`}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl text-primary mb-4">
            My Benefits
          </h1>
          <p className="text-gray-600">
            Manage your wellness credits and explore available benefits
          </p>
        </div>

        {/* Credit Balance Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <CreditCard className="w-8 h-8 text-emerald-600" />
                <Badge
                  variant="secondary"
                  className="bg-emerald-200 text-emerald-800"
                >
                  Active
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-emerald-600">Total Credits</p>
                <p className="text-3xl font-bold text-emerald-800">
                  {session?.user
                    ? creditBalance.total
                    : demoCreditBalance.total}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Gift className="w-8 h-8 text-green-600" />
                <Badge
                  variant="secondary"
                  className="bg-green-200 text-green-800"
                >
                  Available
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-green-600">Remaining</p>
                <p className="text-3xl font-bold text-green-800">
                  {session?.user
                    ? creditBalance.remaining
                    : demoCreditBalance.remaining}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-teal-600" />
                <Badge
                  variant="secondary"
                  className="bg-teal-200 text-teal-800"
                >
                  Used
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-teal-600">Spent</p>
                <p className="text-3xl font-bold text-teal-800">
                  {session?.user ? creditBalance.used : demoCreditBalance.used}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {session?.user && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Credit Usage Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Used: {creditBalance.used} credits
                </span>
                <span className="text-sm text-gray-600">
                  Remaining: {creditBalance.remaining} credits
                </span>
              </div>
              <Progress value={usagePercentage} className="h-3" />
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  {usagePercentage.toFixed(1)}% utilized
                </span>
                <div className="flex items-center space-x-1 text-orange-600">
                  <Calendar className="w-4 h-4" />
                  <span>Expires: {creditBalance.expiryDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!session?.user && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Credit Usage Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Used: {demoCreditBalance.used} credits
                </span>
                <span className="text-sm text-gray-600">
                  Remaining: {demoCreditBalance.remaining} credits
                </span>
              </div>
              <Progress value={demoUsagePercentage} className="h-3" />
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  {demoUsagePercentage.toFixed(1)}% utilized
                </span>
                <div className="flex items-center space-x-1 text-orange-600">
                  <Calendar className="w-4 h-4" />
                  <span>Expires: {demoCreditBalance.expiryDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Redeemable Items */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl text-primary">Redeemable Benefits</h2>
            <Button
              variant="outline"
              className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
            >
              View All Categories
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {redeemableItems.map((item) => (
              <Card
                key={item.id}
                className="hover:shadow-lg transition-shadow p-0"
              >
                <CardContent className="p-0">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.title}
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
                  <div className="p-4 space-y-3">
                    <Badge variant="secondary" className="text-xs">
                      {item.category}
                    </Badge>
                    <h3 className="font-medium text-primary">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.provider}</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-emerald-600">
                          {item.credits} credits
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {item.originalPrice}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        Valid until {item.validUntil}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className={`w-full ${
                        item.credits >
                        (session?.user
                          ? creditBalance.remaining
                          : demoCreditBalance.remaining)
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-emerald-500 hover:bg-emerald-600"
                      }`}
                      disabled={
                        item.credits >
                        (session?.user
                          ? creditBalance.remaining
                          : demoCreditBalance.remaining)
                      }
                    >
                      {item.credits >
                      (session?.user
                        ? creditBalance.remaining
                        : demoCreditBalance.remaining)
                        ? "Insufficient Credits"
                        : "Redeem Now"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Credit History */}
          {session?.user ? (
            <Card>
              <CardHeader>
                <CardTitle>Credit History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {creditHistory.map((transaction, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-gray-100 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            transaction.type === "Used"
                              ? "bg-red-100 text-red-600"
                              : transaction.type === "Bonus"
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-emerald-100 text-emerald-600"
                          }`}
                        >
                          {transaction.type === "Used" ? "-" : "+"}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            {transaction.date}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`font-bold ${
                          transaction.amount < 0
                            ? "text-red-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {transaction.amount > 0 ? "+" : ""}
                        {Math.abs(transaction.amount)} credits
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Credit History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demoCreditHistory.map((transaction, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-gray-100 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            transaction.type === "Used"
                              ? "bg-red-100 text-red-600"
                              : transaction.type === "Bonus"
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-emerald-100 text-emerald-600"
                          }`}
                        >
                          {transaction.type === "Used" ? "-" : "+"}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            {transaction.date}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`font-bold ${
                          transaction.amount < 0
                            ? "text-red-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {transaction.amount > 0 ? "+" : ""}
                        {Math.abs(transaction.amount)} credits
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Wellness Program Info</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-primary mb-2">
                  How Credits Work
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Credits are allocated quarterly by your company</li>
                  <li>
                    • Use credits to purchase wellness products and services
                  </li>
                  <li>• Unused credits expire at the end of the year</li>
                  <li>• Earn bonus credits through wellness challenges</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-primary mb-2">
                  Program Benefits
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <div className="font-bold text-emerald-600 text-lg">
                      500
                    </div>
                    <div className="text-gray-600">Annual Allocation</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="font-bold text-green-600 text-lg">50+</div>
                    <div className="text-gray-600">Partner Brands</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-primary mb-2">Need Help?</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Contact our wellness team for questions about your benefits or
                  credit usage.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                >
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Login Overlay - Only show when not logged in */}
      {!session?.user && (
        <div className="absolute bg-black/40 h-full inset-0">
          <Card className="bg-white shadow-2xl border-0 max-w-md w-full mx-auto mt-[20vh]">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl text-primary">
                Access Your Benefits
              </CardTitle>
              <p className="text-gray-600">
                Sign in to view your wellness credits, redeem benefits, and
                track your health journey.
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={() => router.push("/login")}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Login to Continue
              </Button>
              <p className="text-sm text-gray-500 mt-4">
                Don't have an account?{" "}
                <button
                  onClick={() => router.push("/signup")}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Sign up
                </button>
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
