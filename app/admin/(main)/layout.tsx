"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { fetchAdminProducts } from "@/app/hooks/useAdminProducts";
import { preload } from "swr";

preload("admin-products", fetchAdminProducts);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminSidebar>{children}</AdminSidebar>;
}
