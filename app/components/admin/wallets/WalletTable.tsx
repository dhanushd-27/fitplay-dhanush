"use client";

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
import { MoreHorizontal, Edit, User } from "lucide-react";

interface UserWallet {
  id: string;
  email: string;
  name: string;
  role: string;
  company: string;
  balance: number;
  expiryDate: string | null;
}

interface WalletTableProps {
  wallets: UserWallet[];
  onEdit: (wallet: UserWallet) => void;
}

const getBalanceBadge = (balance: number) => {
  if (balance === 0) {
    return <Badge variant="destructive">Zero</Badge>;
  } else if (balance < 1000) {
    return <Badge variant="secondary">Low</Badge>;
  } else {
    return (
      <Badge className="bg-emerald-100 text-emerald-700">Sufficient</Badge>
    );
  }
};

const getRoleBadge = (role: string) => {
  if (role === "HR") {
    return <Badge variant="default">HR</Badge>;
  } else if (role === "EMPLOYEE") {
    return <Badge variant="outline">Employee</Badge>;
  } else {
    return <Badge variant="secondary">{role}</Badge>;
  }
};

export function WalletTable({ wallets, onEdit }: WalletTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Balance</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {wallets.map((wallet) => (
            <TableRow key={wallet.id}>
              <TableCell className="font-medium">{wallet.name}</TableCell>
              <TableCell>{wallet.email}</TableCell>
              <TableCell>{wallet.company}</TableCell>
              <TableCell>{getRoleBadge(wallet.role)}</TableCell>
              <TableCell className="text-right font-medium">
                {wallet.balance.toLocaleString()} credits
                {getBalanceBadge(wallet.balance)}
              </TableCell>
              <TableCell>
                {wallet.expiryDate
                  ? new Date(wallet.expiryDate).toLocaleDateString()
                  : "N/A"}
              </TableCell>
              <TableCell className="text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(wallet)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Credits
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {wallets.length === 0 && (
        <div className="text-center py-8">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No users found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
