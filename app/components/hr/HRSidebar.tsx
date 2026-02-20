"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Home,
  Users,
  Package,
  TrendingUp,
  LogOut,
  Building2,
  Bell,
  UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const hrNavItems = [
  {
    title: "Dashboard",
    url: "/hr",
    icon: Home,
  },
  {
    title: "Employees",
    url: "/hr/employees",
    icon: Users,
  },
  {
    title: "Invites",
    url: "/hr/invites",
    icon: UserPlus,
  },
  {
    title: "Product Visibility",
    url: "/hr/products",
    icon: Package,
  },
  {
    title: "Analytics",
    url: "/hr/analytics",
    icon: TrendingUp,
  },
];

export function HRSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session || session.user.role !== "HR") {
      router.push("/login");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <SidebarProvider>
        <Sidebar className="border-r border-gray-200 bg-white">
          <SidebarHeader className="border-b border-gray-200 bg-emerald-50 p-6">
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center w-full">
                <Link href="/" className="block hover:opacity-80 transition-opacity mb-3">
                  <Image
                    src="/logo.png"
                    alt="FitPlay Logo"
                    width={140}
                    height={140}
                    className="rounded-lg object-contain max-w-none"
                    priority
                  />
                </Link>
                <div>
                  <Badge
                    variant="destructive"
                    className="bg-green-600 hover:bg-green-700 px-4 py-1 text-sm font-semibold"
                  >
                    HR
                  </Badge>
                </div>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-4 py-6">
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">Loading...</div>
            </div>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 bg-white border-b border-gray-200">
            <div className="flex items-center gap-2 px-4">
              <div className="h-4 w-px bg-gray-300" />
              <Badge
                variant="destructive"
                className="bg-green-600 hover:bg-green-700"
              >
                HR
              </Badge>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-6 bg-gray-50">
            <div className="flex items-center justify-center h-96">
              <div className="text-gray-500">Loading dashboard...</div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!session || session.user.role !== "HR") {
    return null; // Will redirect in useEffect
  }

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-gray-200 bg-white p-0 w-64">
        <SidebarHeader className="border-b border-gray-200 bg-emerald-50 p-6">
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center w-full">
              <Link href="/" className="block hover:opacity-80 transition-opacity mb-3">
                <Image
                  src="/logo.png"
                  alt="FitPlay Logo"
                  width={120}
                  height={120}
                  className="rounded-lg object-contain"
                  priority
                />
              </Link>
              <div>
                <Badge
                  variant="destructive"
                  className="bg-green-600 hover:bg-green-700 px-4 py-1 text-sm font-semibold"
                >
                  HR Portal
                </Badge>
              </div>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 py-3">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {hrNavItems.map((item) => {
                  const isActive = pathname === item.url;

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`
                          px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border-r-2 border-emerald-600"
                              : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
                          }
                        `}
                        tooltip={item.title}
                      >
                        <Link
                          href={item.url}
                          className="flex items-center gap-3"
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-gray-200">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="sm"
                className="w-full text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut />
                <span>Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="text-xs text-gray-500 text-center mt-4">
            FitPlay.life HR Portal v2.0.1
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-white border-b border-gray-200">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 text-gray-600 hover:text-emerald-600" />
            <div className="h-4 w-px bg-gray-300" />
            <Badge
              variant="destructive"
              className="bg-green-600 hover:bg-green-700"
            >
              HR
            </Badge>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-6 bg-gray-50">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}