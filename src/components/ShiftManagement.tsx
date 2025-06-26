
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Calculator, CreditCard, Users, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useShifts } from '@/hooks/useShifts';
import { usePersonnel } from '@/hooks/usePersonnel';
import { BankSelectionDialog } from './BankSelectionDialog';

export const ShiftManagement = () => {
  const { toast } = useToast();
  const { shifts, loading: shiftsLoading, addShift } = useShifts();
  const { personnel, loading: personnelLoading } = usePersonnel();
  const [newShiftOpen, setNewShiftOpen] = useState(false);
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [bankAmounts, setBankAmounts] = useState<Record<string, string>>({});
  const [newShiftData, setNewShiftData] = useState({
    personnel_id: '',
    start_time: '',
    end_time: '',
    cash_sales: '',
    card_sales: '',
    otomasyon_satis: '',
    veresiye: '',
    bank_transfers: ''
  });

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newShiftData.personnel_id || !newShiftData.start_time || !newShiftData.end_time) {
      toast({
        title: "Hata",
        description: "Personel, giriş saati ve çıkış saati zorunludur.",
        variant: "destructive"
      });
      return;
    }

    // Ensure numeric values
    const cashSales = parseFloat(newShiftData.cash_sales) || 0;
    const cardSales = parseFloat(newShiftData.card_sales) || 0;
    const otomasyonSatis = parseFloat(newShiftData.otomasyon_satis) || 0;
    const veresiye = parseFloat(newShiftData.veresiye) || 0;
    const bankTransfers = parseFloat(newShiftData.bank_transfers) || 0;

    const shiftData = {
      personnel_id: newShiftData.personnel_id,
      start_time: newShiftData.start_time,
      end_time: newShiftData.end_time,
      cash_sales: cashSales,
      card_sales: cardSales,
      otomasyon_satis: otomasyonSatis,
      veresiye: veresiye,
      bank_transfers: bankTransfers,
      status: 'completed'
    };

    console.log('Creating shift with data:', shiftData);

    const { error } = await addShift(shiftData);

    if (error) {
      console.error('Error creating shift:', error);
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Bilinmeyen hata';
      toast({
        title: "Hata",
        description: "Vardiya oluşturulurken bir hata oluştu: " + errorMessage,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Vardiya Kaydedildi",
        description: "Vardiya başarıyla kaydedildi.",
      });
      
      setNewShiftOpen(false);
      setNewShiftData({
        personnel_id: '',
        start_time: '',
        end_time: '',
        cash_sales: '',
        card_sales: '',
        otomasyon_satis: '',
        veresiye: '',
        bank_transfers: ''
      });
      setBankAmounts({});
    }
  };

  const handleBankAmountsChange = (amounts: Record<string, string>) => {
    setBankAmounts(amounts);
    const total = Object.values(amounts).reduce((sum, amount) => {
      return sum + (parseFloat(amount) || 0);
    }, 0);
    setNewShiftData(prev => ({ ...prev, card_sales: total.toString() }));
  };

  // Calculate preview values with CORRECTED formula: (nakit + kart + veresiye + banka) - otomasyon
  const calculatePreview = () => {
    const cashSales = parseFloat(newShiftData.cash_sales) || 0;
    const cardSales = parseFloat(newShiftData.card_sales) || 0;
    const otomasyonSatis = parseFloat(newShiftData.otomasyon_satis) || 0;
    const veresiye = parseFloat(newShiftData.veresiye) || 0;
    const bankTransfers = parseFloat(newShiftData.bank_transfers) || 0;
    
    const totalCollected = cashSales + cardSales + veresiye + bankTransfers;
    const difference = totalCollected - otomasyonSatis; // CORRECTED: collected - automation
    
    return {
      totalCollected,
      difference,
      otomasyonSatis
    };
  };

  if (shiftsLoading || personnelLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Vardiya bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  const activePersonnel = personnel.filter(p => p.status === 'active');
  const preview = calculatePreview();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900">Vardiya Yönetimi</h2>
        <p className="text-muted-foreground text-lg mt-2">Vardiya bilgilerini kaydet ve yönet</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktif Personel</p>
                <p className="text-3xl font-bold text-gray-900">{activePersonnel.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bugünkü Vardiya</p>
                <p className="text-3xl font-bold text-gray-900">
                  {shifts.filter(s => {
                    const today = new Date().toDateString();
                    return new Date(s.start_time).toDateString() === today;
                  }).length}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-lg">
          <CardContent className="p-6 flex items-center justify-center">
            <Dialog open={newShiftOpen} onOpenChange={setNewShiftOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 w-full">
                  <Plus className="h-5 w-5 mr-2" />
                  Vardiya Kaydet
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Yeni Vardiya Kaydet</DialogTitle>
                  <DialogDescription>Vardiya bilgilerini dikkatli bir şekilde girin</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateShift} className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Personel *</Label>
                    <Select value={newShiftData.personnel_id} onValueChange={(value) => setNewShiftData({...newShiftData, personnel_id: value})}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Personel seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {activePersonnel.map((person) => (
                          <SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Giriş Saati *</Label>
                      <Input 
                        type="datetime-local" 
                        value={newShiftData.start_time}
                        onChange={(e) => setNewShiftData({...newShiftData, start_time: e.target.value})}
                        required
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Çıkış Saati *</Label>
                      <Input 
                        type="datetime-local" 
                        value={newShiftData.end_time}
                        onChange={(e) => setNewShiftData({...newShiftData, end_time: e.target.value})}
                        required
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-medium">Otomasyon Satış (₺) *</Label>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
                      value={newShiftData.otomasyon_satis}
                      onChange={(e) => setNewShiftData({...newShiftData, otomasyon_satis: e.target.value})}
                      className="h-12 text-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Nakit Satış (₺)</Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        value={newShiftData.cash_sales}
                        onChange={(e) => setNewShiftData({...newShiftData, cash_sales: e.target.value})}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Kart Satış (₺)</Label>
                      <div className="flex space-x-2">
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="0.00"
                          value={newShiftData.card_sales}
                          onChange={(e) => setNewShiftData({...newShiftData, card_sales: e.target.value})}
                          readOnly
                          className="h-12"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setBankDialogOpen(true)}
                          className="h-12 px-3"
                        >
                          <CreditCard className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Veresiye (₺)</Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        value={newShiftData.veresiye}
                        onChange={(e) => setNewShiftData({...newShiftData, veresiye: e.target.value})}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Banka Havale (₺)</Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        value={newShiftData.bank_transfers}
                        onChange={(e) => setNewShiftData({...newShiftData, bank_transfers: e.target.value})}
                        className="h-12"
                      />
                    </div>
                  </div>

                  {/* CORRECTED Calculation Preview */}
                  {(newShiftData.cash_sales || newShiftData.card_sales || newShiftData.otomasyon_satis || newShiftData.veresiye || newShiftData.bank_transfers) && (
                    <Card className="p-4 bg-blue-50 border-blue-200">
                      <div className="space-y-3">
                        <p className="font-medium mb-2 flex items-center space-x-2 text-blue-800">
                          <Calculator className="h-4 w-4" />
                          <span>Hesaplama Önizlemesi:</span>
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Otomasyon Satış:</span>
                            <span className="font-medium">₺{preview.otomasyonSatis.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Toplanan (Nakit+Kart+Veresiye+Havale):</span>
                            <span className="font-medium">₺{preview.totalCollected.toFixed(2)}</span>
                          </div>
                          <hr className="border-blue-200" />
                          <div className="flex justify-between font-bold text-base">
                            <span>Fark:</span>
                            <span className={preview.difference >= 0 ? 'text-green-600' : 'text-red-600'}>
                              ₺{Math.abs(preview.difference).toFixed(2)} {preview.difference >= 0 ? '(Fazla)' : '(Açık)'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}

                  <Button type="submit" className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700">
                    Vardiya Kaydet
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Information Card */}
      <Card className="shadow-lg">
        <CardContent className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Vardiya Kayıt Sistemi</h3>
          <p className="text-muted-foreground">
            Vardiyalar kaydedildikten sonra kalıcı olarak saklanır. 
            Geçmiş vardiyaları görmek için <strong>Vardiya Listesi</strong> sekmesini kullanın.
          </p>
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Hesaplama Formülü:</strong> (Nakit + Kart + Veresiye + Havale) - Otomasyon Satış
            </p>
          </div>
        </CardContent>
      </Card>

      <BankSelectionDialog
        isOpen={bankDialogOpen}
        onOpenChange={setBankDialogOpen}
        bankAmounts={bankAmounts}
        onBankAmountsChange={handleBankAmountsChange}
        totalAmount={parseFloat(newShiftData.card_sales) || 0}
      />
    </div>
  );
};
