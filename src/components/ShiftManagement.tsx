
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

export const ShiftManagement = () => {
  const { toast } = useToast();
  const [newShiftOpen, setNewShiftOpen] = useState(false);
  const [newShiftData, setNewShiftData] = useState({
    employee: '',
    startTime: '',
    cashSales: '',
    bankTransfers: '',
    posAmount: '',
    posBank: '',
    paidAmount: ''
  });

  // Basit personel listesi
  const staff = ['Ahmet Yılmaz', 'Fatma Demir', 'Mehmet Kaya', 'Ayşe Özkan', 'Mustafa Çelik'];
  const banks = ['Ziraat Bankası', 'İş Bankası', 'Akbank', 'Garanti BBVA', 'Yapı Kredi'];

  // Aktif vardiyalar - manuel veriler
  const [activeShifts, setActiveShifts] = useState([
    {
      id: 1,
      employee: 'Ahmet Yılmaz',
      startTime: '2024-01-15 06:00',
      cashSales: 1200.00,
      bankTransfers: 300.00,
      posAmount: 800.50,
      posBank: 'Ziraat Bankası',
      paidAmount: 2250.00,
      status: 'aktif'
    },
    {
      id: 2,
      employee: 'Fatma Demir',
      startTime: '2024-01-15 14:00',
      cashSales: 950.00,
      bankTransfers: 150.00,
      posAmount: 1200.00,
      posBank: 'Akbank',
      paidAmount: 2300.00,
      status: 'aktif'
    }
  ]);

  const calculateOverShort = (shift) => {
    const totalSales = shift.cashSales + shift.bankTransfers + shift.posAmount;
    return shift.paidAmount - totalSales;
  };

  const handleCreateShift = () => {
    if (!newShiftData.employee || !newShiftData.startTime) {
      toast({
        title: "Hata",
        description: "Personel ve başlangıç saati zorunludur.",
        variant: "destructive"
      });
      return;
    }

    const newShift = {
      id: Date.now(),
      employee: newShiftData.employee,
      startTime: newShiftData.startTime,
      cashSales: parseFloat(newShiftData.cashSales) || 0,
      bankTransfers: parseFloat(newShiftData.bankTransfers) || 0,
      posAmount: parseFloat(newShiftData.posAmount) || 0,
      posBank: newShiftData.posBank || '',
      paidAmount: parseFloat(newShiftData.paidAmount) || 0,
      status: 'aktif'
    };

    setActiveShifts([...activeShifts, newShift]);
    
    toast({
      title: "Vardiya Oluşturuldu",
      description: `${newShiftData.employee} için yeni vardiya başlatıldı.`,
    });
    
    setNewShiftOpen(false);
    setNewShiftData({
      employee: '',
      startTime: '',
      cashSales: '',
      bankTransfers: '',
      posAmount: '',
      posBank: '',
      paidAmount: ''
    });
  };

  const handleCloseShift = (shiftId) => {
    setActiveShifts(activeShifts.filter(shift => shift.id !== shiftId));
    toast({
      title: "Vardiya Kapatıldı",
      description: "Vardiya başarıyla kapatıldı.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Başlık ve Yeni Vardiya Butonu */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Vardiya Yönetimi</h2>
          <p className="text-muted-foreground">Manuel vardiya bilgilerini girin ve yönetin</p>
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
              <DialogDescription>Vardiya bilgilerini manuel olarak girin</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Personel *</Label>
                <Select value={newShiftData.employee} onValueChange={(value) => setNewShiftData({...newShiftData, employee: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Personel seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((employee) => (
                      <SelectItem key={employee} value={employee}>{employee}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Başlangıç Saati *</Label>
                <Input 
                  type="datetime-local" 
                  value={newShiftData.startTime}
                  onChange={(e) => setNewShiftData({...newShiftData, startTime: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Nakit Satış (₺)</Label>
                  <Input 
                    type="number" 
                    placeholder="0.00"
                    value={newShiftData.cashSales}
                    onChange={(e) => setNewShiftData({...newShiftData, cashSales: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Banka Transfer (₺)</Label>
                  <Input 
                    type="number" 
                    placeholder="0.00"
                    value={newShiftData.bankTransfers}
                    onChange={(e) => setNewShiftData({...newShiftData, bankTransfers: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>POS Bankası</Label>
                <Select value={newShiftData.posBank} onValueChange={(value) => setNewShiftData({...newShiftData, posBank: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Banka seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map((bank) => (
                      <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>POS Tutarı (₺)</Label>
                <Input 
                  type="number" 
                  placeholder="0.00"
                  value={newShiftData.posAmount}
                  onChange={(e) => setNewShiftData({...newShiftData, posAmount: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Ödenen Tutar (₺)</Label>
                <Input 
                  type="number" 
                  placeholder="0.00"
                  value={newShiftData.paidAmount}
                  onChange={(e) => setNewShiftData({...newShiftData, paidAmount: e.target.value})}
                />
              </div>

              <Button onClick={handleCreateShift} className="w-full">
                Vardiya Oluştur
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Aktif Vardiyalar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeShifts.map((shift) => {
          const overShort = calculateOverShort(shift);
          const totalSales = shift.cashSales + shift.bankTransfers + shift.posAmount;
          
          return (
            <Card key={shift.id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{shift.employee}</CardTitle>
                    <CardDescription>
                      Başlangıç: {new Date(shift.startTime).toLocaleString('tr-TR')}
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
                    <p className="font-semibold">₺{shift.cashSales.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Banka Transfer</p>
                    <p className="font-semibold">₺{shift.bankTransfers.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">POS ({shift.posBank})</p>
                    <p className="font-semibold">₺{shift.posAmount.toFixed(2)}</p>
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
                      <span>Ödenen Tutar:</span>
                      <span>₺{shift.paidAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Toplam Satış:</span>
                      <span>₺{totalSales.toFixed(2)}</span>
                    </div>
                    <hr className="my-2" />
                    <div className={`flex justify-between font-medium ${overShort >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{overShort >= 0 ? 'Fazla:' : 'Eksik:'}</span>
                      <span>₺{Math.abs(overShort).toFixed(2)}</span>
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

      {activeShifts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Henüz aktif vardiya bulunmuyor.</p>
            <p className="text-sm text-muted-foreground mt-2">Yeni vardiya başlatmak için yukarıdaki butonu kullanın.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
