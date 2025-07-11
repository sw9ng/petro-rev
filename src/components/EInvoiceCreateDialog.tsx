
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInvoices } from '@/hooks/useInvoices';
import { toast } from 'sonner';

interface EInvoiceCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  onSuccess: () => void;
}

export const EInvoiceCreateDialog = ({ open, onOpenChange, companyId, onSuccess }: EInvoiceCreateDialogProps) => {
  const { accounts, addIncomeInvoice, addExpenseInvoice } = useInvoices(companyId);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    invoice_number: '',
    description: '',
    amount: '',
    invoice_date: new Date().toISOString().split('T')[0],
    account_id: '',
    tax_number: '',
    company_title: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const invoiceData = {
        invoice_number: formData.invoice_number,
        description: formData.description,
        amount: parseFloat(formData.amount),
        invoice_date: formData.invoice_date,
        account_id: formData.account_id || undefined,
        tax_number: formData.tax_number,
        company_title: formData.company_title,
        payment_status: 'unpaid' as const
      };

      const result = formData.type === 'income' 
        ? await addIncomeInvoice(invoiceData)
        : await addExpenseInvoice(invoiceData);

      if (result.error) {
        toast.error('Fatura oluşturulamadı');
        return;
      }

      toast.success('E-fatura başarıyla oluşturuldu');
      onSuccess();
      setFormData({
        type: 'income',
        invoice_number: '',
        description: '',
        amount: '',
        invoice_date: new Date().toISOString().split('T')[0],
        account_id: '',
        tax_number: '',
        company_title: ''
      });
    } catch (error) {
      console.error('E-fatura oluşturma hatası:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Yeni E-Fatura Oluştur</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Fatura Türü</Label>
            <Select value={formData.type} onValueChange={(value: 'income' | 'expense') => setFormData({...formData, type: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Gelir Faturası</SelectItem>
                <SelectItem value="expense">Gider Faturası</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoice_number">Fatura Numarası</Label>
            <Input
              id="invoice_number"
              value={formData.invoice_number}
              onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
              placeholder="FTR-2024-001"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Fatura açıklaması"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Tutar (₺)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoice_date">Fatura Tarihi</Label>
            <Input
              id="invoice_date"
              type="date"
              value={formData.invoice_date}
              onChange={(e) => setFormData({...formData, invoice_date: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax_number">Vergi Numarası</Label>
            <Input
              id="tax_number"
              value={formData.tax_number}
              onChange={(e) => setFormData({...formData, tax_number: e.target.value})}
              placeholder="1234567890"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_title">Şirket Unvanı</Label>
            <Input
              id="company_title"
              value={formData.company_title}
              onChange={(e) => setFormData({...formData, company_title: e.target.value})}
              placeholder="ABC Ltd. Şti."
            />
          </div>

          {accounts.length > 0 && (
            <div className="space-y-2">
              <Label>Cari Hesap</Label>
              <Select value={formData.account_id} onValueChange={(value) => setFormData({...formData, account_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Cari hesap seçin (opsiyonel)" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Oluşturuluyor...' : 'Oluştur'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
