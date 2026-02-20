"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Gift, Users, Trash2, Eye } from 'lucide-react';
import { useVouchers, createVoucher, updateVoucher, deleteVoucher, type Voucher } from '@/app/hooks/useVouchers';
import { voucherToast } from '@/lib/voucherToast';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Company {
  id: string;
  name: string;
}

export default function VoucherManagement() {
  const { vouchers, isLoading, mutate } = useVouchers();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [voucherToDelete, setVoucherToDelete] = useState<Voucher | null>(null);

  const { data: companiesData } = useSWR<{ companies: Company[] }>('/api/companies', fetcher);
  const companies = companiesData?.companies || [];

  const [formData, setFormData] = useState({
    companyId: '',
    code: '',
    credits: '',
    description: '',
    expiryDate: '',
    remarks: '',
    userLimit: '',
    restrictions: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyId || !formData.code || !formData.credits || !formData.expiryDate) {
      voucherToast.error('Please fill all required fields');
      return;
    }

    try {


      const result = await createVoucher({
        companyId: formData.companyId,
        code: formData.code,
        credits: parseInt(formData.credits),
        description: formData.description || undefined,
        expiryDate: formData.expiryDate,
      });

      voucherToast.success('Voucher created successfully');
      setIsCreateDialogOpen(false);
      setFormData({
        companyId: '',
        code: '',
        credits: '',
        description: '',
        expiryDate: '',
        remarks: '',
        userLimit: '',
        restrictions: '',
      });
      mutate();
    } catch (error) {
      console.error('Voucher creation error:', error);
      voucherToast.error(error instanceof Error ? error.message : 'Failed to create voucher');
    }
  };

  const handleEdit = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setFormData({
      companyId: voucher.companies[0]?.id || '',
      code: voucher.code,
      credits: voucher.credits.toString(),
      description: voucher.description || '',
      expiryDate: voucher.expiryDate.split('T')[0],
      remarks: voucher.remarks || '',
      userLimit: voucher.userLimit?.toString() || '',
      restrictions: voucher.restrictions || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVoucher || !formData.code || !formData.credits || !formData.expiryDate) {
      voucherToast.error('Please fill all required fields');
      return;
    }

    try {
      await updateVoucher({
        voucherId: selectedVoucher.id,
        companyId: formData.companyId,
        code: formData.code,
        credits: parseInt(formData.credits),
        description: formData.description || undefined,
        expiryDate: formData.expiryDate,
      });

      voucherToast.success('Voucher updated successfully');
      setIsEditDialogOpen(false);
      setFormData({
        companyId: '',
        code: '',
        credits: '',
        description: '',
        expiryDate: '',
      });
      setSelectedVoucher(null);
      mutate();
    } catch (error) {
      voucherToast.error(error instanceof Error ? error.message : 'Failed to update voucher');
    }
  };

  const handleDelete = (voucher: Voucher) => {
    setVoucherToDelete(voucher);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!voucherToDelete) return;

    try {
      await deleteVoucher(voucherToDelete.id);
      voucherToast.success('Voucher deleted successfully');
      mutate();
      setIsDeleteDialogOpen(false);
      setVoucherToDelete(null);
    } catch (error) {
      voucherToast.error(error instanceof Error ? error.message : 'Failed to delete voucher');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const getStatusBadge = (voucher: Voucher) => {
    if (isExpired(voucher.expiryDate)) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    return <Badge className="bg-emerald-100 text-emerald-800">Active</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Voucher Management</h2>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Voucher Management</h2>
          <p className="text-gray-600">Create and manage vouchers for companies</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Voucher
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>Create New Voucher</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="company">Company *</Label>
                <Select value={formData.companyId} onValueChange={(value) => setFormData({ ...formData, companyId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="code">Voucher Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., WELLNESS50"
                  className="uppercase"
                />
              </div>

              <div>
                <Label htmlFor="credits">Credits *</Label>
                <Input
                  id="credits"
                  type="number"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                  placeholder="e.g., 100"
                  min="1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="remarks">Terms & Conditions</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="e.g., Once per user, Valid for first 100 users only"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="userLimit">User Limit</Label>
                <Input
                  id="userLimit"
                  type="number"
                  value={formData.userLimit}
                  onChange={(e) => setFormData({ ...formData, userLimit: e.target.value })}
                  placeholder="Maximum number of users (optional)"
                  min="1"
                />
              </div>

              <div>
                <Label htmlFor="restrictions">Additional Restrictions</Label>
                <Textarea
                  id="restrictions"
                  value={formData.restrictions}
                  onChange={(e) => setFormData({ ...formData, restrictions: e.target.value })}
                  placeholder="Any additional restrictions or conditions"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                  Create Voucher
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Voucher Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>Edit Voucher</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <Label htmlFor="editCompany">Company *</Label>
                <Select value={formData.companyId} onValueChange={(value) => setFormData({ ...formData, companyId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="editCode">Voucher Code *</Label>
                <Input
                  id="editCode"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., WELLNESS50"
                  className="uppercase"
                />
              </div>

              <div>
                <Label htmlFor="editCredits">Credits *</Label>
                <Input
                  id="editCredits"
                  type="number"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                  placeholder="e.g., 100"
                  min="1"
                />
              </div>

              <div>
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="editExpiryDate">Expiry Date *</Label>
                <Input
                  id="editExpiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                  Update Voucher
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete voucher <strong>"{voucherToDelete?.code}"</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setVoucherToDelete(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Vouchers</p>
                <p className="text-2xl font-bold">{vouchers.length}</p>
              </div>
              <Gift className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Vouchers</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {vouchers.filter(v => !isExpired(v.expiryDate)).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expired Vouchers</p>
                <p className="text-2xl font-bold text-red-600">
                  {vouchers.filter(v => isExpired(v.expiryDate)).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Redemptions</p>
                <p className="text-2xl font-bold text-blue-600">
                  {vouchers.reduce((acc, v) => acc + v.redemptions.length, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vouchers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vouchers.map((voucher) => (
          <Card key={voucher.id} className="hover:shadow-lg transition-shadow">
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
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-emerald-600">
                  {voucher.credits} credits
                </span>
              </div>
              
              {voucher.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{voucher.description}</p>
              )}
              
              <div className="space-y-1 text-sm text-gray-500">
                <div>Expires: {formatDate(voucher.expiryDate)}</div>
                <div>Redeemed: {voucher.redemptions.length} times</div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setSelectedVoucher(voucher);
                    setIsDetailDialogOpen(true);
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(voucher)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(voucher)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {vouchers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vouchers yet</h3>
            <p className="text-gray-600 mb-4">Create your first voucher to get started</p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Create First Voucher
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Voucher Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Voucher Details</DialogTitle>
          </DialogHeader>
          {selectedVoucher && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h3 className="text-2xl font-mono font-bold">{selectedVoucher.code}</h3>
                <p className="text-3xl font-bold text-emerald-600 mt-2">
                  {selectedVoucher.credits} credits
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Companies</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedVoucher.companies.map((company) => (
                      <Badge key={company.id} variant="outline">{company.name}</Badge>
                    ))}
                  </div>
                </div>

                {selectedVoucher.description && (
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedVoucher.description}</p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedVoucher)}</div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Expiry Date</Label>
                  <p className="text-sm text-gray-600 mt-1">{formatDate(selectedVoucher.expiryDate)}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Redemptions</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedVoucher.redemptions.length} times redeemed
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm text-gray-600 mt-1">{formatDate(selectedVoucher.createdAt)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}