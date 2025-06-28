import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, DollarSign, Users, AlertCircle, CreditCard } from 'lucide-react';
import { useShifts } from '@/hooks/useShifts';
import { usePersonnel } from '@/hooks/usePersonnel';
import { useCustomers } from '@/hooks/useCustomers';
import { useCustomerTransactions } from '@/hooks/useCustomerTransactions';
import { BankSelectionDialog } from './BankSelectionDialog';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/numberUtils';
import { Textarea } from '@/components/ui/textarea';

// Function to determine shift date based on start time
const getShiftDate = (startDateTime: string) => {
  const startTime = new Date(startDateTime);
  const hour = startTime.getHours();
  const minute = startTime.getMinutes();
  
  // If shift starts after 22:55, it belongs to the next day
  if (hour > 22 || (hour === 22 && minute >= 55)) {
    const nextDay = new Date(startTime);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
  }
  
  return startTime.toISOString().split('T')[0];
};

export const ShiftManagement = () => {
  const { toast } = useToast();
  const { addShift } = useShifts();
  const { personnel } = usePersonnel();
  const { customers } = useCustomers();
  const { addVeresiye } = useCustomerTransactions();
  const [showBankDialog, setShowBankDialog] = useState(false);
  const [bankDetails, setBankDetails] = useState<Array<{bank_name: string, amount: number}>>([]);
  
  const [shiftData, setShiftData] = useState({
    personnel_id: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    cash_sales: 0,
    card_sales: 0,
    otomasyon_satis: 0,
    veresiye: 0,
    customer_id: '',
    bank_transfers: 0,
    loyalty_card: 0,
    bank_transfer_description: ''
  });

  // Set default date to today
  useEffect(() => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    setShiftData(prev => ({
      ...prev,
      start_date: dateStr,
      end_date: dateStr
    }));
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setShiftData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBankDetailsUpdate = (details: Array<{bank_name: string, amount: number}>) => {
    setBankDetails(details);
    const totalCardSales = details.reduce((sum, detail) => sum + detail.amount, 0);
    setShiftData(prev => ({
      ...prev,
      card_sales: totalCardSales
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shiftData.personnel_id || !shiftData.start_date || !shiftData.start_time || !shiftData.end_date || !shiftData.end_time) {
      toast({
        title: "Hata",
        description: "Lütfen tüm zorunlu alanları doldurun.",
        variant: "destructive"
      });
      return;
    }

    if (shiftData.veresiye > 0 && !shiftData.customer_id) {
      toast({
        title: "Hata",
        description: "Veresiye tutarı girildiğinde müşteri seçimi zorunludur.",
        variant: "destructive"
      });
      return;
    }

    // Create datetime strings without timezone conversion - store exactly as entered
    const startDateTime = `${shiftData.start_date}T${shiftData.start_time}:00`;
    const endDateTime = `${shiftData.end_date}T${shiftData.end_time}:00`;

    const shiftPayload = {
      personnel_id: shiftData.personnel_id,
      start_time: startDateTime,
      end_time: endDateTime,
      cash_sales: shiftData.cash_sales,
      card_sales: shiftData.card_sales,
      otomasyon_satis: shiftData.otomasyon_satis,
      veresiye: shiftData.veresiye,
      customer_id: shiftData.customer_id || null,
      bank_transfers: shiftData.bank_transfers,
      loyalty_card: shiftData.loyalty_card,
      bank_transfer_description: shiftData.bank_transfer_description,
      bank_details: bankDetails
    };

    const { data: shiftResult, error } = await addShift(shiftPayload);

    if (error) {
      toast({
        title: "Hata",
        description: "Vardiya kaydedilirken bir hata oluştu.",
        variant: "destructive"
      });
      return;
    }

    // If there's a veresiye amount, record it in customer transactions
    if (shiftData.veresiye > 0 && shiftData.customer_id && shiftResult) {
      await addVeresiye({
        customer_id: shiftData.customer_id,
        shift_id: shiftResult.id,
        personnel_id: shiftData.personnel_id,
        amount: shiftData.veresiye,
        description: `Vardiya veresiye satışı - ${new Date(startDateTime).toLocaleDateString('tr-TR')}`
      });
    }

    toast({
      title: "Vardiya Kaydedildi",
      description: `Vardiya başarıyla kaydedildi. Shift tarihi: ${getShiftDate(startDateTime)}`,
    });
    
    // Reset form
    setShiftData({
      personnel_id: '',
      start_date: new Date().toISOString().split('T')[0],
      start_time: '',
      end_date: new Date().toISOString().split('T')[0],
      end_time: '',
      cash_sales: 0,
      card_sales: 0,
      otomasyon_satis: 0,
      veresiye: 0,
      customer_id: '',
      bank_transfers: 0,
      loyalty_card: 0,
      bank_transfer_description: ''
    });
    setBankDetails([]);
  };

  const totalExpenses = shiftData.cash_sales + shiftData.card_sales + shiftData.veresiye + shiftData.bank_transfers + shiftData.loyalty_card;
  const overShort = totalExpenses - shiftData.otomasyon_satis;

  // Calculate effective shift date for display
  const effectiveShiftDate = shiftData.start_date && shiftData.start_time 
    ? getShiftDate(`${shiftData.start_date}T${shiftData.start_time}:00`)
    : shiftData.start_date;

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Vardiya Kaydet</h2>
        <p className="text-sm lg:text-base text-gray-600">Yeni vardiya bilgilerini girin</p>
        {effectiveShiftDate && effectiveShiftDate !== shiftData.start_date && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Dikkat:</strong> Bu vardiya {effectiveShiftDate} tarihine kaydedilecek (22:55 sonrası başladığı için)
            </p>
          </div>
        )}
      </div>

      <Card className="shadow-sm border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center space-x-2 text-gray-900">
            <Users className="h-5 w-5 text-gray-700" />
            <span>Vardiya Bilgileri</span>
          </CardTitle>
          <CardDescription>Personel ve zaman bilgilerini girin</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Personel Seçin *</Label>
                <Select value={shiftData.personnel_id} onValueChange={(value) => handleInputChange('personnel_id', value)}>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4 bg-gray-50 border">
                <div className="flex items-center space-x-2 mb-4">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Giriş Zamanı</h3>
                </div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Tarih *</Label>
                    <Input 
                      type="date" 
                      value={shiftData.start_date}
                      onChange={(e) => handleInputChange('start_date', e.target.value)}
                      className="h-11 border-gray-300"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Saat *</Label>
                    <Input 
                      type="time" 
                      value={shiftData.start_time}
                      onChange={(e) => handleInputChange('start_time', e.target.value)}
                      className="h-11 border-gray-300"
                      required
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-gray-50 border">
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Çıkış Zamanı</h3>
                </div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Tarih *</Label>
                    <Input 
                      type="date" 
                      value={shiftData.end_date}
                      onChange={(e) => handleInputChange('end_date', e.target.value)}
                      className="h-11 border-gray-300"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Saat *</Label>
                    <Input 
                      type="time" 
                      value={shiftData.end_time}
                      onChange={(e) => handleInputChange('end_time', e.target.value)}
                      className="h-11 border-gray-300"
                      required
                    />
                  </div>
                </div>
              </Card>
            </div>

            <Card className="shadow-sm border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center space-x-2 text-gray-900">
                  <DollarSign className="h-5 w-5 text-gray-700" />
                  <span>Satış Bilgileri</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Otomasyon Satış (₺)</Label>
                    <Input 
                      type="number" 
                      step="0.001"
                      value={shiftData.otomasyon_satis}
                      onChange={(e) => handleInputChange('otomasyon_satis', parseFloat(e.target.value) || 0)}
                      className="h-11 border-gray-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nakit Satış (₺)</Label>
                    <Input 
                      type="number" 
                      step="0.001"
                      value={shiftData.cash_sales}
                      onChange={(e) => handleInputChange('cash_sales', parseFloat(e.target.value) || 0)}
                      className="h-11 border-gray-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Kart Satış (₺)</Label>
                    <div className="flex space-x-2">
                      <Input 
                        type="number" 
                        step="0.001"
                        value={shiftData.card_sales}
                        onChange={(e) => handleInputChange('card_sales', parseFloat(e.target.value) || 0)}
                        className="h-11 border-gray-300"
                        readOnly
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowBankDialog(true)}
                        className="h-11 px-4"
                      >
                        Detay
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-gray-600" />
                      <span>Sadakat Kartı (₺)</span>
                    </Label>
                    <Input 
                      type="number" 
                      step="0.001"
                      value={shiftData.loyalty_card}
                      onChange={(e) => handleInputChange('loyalty_card', parseFloat(e.target.value) || 0)}
                      className="h-11 border-gray-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Veresiye (₺)</Label>
                    <Input 
                      type="number" 
                      step="0.001"
                      value={shiftData.veresiye}
                      onChange={(e) => handleInputChange('veresiye', parseFloat(e.target.value) || 0)}
                      className="h-11 border-gray-300"
                    />
                  </div>
                  {shiftData.veresiye > 0 && (
                    <div className="space-y-2 md:col-span-2">
                      <Label>Veresiye Müşterisi *</Label>
                      <Select value={shiftData.customer_id} onValueChange={(value) => handleInputChange('customer_id', value)}>
                        <SelectTrigger className="h-11 border-gray-300">
                          <SelectValue placeholder="Müşteri seçin" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border shadow-lg">
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Banka Havale (₺)</Label>
                    <Input 
                      type="number" 
                      step="0.001"
                      value={shiftData.bank_transfers}
                      onChange={(e) => handleInputChange('bank_transfers', parseFloat(e.target.value) || 0)}
                      className="h-11 border-gray-300"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Havale Açıklaması</Label>
                    <Textarea 
                      value={shiftData.bank_transfer_description}
                      onChange={(e) => handleInputChange('bank_transfer_description', e.target.value)}
                      className="border-gray-300"
                      placeholder="Havale detayları ve açıklaması..."
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-gray-700" />
                  <span>Özet</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-600 font-medium">Otomasyon Satış</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(shiftData.otomasyon_satis)}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-600 font-medium">Toplam Giderler</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
                  </div>
                  <div className={`text-center p-4 rounded-lg border ${overShort >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <p className="text-sm font-medium text-gray-700">Açık/Fazla</p>
                    <p className={`text-lg font-bold ${overShort >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {overShort >= 0 ? '+' : ''}{formatCurrency(overShort)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button type="submit" className="px-8 py-2 bg-blue-600 hover:bg-blue-700">
                Vardiya Kaydet
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <BankSelectionDialog
        isOpen={showBankDialog}
        onOpenChange={setShowBankDialog}
        onBankDetailsUpdate={handleBankDetailsUpdate}
        currentDetails={bankDetails}
      />
    </div>
  );
};
