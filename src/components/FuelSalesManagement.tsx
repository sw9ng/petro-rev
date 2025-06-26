
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Fuel, Trash2, Calculator, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFuelSales } from '@/hooks/useFuelSales';
import { usePersonnel } from '@/hooks/usePersonnel';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const FUEL_TYPES = ['MOTORİN', 'LPG', 'BENZİN', 'MOTORİN(DİĞER)'] as const;

export const FuelSalesManagement = () => {
  const { toast } = useToast();
  const { fuelSales, loading: fuelLoading, addFuelSale, deleteFuelSale } = useFuelSales();
  const { personnel, loading: personnelLoading } = usePersonnel();
  const [newSaleOpen, setNewSaleOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedPersonnel, setSelectedPersonnel] = useState('');
  const [fuelData, setFuelData] = useState({
    'MOTORİN': { liters: '', price_per_liter: '' },
    'LPG': { liters: '', price_per_liter: '' },
    'BENZİN': { liters: '', price_per_liter: '' },
    'MOTORİN(DİĞER)': { liters: '', price_per_liter: '' }
  });

  const handleCreateSales = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPersonnel || !selectedDate) {
      toast({
        title: "Hata",
        description: "Personel ve tarih seçimi zorunludur.",
        variant: "destructive"
      });
      return;
    }

    // Create sales for each fuel type that has data
    const salesToCreate = FUEL_TYPES.filter(fuelType => {
      const data = fuelData[fuelType];
      return data.liters && data.price_per_liter && parseFloat(data.liters) > 0;
    });

    if (salesToCreate.length === 0) {
      toast({
        title: "Hata",
        description: "En az bir akaryakıt türü için veri girmelisiniz.",
        variant: "destructive"
      });
      return;
    }

    let hasError = false;

    for (const fuelType of salesToCreate) {
      const data = fuelData[fuelType];
      const liters = parseFloat(data.liters);
      const pricePerLiter = parseFloat(data.price_per_liter);
      const totalAmount = liters * pricePerLiter;

      const saleData = {
        personnel_id: selectedPersonnel,
        fuel_type: fuelType,
        liters: liters,
        price_per_liter: pricePerLiter,
        total_amount: totalAmount,
        amount: totalAmount,
        sale_time: selectedDate.toISOString()
      };

      const { error } = await addFuelSale(saleData);

      if (error) {
        console.error('Error creating fuel sale:', error);
        hasError = true;
      }
    }

    if (hasError) {
      toast({
        title: "Hata",
        description: "Bazı akaryakıt satışları kaydedilirken hata oluştu.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Akaryakıt Satışları Kaydedildi",
        description: `${salesToCreate.length} akaryakıt satışı başarıyla kaydedildi.`,
      });
      
      setNewSaleOpen(false);
      setSelectedPersonnel('');
      setFuelData({
        'MOTORİN': { liters: '', price_per_liter: '' },
        'LPG': { liters: '', price_per_liter: '' },
        'BENZİN': { liters: '', price_per_liter: '' },
        'MOTORİN(DİĞER)': { liters: '', price_per_liter: '' }
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

  const updateFuelData = (fuelType: string, field: string, value: string) => {
    setFuelData(prev => ({
      ...prev,
      [fuelType]: {
        ...prev[fuelType as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const calculateTotalAmount = () => {
    return FUEL_TYPES.reduce((total, fuelType) => {
      const data = fuelData[fuelType];
      const liters = parseFloat(data.liters) || 0;
      const price = parseFloat(data.price_per_liter) || 0;
      return total + (liters * price);
    }, 0);
  };

  if (fuelLoading || personnelLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Fuel className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Akaryakıt satış bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  const activePersonnel = personnel.filter(p => p.status === 'active');
  const totalAmount = calculateTotalAmount();

  // Group sales by date and personnel
  const groupedSales = fuelSales.reduce((acc, sale) => {
    const dateKey = format(new Date(sale.sale_time), 'yyyy-MM-dd');
    const key = `${dateKey}-${sale.personnel_id}`;
    
    if (!acc[key]) {
      acc[key] = {
        date: dateKey,
        personnel: sale.personnel,
        sales: [],
        totalAmount: 0
      };
    }
    
    acc[key].sales.push(sale);
    acc[key].totalAmount += sale.total_amount;
    
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Akaryakıt Satışları</h2>
          <p className="text-muted-foreground mt-1">Günlük akaryakıt satışlarını kaydet ve yönet</p>
        </div>
        <Dialog open={newSaleOpen} onOpenChange={setNewSaleOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-5 w-5 mr-2" />
              Günlük Satış Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">Günlük Akaryakıt Satışları</DialogTitle>
              <DialogDescription>Tüm akaryakıt türleri için günlük satış verilerini girin</DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateSales} className="space-y-6 py-4">
              {/* Date and Personnel Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tarih *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP", { locale: tr }) : "Tarih seçin"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Personel *</Label>
                  <Select value={selectedPersonnel} onValueChange={setSelectedPersonnel}>
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
              </div>

              {/* Fuel Types Data Entry */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Akaryakıt Türleri</h3>
                {FUEL_TYPES.map((fuelType) => (
                  <Card key={fuelType} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{fuelType}</h4>
                      <Fuel className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-sm">Litre</Label>
                        <Input 
                          type="number" 
                          step="0.001"
                          placeholder="0.000"
                          value={fuelData[fuelType].liters}
                          onChange={(e) => updateFuelData(fuelType, 'liters', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm">Litre Fiyatı (₺)</Label>
                        <Input 
                          type="number" 
                          step="0.001"
                          placeholder="0.000"
                          value={fuelData[fuelType].price_per_liter}
                          onChange={(e) => updateFuelData(fuelType, 'price_per_liter', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm">Toplam (₺)</Label>
                        <div className="h-9 px-3 py-2 bg-gray-50 border rounded-md text-sm">
                          ₺{((parseFloat(fuelData[fuelType].liters) || 0) * (parseFloat(fuelData[fuelType].price_per_liter) || 0)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Total Calculation */}
              {totalAmount > 0 && (
                <Card className="p-4 bg-green-50 border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calculator className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Genel Toplam:</span>
                    </div>
                    <span className="font-bold text-2xl text-green-600">₺{totalAmount.toFixed(2)}</span>
                  </div>
                </Card>
              )}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                Satışları Kaydet
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sales List */}
      {Object.keys(groupedSales).length === 0 ? (
        <Card className="p-8">
          <CardContent className="text-center">
            <Fuel className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz akaryakıt satışı bulunmuyor</h3>
            <p className="text-muted-foreground mb-4">İlk günlük satışınızı eklemek için yukarıdaki butonu kullanın.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {Object.values(groupedSales)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((group: any) => (
              <Card key={`${group.date}-${group.personnel.name}`} className="overflow-hidden">
                <CardHeader className="bg-gray-50 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-gray-900">
                        {format(new Date(group.date), "PPP", { locale: tr })}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Personel: {group.personnel.name}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Toplam Satış</p>
                      <p className="font-bold text-xl text-green-600">₺{group.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {group.sales.map((sale: any) => (
                      <div key={sale.id} className="relative p-4 bg-white border rounded-lg hover:shadow-md transition-shadow">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSale(sale.id)}
                          className="absolute top-2 right-2 h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-900">{sale.fuel_type}</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Litre:</span>
                              <span>{sale.liters.toFixed(3)} L</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Fiyat:</span>
                              <span>₺{sale.price_per_liter.toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between font-semibold border-t pt-1">
                              <span>Toplam:</span>
                              <span className="text-green-600">₺{sale.total_amount.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
};
