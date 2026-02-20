"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Eye, AlertTriangle, Tags } from "lucide-react";

interface ProductStatsProps {
  products: any[];
}

export function ProductStats({ products }: ProductStatsProps) {
  const categories = [
    "Fitness_And_Gym_Equipment",
    "Nutrition_And_Health",
    "Diagnostics_And_Prevention",
    "Ergonomics_And_Workspace_Comfort",
    "Health_And_Wellness_Services",
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Card className="py-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-xl font-semibold">{products.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Eye className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Products</p>
              <p className="text-xl font-semibold">
                {products.filter((p: any) => p.status === "active").length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-xl font-semibold">
                {products.filter((p: any) => p.availableStock <= 10).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Tags className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Categories</p>
              <p className="text-xl font-semibold">{categories.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}
