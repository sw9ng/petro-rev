
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, Search, Eye, Phone, MapPin, Edit, Plus, User, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/numberUtils';
import { toast } from 'sonner';
import { CompanyAccountDetailView } from './CompanyAccountDetailView';

interface CompanyAccountsListProps {
  companyId: string;
  onCustomerSelect?: (customerId: string) => void;
}

export const CompanyAccountsList = ({ companyId }: CompanyAccountsListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

  // Company accounts'u getir
  const { data: companyAccounts = [], refetch } = useQuery({
    queryKey: ['company-accounts', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_accounts')
        .select('*')
        .eq('company_id', companyId)
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Gelir ve gider faturalarını getir
  const { data: incomeInvoices = [] } = useQuery({
    queryKey: ['income-invoices', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('income_invoices')
        .select('*')
        .eq('company_id', companyId);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: expenseInvoices = [] } = useQuery({
    queryKey: ['expense-invoices', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_invoices')
        .select('*')
        .eq('company_id', companyId);
      
      if (error) throw error;
      return data;
    },
  });

  const filteredAccounts = companyAccounts.filter(account =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAccountBalance = (accountId: string) => {
    const incomeTotal = incomeInvoices
      .filter(invoice => invoice.account_id === accountId)
      .reduce((sum, invoice) => sum + invoice.amount, 0);
    
    const expenseTotal = expenseInvoices
      .filter(invoice => invoice.account_id === accountId)
      .reduce((sum, invoice) => sum + invoice.amount, 0);
    
    return incomeTotal - expenseTotal;
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'bg-green-100 text-green-800 border-green-200';
    if (balance < 0) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getBalanceText = (balance: number) => {
    if (balance > 0) return `Alacak: ${formatCurrency(balance)}`;
    if (balance < 0) return `Borç: ${formatCurrency(Math.abs(balance))}`;
    return 'Bakiye: ₺0,00';
  };

  const handleCreateAccount = async () => {
    if (!formData.name) {
      toast.error('Cari adı zorunludur');
      return;
    }

    const { error } = await supabase
      .from('company_accounts')
      .insert([{
        company_id: companyId,
        name: formData.name,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        notes: formData.notes || undefined
      }]);

    if (error) {
      toast.error("Cari eklenirken bir hata oluştu.");
      return;
    }

    toast.success("Cari başarıyla eklendi.");
    setIsCreateDialogOpen(false);
    setFormData({ name: '', phone: '', address: '', notes: '' });
    refetch();
  };

  const handleEditAccount = (account: any) => {
    setEditingAccount(account.id);
    setFormData({
      name: account.name,
      phone: account.phone || '',
      address: account.address || '',
      notes: account.notes || ''
    });
  };

  const handleUpdateAccount = async () => {
    if (!editingAccount || !formData.name) {
      toast.error('Cari adı zorunludur');
      return;
    }

    const { error } = await supabase
      .from('company_accounts')
      .update({
        name: formData.name,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        notes: formData.notes || undefined
      })
      .eq('id', editingAccount);

    if (error) {
      toast.error("Cari güncellenirken bir hata oluştu.");
      return;
    }

    toast.success("Cari başarıyla güncellendi.");
    setEditingAccount(null);
    setFormData({ name: '', phone: '', address: '', notes: '' });
    refetch();
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('company_accounts')
        .delete()
        .eq('id', accountId);

      if (error) {
        console.error('Delete error:', error);
        toast.error("Cari silinirken bir hata oluştu: " + error.message);
        return;
      }

      toast.success("Cari başarıyla silindi.");
      refetch();
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error("Beklenmeyen bir hata oluştu.");
    }
  };

  const handleAccountDetail = (accountId: string) => {
    setSelectedAccountId(accountId);
  };

  const handleBack = () => {
    setSelectedAccountId(null);
  };

  // Eğer bir cari seçildiyse detay sayfasını göster
  if (selectedAccountId) {
    return (
      <CompanyAccountDetailView
        accountId={selectedAccountId}
        companyId={companyId}
        onBack={handleBack}
      />
    );
  }

  return (
    <Card className="shadow-sm border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span>Cari Listesi</span>
            </CardTitle>
            <CardDescription>Şirket carilerini görüntüleyin ve yönetin</CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Yeni Cari</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Yeni Cari Ekle</DialogTitle>
                <DialogDescription>
                  Yeni cari hesap bilgilerini girin
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Cari Adı *</Label>
                  <Input 
                    id="name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Cari adı"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input 
                    id="phone" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="0555 123 45 67"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adres</Label>
                  <Input 
                    id="address" 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Adres bilgisi"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notlar</Label>
                  <Textarea 
                    id="notes" 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Ek notlar..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>İptal</Button>
                <Button onClick={handleCreateAccount}>Ekle</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari adı veya telefon ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredAccounts.length > 0 ? (
          <div className="space-y-2">
            {filteredAccounts.map((account) => {
              const balance = getAccountBalance(account.id);
              return (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{account.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          {account.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{account.phone}</span>
                            </div>
                          )}
                          {account.address && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate max-w-48">{account.address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant="outline" 
                          className={`${getBalanceColor(balance)} font-medium`}
                        >
                          {getBalanceText(balance)}
                        </Badge>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditAccount(account)}
                              className="flex items-center space-x-1"
                            >
                              <Edit className="h-4 w-4" />
                              <span>Düzenle</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Cari Düzenle</DialogTitle>
                              <DialogDescription>
                                Cari bilgilerini güncelleyin
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-name">Cari Adı *</Label>
                                <Input 
                                  id="edit-name" 
                                  value={formData.name}
                                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                                  placeholder="Cari adı"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-phone">Telefon</Label>
                                <Input 
                                  id="edit-phone" 
                                  value={formData.phone}
                                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                  placeholder="0555 123 45 67"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-address">Adres</Label>
                                <Input 
                                  id="edit-address" 
                                  value={formData.address}
                                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                                  placeholder="Adres bilgisi"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-notes">Notlar</Label>
                                <Textarea 
                                  id="edit-notes" 
                                  value={formData.notes}
                                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                  placeholder="Ek notlar..."
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setEditingAccount(null)}>İptal</Button>
                              <Button onClick={handleUpdateAccount}>Güncelle</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center space-x-1 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Sil</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cariyi Sil</AlertDialogTitle>
                              <AlertDialogDescription>
                                "{account.name}" carisini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>İptal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteAccount(account.id)}>
                                Sil
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAccountDetail(account.id)}
                          className="flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Detay</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Cari bulunamadı' : 'Henüz cari yok'}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Arama kriterlerinize uygun cari bulunamadı' 
                : 'İlk cariyi ekleyin'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
