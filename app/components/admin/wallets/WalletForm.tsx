"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Save, Minus, Plus } from "lucide-react";

interface UserWallet {
  id: string;
  email: string;
  name: string;
  role: string;
  company: string;
  balance: number;
  expiryDate: string | null;
}

interface WalletFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (userId: string, creditAmount: number) => void;
  editingWallet: UserWallet | null;
  loading?: boolean;
}

export function WalletForm({
  isOpen,
  onOpenChange,
  onSubmit,
  editingWallet,
  loading = false,
}: WalletFormProps) {
  const [creditAmount, setCreditAmount] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWallet || creditAmount === 0) return;

    onSubmit(editingWallet.id, creditAmount);
    setCreditAmount(0);
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setCreditAmount(0);
    }
  };

  const quickAmounts = [100, 500, 1000, -100, -500];

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update {editingWallet?.name}'s Wallet</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Current Balance</Label>
            <div className="text-lg font-semibold">
              {editingWallet?.balance.toLocaleString()} credits
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="creditAmount">
              Credit Amount{" "}
              <span className="text-sm text-gray-500">
                (positive to add, negative to deduct)
              </span>
            </Label>
            <Input
              id="creditAmount"
              type="number"
              value={creditAmount}
              onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
              placeholder="e.g., 500 or -100"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Quick Actions</Label>
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCreditAmount(amount)}
                  className={`${
                    amount > 0
                      ? "border-green-500 text-green-600 hover:bg-green-50"
                      : "border-red-500 text-red-600 hover:bg-red-50"
                  }`}
                >
                  {amount > 0 ? (
                    <Plus className="h-3 w-3 mr-1" />
                  ) : (
                    <Minus className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(amount)}
                </Button>
              ))}
            </div>
          </div>

          {creditAmount !== 0 && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  New Balance: {(editingWallet?.balance || 0) + creditAmount}{" "}
                  credits
                </div>
                <div className="text-xs text-gray-500">
                  {creditAmount > 0 ? "Adding" : "Deducting"}{" "}
                  {Math.abs(creditAmount)} credits
                </div>
              </div>
            </div>
          )}

          <Separator />

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || creditAmount === 0}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? (
                "Updating..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Credits
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
