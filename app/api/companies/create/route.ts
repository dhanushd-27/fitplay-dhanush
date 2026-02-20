import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, address } = body;

    // Basic validation
    if (!name || !address) {
      return NextResponse.json(
        { error: "Company name and address are required" },
        { status: 400 }
      );
    }

    // Create company
    const company = await prisma.company.create({
      data: {
        name,
        address,
      },
    });

    return NextResponse.json(
      { message: "Company created successfully", company },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
