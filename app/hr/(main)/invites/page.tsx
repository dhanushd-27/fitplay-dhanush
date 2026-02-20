"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, Users, UserPlus, Link as LinkIcon } from "lucide-react";

interface InviteLink {
  signupLink: string;
  employeeCount: number;
  createdAt: Date;
}

export default function HRInvitePage() {
  const [loading, setLoading] = useState(false);
  const [employeeCount, setEmployeeCount] = useState("");
  const [generatedLinks, setGeneratedLinks] = useState<InviteLink[]>([]);

  // Load saved links from localStorage on mount
  React.useEffect(() => {
    const savedLinks = localStorage.getItem('fitplay-hr-invites');
    if (savedLinks) {
      try {
        const parsed = JSON.parse(savedLinks);
        setGeneratedLinks(parsed);
      } catch (error) {
        console.error('Error loading saved HR invites:', error);
      }
    }
  }, []);

  // Save links to localStorage whenever generatedLinks changes
  React.useEffect(() => {
    if (generatedLinks.length > 0) {
      localStorage.setItem('fitplay-hr-invites', JSON.stringify(generatedLinks));
    }
  }, [generatedLinks]);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup/create-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: "EMPLOYEE",
          // companyName: "", // HR's company will be used automatically
          employeeCount: parseInt(employeeCount)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create invite");
      }

      const newInvite: InviteLink = {
        signupLink: data.signupLink,
        employeeCount: parseInt(employeeCount),
        createdAt: new Date()
      };

      setGeneratedLinks([newInvite, ...generatedLinks]);
      
      toast.success("Employee invitation links created successfully!");
      
      // Reset form
      setEmployeeCount("");

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create invite");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Invite link copied to clipboard!");
  };

  const clearHistory = () => {
    setGeneratedLinks([]);
    localStorage.removeItem('fitplay-hr-invites');
    toast.success("Invite history cleared!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Invitations</h1>
          <p className="text-gray-600">Generate invitation links to share with your employees so they can create their FitPlay accounts</p>
        </div>
      </div>

      {/* Create Invite Form */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="bg-white">
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            Generate Employee Invitations
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-white">
          <form onSubmit={handleCreateInvite} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="employeeCount">Number of Employees *</Label>
              <Input
                id="employeeCount"
                type="number"
                min="1"
                max="100"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(e.target.value)}
                placeholder="Enter number of employees to invite"
                required
                className="max-w-xs bg-white border-gray-300"
              />
              <p className="text-sm text-gray-500">
                This will create invitation slots for the specified number of employees
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? "Creating..." : "Create Employee Invitations"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Generated Links */}
      {generatedLinks.length > 0 && (
        <Card className="bg-white border border-gray-200">
          <CardHeader className="bg-white">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-blue-600" />
                Generated Invitation Links ({generatedLinks.length})
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearHistory}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Clear History
              </Button>
            </div>
          </CardHeader>
          <CardContent className="bg-white">
            <div className="space-y-4">
              {generatedLinks.map((invite, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">EMPLOYEE</Badge>
                        <span className="text-sm text-gray-600">
                          {invite.employeeCount} invitation slots created
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Created: {new Date(invite.createdAt).toLocaleDateString()} at {new Date(invite.createdAt).toLocaleTimeString()}
                      </div>
                      <div className="bg-white p-3 rounded border font-mono text-sm break-all">
                        {invite.signupLink}
                      </div>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(invite.signupLink)}
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">How to Invite Your Employees</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Step 1:</strong> Enter the number of employees you want to invite</li>
                <li>• <strong>Step 2:</strong> Copy the generated invitation link</li>
                <li>• <strong>Step 3:</strong> Share the link with your employees via email, Slack, or Teams</li>
                <li>• <strong>Step 4:</strong> Employees click the link to complete their registration</li>
                <li>• <strong>Note:</strong> Multiple employees can use the same link (first-come, first-served)</li>
                <li>• <strong>Validity:</strong> Links expire after 7 days from creation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}