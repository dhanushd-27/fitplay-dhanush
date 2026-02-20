import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";

// Simple endpoint to create test HR credentials (for development only)
export async function POST(request: NextRequest) {
  try {
    // Get environment check
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Not available in production" }, { status: 403 });
    }

    const { email = "hr@test.com", password = "hr123456", name = "Test HR", phone = "+1234567890" } = await request.json() || {};

    // Create or find a test company
    let company = await prisma.company.findFirst({
      where: { name: "Test Company" }
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: "Test Company",
          address: "123 Test Street, Test City"
        }
      });
    }

    // Check if HR user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { 
          message: "HR user already exists",
          credentials: {
            email: existingUser.email,
            password: "Use existing password or reset"
          }
        },
        { status: 200 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create HR user
    const hrUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: "HR",
        companyId: company.id,
        verified: true,
        claimed: true,
      },
      include: {
        company: true,
      },
    });

    return NextResponse.json(
      {
        message: "Test HR user created successfully!",
        credentials: {
          email,
          password,
          loginUrl: "/login"
        },
        user: {
          id: hrUser.id,
          name: hrUser.name,
          email: hrUser.email,
          role: hrUser.role,
          company: hrUser.company.name
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating test HR user:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}