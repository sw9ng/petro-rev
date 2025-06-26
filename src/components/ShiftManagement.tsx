
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Calculator, CreditCard } from 'lucide-react';
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

  // Calculate preview values with the new formula: otomasyon_satis - (cash_sales + card_sales + veresiye + bank_transfers)
  const calculatePreview = () => {
    const cashSales = parseFloat(newShiftData.cash_sales) || 0;
    const cardSales = parseFloat(newShiftData.card_sales) || 0;
    const otomasyonSatis = parseFloat(newShiftData.otomasyon_satis) || 0;
    const veresiye = parseFloat(newShiftData.veresiye) || 0;
    const bankTransfers = parseFloat(newShiftData.bank_transfers) || 0;
    
    const totalExpenses = cashSales + cardSales + veresiye + bankTransfers;
    const overShort = otomasyonSatis - totalExpenses; // Updated formula
    
    return {
      totalExpenses,
      overShort
    };
  };

  if (shiftsLoading || personnelLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Vardiya bilgileri yükleniyor...</p>
      </div>
    );
  }

  const activePersonnel = personnel.filter(p => p.status === 'active');
  const preview = calculatePreview();

  return (
    <div className="space-y-6">
      {/* Başlık ve Yeni Vardiya Butonu */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Vardiya Yönetimi</h2>
          <p className="text-muted-foreground">Vardiya bilgilerini kaydet ve yönet</p>
        </div>
        <Dialog open={newShiftOpen} onOpenChange={setNewShiftOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Vardiya Kaydet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni Vardiya Kaydet</DialogTitle>
              <DialogDescription>Vardiya bilgilerini girin</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateShift} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Personel *</Label>
                <Select value={newShiftData.personnel_id} onValueChange={(value) => setNewShiftData({...newShiftData, personnel_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Personel seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {activePersonnel.map((person) => (
                      <SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Giriş Saati *</Label>
                  <Input 
                    type="datetime-local" 
                    value={newShiftData.start_time}
                    onChange={(e) => setNewShiftData({...newShiftData, start_time: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Çıkış Saati *</Label>
                  <Input 
                    type="datetime-local" 
                    value={newShiftData.end_time}
                    onChange={(e) => setNewShiftData({...newShiftData, end_time: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Otomasyon Satış (₺)</Label>
                <Input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00"
                  value={newShiftData.otomasyon_satis}
                  onChange={(e) => setNewShiftData({...newShiftData, otomasyon_satis: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Nakit Satış (₺)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    value={newShiftData.cash_sales}
                    onChange={(e) => setNewShiftData({...newShiftData, cash_sales: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kart Satış (₺)</Label>
                  <div className="flex space-x-1">
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
                      value={newShiftData.card_sales}
                      onChange={(e) => setNewShiftData({...newShiftData, card_sales: e.target.value})}
                      readOnly
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setBankDialogOpen(true)}
                    >
                      <CreditCard className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Veresiye (₺)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    value={newShiftData.veresiye}
                    onChange={(e) => setNewShiftData({...newShiftData, veresiye: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Banka Havale (₺)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    value={newShiftData.bank_transfers}
                    onChange={(e) => setNewShiftData({...newShiftData, bank_transfers: e.target.value})}
                  />
                </div>
              </div>

              {/* Hesaplama Önizlemesi */}
              {(newShiftData.cash_sales || newShiftData.card_sales || newShiftData.otomasyon_satis || newShiftData.veresiye || newShiftData.bank_transfers) && (
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  <p className="font-medium mb-2 flex items-center space-x-2">
                    <Calculator className="h-4 w-4" />
                    <span>Hesaplama Önizlemesi:</span>
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Otomasyon Satış:</span>
                      <span>₺{(parseFloat(newShiftData.otomasyon_satis) || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Toplam Giderler:</span>
                      <span>₺{preview.totalExpenses.toFixed(2)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-medium">
                      <span>Açık/Fazla:</span>
                      <span className={preview.overShort >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ₺{Math.abs(preview.overShort).toFixed(2)} {preview.overShort >= 0 ? '(Fazla)' : '(Açık)'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full">
                Vardiya Kaydet
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mesaj */}
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">
            Vardiyalar kaydedildikten sonra kalıcı olarak saklanır. 
            Geçmiş vardiyaları görmek için <strong>Vardiya Listesi</strong> sekmesini kullanın.
          </p>
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
