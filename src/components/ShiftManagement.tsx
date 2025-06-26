
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, DollarSign, Clock, Calculator, CreditCard } from 'lucide-react';
import { usePersonnel } from '@/hooks/usePersonnel';
import { useShifts } from '@/hooks/useShifts';
import { useToast } from '@/hooks/use-toast';
import { BankSelectionDialog } from './BankSelectionDialog';
import { supabase } from '@/integrations/supabase/client';

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

  // Auto-fill card sales when bank amounts change
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
      // Save bank details if card sales exist
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

  // Calculate total expenses and over/short
  const totalExpenses = (parseFloat(cashSales) || 0) + 
                       getBankTotal() + 
                       (parseFloat(veresiye) || 0) + 
                       (parseFloat(bankTransfers) || 0);
  
  const otomasyonValue = parseFloat(otomasyonSatis) || 0;
  const overShort = totalExpenses - otomasyonValue;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Vardiya Kaydet</h2>
          <p className="text-sm md:text-base text-gray-600">Yeni vardiya bilgilerini kaydedin</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          {/* Sol Kolon - Temel Bilgiler */}
          <Card className="shadow-md border bg-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2 text-gray-900">
                <User className="h-5 w-5 text-gray-700" />
                <span>Vardiya Bilgileri</span>
              </CardTitle>
              <CardDescription className="text-gray-600">Personel ve zaman bilgileri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="personnel" className="text-gray-700">Personel Seçin</Label>
                <Select value={selectedPersonnel} onValueChange={setSelectedPersonnel}>
                  <SelectTrigger className="h-11 border-gray-300">
                    <SelectValue placeholder="Personel seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {personnel.map((person) => (
                      <SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start-time" className="text-gray-700">Başlangıç Zamanı</Label>
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
                <Label htmlFor="end-time" className="text-gray-700">Bitiş Zamanı</Label>
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

          {/* Sağ Kolon - Satış Bilgileri */}
          <Card className="shadow-md border bg-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2 text-gray-900">
                <DollarSign className="h-5 w-5 text-gray-700" />
                <span>Satış Bilgileri</span>
              </CardTitle>
              <CardDescription className="text-gray-600">Satış tutarları ve ödeme yöntemleri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otomasyon" className="text-gray-700">Otomasyon Satış (₺)</Label>
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
                <Label htmlFor="cash" className="text-gray-700">Nakit Satış (₺)</Label>
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
                <Label htmlFor="card" className="text-gray-700">Kart Satış (₺)</Label>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
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
                    className="whitespace-nowrap h-11 px-4 border-gray-300 hover:bg-gray-50"
                  >
                    <CreditCard className="h-4 w-4 mr-1" />
                    Banka
                  </Button>
                </div>
                {getBankTotal() > 0 && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
                    Banka toplamı: ₺{getBankTotal().toFixed(2)}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="veresiye" className="text-gray-700">Veresiye (₺)</Label>
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
                <Label htmlFor="bank-transfer" className="text-gray-700">Banka Havale (₺)</Label>
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

        {/* Alt Kısım - Hesaplama ve Kaydet */}
        <Card className="shadow-md border bg-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2 text-gray-900">
              <Calculator className="h-5 w-5 text-gray-700" />
              <span>Açık/Fazla Hesaplama</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border">
              <div className="text-center">
                <p className="text-sm text-gray-600">Otomasyon Satış</p>
                <p className="text-lg font-semibold text-gray-900">₺{otomasyonValue.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Toplam Giderler</p>
                <p className="text-lg font-semibold text-gray-900">₺{totalExpenses.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Açık/Fazla</p>
                <p className={`text-lg font-bold ${overShort >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {overShort >= 0 ? '+' : ''}₺{overShort.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <Button type="button" variant="outline" onClick={resetForm} className="h-11 border-gray-300 hover:bg-gray-50">
                Temizle
              </Button>
              <Button type="submit" disabled={loading} className="h-11 bg-gray-900 hover:bg-gray-800 text-white">
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
