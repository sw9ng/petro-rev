import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  amount: number;
  description?: string;
  payment_status: string;
  transaction_type: 'income' | 'expense';
  invoice_number?: string;
}

interface EditTransactionDialogProps {
  transaction: Transaction;
  onTransactionUpdated: () => void;
}

export const EditTransactionDialog = ({ transaction, onTransactionUpdated }: EditTransactionDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: transaction.amount,
    description: transaction.description || '',
    payment_status: transaction.payment_status,
    invoice_number: transaction.invoice_number || ''
  });

  const handleSubmit = async () => {
    try {
      const tableName = transaction.transaction_type === 'income' ? 'income_invoices' : 'expense_invoices';
      
      const { error } = await supabase
        .from(tableName)
        .update({
          amount: formData.amount,
          description: formData.description || undefined,
          payment_status: formData.payment_status,
          invoice_number: formData.invoice_number || undefined
        })
        .eq('id', transaction.id);

      if (error) {
        console.error('Update error:', error);
        toast.error("İşlem güncellenirken bir hata oluştu: " + error.message);
        return;
      }

      toast.success("İşlem başarıyla güncellendi.");
      setIsOpen(false);
      onTransactionUpdated();
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error("Beklenmeyen bir hata oluştu.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center space-x-1">
          <Edit2 className="h-4 w-4" />
          <span>Düzenle</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>İşlem Düzenle</DialogTitle>
          <DialogDescription>
            {transaction.transaction_type === 'income' ? 'Gelir' : 'Gider'} faturası bilgilerini güncelleyin
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Tutar *</Label>
            <Input 
              id="amount" 
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoice-number">Fatura Numarası</Label>
            <Input 
              id="invoice-number" 
              value={formData.invoice_number}
              onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
              placeholder="Fatura numarası"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment-status">Ödeme Durumu</Label>
            <Select value={formData.payment_status} onValueChange={(value) => setFormData({...formData, payment_status: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Ödeme durumunu seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Ödendi</SelectItem>
                <SelectItem value="unpaid">Ödenmedi</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea 
              id="description" 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Ek açıklama..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>İptal</Button>
          <Button onClick={handleSubmit}>Güncelle</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};