
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
    cash_sales: '',
    card_sales: '',
    personel_odenen: '',
    veresiye: ''
  });

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newShiftData.personnel_id || !newShiftData.start_time) {
      toast({
        title: "Hata",
        description: "Personel ve başlangıç saati zorunludur.",
        variant: "destructive"
      });
      return;
    }

    // Ensure numeric values
    const cashSales = parseFloat(newShiftData.cash_sales) || 0;
    const cardSales = parseFloat(newShiftData.card_sales) || 0;
    const personelOdenen = parseFloat(newShiftData.personel_odenen) || 0;
    const veresiye = parseFloat(newShiftData.veresiye) || 0;

    const shiftData = {
      personnel_id: newShiftData.personnel_id,
      start_time: newShiftData.start_time,
      cash_sales: cashSales,
      card_sales: cardSales,
      personel_odenen: personelOdenen,
      veresiye: veresiye,
      status: 'completed'
    };

    console.log('Creating shift with data:', shiftData);

    const { error } = await addShift(shiftData);

    if (error) {
      console.error('Error creating shift:', error);
      toast({
        title: "Hata",
        description: "Vardiya oluşturulurken bir hata oluştu: " + error.message,
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
        cash_sales: '',
        card_sales: '',
        personel_odenen: '',
        veresiye: ''
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

  // Calculate preview values
  const calculatePreview = () => {
    const cashSales = parseFloat(newShiftData.cash_sales) || 0;
    const cardSales = parseFloat(newShiftData.card_sales) || 0;
    const personelOdenen = parseFloat(newShiftData.personel_odenen) || 0;
    
    const totalSales = cashSales + cardSales;
    const overShort = totalSales - personelOdenen;
    
    return {
      totalSales,
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
              
              <div className="space-y-2">
                <Label>Vardiya Tarihi ve Saati *</Label>
                <Input 
                  type="datetime-local" 
                  value={newShiftData.start_time}
                  onChange={(e) => setNewShiftData({...newShiftData, start_time: e.target.value})}
                  required
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
                  <Label>Personel Ödenen (₺)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    value={newShiftData.personel_odenen}
                    onChange={(e) => setNewShiftData({...newShiftData, personel_odenen: e.target.value})}
                  />
                </div>
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
              </div>

              {/* Hesaplama Önizlemesi */}
              {(newShiftData.cash_sales || newShiftData.card_sales || newShiftData.personel_odenen) && (
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  <p className="font-medium mb-2 flex items-center space-x-2">
                    <Calculator className="h-4 w-4" />
                    <span>Hesaplama Önizlemesi:</span>
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Toplam Satış:</span>
                      <span>₺{preview.totalSales.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Personel Ödenen:</span>
                      <span>₺{(parseFloat(newShiftData.personel_odenen) || 0).toFixed(2)}</span>
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
