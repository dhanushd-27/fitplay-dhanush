"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gift, Plus, Loader2, CheckCircle } from 'lucide-react';
import { redeemVoucher } from '@/app/hooks/useVouchers';
import { voucherToast } from '@/lib/voucherToast';

interface CheckoutVoucherProps {
  onCreditsAdded?: (credits: number) => void;
}

export default function CheckoutVoucherRedemption({ onCreditsAdded }: CheckoutVoucherProps) {
  const [voucherCode, setVoucherCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showRedeemForm, setShowRedeemForm] = useState(false);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!voucherCode.trim()) {
      voucherToast.error('Please enter a voucher code');
      return;
    }

    try {
      setIsRedeeming(true);
      const result = await redeemVoucher(voucherCode);
      voucherToast.success(`Voucher redeemed! ${result.credits} credits added to your wallet`);
      setVoucherCode('');
      setShowRedeemForm(false);
      if (onCreditsAdded) {
        onCreditsAdded(result.credits);
      }
    } catch (error) {
      voucherToast.error(error instanceof Error ? error.message : 'Failed to redeem voucher');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <Card className="border-emerald-200 bg-emerald-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-emerald-800 flex items-center gap-2">
          <Gift className="w-4 h-4" />
          Have a Voucher?
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!showRedeemForm ? (
          <Button 
            onClick={() => setShowRedeemForm(true)}
            variant="outline" 
            size="sm" 
            className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-100"
          >
            <Plus className="w-4 h-4 mr-2" />
            Redeem Voucher Code
          </Button>
        ) : (
          <form onSubmit={handleRedeem} className="space-y-3">
            <div>
                <Label htmlFor="checkoutVoucherCode" className="text-sm font-medium text-gray-700">
                Voucher Code
              </Label>
              <Input
                id="checkoutVoucherCode"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className="uppercase font-mono text-sm h-10 mt-1"
                autoFocus
                disabled={isRedeeming}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                type="submit" 
                size="sm"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-8 text-xs"
                disabled={isRedeeming}
              >
                {isRedeeming ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Redeeming...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Apply
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => {
                  setShowRedeemForm(false);
                  setVoucherCode('');
                }}
                disabled={isRedeeming}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
        
        <p className="text-xs text-gray-600 mt-2">
          Credits from vouchers will be added to your wallet balance
        </p>
      </CardContent>
    </Card>
  );
}