// types/next-auth.d.ts or lib/auth.d.ts
import { DefaultSession } from "next-auth"
import { $Enums } from "@/lib/generated/prisma"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string
      email: string
      company?: any
      role: $Enums.Role
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    name?: string
    email: string
    role: $Enums.Role
    company?: any
    // Remove optional since we always set it
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    name?: string
    email: string
    role: $Enums.Role
  }
}