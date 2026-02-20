"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Logo from "@/components/logo";
import Link from "next/link";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }

    const verifyAccount = async () => {
      try {
        const res = await fetch(`/api/auth/verify?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(
            data.message || "Account verified successfully! You can now log in."
          );
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Something went wrong during verification");
      }
    };

    verifyAccount();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center">
            <Logo />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Email Verification
          </h1>
          <p className="text-gray-600">
            Activating your FitPlay account
          </p>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-emerald-100 shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {status === "loading" && (
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
              )}
              {status === "success" && (
                <CheckCircle className="w-12 h-12 text-green-500" />
              )}
              {status === "error" && (
                <XCircle className="w-12 h-12 text-red-500" />
              )}
            </div>
            <CardTitle className="text-2xl text-gray-900">
              {status === "loading" && "Verifying Your Email..."}
              {status === "success" && "Welcome to FitPlay!"}
              {status === "error" && "Verification Failed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <CardDescription className="text-gray-600">
              {message}
            </CardDescription>

            {status === "success" && (
              <>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-left">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-emerald-900 mb-1">Account Activated!</p>
                      <ul className="text-emerald-800 space-y-1">
                        <li>✓ Your FitPlay account is now active</li>
                        <li>✓ You can access the wellness store</li>
                        <li>✓ Start exploring your company benefits</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
                >
                  Continue to Login
                </Button>
              </>
            )}

            {status === "error" && (
              <>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-red-900 mb-1">Need Help?</p>
                      <ul className="text-red-800 space-y-1">
                        <li>• Check if the verification link has expired</li>
                        <li>• Contact your HR for a new invitation</li>
                        <li>• Ensure you used the complete link from email</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/login">Go to Login</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/forgot-password">Reset Password</Link>
                  </Button>
                </div>
              </>
            )}

            {status === "loading" && (
              <div className="text-sm text-gray-500">
                Please wait while we verify your account...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
