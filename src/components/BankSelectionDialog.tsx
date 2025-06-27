
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreditCard, Plus } from 'lucide-react';

const BANKS = [
  'Ziraat',
  'İş Bankası', 
  'Denizbank',
  'Vakıfbank',
  'Şekerbank',
  'Garanti',
  'Halkbank',
  'Yapıkredi',
  'Diğerleri'
];

interface BankSelectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onBankDetailsUpdate: (details: Array<{bank_name: string, amount: number}>) => void;
  currentDetails: Array<{bank_name: string, amount: number}>;
}

export const BankSelectionDialog = ({ 
  isOpen, 
  onOpenChange, 
  onBankDetailsUpdate,
  currentDetails 
}: BankSelectionDialogProps) => {
  const [bankAmounts, setBankAmounts] = useState<Record<string, string>>(() => {
    const amounts: Record<string, string> = {};
    currentDetails.forEach(detail => {
      amounts[detail.bank_name] = detail.amount.toString();
    });
    return amounts;
  });

  const handleBankAmountChange = (bank: string, amount: string) => {
    setBankAmounts(prev => ({ ...prev, [bank]: amount }));
  };

  const calculateTotal = () => {
    return Object.values(bankAmounts).reduce((sum, amount) => {
      return sum + (parseFloat(amount) || 0);
    }, 0);
  };

  const getActiveBanks = () => {
    return Object.entries(bankAmounts).filter(([_, amount]) => parseFloat(amount) > 0);
  };

  const clearAllAmounts = () => {
    setBankAmounts({});
  };

  const handleSave = () => {
    const details = Object.entries(bankAmounts)
      .filter(([_, amount]) => parseFloat(amount) > 0)
      .map(([bank_name, amount]) => ({
        bank_name,
        amount: parseFloat(amount)
      }));
    
    onBankDetailsUpdate(details);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-white">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center space-x-2 text-gray-900">
            <CreditCard className="h-5 w-5 text-gray-700" />
            <span>Banka Bazında Kart Satışları</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Her banka için ayrı tutarları girin
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BANKS.map((bank) => (
              <div key={bank} className="space-y-2">
                <Label className="text-gray-700 font-medium">{bank}</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={bankAmounts[bank] || ''}
                  onChange={(e) => handleBankAmountChange(bank, e.target.value)}
                  className="h-11 border-gray-300"
                />
              </div>
            ))}
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg border space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Toplam:</span>
              <span className="font-bold text-xl text-gray-900">₺{calculateTotal().toFixed(2)}</span>
            </div>
            
            {getActiveBanks().length > 0 && (
              <div className="border-t pt-4 space-y-2">
                <p className="text-sm font-medium text-gray-900">Aktif Bankalar:</p>
                <div className="space-y-2">
                  {getActiveBanks().map(([bank, amount]) => (
                    <div key={bank} className="flex justify-between text-sm p-2 bg-white rounded border">
                      <span className="text-gray-700 font-medium">{bank}:</span>
                      <span className="text-gray-900 font-semibold">₺{parseFloat(amount).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={clearAllAmounts} 
              className="flex-1 h-11 border-gray-300 hover:bg-gray-50"
            >
              Temizle
            </Button>
            <Button 
              onClick={handleSave} 
              className="flex-1 h-11 bg-gray-900 hover:bg-gray-800 text-white"
            >
              Tamam
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
