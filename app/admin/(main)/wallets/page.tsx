"use client";

import React, { useState } from "react";
import {
  WalletStats,
  WalletFilters,
  WalletTable,
  WalletForm,
  WalletLoadingSkeleton,
} from "@/app/components/admin/wallets";
import useSWR, { useSWRConfig } from "swr";

interface UserWallet {
  id: string;
  email: string;
  name: string;
  role: string;
  company: string;
  balance: number;
  expiryDate: string | null;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminWalletsPage() {
  const { mutate: globalMutate } = useSWRConfig();
  const {
    data: walletData,
    error: swrError,
    isLoading,
  } = useSWR("/api/wallets", fetcher);
  const [selectedUser, setSelectedUser] = useState<UserWallet | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [balanceFilter, setBalanceFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const users = walletData?.wallets || [];
  const error = swrError ? "Failed to fetch wallets" : "";

  const handleUpdateCredits = async (userId: string, creditAmount: number) => {
    setUpdating(true);
    try {
      // Optimistic update
      const optimisticData = walletData
        ? {
            ...walletData,
            wallets: walletData.wallets.map((user: UserWallet) =>
              user.id === userId
                ? { ...user, balance: user.balance + creditAmount }
                : user
            ),
          }
        : walletData;

      // Update cache optimistically
      globalMutate("/api/wallets", optimisticData, false);

      const res = await fetch("/api/wallets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          creditAmount,
        }),
      });

      if (res.ok) {
        setIsEditOpen(false);
        setSelectedUser(null);
        // Revalidate to ensure data is correct
        globalMutate("/api/wallets");
      } else {
        // Revert optimistic update on error
        globalMutate("/api/wallets");
        const data = await res.json();
        alert(data.error || "Failed to update credits");
      }
    } catch (err) {
      // Revert optimistic update on error
      globalMutate("/api/wallets");
      alert("Error updating credits");
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = users
    .filter((user: UserWallet) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBalance =
        balanceFilter === "all" ||
        (balanceFilter === "zero" && user.balance === 0) ||
        (balanceFilter === "low" && user.balance > 0 && user.balance < 1000) ||
        (balanceFilter === "sufficient" && user.balance >= 1000);
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesBalance && matchesRole;
    })
    .sort((a: UserWallet, b: UserWallet) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "balance":
          return b.balance - a.balance;
        case "company":
          return a.company.localeCompare(b.company);
        case "role":
          return a.role.localeCompare(b.role);
        default:
          return 0;
      }
    });

  if (isLoading) return <WalletLoadingSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Wallet Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage employee credits and wallet balances
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <WalletStats wallets={users} />

      {/* Filters and Table */}
      <div className="space-y-6">
        <WalletFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          balanceFilter={balanceFilter}
          onBalanceFilterChange={setBalanceFilter}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <WalletTable
          wallets={filteredUsers}
          onEdit={(wallet: UserWallet) => {
            setSelectedUser(wallet);
            setIsEditOpen(true);
          }}
        />
      </div>

      {/* Edit Credits Form */}
      <WalletForm
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSubmit={handleUpdateCredits}
        editingWallet={selectedUser}
        loading={updating}
      />
    </div>
  );
}
