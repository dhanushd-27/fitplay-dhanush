import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) throw new Error("RESEND_API_KEY is not defined");
const resend = new Resend(resendApiKey);

function looksLikeEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { token, name, email, password, phone, gender, birthDate } = body;

        // If no token, allow direct signup for normal users
        if (!token) {
            // Check if email already exists
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return NextResponse.json({ error: "This email is already registered. Please use a different email." }, { status: 400 });
            }
            // Check if phone already exists
            if (phone) {
                const existingPhone = await prisma.user.findFirst({ where: { phone } });
                if (existingPhone) {
                    return NextResponse.json({ error: "This phone number is already registered. Please use a different phone number." }, { status: 400 });
                }
            }
            const hashedPass = await bcrypt.hash(password, 10);
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPass,
                    phone,
                    gender,
                    birthDate,
                    role: "EMPLOYEE",
                    claimed: true,
                    verified: false,
                    hasPaidBundle: false,
                },
            });
            // Send verification email
            const verifyToken = crypto.randomUUID();
            await prisma.verificationToken.create({
                data: {
                    identifier: user.email,
                    token: verifyToken,
                    expires: new Date(Date.now() + 1 * 60 * 60 * 1000),
                },
            });
            // ...send email logic (reuse below)

              const baseUrl = process.env.ENVIRONMENT !== "development" ? `https://fitplay.life` : 'http://localhost:3000';

        const verifyLink = `${baseUrl}/verify?token=${verifyToken}`;
        // Use Resend's verified domain for better delivery
        const verificationMail = "no-reply@fitplaysolutions.com";

        try {

            const emailResult = await resend.emails.send({
                from: verificationMail,
                to: email,
                subject: "✅ Verify your FitPlay account - Action Required",
                html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Verify your FitPlay account</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white;">
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 28px;">🎯 Welcome to FitPlay!</h1>
                            <p style="color: #E6FFFA; margin: 10px 0 0 0; font-size: 16px;">Your wellness journey starts here</p>
                        </div>
                        
                        <!-- Content -->
                        <div style="padding: 40px 30px; background-color: white;">
                            <p style="font-size: 18px; color: #1F2937; margin-bottom: 20px; font-weight: bold;">Hi ${name}! 👋</p>
                            
                            <p style="font-size: 16px; color: #4B5563; margin-bottom: 25px; line-height: 1.6;">
                                🎉 Congratulations on joining FitPlay! We're excited to have you as part of our community.
                            </p>
                            
                            <p style="font-size: 16px; color: #4B5563; margin-bottom: 30px; line-height: 1.6;">
                                To complete your registration and start exploring our platform, please verify your email address by clicking the button below:
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
                                    transition: all 0.2s;
                                ">
                                    ✅ Verify My Email Address
                                </a>
                            </div>
                            
                            <div style="background-color: #FEF3C7; padding: 20px; border-radius: 8px; border-left: 4px solid #F59E0B; margin: 30px 0;">
                                <p style="margin: 0; color: #92400E; font-size: 14px; font-weight: bold;">⚠️ Important:</p>
                                <p style="margin: 5px 0 0 0; color: #92400E; font-size: 14px;">This verification link will expire in 1 hour for security reasons.</p>
                            </div>
                            
                            <p style="font-size: 14px; color: #6B7280; margin: 20px 0;">
                                If the button doesn't work, copy and paste this link into your browser:
                            </p>
                            <p style="font-size: 12px; color: #9CA3AF; word-break: break-all; background-color: #F9FAFB; padding: 10px; border-radius: 4px;">
                                ${verifyLink}
                            </p>
                        </div>
                        
                        <!-- Footer -->
                        <div style="background-color: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB;">
                            <p style="font-size: 14px; color: #6B7280; margin: 0 0 10px 0;">
                                Didn't sign up for FitPlay? You can safely ignore this email.
                            </p>
                            <p style="font-size: 12px; color: #9CA3AF; margin: 0;">
                                © 2024 FitPlay.life - Transforming Health & Wellness Together 🌟
                            </p>
                            <p style="font-size: 10px; color: #D1D5DB; margin: 10px 0 0 0;">
                                This email was sent to ${email}
                            </p>
                        </div>
                    </div>
                </body>
                </html>
                `,
            });
        } catch (emailError) {
            console.error(`❌ Failed to send verification email to ${email}:`, emailError);
            console.error(`📧 Attempted from: ${verificationMail}`);
            // Don't fail the signup if email fails
        }
            // Return response
            return NextResponse.json({ message: "Signup completed. Please verify your email in 1 hour." });
        }

         const tokenRecord = await prisma.verificationToken.findUnique({
            where: { token },
        });

        if (!tokenRecord || tokenRecord.expires < new Date()) {
            return NextResponse.json(
                { error: "Invalid or expired token" },
                { status: 400 })}

        // Check if email already exists (for someone else)
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser && existingUser.email !== tokenRecord.identifier) {
            return NextResponse.json(
                { error: "This email is already registered. Please use a different email." },
                { status: 400 }
            );
        }

        // Check if phone already exists
        if (phone) {
            const existingPhone = await prisma.user.findFirst({
                where: { phone },
            });

            if (existingPhone) {
                return NextResponse.json(
                    { error: "This phone number is already registered. Please use a different phone number." },
                    { status: 400 }
                );
            }
        }

        const hashedPass = await bcrypt.hash(password, 10);

        let user;

        if (looksLikeEmail(tokenRecord.identifier)) {
            // -------- HR flow --------
            user = await prisma.user.update({
                where: { email: tokenRecord.identifier },
                data: {
                    name,
                    email,
                    password: hashedPass,
                    phone,
                    gender:null,
                    birthDate: null,

                    verified: false,
                    claimed: true,
                },
            });
        } else {
            // -------- Employee flow (claim logic) --------
            const companyId = tokenRecord.identifier;

            const unclaimed = await prisma.user.findFirst({
                where: {
                    companyId,
                    role: "EMPLOYEE",
                    claimed: false,
                },
            });

            if (!unclaimed) {
                return NextResponse.json(
                    { error: "All employee slots have been claimed" },
                    { status: 400 }
                );
            }

            user = await prisma.user.update({
                where: { id: unclaimed.id },
                data: {
                    name,
                    email,
                    password: hashedPass,
                    phone,
                    gender:null,
                    birthDate: null,
                    claimed: true,
                    verified: false,
                },
            });
        }

        // consume the signup token
        await prisma.verificationToken.delete({ where: { token } });

        // send verification mail
        const verifyToken = crypto.randomUUID();
        await prisma.verificationToken.create({
            data: {
                identifier: user.email,
                token: verifyToken,
                expires: new Date(Date.now() + 1 * 60 * 60 * 1000),
            },
        });

        const baseUrl = process.env.ENVIRONMENT !== "development" ? `https://fitplay.life` : 'http://localhost:3000';

        const verifyLink = `${baseUrl}/verify?token=${verifyToken}`;
        // Use Resend's verified domain for better delivery
        const verificationMail = "no-reply@fitplaysolutions.com";

        try {
            const emailResult = await resend.emails.send({
                from: verificationMail,
                to: email,
                subject: "✅ Verify your FitPlay account - Action Required",
                html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Verify your FitPlay account</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white;">
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 28px;">🎯 Welcome to FitPlay!</h1>
                            <p style="color: #E6FFFA; margin: 10px 0 0 0; font-size: 16px;">Your wellness journey starts here</p>
                        </div>
                        
                        <!-- Content -->
                        <div style="padding: 40px 30px; background-color: white;">
                            <p style="font-size: 18px; color: #1F2937; margin-bottom: 20px; font-weight: bold;">Hi ${name}! 👋</p>
                            
                            <p style="font-size: 16px; color: #4B5563; margin-bottom: 25px; line-height: 1.6;">
                                🎉 Congratulations on joining FitPlay! We're excited to have you as part of our community.
                            </p>
                            
                            <p style="font-size: 16px; color: #4B5563; margin-bottom: 30px; line-height: 1.6;">
                                To complete your registration and start exploring our platform, please verify your email address by clicking the button below:
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
                                    transition: all 0.2s;
                                ">
                                    ✅ Verify My Email Address
                                </a>
                            </div>
                            
                            <div style="background-color: #FEF3C7; padding: 20px; border-radius: 8px; border-left: 4px solid #F59E0B; margin: 30px 0;">
                                <p style="margin: 0; color: #92400E; font-size: 14px; font-weight: bold;">⚠️ Important:</p>
                                <p style="margin: 5px 0 0 0; color: #92400E; font-size: 14px;">This verification link will expire in 1 hour for security reasons.</p>
                            </div>
                            
                            <p style="font-size: 14px; color: #6B7280; margin: 20px 0;">
                                If the button doesn't work, copy and paste this link into your browser:
                            </p>
                            <p style="font-size: 12px; color: #9CA3AF; word-break: break-all; background-color: #F9FAFB; padding: 10px; border-radius: 4px;">
                                ${verifyLink}
                            </p>
                        </div>
                        
                        <!-- Footer -->
                        <div style="background-color: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB;">
                            <p style="font-size: 14px; color: #6B7280; margin: 0 0 10px 0;">
                                Didn't sign up for FitPlay? You can safely ignore this email.
                            </p>
                            <p style="font-size: 12px; color: #9CA3AF; margin: 0;">
                                © 2024 FitPlay.life - Transforming Health & Wellness Together 🌟
                            </p>
                            <p style="font-size: 10px; color: #D1D5DB; margin: 10px 0 0 0;">
                                This email was sent to ${email}
                            </p>
                        </div>
                    </div>
                </body>
                </html>
                `,
            });
        } catch (emailError) {
            console.error(`❌ Failed to send verification email to ${email}:`, emailError);
            console.error(`📧 Attempted from: ${verificationMail}`);
            // Don't fail the signup if email fails
        } return NextResponse.json({
            message: "Signup completed. Please verify your email in 1 hour.",
        });
    } catch (err: any) {
        console.error("Signup error:", err);

        // Handle Prisma unique constraint violations
        if (err.code === 'P2002') {
            const target = err.meta?.target;
            if (target?.includes('email')) {
                return NextResponse.json(
                    { error: "This email is already registered." },
                    { status: 400 }
                );
            }
            if (target?.includes('phone')) {
                return NextResponse.json(
                    { error: "This phone number is already registered." },
                    { status: 400 }
                );
            }
            return NextResponse.json(
                { error: "A user with this information already exists." },
                { status: 400 }
            );
        }

        // Handle other Prisma errors
        if (err.code?.startsWith('P')) {
            return NextResponse.json(
                { error: "Database error occurred. Please try again." },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
