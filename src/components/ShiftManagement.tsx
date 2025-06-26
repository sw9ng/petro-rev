
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
  const [cardSales, setCardSales] = useState('');
  const [veresiye, setVeresiye] = useState('');
  const [bankTransfers, setBankTransfers] = useState('');
  const [otomasyonSatis, setOtomasyonSatis] = useState('');
  const [bankAmounts, setBankAmounts] = useState<Record<string, string>>({});
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCardSalesChange = (value: string) => {
    setCardSales(value);
    // Clear bank amounts when card sales change
    setBankAmounts({});
  };

  const openBankDialog = () => {
    if (!cardSales || parseFloat(cardSales) <= 0) {
      toast({
        title: "Uyarı",
        description: "Önce kart satış tutarını girin.",
        variant: "destructive"
      });
      return;
    }
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
    const total = Object.values(amounts).reduce((sum, amount) => {
      return sum + (parseFloat(amount) || 0);
    }, 0);
    if (total > 0) {
      setCardSales(total.toString());
    }
  };

  const resetForm = () => {
    setSelectedPersonnel('');
    setStartDateTime('');
    setEndDateTime('');
    setCashSales('');
    setCardSales('');
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

    const bankTotal = getBankTotal();
    const cardSalesValue = parseFloat(cardSales) || 0;
    
    if (cardSalesValue > 0 && Math.abs(bankTotal - cardSalesValue) > 0.01) {
      toast({
        title: "Uyarı",
        description: `Banka toplamı (₺${bankTotal.toFixed(2)}) kart satışı (₺${cardSalesValue.toFixed(2)}) ile eşleşmiyor.`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

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
                       (parseFloat(cardSales) || 0) + 
                       (parseFloat(veresiye) || 0) + 
                       (parseFloat(bankTransfers) || 0);
  
  const otomasyonValue = parseFloat(otomasyonSatis) || 0;
  const overShort = totalExpenses - otomasyonValue;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Vardiya Kaydet</h2>
          <p className="text-sm md:text-base text-muted-foreground">Yeni vardiya bilgilerini kaydedin</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          {/* Sol Kolon - Temel Bilgiler */}
          <Card className="shadow-sm border-0 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>Vardiya Bilgileri</span>
              </CardTitle>
              <CardDescription>Personel ve zaman bilgileri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="personnel">Personel Seçin</Label>
                <Select value={selectedPersonnel} onValueChange={setSelectedPersonnel}>
                  <SelectTrigger className="h-11">
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
                <Label htmlFor="start-time">Başlangıç Zamanı</Label>
                <Input
                  id="start-time"
                  type="datetime-local"
                  value={startDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-time">Bitiş Zamanı</Label>
                <Input
                  id="end-time"
                  type="datetime-local"
                  value={endDateTime}
                  onChange={(e) => setEndDateTime(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
            </CardContent>
          </Card>

          {/* Sağ Kolon - Satış Bilgileri */}
          <Card className="shadow-sm border-0 bg-gradient-to-br from-green-50 to-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span>Satış Bilgileri</span>
              </CardTitle>
              <CardDescription>Satış tutarları ve ödeme yöntemleri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otomasyon">Otomasyon Satış (₺)</Label>
                <Input
                  id="otomasyon"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={otomasyonSatis}
                  onChange={(e) => setOtomasyonSatis(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cash">Nakit Satış (₺)</Label>
                <Input
                  id="cash"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={cashSales}
                  onChange={(e) => setCashSales(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="card">Kart Satış (₺)</Label>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Input
                    id="card"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={cardSales}
                    onChange={(e) => handleCardSalesChange(e.target.value)}
                    className="h-11 flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={openBankDialog}
                    className="whitespace-nowrap h-11 px-4"
                  >
                    <CreditCard className="h-4 w-4 mr-1" />
                    Banka
                  </Button>
                </div>
                {getBankTotal() > 0 && (
                  <div className="text-sm text-muted-foreground bg-blue-50 p-2 rounded">
                    Banka toplamı: ₺{getBankTotal().toFixed(2)}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="veresiye">Veresiye (₺)</Label>
                <Input
                  id="veresiye"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={veresiye}
                  onChange={(e) => setVeresiye(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank-transfer">Banka Havale (₺)</Label>
                <Input
                  id="bank-transfer"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={bankTransfers}
                  onChange={(e) => setBankTransfers(e.target.value)}
                  className="h-11"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alt Kısım - Hesaplama ve Kaydet */}
        <Card className="shadow-md border-0 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Calculator className="h-5 w-5 text-purple-600" />
              <span>Açık/Fazla Hesaplama</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-white/70 rounded-xl shadow-sm">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Otomasyon Satış</p>
                <p className="text-lg font-semibold text-blue-600">₺{otomasyonValue.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Toplam Giderler</p>
                <p className="text-lg font-semibold text-green-600">₺{totalExpenses.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Açık/Fazla</p>
                <p className={`text-lg font-bold ${overShort >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {overShort >= 0 ? '+' : ''}₺{overShort.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <Button type="button" variant="outline" onClick={resetForm} className="h-11">
                Temizle
              </Button>
              <Button type="submit" disabled={loading} className="h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
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
        totalAmount={parseFloat(cardSales) || 0}
      />
    </div>
  );
};
