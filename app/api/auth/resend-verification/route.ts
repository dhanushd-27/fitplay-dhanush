import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) throw new Error("RESEND_API_KEY is not defined");
const resend = new Resend(resendApiKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists and is not verified
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.verified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      );
    }

    // Delete existing verification tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // Generate new verification token
    const verifyToken = crypto.randomUUID();
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verifyToken,
        expires: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
      },
    });

    const baseUrl =
      process.env.ENVIRONMENT !== "development"
        ? process.env.NEXTAUTH_URL
        : "http://localhost:3000";
    const verifyLink = `${baseUrl}/verify?token=${verifyToken}`;
    const verificationMail =
      process.env.VERIFICATION_MAIL || "no-reply@fitplaysolutions.com";

    try {
      const result = await resend.emails.send({
        from: verificationMail,
        to: email,
        subject: "🔄 FitPlay Account Verification - Resent",
        html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Resend Verification - FitPlay</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white;">
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 28px;">🔄 Verification Link Resent</h1>
                            <p style="color: #E6FFFA; margin: 10px 0 0 0; font-size: 16px;">Complete your FitPlay registration</p>
                        </div>
                        
                        <!-- Content -->
                        <div style="padding: 40px 30px; background-color: white;">
                            <p style="font-size: 18px; color: #1F2937; margin-bottom: 20px; font-weight: bold;">Hi ${user.name}! 👋</p>
                            
                            <p style="font-size: 16px; color: #4B5563; margin-bottom: 25px; line-height: 1.6;">
                                We've sent you a new verification link as requested. Please click the button below to verify your email address:
                            </p>
                            
                            <!-- CTA Button -->
                            <div style="text-align: center; margin: 40px 0;">
                                <a href="${verifyLink}" style="
                                    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
                                    color: white;
                                    padding: 16px 32px;
                                    text-decoration: none;
                                    border-radius: 8px;
                                    font-weight: bold;
                                    font-size: 16px;
                                    display: inline-block;
                                    box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.3);
                                ">
                                    ✅ Verify My Email Address
                                </a>
                            </div>
                            
                            <div style="background-color: #DBEAFE; padding: 20px; border-radius: 8px; border-left: 4px solid #3B82F6; margin: 30px 0;">
                                <p style="margin: 0; color: #1E40AF; font-size: 14px; font-weight: bold;">ℹ️ New Link Generated:</p>
                                <p style="margin: 5px 0 0 0; color: #1E40AF; font-size: 14px;">This is a fresh verification link that expires in 1 hour. Your previous verification links have been invalidated.</p>
                            </div>
                            
                            <p style="font-size: 14px; color: #6B7280; margin: 20px 0;">
                                If the button doesn't work, copy and paste this link:
                            </p>
                            <p style="font-size: 12px; color: #9CA3AF; word-break: break-all; background-color: #F9FAFB; padding: 10px; border-radius: 4px;">
                                ${verifyLink}
                            </p>
                        </div>
                        
                        <!-- Footer -->
                        <div style="background-color: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB;">
                            <p style="font-size: 14px; color: #6B7280; margin: 0 0 10px 0;">
                                Need help? Contact us at <a href="mailto:support@fitplay.life" style="color: #059669;">support@fitplay.life</a>
                            </p>
                            <p style="font-size: 12px; color: #9CA3AF; margin: 0;">
                                © 2024 FitPlay.life - Your Health & Wellness Partner<br>
                                This email was sent to ${email}
                            </p>
                        </div>
                    </div>
                </body>
                </html>
                `,
      });

      return NextResponse.json({
        message: "Verification email has been resent successfully",
        emailId: result.data?.id,
      });
    } catch (emailError) {
      console.error("❌ Failed to resend verification email:", emailError);
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("❌ Resend verification error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
