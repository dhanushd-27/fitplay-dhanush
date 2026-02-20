

"use client";

import Link from "next/link";
import Image from "next/image";
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
import { Heart, Shield, Users, ArrowRight, Activity, Lock ,ShoppingBag} from "lucide-react";
import PasswordInput from "@/components/password-input";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        rememberMe,
      });

      if (result?.error) {
        toast.error(result.error || "Invalid credentials");
        return;
      }

      const session = await getSession();
      const role = session?.user?.role;

      if (!role) {
        toast.error("Unknown user role");
        console.error("Login successful but role is undefined");
        return;
      }

      toast.success("Login successful!");

      switch (role) {
        case "EMPLOYEE":
          router.replace("/");
          break;
        case "HR":
          router.replace("/hr");
          break;
        case "VENDOR":
          //vendor redirect
          router.replace("/");
          break;
        case "ADMIN":
          router.replace("/admin");
          break;
        default:
          toast.error("Unknown user role");
          console.error("Unknown role:", role);
          break;
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-950 to-emerald-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Smooth animated background */}
      <div className="absolute inset-0 overflow-hidden opacity-40">
        {/* Large slow-moving gradients */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/30 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-green-600/25 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '3s' }}></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '6s' }}></div>
        
        {/* Subtle grid */}
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

      <div className="w-full max-w-6xl relative z-10 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left side - Branding */}
        <div className="hidden lg:flex flex-col justify-center space-y-12 text-white">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-300">Trusted by 25,000+ users</span>
            </div>
            
            <h1 className="text-6xl font-bold leading-tight">
              <span className="block text-white">Welcome to</span>
              <span className="block text-emerald-400 mt-2">Fitplay.life</span>
            </h1>
            
            <p className="text-lg text-gray-400 leading-relaxed max-w-md">
              Your comprehensive platform for workplace wellness, fitness tracking, and health management.
            </p>
          </div>

          <div className="space-y-5">
            {[
              { icon: Shield, title: "Platform", desc: "Let consumers buy through corporate credits & vouchers", color: "emerald" },
              { icon: ShoppingBag, title: "Explore & Shop", desc: "Buy curated wellness products that boost your productivity", color: "emerald" },
              { icon: Lock, title: "Privacy First", desc: "Your data is encrypted and fully protected", color: "emerald" }
            ].map((feature, idx) => (
              <div 
                key={idx}
                className="flex items-start space-x-4 bg-white/5 border border-emerald-500/20 rounded-xl p-5 hover:bg-white/10 transition-all duration-300"
              >
                <div className={`w-12 h-12 bg-${feature.color}-500/20 rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base mb-1 text-white">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Login Card */}
        <div className="w-full">
          <div className="text-center mb-8 lg:hidden">
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
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400">Sign in to your wellness account</p>
          </div>

          <Card className="bg-slate-900/70 backdrop-blur-xl border border-emerald-500/20 shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
            
            <CardHeader className="space-y-2 pt-8 pb-6">
              <div className="hidden lg:flex items-center justify-center mb-4">
                <Image
                  src="/logo.png"
                  alt="FitPlay Logo"
                  width={80}
                  height={80}
                  className="rounded-xl object-contain"
                  priority
                />
              </div>
              <CardTitle className="text-3xl text-center font-bold text-white">
                Sign In
              </CardTitle>
              <CardDescription className="text-center text-gray-400">
                Enter your credentials to continue
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-8 pb-8">
              <div className="space-y-5">
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
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                    className="h-12 bg-slate-800/50 border border-emerald-500/30 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-lg text-white placeholder:text-gray-500 transition-all"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300 font-medium text-sm">
                    Password
                  </Label>
                  <PasswordInput
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                    className="h-12 bg-slate-800/50 border border-emerald-500/30 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-lg text-white placeholder:text-gray-500 pr-12 transition-all"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) =>
                        setRememberMe(checked === true)
                      }
                      disabled={isLoading}
                      className="border-emerald-500/50 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-300 font-medium cursor-pointer">
                      Remember me
                    </Label>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing In...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      Sign In
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </span>
                  )}
                </Button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                  >
                    Create account
                  </Link>
                </p>
              </div>

              {/* Mobile features */}
              <div className="lg:hidden mt-6 pt-6 border-t border-emerald-500/20">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Shield, label: "Secure" },
                    { icon: Users, label: "25K+ Users" },
                    { icon: Heart, label: "Wellness" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center space-y-2 p-3 bg-slate-800/30 border border-emerald-500/20 rounded-lg">
                      <item.icon className="w-5 h-5 text-emerald-400" />
                      <p className="text-xs text-gray-300 font-medium text-center">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}



