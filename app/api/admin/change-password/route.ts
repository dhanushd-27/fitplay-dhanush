import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { compare, hash } from "bcryptjs";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { verificationMethod, currentPassword, verificationEmail, newPassword } = await request.json();

    if (!newPassword) {
      return NextResponse.json(
        { error: "New password is required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Validate verification method
    if (!verificationMethod || !['password', 'email'].includes(verificationMethod)) {
      return NextResponse.json(
        { error: "Invalid verification method" },
        { status: 400 }
      );
    }

    if (verificationMethod === 'password' && !currentPassword) {
      return NextResponse.json(
        { error: "Current password is required for password verification" },
        { status: 400 }
      );
    }

    if (verificationMethod === 'email' && !verificationEmail) {
      return NextResponse.json(
        { error: "Email address is required for email verification" },
        { status: 400 }
      );
    }

    // Get admin from database
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    // Verify based on chosen method
    if (verificationMethod === 'password') {
      const isValidPassword = await compare(currentPassword, admin.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }
    } else if (verificationMethod === 'email') {
      // Verify email matches the admin's email
      if (verificationEmail.toLowerCase() !== admin.email.toLowerCase()) {
        return NextResponse.json(
          { error: "Email address does not match your account" },
          { status: 400 }
        );
      }
    }

    // Hash new password
    const hashedNewPassword = await hash(newPassword, 12);

    // Update password in database
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}