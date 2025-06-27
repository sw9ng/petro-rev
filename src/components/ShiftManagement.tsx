
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, DollarSign, Calculator, CreditCard } from 'lucide-react';
import { usePersonnel } from '@/hooks/usePersonnel';
import { useShifts } from '@/hooks/useShifts';
import { useToast } from '@/hooks/use-toast';
import { BankSelectionDialog } from './BankSelectionDialog';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, formatNumber } from '@/lib/numberUtils';

export const ShiftManagement = () => {
  const { toast } = useToast();
  const { personnel } = usePersonnel();
  const { addShift } = useShifts();
  
  const [selectedPersonnel, setSelectedPersonnel] = useState('');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [cashSales, setCashSales] = useState('');
  const [veresiye, setVeresiye] = useState('');
  const [bankTransfers, setBankTransfers] = useState('');
  const [otomasyonSatis, setOtomasyonSatis] = useState('');
  const [bankAmounts, setBankAmounts] = useState<Record<string, string>>({});
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const openBankDialog = () => {
    setBankDialogOpen(true);
  };

  const getBankTotal = () => {
    return Object.values(bankAmounts).reduce((sum, amount) => {
      return sum + (parseFloat(amount) || 0);
    }, 0);
  };

  const handleBankAmountsChange = (amounts: Record<string, string>) => {
    setBankAmounts(amounts);
  };

  const resetForm = () => {
    setSelectedPersonnel('');
    setStartDateTime('');
    setEndDateTime('');
    setCashSales('');
    setVeresiye('');
    setBankTransfers('');
    setOtomasyonSatis('');
    setBankAmounts({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPersonnel || !startDateTime || !endDateTime) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen tüm zorunlu alanları doldurun.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const cardSalesValue = getBankTotal();

    const shiftData = {
      personnel_id: selectedPersonnel,
      start_time: startDateTime,
      end_time: endDateTime,
      cash_sales: parseFloat(cashSales) || 0,
      card_sales: cardSalesValue,
      veresiye: parseFloat(veresiye) || 0,
      bank_transfers: parseFloat(bankTransfers) || 0,
      otomasyon_satis: parseFloat(otomasyonSatis) || 0
    };

    const { data, error } = await addShift(shiftData);

    if (error) {
      console.error('Error adding shift:', error);
      toast({
        title: "Hata",
        description: "Vardiya kaydedilirken bir hata oluştu.",
        variant: "destructive"
      });
    } else if (data) {
      if (cardSalesValue > 0 && Object.keys(bankAmounts).length > 0) {
        const bankDetailsToSave = Object.entries(bankAmounts)
          .filter(([_, amount]) => parseFloat(amount) > 0)
          .map(([bank, amount]) => ({
            shift_id: data.id,
            bank_name: bank,
            amount: parseFloat(amount)
          }));

        if (bankDetailsToSave.length > 0) {
          try {
            const { error: bankError } = await supabase
              .from('shift_bank_details')
              .insert(bankDetailsToSave);

            if (bankError) {
              console.error('Error saving bank details:', bankError);
              toast({
                title: "Uyarı",
                description: "Vardiya kaydedildi ancak banka detayları kaydedilemedi.",
                variant: "destructive"
              });
            }
          } catch (bankError) {
            console.error('Error saving bank details:', bankError);
          }
        }
      }

      toast({
        title: "Vardiya Kaydedildi",
        description: "Vardiya başarıyla kaydedildi.",
      });
      resetForm();
    }

    setLoading(false);
  };

  const totalExpenses = (parseFloat(cashSales) || 0) + 
                       getBankTotal() + 
                       (parseFloat(veresiye) || 0) + 
                       (parseFloat(bankTransfers) || 0);
  
  const otomasyonValue = parseFloat(otomasyonSatis) || 0;
  const overShort = totalExpenses - otomasyonValue;

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Vardiya Kaydet</h2>
        <p className="text-sm lg:text-base text-gray-600">Yeni vardiya bilgilerini kaydedin</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Vardiya Bilgileri */}
          <Card className="shadow-sm border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center space-x-2 text-gray-900">
                <User className="h-5 w-5 text-gray-700" />
                <span>Vardiya Bilgileri</span>
              </CardTitle>
              <CardDescription className="text-gray-600">Personel ve zaman bilgileri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="personnel" className="text-gray-700 font-medium">Personel Seçin</Label>
                <Select value={selectedPersonnel} onValueChange={setSelectedPersonnel}>
                  <SelectTrigger className="h-11 border-gray-300">
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
                <Label htmlFor="start-time" className="text-gray-700 font-medium">Başlangıç Zamanı</Label>
                <Input
                  id="start-time"
                  type="datetime-local"
                  value={startDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                  required
                  className="h-11 border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-time" className="text-gray-700 font-medium">Bitiş Zamanı</Label>
                <Input
                  id="end-time"
                  type="datetime-local"
                  value={endDateTime}
                  onChange={(e) => setEndDateTime(e.target.value)}
                  required
                  className="h-11 border-gray-300"
                />
              </div>
            </CardContent>
          </Card>

          {/* Satış Bilgileri */}
          <Card className="shadow-sm border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center space-x-2 text-gray-900">
                <DollarSign className="h-5 w-5 text-gray-700" />
                <span>Satış Bilgileri</span>
              </CardTitle>
              <CardDescription className="text-gray-600">Satış tutarları ve ödeme yöntemleri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otomasyon" className="text-gray-700 font-medium">Otomasyon Satış (₺)</Label>
                <Input
                  id="otomasyon"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={otomasyonSatis}
                  onChange={(e) => setOtomasyonSatis(e.target.value)}
                  className="h-11 border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cash" className="text-gray-700 font-medium">Nakit Satış (₺)</Label>
                <Input
                  id="cash"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={cashSales}
                  onChange={(e) => setCashSales(e.target.value)}
                  className="h-11 border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="card" className="text-gray-700 font-medium">Kart Satış (₺)</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    id="card"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={getBankTotal().toFixed(2)}
                    readOnly
                    className="h-11 flex-1 border-gray-300 bg-gray-50"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={openBankDialog}
                    className="h-11 px-4 border-gray-300 hover:bg-gray-50 whitespace-nowrap"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Banka Detayları
                  </Button>
                </div>
                {getBankTotal() > 0 && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border">
                    <span className="font-medium">Toplam banka tutarı: ₺{getBankTotal().toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="veresiye" className="text-gray-700 font-medium">Veresiye (₺)</Label>
                <Input
                  id="veresiye"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={veresiye}
                  onChange={(e) => setVeresiye(e.target.value)}
                  className="h-11 border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank-transfer" className="text-gray-700 font-medium">Banka Havale (₺)</Label>
                <Input
                  id="bank-transfer"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={bankTransfers}
                  onChange={(e) => setBankTransfers(e.target.value)}
                  className="h-11 border-gray-300"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hesaplama ve Kaydet */}
        <Card className="shadow-sm border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center space-x-2 text-gray-900">
              <Calculator className="h-5 w-5 text-gray-700" />
              <span>Açık/Fazla Hesaplama</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border">
              <div className="text-center">
                <p className="text-sm text-gray-600 font-medium">Otomasyon Satış</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(otomasyonValue)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 font-medium">Toplam Giderler</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(totalExpenses)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 font-medium">Açık/Fazla</p>
                <p className={`text-lg font-bold ${overShort >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {overShort >= 0 ? '+' : ''}{formatCurrency(overShort)}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={resetForm} 
                className="h-11 border-gray-300 hover:bg-gray-50 order-2 sm:order-1"
              >
                Temizle
              </Button>
              <Button 
                type="submit" 
                disabled={loading} 
                className="h-11 bg-gray-900 hover:bg-gray-800 text-white order-1 sm:order-2"
              >
                {loading ? 'Kaydediliyor...' : 'Vardiya Kaydet'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <BankSelectionDialog
        isOpen={bankDialogOpen}
        onOpenChange={setBankDialogOpen}
        bankAmounts={bankAmounts}
        onBankAmountsChange={handleBankAmountsChange}
        totalAmount={getBankTotal()}
      />
    </div>
  );
};
