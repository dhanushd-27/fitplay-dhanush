"use client";

import { useState, useEffect, Suspense } from "react";
import {
  LayoutDashboard,
  History,
  Wallet,
  Settings,
  
} from "lucide-react";

import { useSearchParams, useRouter } from "next/navigation";
import { User, LogOut, Shield, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Dashboard from "@/components/profile/dashboard";
import WalletComponent from "@/components/profile/wallet";
import { WalletTransaction } from "@/components/profile/wallet";
import HistoryComponent from "@/components/profile/history";
import Wishlist from "@/components/profile/wishlist";
import SupportModule from "@/components/profile/support";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import PersonalInformation from "@/components/profile/personal-information";
import { useUser } from "@/app/hooks/useUser";
import { $Enums } from "@/lib/generated/prisma";
import { useAtomValue, useSetAtom } from "jotai";
import {
  wishlistItemsAtom,
  removeFromWishlistAtom,
  addToCartAtom,
  cartAnimationAtom,
} from "@/lib/store";
import useSWR from "swr";
import { useOrders } from "@/app/hooks/useOrders";

// Define the Order type to match the API response
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
        category: {
          id: string;
          name: string;
        } | null;
        subCategory?: {
          id: string;
          name: string;
        } | null;
        avgRating?: number | null;
        noOfReviews?: number | null;
        createdAt: string;
        updatedAt: string;
        specifications?: any;
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


// Define the transformed order type for History component
interface TransformedOrder {
  id: string;
  date: string;
  item: string;
  amount: number;
  isCashPayment?: boolean | null;
  credits: number;
  status: string;
  phNumber?: string | null;
  address?: string | null;
  deliveryInstructions?: string | null;
  transactionId?: string | null;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      images: string[];
    };
    variant: {
      id: string;
      variantValue: string;
    } | null;
  }>;
}

interface DashboardStats {
  totalOrders: number;
  totalSpent: number;
  creditsUsed: number;
  creditsRemaining: number;
}

// Client component to handle search params
function ProfileContent() {
  const { user, isAuthenticated, isLoading, refreshSession } = useUser();
  const { orders, isLoading: ordersLoading } = useOrders();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get the tab from URL parameters, default to "dashboard"
  const activeTab = searchParams.get('tab') || 'dashboard';
  
  // Handle tab change and update URL
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'dashboard') {
      params.delete('tab');
    } else {
      params.set('tab', value);
    }
    const newUrl = params.toString() ? `/profile?${params.toString()}` : '/profile';
    router.push(newUrl, { scroll: false });
  };
  
  // Simple auth check without excessive logging
  useEffect(() => {
    // Only log once when component mounts for debugging if needed
    if (process.env.NODE_ENV === 'development') {

    }
  }, []); // Empty dependency array - only run once on mount

  // Simple delay to ensure session is loaded before checking auth
  const [initialLoad, setInitialLoad] = useState(true);
  
  useEffect(() => {
    // Small delay to let session initialize properly
    const timer = setTimeout(() => {
      setInitialLoad(false);
    }, 500); // Reduced delay - just enough to let session load
    
    return () => clearTimeout(timer);
  }, []); // Empty dependency array - only run once
  const wishlistItems = useAtomValue(wishlistItemsAtom);
  const removeFromWishlist = useSetAtom(removeFromWishlistAtom);
  const addToCart = useSetAtom(addToCartAtom);
  const setCartAnimation = useSetAtom(cartAnimationAtom);

  const fetcher = (url: string) =>
    fetch(url, { credentials: "include" }).then((res) => res.json());
  const {
    data: walletData,
    error: walletError,
    isLoading: walletLoading,
  } = useSWR(
    isAuthenticated && user ? "/api/wallets?personal=true" : null,
    fetcher
  );

  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalSpent: 0,
    creditsUsed: 0,
    creditsRemaining: 0,
  });

  const walletHistory = walletData?.creditTransactionsRecent || [];

  useEffect(() => {
    if (walletData?.dashboardStats) {
      setDashboardStats((prev: DashboardStats) => ({
        ...prev,
        creditsUsed: walletData.dashboardStats.creditsUsed,
        creditsRemaining: walletData.dashboardStats.creditsRemaining,
      }));
    }
  }, [walletData]);

  useEffect(() => {
    if (orders.length > 0) {
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, order) => sum + order.amount, 0);
      setDashboardStats((prev: DashboardStats) => ({
        ...prev,
        totalOrders,
        totalSpent,
      }));
    }
  }, [orders]);

  // Transform orders data to match History component interface
  const orderHistory: TransformedOrder[] = orders.map((order) => {
    const firstItem = order.items[0];
    const itemName = firstItem?.variant?.product?.name
      ? order.items.length === 1
        ? firstItem.variant.product.name
        : `${firstItem.variant.product.name} + ${order.items.length - 1} more`
      : "Unknown Product";

    return {
      id: order.id,
      date: new Date(order.createdAt).toISOString().split("T")[0],
      isCashPayment: order.isCashPayment,
      item: itemName,
      amount: order.amount,
      credits: order.amount, // Since credits are used as currency
      status: order.status,
      phNumber: order.phNumber,
      address: order.address,
      deliveryInstructions: order.deliveryInstructions,
      transactionId: order.transactionId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        product: {
          id: item.variant?.product?.id || "unknown",
          name: item.variant?.product?.name || "Unknown Product",
          images: item.variant?.product?.images || [],
        },
        variant: item.variant
          ? {
              id: item.variant.id,
              variantValue: item.variant.variantValue,
            }
          : null,
      })),
    };
  });

  const handleLogout = () => {
    signOut();
  };

  // Loading state - show loading while checking auth or session is loading
  if (isLoading || initialLoad) {
    return (
      <div className="min-h-screen">
        {/* Green Header Section */}
        <section className="bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950 pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Loading Profile
                </h2>
                <p className="text-emerald-200">
                  Please wait while we load your profile information...
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Content Section */}
        <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 min-h-screen -mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"></div>
        </div>
      </div>
    );
  }

  // Not authenticated state - redirect to login instead of showing error page
  if (!initialLoad && !isLoading && (!isAuthenticated || !user)) {

    // In production, redirect immediately to prevent showing auth error
    if (typeof window !== "undefined") {
      const currentUrl = `/profile${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      window.location.href = `/login?callbackUrl=${encodeURIComponent(currentUrl)}`;
      return null;
    }
    
    return (
      <div className="min-h-screen">
        {/* Green Header Section */}
        <section className="bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950 pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Profile <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Access</span>
              </h1>
            </div>
          </div>
        </section>
        {/* Content Section */}
        <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 min-h-screen -mt-8 pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <User className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-emerald-800 mb-2">
                  Redirecting to Login
                </h2>
                <p className="text-emerald-600 mb-4">
                  You need to be logged in to view your profile. Redirecting...
                </p>
                <Button 
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg"
                  onClick={() => (window.location.href = "/login?returnUrl=/profile")}
                >
                  Go to Login
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Green Header Section */}
      <section className="bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-6 mb-6 md:mb-0">
              <div className="relative">
                <Avatar className="w-20 h-20 border-4 border-emerald-300 shadow-xl">
                  <AvatarImage
                    src={`https://ui-avatars.com/api/?name=${user.name}&background=10b981&color=fff`}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xl font-bold">
                    {(user.name || "")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {user.name}
                </h1>
                <p className="text-emerald-300 font-medium text-lg">
                  {user.role === 'EMPLOYEE' ? '🏢 Employee' : user.role === 'HR' ? '👥 HR Manager' : '👑 Administrator'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="text-red-400 border-red-400/50 hover:bg-red-500/20 hover:border-red-400 transition-all duration-200 shadow-lg bg-white/10 backdrop-blur-sm"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 min-h-screen -mt-8 pt-12">
        
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">

  <Tabs value={activeTab} onValueChange={handleTabChange}>

    <div className="w-full flex justify-center">

      <TabsList
        className={`
          w-full
          max-w-7xl
          min-h-[64px]

          grid
          gap-2
          px-2 sm:px-4

          bg-gradient-to-r from-emerald-50 via-white to-teal-50
          border border-emerald-200
          rounded-2xl

          shadow-[0_15px_40px_rgba(16,185,129,0.18)]

          ${
            user.role === $Enums.Role.EMPLOYEE
              ? "grid-cols-5"
              : "grid-cols-4"
          }
        `}
      >

        <TabsTrigger value="dashboard" className="tab-trigger">
          <LayoutDashboard className="w-4 h-4" />
  <span>Overview</span>
        </TabsTrigger>

        
        <TabsTrigger value="history" className="tab-trigger">
          <History className="w-4 h-4" />
  <span>My Orders</span>
        </TabsTrigger>

       

        <TabsTrigger value="wallet" className="tab-trigger">
          <Wallet className="w-4 h-4" />
  <span>Wallet</span>
        </TabsTrigger>
        <TabsTrigger value="settings" className="tab-trigger">
           <Settings className="w-4 h-4" />
  <span>Settings</span>
        </TabsTrigger>


        {user.role === $Enums.Role.EMPLOYEE && (
          <TabsTrigger value="wishlist" className="tab-trigger">
            <Heart className="w-3.5 h-3.5" />
            Support
          </TabsTrigger>
        )}

      </TabsList>

    </div>


        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {ordersLoading || walletLoading ? (
            <div className="space-y-6">
              {/* Stats Skeleton */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-3 animate-pulse"></div>
                      <div className="h-8 bg-gray-200 rounded mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Orders Skeleton */}
              <Card>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 border border-gray-100 rounded-lg"
                      >
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Dashboard
              dashboardStats={dashboardStats}
              orderHistory={orderHistory}
              user={user}
            />
          )}
        </TabsContent>


         <TabsContent value="history" className="space-y-6">
          {ordersLoading ? (
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-64 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                      </div>
                      <div className="h-7 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <HistoryComponent orderHistory={orderHistory} />
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <PersonalInformation user={user} />
        </TabsContent>

        {/* Wallet Tab */}
        <TabsContent value="wallet" className="space-y-6">
          {walletLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading wallet data...</p>
              </div>
            </div>
          ) : walletError ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-red-600 mb-4">
                  Error loading wallet: {walletError}
                </p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </CardContent>
            </Card>
          ) : (
            <WalletComponent
              dashboardStats={dashboardStats}
              walletHistory={walletHistory}

            />
          )}
        </TabsContent>

        {/* History Tab */}
       

        {/* Wishlist Tab - Only for user role */}
        {user.role === $Enums.Role.EMPLOYEE && (
          <TabsContent value="wishlist" className="space-y-6">
            {/* <Wishlist
              wishlistItems={wishlistItems}
              onAddToCart={(product, selectedVariant) =>
                addToCart({ product, selectedVariant })
              }
              onAddAllToCart={() => {
                wishlistItems.forEach((wish) => {
                  const mockProduct = {
                    id: wish.productId,
                    name: wish.title,
                    images: [wish.image],
                    vendorName: wish.brand,
                    variants: wish.variantValue
                      ? [
                          {
                            variantValue: wish.variantValue,
                            mrp: wish.mrp || wish.credits / 2,
                          },
                        ]
                      : [],
                  };
                  addToCart({
                    product: mockProduct,
                    selectedVariant: wish.variantValue,
                  });
                });
                setCartAnimation(true);
                setTimeout(() => setCartAnimation(false), 600);
                toast.success(`Added ${wishlistItems.length} items to cart!`, {
                  description: `All wishlist items have been added to your cart.`,
                  duration: 3000,
                });
              }}
              onRemoveFromWishlist={removeFromWishlist}
              onSetCartAnimation={setCartAnimation}
            /> */}
            <SupportModule />
          </TabsContent>
        )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense
export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-48 mb-8"></div>
            <div className="space-y-4">
              <div className="h-10 bg-slate-200 rounded"></div>
              <div className="h-64 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
