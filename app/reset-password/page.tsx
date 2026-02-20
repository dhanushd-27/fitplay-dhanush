
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Shield, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import PasswordInput from "@/components/password-input";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid reset token");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/resetPassword", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          toast.error("Invalid or expired reset token. Please request a new reset link.");
        } else {
          toast.error(data.error || "Failed to reset password");
        }
        return;
      }

      setIsSuccess(true);
      toast.success("Password reset successfully!");

    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
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

        <div className="w-full max-w-md text-center relative z-10">
          <div className="inline-flex items-center justify-center mb-6">
            <Image
              src="/logo.png"
              alt="FitPlay Logo"
              width={100}
              height={100}
              className="rounded-xl object-contain"
              priority
            />
          </div>
          <Card className="bg-slate-900/70 backdrop-blur-xl border border-emerald-500/20 shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
            <CardHeader className="pt-8">
              <CardTitle className="text-2xl text-white">
                Invalid Reset Link
              </CardTitle>
              <CardDescription className="text-gray-400">
                This password reset link is invalid or has expired. 
                Please request a new password reset.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pb-8">
              <Button asChild className="w-full h-12 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold rounded-lg">
                <Link href="/forgot-password">Request New Reset Link</Link>
              </Button>
              <Button asChild variant="outline" className="w-full h-12 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 rounded-lg">
                <Link href="/login">Back to Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isSuccess) {
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
                Password Reset Successfully!
              </CardTitle>
              <CardDescription className="text-gray-400">
                Your password has been updated. You can now log in with your new password.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8">
              <Button 
                onClick={() => router.push("/login")}
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold rounded-lg"
              >
                Continue to Login
              </Button>
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
            Set New Password
          </h1>
          <p className="text-gray-400">
            Enter your new password below
          </p>
        </div>

        {/* Reset Form */}
        <Card className="bg-slate-900/70 backdrop-blur-xl border border-emerald-500/20 shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
          <CardHeader className="space-y-1 pt-8">
            <CardTitle className="text-2xl text-center text-white">
              Create New Password
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              Choose a strong password to secure your account
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300 font-medium text-sm">
                  New Password
                </Label>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-slate-800/50 border border-emerald-500/30 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-lg text-white placeholder:text-gray-500 transition-all"
                  placeholder="Enter your new password"
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500">
                  Password must be at least 8 characters long
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300 font-medium text-sm">
                  Confirm New Password
                </Label>
                <PasswordInput
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 bg-slate-800/50 border border-emerald-500/30 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-lg text-white placeholder:text-gray-500 transition-all"
                  placeholder="Confirm your new password"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !password || !confirmPassword}
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold rounded-lg transition-all duration-300"
              >
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Password Requirements */}
        <div className="mt-6 bg-slate-900/50 backdrop-blur-xl rounded-lg p-4 border border-emerald-500/20">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-white mb-2">Password Requirements:</p>
              <ul className="text-gray-400 space-y-1">
                <li className={password.length >= 8 ? "text-emerald-400" : ""}>
                  • At least 8 characters long
                </li>
                <li className={password === confirmPassword && password ? "text-emerald-400" : ""}>
                  • Passwords must match
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-950 to-emerald-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}