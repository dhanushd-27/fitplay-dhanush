"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Gift, Calendar, Check, AlertCircle, Plus } from 'lucide-react';
import { useVouchers, redeemVoucher, type Voucher } from '@/app/hooks/useVouchers';
import { voucherToast } from '@/lib/voucherToast';

export default function VoucherRedemption() {
  const { vouchers, isLoading, mutate } = useVouchers();
  const [isRedeemDialogOpen, setIsRedeemDialogOpen] = useState(false);
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
      setIsRedeemDialogOpen(false);
      setVoucherCode('');
      mutate(); // Refresh vouchers list
    } catch (error) {
      voucherToast.error(error instanceof Error ? error.message : 'Failed to redeem voucher');
    } finally {
      setIsRedeeming(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const isRedeemed = (voucher: Voucher) => {
    return voucher.redemptions.length > 0;
  };

  const getStatusBadge = (voucher: Voucher) => {
    if (isRedeemed(voucher)) {
      return <Badge className="bg-blue-100 text-blue-800">Redeemed</Badge>;
    }
    if (isExpired(voucher.expiryDate)) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    return <Badge className="bg-emerald-100 text-emerald-800">Available</Badge>;
  };

  const availableVouchers = vouchers.filter(v => !isRedeemed(v) && !isExpired(v.expiryDate));
  const redeemedVouchers = vouchers.filter(v => isRedeemed(v));
  const expiredVouchers = vouchers.filter(v => !isRedeemed(v) && isExpired(v.expiryDate));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Vouchers</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-4">Vouchers</h1>
              <p className="text-emerald-100 text-lg">Redeem vouchers to earn wellness credits</p>
            </div>
            
            <Dialog open={isRedeemDialogOpen} onOpenChange={setIsRedeemDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-emerald-600 hover:bg-emerald-50">
                  <Plus className="w-4 h-4 mr-2" />
                  Redeem Voucher
                </Button>
              </DialogTrigger>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-lg">Redeem Voucher</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRedeem} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="voucherCode" className="text-sm font-medium">Voucher Code</Label>
                <Input
                  id="voucherCode"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  placeholder="Enter voucher code"
                  className="uppercase"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-6">
                <Button 
                  type="submit" 
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  disabled={isRedeeming}
                >
                  {isRedeeming ? 'Redeeming...' : 'Redeem Voucher'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsRedeemDialogOpen(false)}
                  disabled={isRedeeming}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold text-emerald-600">{availableVouchers.length}</p>
              </div>
              <Gift className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Redeemed</p>
                <p className="text-2xl font-bold text-blue-600">{redeemedVouchers.length}</p>
              </div>
              <Check className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-red-600">{expiredVouchers.length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Credits</p>
                <p className="text-2xl font-bold text-purple-600">
                  {redeemedVouchers.reduce((acc, v) => acc + v.credits, 0)}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Vouchers */}
      {availableVouchers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Available Vouchers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableVouchers.map((voucher) => (
              <Card key={voucher.id} className="hover:shadow-lg transition-shadow border-emerald-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-mono">{voucher.code}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {voucher.companies.map(c => c.name).join(', ')}
                      </p>
                    </div>
                    {getStatusBadge(voucher)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <span className="text-2xl font-bold text-emerald-600">
                      {voucher.credits} credits
                    </span>
                  </div>
                  
                  {voucher.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{voucher.description}</p>
                  )}
                  
                  <div className="space-y-1 text-sm text-gray-500">
                    <div>Expires: {formatDate(voucher.expiryDate)}</div>
                  </div>

                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      setVoucherCode(voucher.code);
                      setIsRedeemDialogOpen(true);
                    }}
                  >
                    Redeem Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Redeemed Vouchers */}
      {redeemedVouchers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Redeemed Vouchers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {redeemedVouchers.map((voucher) => (
              <Card key={voucher.id} className="opacity-75">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-mono">{voucher.code}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {voucher.companies.map(c => c.name).join(', ')}
                      </p>
                    </div>
                    {getStatusBadge(voucher)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-2xl font-bold text-blue-600">
                      {voucher.credits} credits
                    </span>
                  </div>
                  
                  {voucher.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{voucher.description}</p>
                  )}
                  
                  <div className="space-y-1 text-sm text-gray-500">
                    <div>Redeemed: {formatDate(voucher.redemptions[0].redeemedAt)}</div>
                    <div>Expired: {formatDate(voucher.expiryDate)}</div>
                  </div>

                  <div className="flex items-center justify-center p-2 bg-gray-50 rounded">
                    <Check className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm text-blue-600 font-medium">Already Redeemed</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {vouchers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vouchers available</h3>
            <p className="text-gray-600 mb-4">Check back later for new vouchers from your company</p>
          </CardContent>
        </Card>
      )}

      {/* No Available Vouchers */}
      {vouchers.length > 0 && availableVouchers.length === 0 && redeemedVouchers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No available vouchers</h3>
            <p className="text-gray-600">All vouchers have either been redeemed or expired</p>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}