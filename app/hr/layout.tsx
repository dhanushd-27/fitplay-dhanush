"use client";

import { HRSidebar } from "@/app/components/hr/HRSidebar";

export default function HRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HRSidebar>{children}</HRSidebar>;
}