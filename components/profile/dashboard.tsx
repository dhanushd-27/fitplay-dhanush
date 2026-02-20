



"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Wallet, History, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { CreditPurchase } from "@/components/CreditPurchase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface DashboardStats {
  totalOrders: number;
  creditsRemaining: number;
}

interface Order {
  id: string;
  item: string;
  date: string;
  status: string;
}

interface DashboardProps {
  dashboardStats: DashboardStats;
  orderHistory: Order[];
  user: any;
}

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => res.json());

export default function Dashboard({
  dashboardStats,
  orderHistory,
  user,
}: DashboardProps) {
  const router = useRouter();
  const { data: profileData } = useSWR("/api/profile", fetcher);
  const profile = profileData?.data;
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-8">

      {/* ================= ROW 1 : PROFILE + WALLET (EQUAL CARDS) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* PROFILE CARD */}
        <Card className="border-emerald-200/60 shadow-[0_20px_50px_rgba(16,185,129,0.18)]">
          <CardContent className="p-8 h-full flex flex-col justify-between">

            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {user?.name
                  ? user.name.charAt(0).toUpperCase()
                  : user?.email?.charAt(0).toUpperCase()}
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {user?.name || "Unnamed User"}
                </h2>
                <p className="text-sm font-bold text-gray-700">{user?.email}</p>
                <p className="text-sm font-semibold text-gray-900">
                  {profile?.company?.name}
                </p>
                <p className="text-sm font-semibold text-gray-900">
  {profile?.createdAt
    ? `Joined since ${new Date(profile.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`
    : "Joined since Unknown"}
</p>

              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t mt-6">
              <Badge
                className={`px-4 py-1.5 text-sm
                  ${
                    user?.role === "ADMIN"
                      ? "bg-purple-100 text-purple-700"
                      : user?.role === "HR"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
              >
                {user?.role}
              </Badge>

              <Button
                variant="outline"
                onClick={() => router.push("/profile?tab=settings")}
              >
                Manage Profile
              </Button>
            </div>

          </CardContent>
        </Card>

        {/* WALLET CARD */}
        <Card className="border-emerald-200/60 shadow-[0_20px_50px_rgba(16,185,129,0.18)]">
          <CardContent className="p-8 h-full flex flex-col justify-between">

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold">Wallet Summary</h3>
              </div>

              <div className="pt-6">
                <p className="text-4xl font-bold text-emerald-700">
                  {dashboardStats.creditsRemaining}
                </p>
                <p className="text-sm text-gray-600">
                  Available Credits
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-6">
              <Button
                variant="outline"
                onClick={() => router.push("/profile?tab=wallet")}
              >
                View Wallet
              </Button>

              <Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button className="bg-emerald-600 hover:bg-emerald-700">
      Add Credits
    </Button>
  </DialogTrigger>

  <DialogContent className="max-w-lg p-0 overflow-hidden bg-white rounded-lg shadow-lg">
    <DialogHeader className="px-6 pt-6">
      <DialogTitle>Top Up Wallet</DialogTitle>
    </DialogHeader>

    <div className="px-6 pb-6">
      <CreditPurchase
        currentCredits={dashboardStats.creditsRemaining} // pass your value
        requiredCredits={0}
        onClose={() => setOpen(false)}   // 🔑 closes modal
      />
    </div>
  </DialogContent>
</Dialog>
            </div>

          </CardContent>
        </Card>
      </div>

      {/* ================= ROW 2 : ORDER SUMMARY ================= */}
<Card className="border-blue-200/60 shadow-sm rounded-2xl">
  <CardContent className="px-4 py-3">
    <div className="
      flex flex-col gap-4
      md:flex-row md:items-center md:justify-between md:gap-0
    ">

      {/* Orders */}
      <div className="
        flex items-center justify-between
        md:justify-start md:gap-3
      ">
        <span className="
          text-lg font-semibold text-gray-600
          md:text-2xl md:-mt-0.5
        ">
          Total Orders
        </span>
        <span className="text-3xl font-bold text-blue-700">
          {dashboardStats.totalOrders}
        </span>
      </div>

      {/* Last Order */}
      <div className="
        flex items-center justify-between
        md:justify-start md:gap-4
      ">
        <span className="
          text-lg font-semibold text-gray-600
          md:text-2xl md:-mt-1
        ">
          Last Order
        </span>

        {orderHistory[0] ? (
          <Badge className="px-3 py-1 text-sm font-semibold">
            {orderHistory[0].status}
          </Badge>
        ) : (
          <span className="text-sm font-semibold text-gray-400">
            No orders
          </span>
        )}
      </div>

      {/* View Button */}
      <Button
        variant="outline"
        size="lg"
        className="
          h-11 px-12 text-sm font-semibold rounded-xl shadow-2xl
          bg-emerald-50 text-emerald-700 hover:bg-emerald-100
          w-full md:w-auto
        "
        onClick={() => router.push('/profile?tab=history')}
      >
        View
      </Button>

    </div>
  </CardContent>
</Card>



      {/* ================= ROW 3 : RECENT ORDERS ================= */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Recent Orders</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/profile?tab=history")}
          >
            View All
          </Button>
        </CardHeader>

        <CardContent className="space-y-3">
          {orderHistory.slice(0, 3).map((order) => (
            <div
              key={order.id}
              className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-gray-100 hover:shadow-sm"
            >
              <div className="sm:col-span-2">
                <p className="font-medium">{order.item}</p>
                <p className="text-xs text-gray-500">{order.date}</p>
              </div>

              <Badge>{order.status}</Badge>

              <div className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/orders/${order.id}`)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ================= ROW 4 : QUICK LINKS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Settings",
            desc: "Update personal & company details",
            icon: <Settings className="w-6 h-6 text-indigo-600" />,
            path: "/profile?tab=settings",
          },
          {
            title: "Orders",
            desc: "Track and manage all orders",
            icon: <History className="w-6 h-6 text-blue-600" />,
            path: "/profile?tab=history",
          },
          {
            title: "Wallet",
            desc: "Credits & transaction history",
            icon: <Wallet className="w-6 h-6 text-emerald-600" />,
            path: "/profile?tab=wallet",
          },
          {
            title: "Support",
            desc: "Raise tickets & get help",
            icon: <Eye className="w-6 h-6 text-orange-600" />,
            path: "/profile?tab=wishlist",
          },
        ].map((item) => (
          <Card
            key={item.title}
            className="cursor-pointer hover:shadow-xl transition"
            onClick={() => router.push(item.path)}
          >
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                {item.icon}
              </div>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
              <Button className="p-4 bg-emerald-600">
                Go to {item.title} →
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
