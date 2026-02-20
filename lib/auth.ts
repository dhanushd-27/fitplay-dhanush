// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";
import { $Enums } from "@/lib/generated/prisma";

type UserRole = $Enums.Role;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Enter email" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // 1. Check Admin
        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email },
        });
        if (admin) {
          const isValid = await compare(credentials.password, admin.password);
          if (!isValid) throw new Error("Invalid password");
          return {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: $Enums.Role.ADMIN,
          };
        }

        // 2. Check User (HR / Employee)
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (user) {
          const isValid = await compare(credentials.password, user.password);
          if (!isValid) throw new Error("Invalid password");

          // Check if email is verified
          if (!user.verified) {
            throw new Error(
              "Please verify your email first. Check your inbox for verification link."
            );
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            companyId: user.companyId,
            isDemo: user.isDemo,
            hasPaidBundle: user.hasPaidBundle,
          };
        }

        // 3. Check Vendor
        const vendor = await prisma.vendor.findUnique({
          where: { email: credentials.email },
        });
        if (vendor) {
          const isValid = await compare(credentials.password, vendor.password);
          if (!isValid) throw new Error("Invalid password");
          return {
            id: vendor.id,
            name: vendor.name,
            email: vendor.email,
            role: $Enums.Role.VENDOR, // you can add to Role enum if needed
          };
        }

        throw new Error("No user found with this email");
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = (user as any).role;
        token.isDemo = (user as any).isDemo || false;
        token.companyId = (user as any).companyId || null; // 🔥 ADD
        token.hasPaidBundle = (user as any).hasPaidBundle || false; // 🔥 ADD
      }

      // Only fetch fresh data from the database when explicitly triggered
      // e.g., when calling `update()` from `useSession` on the client.
      if (trigger === "update" && token?.id) {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            hasPaidBundle: true,
            companyId: true,
          },
        });

        if (freshUser) {
          token.hasPaidBundle = freshUser.hasPaidBundle;
          token.companyId = freshUser.companyId;
        }

        // Also merge session properties if needed
        if (session) {
          if (session.hasPaidBundle !== undefined)
            token.hasPaidBundle = session.hasPaidBundle;
          if (session.companyId !== undefined)
            token.companyId = session.companyId;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
          role: token.role as UserRole,
          isDemo: (token as any).isDemo || false,

          companyId: (token as any).companyId || null, // 🔥 ADD
          hasPaidBundle: (token as any).hasPaidBundle || false, // 🔥 ADD
        };
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Prevent redirect loops and handle production URLs properly
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
