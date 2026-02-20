import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Run a simple query to keep the database connection warm
    const result = await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: "success",
        message: "Database warmed up successfully",
        result,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database warmup failed:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to warm up database" },
      { status: 500 }
    );
  }
}
