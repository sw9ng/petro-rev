
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Receipt, CreditCard, FileText, Calendar, Banknote, User } from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/numberUtils';
import { toast } from 'sonner';

interface CompanyCashManagementProps {
  companyId: string;
  type?: 'income' | 'expense';
}

export const CompanyCashManagement = ({ companyId, type = 'income' }: CompanyCashManagementProps) => {
  const { invoices, isLoading, createInvoice } = useInvoices(companyId, type);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    description: '',
    amount: '',
    invoice_date: new Date().toISOString().split('T')[0],
    invoice_time: new Date().toTimeString().split(' ')[0].slice(0, 5),
    payment_status: 'unpaid' as 'unpaid' | 'paid',
    tax_number: '',
    company_title: '',
    account_id: '',
    home_collection_amount: ''
  });

  // Company accounts'u getir
  const { data: companyAccounts = [] } = useQuery({
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

  const handleCreateInvoice = async () => {
    if (!newInvoice.description || !newInvoice.amount) {
      toast.error('Açıklama ve tutar zorunludur');
      return;
    }

    if (!newInvoice.account_id) {
      toast.error('Cari seçimi zorunludur');
      return;
    }

    // Ev müşterisi için tahsilat kontrolü
    const selectedAccount = companyAccounts.find(acc => acc.id === newInvoice.account_id);
    const homeCollectionAmount = parseFloat(newInvoice.home_collection_amount) || 0;
    
    if (selectedAccount?.customer_type === 'ev müşterisi' && homeCollectionAmount > 0) {
      if (homeCollectionAmount > (selectedAccount.receivable_amount || 0)) {
        toast.error('Ev tahsilat tutarı alacak tutarından fazla olamaz');
        return;
      }
    }

    try {
      await createInvoice.mutateAsync({
        description: newInvoice.description,
        amount: parseFloat(newInvoice.amount),
        invoice_date: newInvoice.invoice_date,
        payment_status: newInvoice.payment_status,
        tax_number: newInvoice.tax_number || undefined,
        company_title: newInvoice.company_title || undefined,
        account_id: newInvoice.account_id,
        home_collection_amount: homeCollectionAmount,
      });

      // Ev tahsilat varsa account'tan düş
      if (selectedAccount?.customer_type === 'ev müşterisi' && homeCollectionAmount > 0) {
        await supabase
          .from('company_accounts')
          .update({
            receivable_amount: Math.max(0, (selectedAccount.receivable_amount || 0) - homeCollectionAmount)
          })
          .eq('id', newInvoice.account_id);
      }
      
      setNewInvoice({
        description: '',
        amount: '',
        invoice_date: new Date().toISOString().split('T')[0],
        invoice_time: new Date().toTimeString().split(' ')[0].slice(0, 5),
        payment_status: 'unpaid',
        tax_number: '',
        company_title: '',
        account_id: '',
        home_collection_amount: ''
      });
      setIsDialogOpen(false);
      toast.success(`${type === 'income' ? 'Gelir' : 'Gider'} faturası oluşturuldu`);
    } catch (error) {
      toast.error('Fatura oluşturulurken hata oluştu');
    }
  };

  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidAmount = invoices
    .filter(invoice => invoice.payment_status === 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const unpaidAmount = totalAmount - paidAmount;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={type === 'income' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-lg flex items-center space-x-2 ${type === 'income' ? 'text-green-800' : 'text-red-800'}`}>
              <Receipt className="h-4 w-4" />
              <span>Toplam {type === 'income' ? 'Gelir' : 'Gider'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${type === 'income' ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrency(totalAmount)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2 text-blue-800">
              <CreditCard className="h-4 w-4" />
              <span>{type === 'income' ? 'Alınan' : 'Tahsil Edilen'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {formatCurrency(paidAmount)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2 text-orange-800">
              <Banknote className="h-4 w-4" />
              <span>Bekleyen</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">
              {formatCurrency(unpaidAmount)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create New Invoice */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">
          {type === 'income' ? 'Gelir' : 'Gider'} Faturaları
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Yeni {type === 'income' ? 'Gelir' : 'Gider'} Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                Yeni {type === 'income' ? 'Gelir' : 'Gider'} Faturası
              </DialogTitle>
              <DialogDescription>
                {type === 'income' ? 'Gelir' : 'Gider'} faturası bilgilerini girin
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="account_id">Cari Seçimi *</Label>
                <Select
                  value={newInvoice.account_id}
                  onValueChange={(value) => setNewInvoice({...newInvoice, account_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Cari seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {companyAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {account.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={newInvoice.description}
                  onChange={(e) => setNewInvoice({...newInvoice, description: e.target.value})}
                  placeholder="Fatura açıklaması"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Tutar (₺)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={newInvoice.amount}
                  onChange={(e) => setNewInvoice({...newInvoice, amount: e.target.value})}
                  placeholder="0,00"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice_date">Fatura Tarihi</Label>
                  <Input
                    id="invoice_date"
                    type="date"
                    value={newInvoice.invoice_date}
                    onChange={(e) => setNewInvoice({...newInvoice, invoice_date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoice_time">Saat</Label>
                  <Input
                    id="invoice_time"
                    type="time"
                    value={newInvoice.invoice_time}
                    onChange={(e) => setNewInvoice({...newInvoice, invoice_time: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax_number">Vergi No (Opsiyonel)</Label>
                  <Input
                    id="tax_number"
                    value={newInvoice.tax_number}
                    onChange={(e) => setNewInvoice({...newInvoice, tax_number: e.target.value})}
                    placeholder="1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_status">Ödeme Durumu</Label>
                  <Select
                    value={newInvoice.payment_status}
                    onValueChange={(value: 'paid' | 'unpaid') => 
                      setNewInvoice({...newInvoice, payment_status: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid">Ödenmemiş</SelectItem>
                      <SelectItem value="paid">Ödenmiş</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Ev müşterisi seçildiğinde ev tahsilat alanını göster */}
              {(() => {
                const selectedAccount = companyAccounts.find(acc => acc.id === newInvoice.account_id);
                return selectedAccount?.customer_type === 'ev müşterisi' && type === 'income' && (
                  <div className="space-y-2">
                    <Label htmlFor="home_collection_amount">Ev Tahsilat (₺)</Label>
                    <Input
                      id="home_collection_amount"
                      type="number"
                      step="0.01"
                      value={newInvoice.home_collection_amount}
                      onChange={(e) => setNewInvoice({...newInvoice, home_collection_amount: e.target.value})}
                      placeholder="0,00"
                    />
                    <p className="text-xs text-gray-500">
                      Mevcut alacak: {formatCurrency(selectedAccount.receivable_amount || 0)}
                    </p>
                  </div>
                );
              })()}
              
              <div className="space-y-2">
                <Label htmlFor="company_title">Şirket Ünvanı (Opsiyonel)</Label>
                <Input
                  id="company_title"
                  value={newInvoice.company_title}
                  onChange={(e) => setNewInvoice({...newInvoice, company_title: e.target.value})}
                  placeholder="ABC Şirketi Ltd. Şti."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleCreateInvoice}>
                Oluştur
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Invoice List */}
      <div className="space-y-4">
        {invoices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">
                Henüz {type === 'income' ? 'gelir' : 'gider'} faturası bulunmuyor.
              </p>
            </CardContent>
          </Card>
        ) : (
          invoices.map((invoice) => (
            <Card key={invoice.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{invoice.description}</h4>
                      <Badge variant={invoice.payment_status === 'paid' ? 'default' : 'secondary'}>
                        {invoice.payment_status === 'paid' ? 'Ödenmiş' : 'Ödenmemiş'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(invoice.invoice_date).toLocaleDateString('tr-TR')}
                        {invoice.created_at && (
                          <span className="ml-1">
                            {new Date(invoice.created_at).toLocaleTimeString('tr-TR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        )}
                      </div>
                      {invoice.company_accounts?.name && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {invoice.company_accounts.name}
                        </div>
                      )}
                      {invoice.tax_number && (
                        <div>Vergi No: {invoice.tax_number}</div>
                      )}
                      {invoice.company_title && (
                        <div>Şirket: {invoice.company_title}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(invoice.amount)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
