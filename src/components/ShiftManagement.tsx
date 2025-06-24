
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Clock, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useShifts } from '@/hooks/useShifts';
import { usePersonnel } from '@/hooks/usePersonnel';

export const ShiftManagement = () => {
  const { toast } = useToast();
  const { shifts, loading: shiftsLoading, addShift, closeShift } = useShifts();
  const { personnel, loading: personnelLoading } = usePersonnel();
  const [newShiftOpen, setNewShiftOpen] = useState(false);
  const [newShiftData, setNewShiftData] = useState({
    personnel_id: '',
    start_time: '',
    cash_sales: '',
    card_sales: '',
    bank_transfers: '',
    actual_amount: ''
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

    const shiftData = {
      personnel_id: newShiftData.personnel_id,
      start_time: newShiftData.start_time,
      cash_sales: parseFloat(newShiftData.cash_sales) || 0,
      card_sales: parseFloat(newShiftData.card_sales) || 0,
      bank_transfers: parseFloat(newShiftData.bank_transfers) || 0,
      actual_amount: parseFloat(newShiftData.actual_amount) || 0,
      status: 'active'
    };

    const { error } = await addShift(shiftData);

    if (error) {
      toast({
        title: "Hata",
        description: "Vardiya oluşturulurken bir hata oluştu.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Vardiya Oluşturuldu",
        description: "Yeni vardiya başarıyla başlatıldı.",
      });
      
      setNewShiftOpen(false);
      setNewShiftData({
        personnel_id: '',
        start_time: '',
        cash_sales: '',
        card_sales: '',
        bank_transfers: '',
        actual_amount: ''
      });
    }
  };

  const handleCloseShift = async (shiftId: string) => {
    const { error } = await closeShift(shiftId);
    
    if (error) {
      toast({
        title: "Hata",
        description: "Vardiya kapatılırken bir hata oluştu.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Vardiya Kapatıldı",
        description: "Vardiya başarıyla kapatıldı.",
      });
    }
  };

  if (shiftsLoading || personnelLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Vardiya bilgileri yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Başlık ve Yeni Vardiya Butonu */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Vardiya Yönetimi</h2>
          <p className="text-muted-foreground">Vardiya bilgilerini girin ve yönetin</p>
        </div>
        <Dialog open={newShiftOpen} onOpenChange={setNewShiftOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Vardiya Başlat
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Yeni Vardiya Oluştur</DialogTitle>
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
                    {personnel.filter(p => p.status === 'active').map((person) => (
                      <SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Başlangıç Saati *</Label>
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
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    value={newShiftData.card_sales}
                    onChange={(e) => setNewShiftData({...newShiftData, card_sales: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Banka Transfer (₺)</Label>
                <Input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00"
                  value={newShiftData.bank_transfers}
                  onChange={(e) => setNewShiftData({...newShiftData, bank_transfers: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Gerçek Tutar (₺)</Label>
                <Input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00"
                  value={newShiftData.actual_amount}
                  onChange={(e) => setNewShiftData({...newShiftData, actual_amount: e.target.value})}
                />
              </div>

              <Button type="submit" className="w-full">
                Vardiya Oluştur
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Aktif Vardiyalar */}
      {shifts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Henüz aktif vardiya bulunmuyor.</p>
            <p className="text-sm text-muted-foreground mt-2">Yeni vardiya başlatmak için yukarıdaki butonu kullanın.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {shifts.map((shift) => {
            const totalSales = shift.cash_sales + shift.card_sales + shift.bank_transfers;
            
            return (
              <Card key={shift.id} className="relative">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{shift.personnel.name}</CardTitle>
                      <CardDescription>
                        Başlangıç: {new Date(shift.start_time).toLocaleString('tr-TR')}
                      </CardDescription>
                    </div>
                    <Badge variant="default">
                      <Clock className="h-3 w-3 mr-1" />
                      Aktif
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Satış Özeti */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Nakit</p>
                      <p className="font-semibold">₺{shift.cash_sales.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Kart</p>
                      <p className="font-semibold">₺{shift.card_sales.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Banka Transfer</p>
                      <p className="font-semibold">₺{shift.bank_transfers.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Toplam Satış</p>
                      <p className="font-semibold">₺{totalSales.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Fazla/Eksik Hesaplama */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Fazla/Eksik Hesaplama</span>
                      <Calculator className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Gerçek Tutar:</span>
                        <span>₺{shift.actual_amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Toplam Satış:</span>
                        <span>₺{totalSales.toFixed(2)}</span>
                      </div>
                      <hr className="my-2" />
                      <div className={`flex justify-between font-medium ${shift.over_short >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <span>{shift.over_short >= 0 ? 'Fazla:' : 'Eksik:'}</span>
                        <span>₺{Math.abs(shift.over_short).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* İşlemler */}
                  <div className="flex space-x-2">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleCloseShift(shift.id)}
                    >
                      Vardiyayı Kapat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
