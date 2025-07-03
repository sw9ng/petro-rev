
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Clock, DollarSign, User } from 'lucide-react';
import { usePersonnel } from '@/hooks/usePersonnel';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/numberUtils';
import { useToast } from '@/hooks/use-toast';
import { Shift } from '@/hooks/useShifts';
import { BankSelectionDialog } from '@/components/BankSelectionDialog';

interface ShiftEditDialogProps {
  shift: Shift | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onShiftUpdated: () => void;
}

interface BankDetail {
  bank_name: string;
  amount: number;
}

export const ShiftEditDialog = ({ shift, isOpen, onOpenChange, onShiftUpdated }: ShiftEditDialogProps) => {
  const { user } = useAuth();
  const { personnel } = usePersonnel();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    personnel_id: '',
    start_time: '',
    end_time: '',
    cash_sales: 0,
    card_sales: 0,
    otomasyon_satis: 0,
    veresiye: 0,
    bank_transfers: 0,
    loyalty_card: 0,
    bank_transfer_description: '',
    shift_number: ''
  });
  
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBankDialog, setShowBankDialog] = useState(false);

  const handleBankDetailsUpdate = (details: BankDetail[]) => {
    setBankDetails(details);
    // Calculate total from bank details and update card_sales
    const totalCardSales = details.reduce((sum, detail) => sum + detail.amount, 0);
    handleInputChange('card_sales', totalCardSales);
  };

  useEffect(() => {
    if (shift && isOpen) {
      const startTime = new Date(shift.start_time);
      const endTime = shift.end_time ? new Date(shift.end_time) : null;
      
      setFormData({
        personnel_id: shift.personnel_id,
        start_time: startTime.toISOString().slice(0, 16),
        end_time: endTime ? endTime.toISOString().slice(0, 16) : '',
        cash_sales: shift.cash_sales,
        card_sales: shift.card_sales,
        otomasyon_satis: shift.otomasyon_satis,
        veresiye: shift.veresiye,
        bank_transfers: shift.bank_transfers,
        loyalty_card: shift.loyalty_card,
        bank_transfer_description: shift.bank_transfer_description || '',
        shift_number: shift.shift_number || ''
      });
      
      fetchBankDetails();
    }
  }, [shift, isOpen]);

  const fetchBankDetails = async () => {
    if (!shift) return;
    
    const { data, error } = await supabase
      .from('shift_bank_details')
      .select('*')
      .eq('shift_id', shift.id);

    if (error) {
      console.error('Error fetching bank details:', error);
    } else {
      setBankDetails(data || []);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateOverShort = () => {
    const totalCollected = formData.cash_sales + formData.card_sales + formData.veresiye + formData.bank_transfers + formData.loyalty_card;
    return totalCollected - formData.otomasyon_satis;
  };

  const handleSave = async () => {
    if (!shift || !user) return;
    
    setLoading(true);
    
    try {
      const overShort = calculateOverShort();
      
      // Update shift data
      const { error: shiftError } = await supabase
        .from('shifts')
        .update({
          personnel_id: formData.personnel_id,
          start_time: formData.start_time,
          end_time: formData.end_time || null,
          cash_sales: formData.cash_sales,
          card_sales: formData.card_sales,
          actual_amount: formData.otomasyon_satis,
          veresiye: formData.veresiye,
          bank_transfers: formData.bank_transfers,
          loyalty_card: formData.loyalty_card,
          over_short: overShort,
          bank_transfer_description: formData.bank_transfer_description,
          shift_number: formData.shift_number || null
        })
        .eq('id', shift.id)
        .eq('station_id', user.id);

      if (shiftError) {
        throw shiftError;
      }

      // Delete existing bank details
      await supabase
        .from('shift_bank_details')
        .delete()
        .eq('shift_id', shift.id);

      // Insert new bank details
      if (bankDetails.length > 0) {
        const bankDetailsToInsert = bankDetails.map(detail => ({
          shift_id: shift.id,
          bank_name: detail.bank_name,
          amount: detail.amount
        }));

        const { error: bankError } = await supabase
          .from('shift_bank_details')
          .insert(bankDetailsToInsert);

        if (bankError) {
          throw bankError;
        }
      }

      toast({
        title: "Başarılı",
        description: "Vardiya başarıyla güncellendi.",
      });
      onShiftUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating shift:', error);
      toast({
        title: "Hata",
        description: "Vardiya güncellenirken bir hata oluştu.",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  if (!shift) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Vardiya Düzenle</span>
          </DialogTitle>
          <DialogDescription>
            Vardiya bilgilerini düzenleyin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personnel and Time */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Temel Bilgiler</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="personnel">Personel</Label>
                  <Select value={formData.personnel_id} onValueChange={(value) => handleInputChange('personnel_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Personel seçin" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg">
                      {personnel.map((person) => (
                        <SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shift_number">Vardiya Numarası</Label>
                  <Select value={formData.shift_number} onValueChange={(value) => handleInputChange('shift_number', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vardiya seçin" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg">
                      <SelectItem value="V1">V1</SelectItem>
                      <SelectItem value="V2">V2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Başlangıç Zamanı</Label>
                  <Input
                    id="start_time"
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => handleInputChange('start_time', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">Bitiş Zamanı</Label>
                  <Input
                    id="end_time"
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => handleInputChange('end_time', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sales Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Satış Bilgileri</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="otomasyon_satis">Otomasyon Satış (₺)</Label>
                  <Input
                    id="otomasyon_satis"
                    type="number"
                    step="0.01"
                    value={formData.otomasyon_satis}
                    onChange={(e) => handleInputChange('otomasyon_satis', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cash_sales">Nakit Satış (₺)</Label>
                  <Input
                    id="cash_sales"
                    type="number"
                    step="0.01"
                    value={formData.cash_sales}
                    onChange={(e) => handleInputChange('cash_sales', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="card_sales">Kart Satış (₺)</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="card_sales"
                      type="number"
                      step="0.01"
                      value={formData.card_sales}
                      onChange={(e) => handleInputChange('card_sales', parseFloat(e.target.value) || 0)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowBankDialog(true)}
                      className="whitespace-nowrap"
                    >
                      Bankalar
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loyalty_card">Sadakat Kartı (₺)</Label>
                  <Input
                    id="loyalty_card"
                    type="number"
                    step="0.01"
                    value={formData.loyalty_card}
                    onChange={(e) => handleInputChange('loyalty_card', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="veresiye">Veresiye (₺)</Label>
                  <Input
                    id="veresiye"
                    type="number"
                    step="0.01"
                    value={formData.veresiye}
                    onChange={(e) => handleInputChange('veresiye', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_transfers">Banka Havale (₺)</Label>
                  <Input
                    id="bank_transfers"
                    type="number"
                    step="0.01"
                    value={formData.bank_transfers}
                    onChange={(e) => handleInputChange('bank_transfers', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_transfer_description">Havale Açıklaması</Label>
                <Textarea
                  id="bank_transfer_description"
                  value={formData.bank_transfer_description}
                  onChange={(e) => handleInputChange('bank_transfer_description', e.target.value)}
                  placeholder="Havale ile ilgili açıklama ekleyin..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center space-x-2">
                <Calculator className="h-4 w-4" />
                <span>Hesaplama Özeti</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Toplam Satış</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(formData.cash_sales + formData.card_sales + formData.veresiye + formData.bank_transfers + formData.loyalty_card)}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Otomasyon</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(formData.otomasyon_satis)}</p>
                </div>
                <div className={`text-center p-3 rounded-lg ${calculateOverShort() >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className="text-sm font-medium text-gray-700">Açık/Fazla</p>
                  <p className={`text-lg font-bold ${calculateOverShort() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {calculateOverShort() >= 0 ? '+' : ''}{formatCurrency(calculateOverShort())}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </div>

        <BankSelectionDialog
          isOpen={showBankDialog}
          onOpenChange={setShowBankDialog}
          onBankDetailsUpdate={handleBankDetailsUpdate}
          currentDetails={bankDetails}
        />
      </DialogContent>
    </Dialog>
  );
};
