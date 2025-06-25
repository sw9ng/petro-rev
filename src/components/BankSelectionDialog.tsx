
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreditCard } from 'lucide-react';

const BANKS = [
  'Ziraat',
  'İş Bankası', 
  'Denizbank',
  'Vakıfbank',
  'Şekerbank',
  'Garanti',
  'Halkbank',
  'Diğer'
];

interface BankSelectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  bankAmounts: Record<string, string>;
  onBankAmountsChange: (amounts: Record<string, string>) => void;
  totalAmount: number;
}

export const BankSelectionDialog = ({ 
  isOpen, 
  onOpenChange, 
  bankAmounts, 
  onBankAmountsChange,
  totalAmount 
}: BankSelectionDialogProps) => {
  const handleBankAmountChange = (bank: string, amount: string) => {
    const newAmounts = { ...bankAmounts, [bank]: amount };
    onBankAmountsChange(newAmounts);
  };

  const calculateTotal = () => {
    return Object.values(bankAmounts).reduce((sum, amount) => {
      return sum + (parseFloat(amount) || 0);
    }, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Banka Bazında Kart Satışları</DialogTitle>
          <DialogDescription>Her banka için ayrı tutarları girin</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {BANKS.map((bank) => (
            <div key={bank} className="space-y-2">
              <Label>{bank}</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={bankAmounts[bank] || ''}
                onChange={(e) => handleBankAmountChange(bank, e.target.value)}
              />
            </div>
          ))}
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Toplam:</span>
              <span className="font-bold">₺{calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        <Button onClick={() => onOpenChange(false)} className="w-full">
          Tamam
        </Button>
      </DialogContent>
    </Dialog>
  );
};
