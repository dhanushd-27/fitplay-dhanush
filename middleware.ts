import withAuth from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth?.token;

    // 🔒 Course protection
    if (
      pathname.startsWith("/course") ||
      pathname.startsWith("/coursepage")
    ) {
      const isCompanyUser = !!token?.companyId;
      const hasPaid = token?.hasPaidBundle === true;

      if (!isCompanyUser && !hasPaid) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // 🔒 Admin protection
    if (pathname.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // 🔒 HR protection
    if (pathname.startsWith("/hr")) {
      if (token?.role !== "HR") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // ❌ Not logged in → block protected routes
        if (
          pathname.startsWith("/admin") ||
          pathname.startsWith("/hr") ||
          pathname.startsWith("/profile") ||
          pathname.startsWith("/cart") ||
          pathname.startsWith("/course") ||
          pathname.startsWith("/coursepage")
        ) {
          return !!token;
        }

        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/profile",
    "/hr/:path*",
    "/admin/:path*",
    "/cart",
    "/course/:path*",
    "/coursepage",
  ],
};
