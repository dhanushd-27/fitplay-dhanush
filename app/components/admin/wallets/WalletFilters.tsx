"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Download } from "lucide-react";

interface WalletFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  balanceFilter: string;
  onBalanceFilterChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export function WalletFilters({
  searchTerm,
  onSearchChange,
  balanceFilter,
  onBalanceFilterChange,
  roleFilter,
  onRoleFilterChange,
  sortBy,
  onSortChange,
}: WalletFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search users, email, company..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 w-full sm:w-64"
        />
      </div>
      <Select value={balanceFilter} onValueChange={onBalanceFilterChange}>
        <SelectTrigger className="w-full sm:w-40">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Balance" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Balances</SelectItem>
          <SelectItem value="zero">Zero Balance</SelectItem>
          <SelectItem value="low">Low Balance ({"<"}1000)</SelectItem>
          <SelectItem value="sufficient">Sufficient (≥1000)</SelectItem>
        </SelectContent>
      </Select>
      <Select value={roleFilter} onValueChange={onRoleFilterChange}>
        <SelectTrigger className="w-full sm:w-32">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="EMPLOYEE">Employee</SelectItem>
          <SelectItem value="HR">HR</SelectItem>
        </SelectContent>
      </Select>
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-full sm:w-32">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Name</SelectItem>
          <SelectItem value="balance">Balance</SelectItem>
          <SelectItem value="company">Company</SelectItem>
          <SelectItem value="role">Role</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
    </div>
  );
}
