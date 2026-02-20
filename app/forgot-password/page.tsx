
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Mail, CheckCircle, Shield, Clock } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/resetPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Too many requests. Please try again later.");
        } else if (response.status === 404) {
          toast.error("No account found with this email address");
        } else {
          toast.error(data.error || "Failed to send reset link");
        }
        return;
      }

      setIsSubmitted(true);
      toast.success("Password reset link sent successfully!");

    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-950 to-emerald-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Smooth animated background */}
        <div className="absolute inset-0 overflow-hidden opacity-40">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/30 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute top-1/2 -right-40 w-96 h-96 bg-green-600/25 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '3s' }}></div>
          <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '6s' }}></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
        </div>

        <style jsx>{`
          @keyframes float-slow {
            0%, 100% { transform: translate(0, 0); }
            33% { transform: translate(30px, -30px); }
            66% { transform: translate(-20px, 20px); }
          }
          .animate-float-slow {
            animation: float-slow 20s ease-in-out infinite;
          }
        `}</style>

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <Image
                src="/logo.png"
                alt="FitPlay Logo"
                width={100}
                height={100}
                className="rounded-xl object-contain"
                priority
              />
            </div>
          </div>

          <Card className="bg-slate-900/70 backdrop-blur-xl border border-emerald-500/20 shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
            
            <CardHeader className="text-center pt-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
              <CardTitle className="text-2xl text-emerald-400">
                Check Your Email
              </CardTitle>
              <CardDescription className="text-gray-400">
                We&apos;ve sent a password reset link to <strong className="text-emerald-400">{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-6 pb-8">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-300 mb-1">Next Steps:</p>
                    <ul className="text-blue-300/90 space-y-1">
                      <li>1. Check your email inbox (and spam folder)</li>
                      <li>2. Click the reset link in the email</li>
                      <li>3. Create your new password</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-300 mb-1">Important:</p>
                    <p className="text-orange-300/90">
                      The reset link is valid for <strong>1 hour only</strong>. 
                      If it expires, you&apos;ll need to request a new one.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                  variant="outline"
                  className="w-full border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                >
                  Send Another Reset Link
                </Button>
                
                <Button asChild className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold rounded-lg">
                  <Link href="/login">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-950 to-emerald-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Smooth animated background */}
      <div className="absolute inset-0 overflow-hidden opacity-40">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/30 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-green-600/25 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '3s' }}></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '6s' }}></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(30px, -30px); }
          66% { transform: translate(-20px, 20px); }
        }
        .animate-float-slow {
          animation: float-slow 20s ease-in-out infinite;
        }
      `}</style>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <Image
              src="/logo.png"
              alt="FitPlay Logo"
              width={100}
              height={100}
              className="rounded-xl object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Reset Password
          </h1>
          <p className="text-gray-400">
            Enter your email to receive a reset link
          </p>
        </div>

        {/* Reset Form */}
        <Card className="bg-slate-900/70 backdrop-blur-xl border border-emerald-500/20 shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
          
          <CardHeader className="space-y-1 pt-8">
            <CardTitle className="text-2xl text-center text-white">
              Forgot Password?
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              Don&apos;t worry! Enter your email and we&apos;ll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300 font-medium text-sm">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-slate-800/50 border border-emerald-500/30 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-lg text-white placeholder:text-gray-500 transition-all"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold rounded-lg transition-all duration-300"
              >
                {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-8 bg-slate-900/50 backdrop-blur-xl rounded-lg p-4 border border-emerald-500/20">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-white mb-1">Security Notice</p>
              <p className="text-gray-400">
                For your security, reset links expire after 1 hour and can only be used once.
                If you don&apos;t receive an email, please check your spam folder.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}