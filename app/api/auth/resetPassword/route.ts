import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Resend } from "resend";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);
function looksLikeEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Store request counts temporarily (IP → timestamps)
const rateLimitMap = new Map<string, number[]>();

// Settings
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;      // max 5 per minute per IP

function rateLimit(ip: string): boolean {
    const now = Date.now();
    const windowStart = now - WINDOW_MS;

    const timestamps = rateLimitMap.get(ip) || [];
    const filtered = timestamps.filter(ts => ts > windowStart);
    filtered.push(now);

    rateLimitMap.set(ip, filtered);

    return filtered.length <= MAX_REQUESTS;
}

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "unknown";
        if (!rateLimit(ip)) {
            return NextResponse.json({ error: "Too many requests, try again later" }, { status: 429 });
        }
        const { email } = await req.json();
        if (!email || typeof email !== "string") {
            return NextResponse.json({ error: "Invalid email" }, { status: 400 });
        }

        // Check if user exists in User, Admin, or Vendor table
        const [user, admin, vendor] = await Promise.all([
            prisma.user.findUnique({ where: { email } }),
            prisma.admin.findUnique({ where: { email } }),
            prisma.vendor.findUnique({ where: { email } }),
        ]);

        const account = user || admin || vendor;
        if (!account) {
            return NextResponse.json({ error: "No account found with this email" }, { status: 404 });
        }

        // Generate secure token and expiry
        const resetToken = crypto.randomUUID();
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        // Store in VerificationToken table (reuse for reset)
        await prisma.verificationToken.create({
            data: {
                identifier: email,
                token: resetToken,
                expires: resetTokenExpiry,
            },
        });

        const baseUrl = process.env.ENVIRONMENT !== "development" ? `https://fitplay.life` : 'http://localhost:3000';

        const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
        // Use Resend's verified domain for better delivery
        const verificationMail = "no-reply@fitplaysolutions.com";

        try {
            const emailResponse = await resend.emails.send({
                from: verificationMail,
                to: email,
                subject: "Reset your FitPlay password",
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">Password Reset Request</h1>
                    </div>
                    <div style="padding: 30px; background-color: #f9fafb;">
                        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Hello,</p>
                        <p style="font-size: 16px; color: #374151; margin-bottom: 25px;">
                            You requested to reset your FitPlay account password. Click the button below to create a new password.
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" style="background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                                Reset Password
                            </a>
                        </div>
                        <p style="font-size: 14px; color: #6B7280; margin-top: 25px;">
                            This password reset link will expire in 1 hour. If you didn't request this reset, you can safely ignore this email.
                        </p>
                        <div style="border-top: 1px solid #E5E7EB; margin-top: 30px; padding-top: 20px; text-align: center;">
                            <p style="font-size: 12px; color: #9CA3AF;">
                                © 2024 FitPlay.life - Your Health & Wellness Partner
                            </p>
                        </div>
                    </div>
                </div>
                `,
            });
        } catch (emailError) {
            console.error("❌ Failed to send password reset email:", emailError);
            return NextResponse.json({ error: "Failed to send reset email. Please try again later." }, { status: 500 });
        }

        return NextResponse.json({ message: "Reset link sent successfully" });
    } catch (error) {
        console.error("[RESET_PASSWORD_ERROR]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { token, newPassword } = await req.json();
        if (!token || typeof token !== "string") {
            return NextResponse.json({ error: "Invalid token" }, { status: 400 });
        }

        if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
            return NextResponse.json({ error: "Invalid or weak new password" }, { status: 400 });
        }

        const record = await prisma.verificationToken.findUnique({
            where: { token: String(token) },
        });

        if (!record || record.expires < new Date()) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }

        if (!looksLikeEmail(record.identifier)) {
            return NextResponse.json({ error: "This is not a password reset token" }, { status: 400 });
        }

        const hashedPass = await bcrypt.hash(newPassword, 10);

        // Update password in the appropriate table
        const user = await prisma.user.findUnique({ where: { email: record.identifier } });
        if (user) {
            await prisma.user.update({
                where: { email: record.identifier },
                data: { password: hashedPass },
            });
        } else {
            const admin = await prisma.admin.findUnique({ where: { email: record.identifier } });
            if (admin) {
                await prisma.admin.update({
                    where: { email: record.identifier },
                    data: { password: hashedPass },
                });
            } else {
                const vendor = await prisma.vendor.findUnique({ where: { email: record.identifier } });
                if (vendor) {
                    await prisma.vendor.update({
                        where: { email: record.identifier },
                        data: { password: hashedPass },
                    });
                } else {
                    return NextResponse.json({ error: "No account found with this email" }, { status: 404 });
                }
            }
        }

        // Delete the used token
        await prisma.verificationToken.delete({ where: { token: String(token) } });

        return NextResponse.json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("[RESET_PASSWORD_ERROR]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}