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
import { Search, Filter } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface ProductFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  stockFilter: string;
  onStockFilterChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

// Friendly category name mapping
const getFriendlyCategoryName = (category: string) => {
  const friendlyNames: Record<string, string> = {
    Fitness_And_Gym_Equipment: "Fitness & Gym Equipment",
    Nutrition_And_Health: "Nutrition & Health Foods",
    Diagnostics_And_Prevention: "Diagnostics & Prevention",
    Ergonomics_And_Workspace_Comfort: "Ergonomics & Workspace Comfort",
    Health_And_Wellness_Services: "Health & Wellness Services",
  };
  return friendlyNames[category] || category;
};

const categories = [
  "Fitness_And_Gym_Equipment",
  "Nutrition_And_Health",
  "Diagnostics_And_Prevention",
  "Ergonomics_And_Workspace_Comfort",
  "Health_And_Wellness_Services",
];

export function ProductFilters({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  statusFilter,
  onStatusFilterChange,
  stockFilter,
  onStockFilterChange,
  sortBy,
  onSortChange,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search products, vendors, SKU..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 w-full sm:w-64"
        />
      </div>
      <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
        <SelectTrigger className="w-full sm:w-40">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {getFriendlyCategoryName(category)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-full sm:w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
      <Select value={stockFilter} onValueChange={onStockFilterChange}>
        <SelectTrigger className="w-full sm:w-32">
          <SelectValue placeholder="Stock" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Stock</SelectItem>
          <SelectItem value="in_stock">In Stock (&gt;10)</SelectItem>
          <SelectItem value="low">Low Stock (1-10)</SelectItem>
          <SelectItem value="out">Out of Stock (0)</SelectItem>
        </SelectContent>
      </Select>
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-full sm:w-32">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Name</SelectItem>
          <SelectItem value="credits">Credits</SelectItem>
          <SelectItem value="stock">Stock</SelectItem>
          <SelectItem value="created">Date Created</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
