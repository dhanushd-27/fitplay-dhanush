"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { User, Key, Mail, Shield } from "lucide-react";
import PasswordInput from "@/components/password-input";

export default function AdminProfilePage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'password' | 'email'>('password');
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    verificationEmail: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    // Validate verification method
    if (verificationMethod === 'password' && !passwordData.currentPassword.trim()) {
      toast.error("Please enter your current password");
      return;
    }

    if (verificationMethod === 'email' && !passwordData.verificationEmail.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    if (verificationMethod === 'email' && passwordData.verificationEmail !== session?.user?.email) {
      toast.error("Email address does not match your account");
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          verificationMethod,
          currentPassword: verificationMethod === 'password' ? passwordData.currentPassword : undefined,
          verificationEmail: verificationMethod === 'email' ? passwordData.verificationEmail : undefined,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to change password");
      }

      toast.success("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        verificationEmail: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
        <p className="text-gray-600 mt-2">Manage your admin account settings and security</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-600" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={session?.user?.name || ""}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={session?.user?.email || ""}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                  Administrator
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-emerald-600" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {/* Verification Method Selector */}
              <div className="space-y-2">
                <Label>Verification Method</Label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="verificationMethod"
                      value="password"
                      checked={verificationMethod === 'password'}
                      onChange={(e) => setVerificationMethod('password')}
                      className="text-emerald-600"
                    />
                    <span className="text-sm">Current Password</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="verificationMethod"
                      value="email"
                      checked={verificationMethod === 'email'}
                      onChange={(e) => setVerificationMethod('email')}
                      className="text-emerald-600"
                    />
                    <span className="text-sm">Email Verification</span>
                  </label>
                </div>
              </div>

              {/* Conditional Verification Fields */}
              {verificationMethod === 'password' && (
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <PasswordInput
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    placeholder="Enter current password"
                    required
                  />
                </div>
              )}

              {verificationMethod === 'email' && (
                <div className="space-y-2">
                  <Label htmlFor="verificationEmail">Email Address</Label>
                  <Input
                    type="email"
                    name="verificationEmail"
                    value={passwordData.verificationEmail}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, verificationEmail: e.target.value })
                    }
                    placeholder="Enter your registered email address"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Enter the email address associated with your admin account
                  </p>
                </div>
              )}
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <PasswordInput
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  placeholder="Enter new password"
                  required
                />
                <p className="text-xs text-gray-500">
                  Password must be at least 8 characters long
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <PasswordInput
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoading ? "Changing Password..." : "Change Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Security Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            Security Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Last Login</Label>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Account Status</Label>
              <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                Active
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}