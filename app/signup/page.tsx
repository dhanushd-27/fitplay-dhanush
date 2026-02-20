"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, Suspense, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { Heart, Shield, Users, CheckCircle, Mail, Clock, Activity, Lock, ArrowRight } from "lucide-react";
import Logo from "@/components/logo";
import PasswordInput from "@/components/password-input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function SignupForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [phone, setPhone] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    terms: false
  });

  // Countdown timer effect
  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [success, countdown]);

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail }),
      });

      if (res.ok) {
        setResendSuccess(true);
        setCountdown(60);
        setTimeout(() => setResendSuccess(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to resend verification email");
      }
    } catch (err) {
      setError("Failed to resend verification email");
    } finally {
      setResendLoading(false);
    }
  };

  const handleSignup = async () => {
    // Allow direct signup if no token

  // Terms check
  if (!formData.terms) {
    setError("Please accept the terms and conditions");
    return;
  }

  // Name check
  if (!formData.name.trim()) {
    setError("Name is required");
    return;
  }

  // Email check (basic regex)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email || !emailRegex.test(formData.email)) {
    setError("Please enter a valid email address");
    return;
  }

  // Phone validation
  const phone = formData.phone.trim();

  const is10Digit = /^\d{10}$/.test(phone);
  const is11DigitWithZero = /^0\d{10}$/.test(phone);

  if (!is10Digit && !is11DigitWithZero) {
    setError(
      "Phone number must be 10 digits or 11 digits starting with 0"
    );
    return;
  }

  // Password check
  if (!formData.password || !formData.confirmPassword) {
    setError("Password is required");
    return;
  }

  if (formData.password.length < 8) {
    setError("Password must be at least 8 characters long");
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  setLoading(true);
  setError("");

  try {
    const res = await fetch("/api/auth/signup/complete-signup", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: phone,
        gender: null,
        birthDate: null,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
    } else {
      setUserEmail(formData.email);
      setSuccess(true);
    }
  } catch (err) {
    setError("Something went wrong");
  } finally {
    setLoading(false);
  }
};


  // If no token, allow direct signup for non-company users
  // Show normal signup form

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

      <div className="w-full max-w-4xl relative z-10">
        {/* Header with FitPlay Logo */}
        <div className="text-center mb-6">
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
            Complete Your Registration
          </h1>
          <p className="text-gray-400">
            Fill in your details to activate your FitPlay account
          </p>
        </div>

        {/* Signup Card */}
        <Card className="bg-slate-900/70 backdrop-blur-xl border border-emerald-500/20 shadow-2xl max-w-full  flex flex-col">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
          
          {!success ? (
            <>
              <CardHeader className="space-y-1 pb-4 flex-shrink-0">
                <CardTitle className="text-xl text-center text-white">
                  Complete Your Account Setup
                </CardTitle>
                <CardDescription className="text-center text-gray-400 text-sm">
                  You've been invited to join FitPlay. Fill in your details to create your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto  px-6 pb-8 ">
                <div className="space-y-4 pb-6">
                  <div className="flex flex-row gap-8">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300 font-medium text-sm">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="h-11 md:w-[350px] bg-slate-800/50 border border-emerald-500/30 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-lg text-white placeholder:text-gray-500 transition-all"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300 font-medium text-sm">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="h-11 md:w-[350px] bg-slate-800/50 border border-emerald-500/30 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-lg text-white placeholder:text-gray-500 transition-all"
                      required
                      disabled={loading}
                    />
                  </div>
                  </div>

                  <div className="space-y-2">
  <Label
    htmlFor="phone"
    className="text-gray-300 font-medium text-sm"
  >
    Phone Number
  </Label>

  <div className="flex">
    {/* Prefix */}
    <div className="flex items-center gap-2 px-3 bg-slate-800/70 border border-r-0 border-emerald-500/30 rounded-l-lg text-white text-sm select-none">
      
      <span className="text-gray-300">+91</span>
    </div>

    {/* Input */}
    <Input
      id="phone"
      type="tel"
      placeholder="Enter 10-digit number"
      value={formData.phone}
      onChange={(e) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 10);
        setFormData({ ...formData, phone: value });
      }}
      pattern="[0-9]{10}"
      title="Phone number must be exactly 10 digits"
      className="h-11 bg-slate-800/50 border border-emerald-500/30 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-l-none rounded-r-lg text-white placeholder:text-gray-500 transition-all"
      required
      disabled={loading}
    />
  </div>
</div>



                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-300 font-medium text-sm">
                      Password
                    </Label>
                    <PasswordInput
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="h-11 bg-slate-800/50 border border-emerald-500/30 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-lg text-white placeholder:text-gray-500 pr-12 transition-all"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-300 font-medium text-sm">
                      Confirm Password
                    </Label>
                    <PasswordInput
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="h-11 bg-slate-800/50 border border-emerald-500/30 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-lg text-white placeholder:text-gray-500 pr-12 transition-all"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="flex items-center space-x-2 mt-6">
                    <Checkbox 
                      id="terms"
                      checked={formData.terms}
                      onCheckedChange={(checked) => setFormData({...formData, terms: checked === true})}
                      disabled={loading}
                      className=" border-emerald-500/50 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <Label htmlFor="terms" className="text-sm text-gray-400">
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                      >
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>

                  {error && (
                    <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      {error}
                    </div>
                  )}

                  <Button
                    onClick={handleSignup}
                    disabled={loading}
                    className="w-full h-12 mt-8 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Completing Signup...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        Complete Signup
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </div>

                <div className="mt-6 pb-4 text-center">
                  <p className="text-sm text-gray-400">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="w-16 h-16 text-emerald-500" />
                </div>
                <CardTitle className="text-2xl text-emerald-400 mb-2">
                  Registration Complete!
                </CardTitle>
                <CardDescription className="text-gray-400 text-base">
                  Your FitPlay account has been created successfully! We&apos;ve sent a verification email to{" "}
                  <span className="font-semibold text-emerald-400">{userEmail}</span>.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Email Status */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Mail className="h-5 w-5 text-blue-400" />
                    <span className="font-medium text-blue-300">Check Your Email</span>
                  </div>
                  <p className="text-sm text-blue-300 mb-3">
                    Please check your inbox and click the verification link to activate your account.
                  </p>
                  {resendSuccess && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-2 mb-3">
                      <p className="text-sm text-emerald-300">✅ Verification email resent successfully!</p>
                    </div>
                  )}
                </div>

                {/* Countdown Timer */}
                {countdown > 0 ? (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="h-5 w-5 text-yellow-400" />
                      <span className="font-medium text-yellow-300">Didn't receive the email?</span>
                    </div>
                    <p className="text-sm text-yellow-300 mb-3">
                      You can request a new verification email in <span className="font-bold">{countdown}</span> seconds
                    </p>
                    <Button
                      disabled={true}
                      variant="outline"
                      className="w-full opacity-50 border-yellow-500/30 text-yellow-400"
                    >
                      Resend Verification Email ({countdown}s)
                    </Button>
                  </div>
                ) : (
                  <div className="bg-slate-800/50 border border-emerald-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <span className="font-medium text-gray-300">Still no email?</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      Check your spam folder or request a new verification email
                    </p>
                    <Button
                      onClick={handleResendVerification}
                      disabled={resendLoading}
                      variant="outline"
                      className="w-full border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                    >
                      {resendLoading ? "Sending..." : "Resend Verification Email"}
                    </Button>
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <div className="pt-4">
                  <Button
                    onClick={() => router.push("/login")}
                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold rounded-lg"
                  >
                    Go to Login
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-400">
                    Having trouble?{" "}
                    <a href="mailto:support@fitplay.life" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                      Contact Support
                    </a>
                  </p>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}