"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, Users, UserPlus, Link as LinkIcon } from "lucide-react";
import { useSession } from "next-auth/react";

interface Company {
  id: string;
  name: string;
  address: string;
}

interface InviteLink {
  signupLink: string;
  role: string;
  companyName: string;
  employeeCount?: number;
  createdAt: Date;
}

export default function CreateInvitePage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const isHR = session?.user?.role === "HR";

  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [isNewCompany, setIsNewCompany] = useState(false);

  const [formData, setFormData] = useState({
    role: "",
    newCompanyName: "",
    newCompanyAddress: "",
    employeeCount: "",
  });

  const [generatedLinks, setGeneratedLinks] = useState<InviteLink[]>([]);

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch("/api/companies");
        const data = await res.json();
        if (res.ok) {
          setCompanies(data.companies);
        }
      } catch (err) {
        console.error("Failed to load companies");
      }
    };

    fetchCompanies();
  }, []);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        role: formData.role,
      };

      // Company logic
      if (isNewCompany) {
        payload.newCompany = {
          name: formData.newCompanyName,
          address: formData.newCompanyAddress,
        };
      } else {
        payload.companyId = selectedCompanyId;
      }

      if (formData.role === "EMPLOYEE") {
        payload.employeeCount = parseInt(formData.employeeCount);
      }

      const response = await fetch(
        "/api/auth/signup/create-invite",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create invite");
      }

      const companyName = isNewCompany
        ? formData.newCompanyName
        : companies.find((c) => c.id === selectedCompanyId)?.name || "";

      const newInvite: InviteLink = {
        signupLink: data.signupLink,
        role: formData.role,
        companyName,
        employeeCount:
          formData.role === "EMPLOYEE"
            ? parseInt(formData.employeeCount)
            : undefined,
        createdAt: new Date(),
      };

      setGeneratedLinks([newInvite, ...generatedLinks]);

      toast.success("Invitation created successfully!");

      // Reset
      setFormData({
        role: "",
        newCompanyName: "",
        newCompanyAddress: "",
        employeeCount: "",
      });
      setSelectedCompanyId("");
      setIsNewCompany(false);

    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create invite"
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Invite link copied!");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            Generate New Invitation
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleCreateInvite} className="space-y-6">

            {/* Role */}
            <div className="space-y-2">
              <Label>User Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {isAdmin && (
                    <SelectItem value="HR">
                      HR Manager
                    </SelectItem>
                  )}
                  <SelectItem value="EMPLOYEE">
                    Employee
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Company Selection */}
            {isAdmin && (
              <div className="space-y-2">
                <Label>Select Company *</Label>
                <Select
                  value={isNewCompany ? "new" : selectedCompanyId}
                  onValueChange={(value) => {
                    if (value === "new") {
                      setIsNewCompany(true);
                      setSelectedCompanyId("");
                    } else {
                      setIsNewCompany(false);
                      setSelectedCompanyId(value);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                   
                  <SelectContent>
                    <SelectItem value="new">
                      + Create New Company
                    </SelectItem>
                    {companies.map((company) => (
                      <SelectItem
                        key={company.id}
                        value={company.id}
                      >
                        {company.name}
                      </SelectItem>
                    ))}
                   
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* New Company Fields */}
            {isAdmin && isNewCompany && (
              <>
                <div className="space-y-2">
                  <Label>Company Name *</Label>
                  <Input
                    value={formData.newCompanyName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        newCompanyName: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Company Address *</Label>
                  <Input
                    value={formData.newCompanyAddress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        newCompanyAddress: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </>
            )}

            {/* Employee Count */}
            {formData.role === "EMPLOYEE" && (
              <div className="space-y-2">
                <Label>Number of Employees *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.employeeCount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      employeeCount: e.target.value,
                    })
                  }
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? "Creating..." : "Create Invitation"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Generated Links */}
      {generatedLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Generated Invitation Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedLinks.map((invite, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <Badge>
                      {invite.role}
                    </Badge>
                    <p className="font-medium">
                      {invite.companyName}
                    </p>
                    {invite.employeeCount && (
                      <p className="text-sm text-gray-500">
                        {invite.employeeCount} employees
                      </p>
                    )}
                    <div className="font-mono text-xs break-all mt-2">
                      {invite.signupLink}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(invite.signupLink)
                    }
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
