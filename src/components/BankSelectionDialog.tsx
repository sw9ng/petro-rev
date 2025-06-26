
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

  const getActiveBanks = () => {
    return Object.entries(bankAmounts).filter(([_, amount]) => parseFloat(amount) > 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Banka Bazında Kart Satışları</span>
          </DialogTitle>
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
          
          <div className="p-3 bg-gray-50 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Toplam:</span>
              <span className="font-bold">₺{calculateTotal().toFixed(2)}</span>
            </div>
            
            {getActiveBanks().length > 0 && (
              <div className="border-t pt-2">
                <p className="text-sm font-medium mb-2">Aktif Bankalar:</p>
                {getActiveBanks().map(([bank, amount]) => (
                  <div key={bank} className="flex justify-between text-sm">
                    <span>{bank}:</span>
                    <span>₺{parseFloat(amount).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Button onClick={() => onOpenChange(false)} className="w-full">
          Tamam
        </Button>
      </DialogContent>
    </Dialog>
  );
};
