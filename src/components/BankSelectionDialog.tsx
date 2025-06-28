
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

interface BankDetail {
  bank_name: string;
  amount: number;
}

interface BankSelectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onBankDetailsUpdate: (details: BankDetail[]) => void;
  currentDetails: BankDetail[];
}

const defaultBanks = [
  'Ziraat Bankası',
  'İş Bankası', 
  'Garanti BBVA',
  'Yapı Kredi',
  'Akbank',
  'Halkbank',
  'Vakıfbank',
  'QNB Finansbank',
  'DenizBank',
  'TEB'
];

export const BankSelectionDialog = ({ isOpen, onOpenChange, onBankDetailsUpdate, currentDetails }: BankSelectionDialogProps) => {
  const [bankDetails, setBankDetails] = useState<BankDetail[]>(currentDetails);

  useEffect(() => {
    setBankDetails(currentDetails);
  }, [currentDetails]);

  const addBankDetail = () => {
    setBankDetails(prev => [...prev, { bank_name: '', amount: 0 }]);
  };

  const removeBankDetail = (index: number) => {
    setBankDetails(prev => prev.filter((_, i) => i !== index));
  };

  const updateBankDetail = (index: number, field: keyof BankDetail, value: string | number) => {
    setBankDetails(prev => prev.map((detail, i) => 
      i === index ? { ...detail, [field]: value } : detail
    ));
  };

  const handleSave = () => {
    const validDetails = bankDetails.filter(detail => detail.bank_name && detail.amount > 0);
    onBankDetailsUpdate(validDetails);
    onOpenChange(false);
  };

  const totalAmount = bankDetails.reduce((sum, detail) => sum + (detail.amount || 0), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Kart Satış Detayları</DialogTitle>
          <DialogDescription>
            Hangi bankalardan ne kadar kart satışı yapıldığını girin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {bankDetails.map((detail, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
              <div className="flex-1">
                <Label>Banka Adı</Label>
                <select
                  value={detail.bank_name}
                  onChange={(e) => updateBankDetail(index, 'bank_name', e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="">Banka seçin</option>
                  {defaultBanks.map(bank => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <Label>Tutar (₺)</Label>
                <Input
                  type="number"
                  step="0.001"
                  value={detail.amount}
                  onChange={(e) => updateBankDetail(index, 'amount', parseFloat(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeBankDetail(index)}
                className="mt-6"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addBankDetail}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Banka Ekle
          </Button>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-lg font-semibold">
            Toplam: ₺{totalAmount.toFixed(2)}
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button onClick={handleSave}>
              Kaydet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
