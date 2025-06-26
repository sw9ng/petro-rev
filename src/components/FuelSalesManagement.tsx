
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Fuel, Trash2, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFuelSales } from '@/hooks/useFuelSales';
import { usePersonnel } from '@/hooks/usePersonnel';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const FUEL_TYPES = ['MOTORİN', 'LPG', 'BENZİN', 'MOTORİN(DİĞER)'] as const;

export const FuelSalesManagement = () => {
  const { toast } = useToast();
  const { fuelSales, loading: fuelLoading, addFuelSale, deleteFuelSale } = useFuelSales();
  const { personnel, loading: personnelLoading } = usePersonnel();
  const [newSaleOpen, setNewSaleOpen] = useState(false);
  const [newSaleData, setNewSaleData] = useState({
    personnel_id: '',
    fuel_type: '',
    liters: '',
    price_per_liter: '',
    sale_time: ''
  });

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSaleData.personnel_id || !newSaleData.fuel_type || !newSaleData.liters || !newSaleData.price_per_liter || !newSaleData.sale_time) {
      toast({
        title: "Hata",
        description: "Tüm alanlar zorunludur.",
        variant: "destructive"
      });
      return;
    }

    const liters = parseFloat(newSaleData.liters);
    const pricePerLiter = parseFloat(newSaleData.price_per_liter);
    const totalAmount = liters * pricePerLiter;

    const saleData = {
      personnel_id: newSaleData.personnel_id,
      fuel_type: newSaleData.fuel_type,
      liters: liters,
      price_per_liter: pricePerLiter,
      total_amount: totalAmount,
      amount: totalAmount, // Same as total_amount
      sale_time: newSaleData.sale_time
    };

    console.log('Creating fuel sale with data:', saleData);

    const { error } = await addFuelSale(saleData);

    if (error) {
      console.error('Error creating fuel sale:', error);
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Bilinmeyen hata';
      toast({
        title: "Hata",
        description: "Akaryakıt satışı oluşturulurken bir hata oluştu: " + errorMessage,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Akaryakıt Satışı Kaydedildi",
        description: "Akaryakıt satışı başarıyla kaydedildi.",
      });
      
      setNewSaleOpen(false);
      setNewSaleData({
        personnel_id: '',
        fuel_type: '',
        liters: '',
        price_per_liter: '',
        sale_time: ''
      });
    }
  };

  const handleDeleteSale = async (saleId: string) => {
    if (window.confirm('Bu akaryakıt satışını silmek istediğinizden emin misiniz?')) {
      const { error } = await deleteFuelSale(saleId);
      
      if (error) {
        toast({
          title: "Hata",
          description: "Akaryakıt satışı silinirken bir hata oluştu.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Akaryakıt Satışı Silindi",
          description: "Akaryakıt satışı başarıyla silindi.",
        });
      }
    }
  };

  const calculatePreview = () => {
    const liters = parseFloat(newSaleData.liters) || 0;
    const pricePerLiter = parseFloat(newSaleData.price_per_liter) || 0;
    return liters * pricePerLiter;
  };

  if (fuelLoading || personnelLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Akaryakıt satış bilgileri yükleniyor...</p>
      </div>
    );
  }

  const activePersonnel = personnel.filter(p => p.status === 'active');
  const totalAmount = calculatePreview();

  return (
    <div className="space-y-6">
      {/* Başlık ve Yeni Satış Butonu */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Akaryakıt Satışları</h2>
          <p className="text-muted-foreground">Akaryakıt satışlarını kaydet ve yönet</p>
        </div>
        <Dialog open={newSaleOpen} onOpenChange={setNewSaleOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Akaryakıt Satışı Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Yeni Akaryakıt Satışı</DialogTitle>
              <DialogDescription>Akaryakıt satış bilgilerini girin</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSale} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Personel *</Label>
                <Select value={newSaleData.personnel_id} onValueChange={(value) => setNewSaleData({...newSaleData, personnel_id: value})}>
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
                <Label>Akaryakıt Türü *</Label>
                <Select value={newSaleData.fuel_type} onValueChange={(value) => setNewSaleData({...newSaleData, fuel_type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Akaryakıt türü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {FUEL_TYPES.map((fuelType) => (
                      <SelectItem key={fuelType} value={fuelType}>{fuelType}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Satış Zamanı *</Label>
                <Input 
                  type="datetime-local" 
                  value={newSaleData.sale_time}
                  onChange={(e) => setNewSaleData({...newSaleData, sale_time: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Litre *</Label>
                  <Input 
                    type="number" 
                    step="0.001"
                    placeholder="0.000"
                    value={newSaleData.liters}
                    onChange={(e) => setNewSaleData({...newSaleData, liters: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Litre Fiyatı (₺) *</Label>
                  <Input 
                    type="number" 
                    step="0.001"
                    placeholder="0.000"
                    value={newSaleData.price_per_liter}
                    onChange={(e) => setNewSaleData({...newSaleData, price_per_liter: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Hesaplama Önizlemesi */}
              {(newSaleData.liters && newSaleData.price_per_liter) && (
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  <p className="font-medium mb-2 flex items-center space-x-2">
                    <Calculator className="h-4 w-4" />
                    <span>Toplam Tutar:</span>
                  </p>
                  <div className="text-right font-bold text-lg text-green-600">
                    ₺{totalAmount.toFixed(2)}
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full">
                Satışı Kaydet
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Akaryakıt Satışları Listesi */}
      {fuelSales.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Fuel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Henüz akaryakıt satışı bulunmuyor.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {fuelSales.map((sale) => (
            <Card key={sale.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Fuel className="h-4 w-4" />
                      <span>{sale.fuel_type}</span>
                    </CardTitle>
                    <CardDescription>
                      {sale.personnel.name} - {format(new Date(sale.sale_time), "PPPp", { locale: tr })}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteSale(sale.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Litre</p>
                    <p className="font-semibold">{sale.liters.toFixed(3)} L</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Litre Fiyatı</p>
                    <p className="font-semibold">₺{sale.price_per_liter.toFixed(3)}</p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Toplam Tutar:</span>
                    <span className="font-bold text-lg text-green-600">₺{sale.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
