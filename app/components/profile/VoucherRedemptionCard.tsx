"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Gift, Plus, Loader2 } from 'lucide-react';
import { redeemVoucher } from '@/app/hooks/useVouchers';
import { voucherToast } from '@/lib/voucherToast';

interface VoucherRedemptionCardProps {
  onVoucherRedeemed?: () => void;
}

export default function VoucherRedemptionCard({ onVoucherRedeemed }: VoucherRedemptionCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!voucherCode.trim()) {
      voucherToast.error('Please enter a voucher code');
      return;
    }

    try {
      setIsRedeeming(true);
      const result = await redeemVoucher(voucherCode);
      voucherToast.success(result.message, result.credits);
      setIsDialogOpen(false);
      setVoucherCode('');
      if (onVoucherRedeemed) {
        onVoucherRedeemed();
      }
    } catch (error) {
      voucherToast.error(error instanceof Error ? error.message : 'Failed to redeem voucher');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <Card className="border-emerald-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Gift className="w-4 h-4 text-emerald-600" />
            </div>
            <CardTitle className="text-lg">Redeem Voucher</CardTitle>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-1" />
                Redeem
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white">
              <DialogHeader className="pb-4">
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <Gift className="w-5 h-5 text-emerald-600" />
                  Redeem Voucher
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRedeem} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="voucherCode" className="text-sm font-medium">Voucher Code</Label>
                  <Input
                    id="voucherCode"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    placeholder="Enter voucher code"
                    className="uppercase font-mono"
                    autoFocus
                    disabled={isRedeeming}
                  />
                </div>

                <div className="flex gap-3 pt-6">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    disabled={isRedeeming}
                  >
                    {isRedeeming ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Redeeming...
                      </>
                    ) : (
                      <>
                        <Gift className="w-4 h-4 mr-2" />
                        Redeem Voucher
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isRedeeming}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-3">
          Have a voucher code? Redeem it here to add credits to your wallet instantly.
        </p>
        <div className="flex items-center gap-2 text-xs text-emerald-600">
          <Gift className="w-3 h-3" />
          <span>Vouchers add credits directly to your wallet balance</span>
        </div>
      </CardContent>
    </Card>
  );
}