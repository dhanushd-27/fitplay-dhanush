"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Edit,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Trash2,
  Package,
} from "lucide-react";
import { getLowestCredits, getLowestMRP } from "@/lib/utils";
import { ProductWithVariant } from "@/lib/types";

interface ProductTableProps {
  products: any[];
  onEdit: (product: any) => void;
  onDelete: (id: string) => void;
}

// Friendly category name mapping
const getFriendlyCategoryName = (name?: string) => {
  return name || "Unassigned";
};


const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
          Active
        </Badge>
      );
    case "inactive":
      return <Badge variant="secondary">Inactive</Badge>;
    case "out_of_stock":
      return <Badge variant="destructive">Out of Stock</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getStockBadge = (stock: number) => {
  if (stock === 0) {
    return <Badge variant="destructive">Out of Stock</Badge>;
  } else if (stock <= 10) {
    return (
      <Badge variant="outline" className="border-orange-500 text-orange-600">
        Low Stock
      </Badge>
    );
  } else if (stock <= 50) {
    return (
      <Badge variant="outline" className="border-yellow-500 text-yellow-600">
        Medium
      </Badge>
    );
  } else {
    return (
      <Badge variant="outline" className="border-emerald-500 text-emerald-600">
        In Stock
      </Badge>
    );
  }
};

export function ProductTable({
  products,
  onEdit,
  onDelete,
}: ProductTableProps) {
  const router = useRouter();

  const handleViewDetails = (product: any) => {
    router.push(`/admin/products/${product.id}`);
  };

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 px-1">Image</TableHead>
            <TableHead className="min-w-[180px] px-2">Product</TableHead>
            <TableHead className="min-w-[120px] px-2">Brand/Vendor</TableHead>
            <TableHead className="min-w-[140px] px-2">Category</TableHead>
            <TableHead className="text-center w-16 px-1">Credits</TableHead>
            <TableHead className="text-center w-16 px-1">₹ Price</TableHead>
            <TableHead className="text-center w-16 px-1">Stock</TableHead>
            <TableHead className="text-center w-20 px-1">Status</TableHead>
            <TableHead className="text-center w-12 px-1">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product: any) => (
            <TableRow 
              key={product.id} 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleViewDetails(product)}
            >
              <TableCell className="w-12 px-1">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="min-w-[180px] px-2">
                <div className="space-y-1">
                  <div className="font-medium text-sm text-gray-900 truncate" title={product.name}>
                    {product.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate" title={product.sku}>
                    {product.sku}
                  </div>
                </div>
              </TableCell>
              <TableCell className="min-w-[120px] px-2">
                <div>
                  <div className="font-medium text-sm truncate" title={product.vendor?.name || 'No Vendor'}>{product.vendor?.name || 'No Vendor'}</div>
                  <div className="text-xs text-gray-400">
                    {product.vendor?.name ? 'Verified' : 'Unassigned'}
                  </div>
                </div>
              </TableCell>
              <TableCell className="min-w-[140px] px-2">
                <Badge variant="outline" className="text-xs max-w-full truncate" title={getFriendlyCategoryName(product.category?.name) || product.categoryOld || 'Nutrition & Health Foods'}>
                  {getFriendlyCategoryName(product.category?.name) || product.categoryOld || 'Nutrition & Health Foods'}
                </Badge>
              </TableCell>
              <TableCell className="text-right w-16 px-1">
                <span className="text-xs font-medium">{getLowestCredits(product as ProductWithVariant)}</span>
              </TableCell>
              <TableCell className="text-right w-16 px-1">
                <span className="text-xs font-medium">₹{getLowestMRP(product as ProductWithVariant)}</span>
              </TableCell>
              <TableCell className="text-center w-16 px-2">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-medium">{product.availableStock}</span>
                  {getStockBadge(product.availableStock)}
                </div>
              </TableCell>
              <TableCell className="text-center w-20">
                {getStatusBadge(product.status || "active")}
              </TableCell>
              <TableCell className="text-center w-16 px-2" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(product)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Product
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewDetails(product)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Product
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {products.length === 0 && (
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            No products found matching your criteria
          </p>
        </div>
      )}
    </div>
  );
}
