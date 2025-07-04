
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Fuel, Trash2, Calculator, Calendar as CalendarIcon, Clock, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFuelSales } from '@/hooks/useFuelSales';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const FUEL_TYPES = ['MOTORİN', 'LPG', 'BENZİN', 'MOTORİN(DİĞER)'] as const;

// Istanbul timezone offset (UTC+3)
const getIstanbulTime = (date?: Date) => {
  const d = date || new Date();
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const istanbul = new Date(utc + (3 * 3600000)); // UTC+3
  return istanbul;
};

const formatDateForInput = (date: Date) => {
  const istanbul = getIstanbulTime(date);
  return format(istanbul, 'yyyy-MM-dd');
};

const formatTimeForInput = (date: Date) => {
  const istanbul = getIstanbulTime(date);
  return format(istanbul, 'HH:mm');
};

export const FuelSalesManagement = () => {
  const { toast } = useToast();
  const { fuelSales, loading: fuelLoading, addFuelSale, deleteFuelSale } = useFuelSales();
  const [newSaleOpen, setNewSaleOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState(formatTimeForInput(new Date()));
  const [endTime, setEndTime] = useState(formatTimeForInput(new Date()));
  const [fuelData, setFuelData] = useState({
    'MOTORİN': { liters: '', total_amount: '', price_per_liter: '' },
    'LPG': { liters: '', total_amount: '', price_per_liter: '' },
    'BENZİN': { liters: '', total_amount: '', price_per_liter: '' },
    'MOTORİN(DİĞER)': { liters: '', total_amount: '', price_per_liter: '' }
  });

  const handleCreateSales = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate || !startTime || !endTime) {
      toast({
        title: "Hata",
        description: "Başlangıç tarihi, bitiş tarihi ve saatler zorunludur.",
        variant: "destructive"
      });
      return;
    }

    // Create sales for each fuel type that has data
    const salesToCreate = FUEL_TYPES.filter(fuelType => {
      const data = fuelData[fuelType];
      return data.liters && data.total_amount && parseFloat(data.liters) > 0 && parseFloat(data.total_amount) > 0;
    });

    if (salesToCreate.length === 0) {
      toast({
        title: "Hata",
        description: "En az bir akaryakıt türü için litre ve toplam tutar girmelisiniz.",
        variant: "destructive"
      });
      return;
    }

    // Create sale time from start date and start time (Istanbul time)
    const [hour, minute] = startTime.split(':');
    const saleDateTime = getIstanbulTime(startDate);
    saleDateTime.setHours(parseInt(hour), parseInt(minute), 0, 0);

    let hasError = false;

    for (const fuelType of salesToCreate) {
      const data = fuelData[fuelType];
      const liters = parseFloat(data.liters);
      const totalAmount = parseFloat(data.total_amount);
      const pricePerLiter = totalAmount / liters; // Calculate price per liter automatically

      const saleData = {
        fuel_type: fuelType,
        liters: liters,
        price_per_liter: pricePerLiter,
        total_amount: totalAmount,
        amount: totalAmount,
        sale_time: saleDateTime.toISOString(),
        start_hour: startTime,
        end_hour: endTime
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
      setStartTime(formatTimeForInput(new Date()));
      setEndTime(formatTimeForInput(new Date()));
      setFuelData({
        'MOTORİN': { liters: '', total_amount: '', price_per_liter: '' },
        'LPG': { liters: '', total_amount: '', price_per_liter: '' },
        'BENZİN': { liters: '', total_amount: '', price_per_liter: '' },
        'MOTORİN(DİĞER)': { liters: '', total_amount: '', price_per_liter: '' }
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
    setFuelData(prev => {
      const newData = {
        ...prev,
        [fuelType]: {
          ...prev[fuelType as keyof typeof prev],
          [field]: value
        }
      };
      
      // Auto-calculate price per liter when liters or total_amount changes
      if (field === 'liters' || field === 'total_amount') {
        const currentFuelData = newData[fuelType as keyof typeof newData];
        const liters = parseFloat(currentFuelData.liters) || 0;
        const totalAmount = parseFloat(currentFuelData.total_amount) || 0;
        
        if (liters > 0 && totalAmount > 0) {
          const pricePerLiter = totalAmount / liters;
          newData[fuelType as keyof typeof newData].price_per_liter = pricePerLiter.toFixed(3);
        } else {
          newData[fuelType as keyof typeof newData].price_per_liter = '';
        }
      }
      
      return newData;
    });
  };

  const calculateGrandTotal = () => {
    return FUEL_TYPES.reduce((total, fuelType) => {
      const data = fuelData[fuelType];
      const totalAmount = parseFloat(data.total_amount) || 0;
      return total + totalAmount;
    }, 0);
  };

  if (fuelLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Fuel className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Akaryakıt satış bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  const grandTotal = calculateGrandTotal();

  // Group sales by date (using Istanbul time)
  const groupedSales = fuelSales.reduce((acc, sale) => {
    const istanbulDate = getIstanbulTime(new Date(sale.sale_time));
    const dateKey = format(istanbulDate, 'yyyy-MM-dd');
    
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: dateKey,
        sales: [],
        totalAmount: 0,
        fuelTypeTotals: {
          'MOTORİN': { amount: 0, liters: 0 },
          'LPG': { amount: 0, liters: 0 },
          'BENZİN': { amount: 0, liters: 0 },
          'MOTORİN(DİĞER)': { amount: 0, liters: 0 }
        }
      };
    }
    
    acc[dateKey].sales.push(sale);
    acc[dateKey].totalAmount += sale.total_amount;
    
    // Add to fuel type totals
    const fuelType = sale.fuel_type as keyof typeof acc[dateKey]['fuelTypeTotals'];
    if (acc[dateKey].fuelTypeTotals[fuelType]) {
      acc[dateKey].fuelTypeTotals[fuelType].amount += sale.total_amount;
      acc[dateKey].fuelTypeTotals[fuelType].liters += sale.liters;
    }
    
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Akaryakıt Satışları
          </h2>
          <p className="text-gray-600 mt-2">Günlük akaryakıt satış verilerini kaydet ve yönet</p>
        </div>
        <Dialog open={newSaleOpen} onOpenChange={setNewSaleOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="h-5 w-5 mr-2" />
              Satış Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900">Günlük Akaryakıt Satışları</DialogTitle>
              <DialogDescription className="text-gray-600">
                Seçilen tarih ve saat aralığı için tüm akaryakıt türlerinin satış verilerini girin
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateSales} className="space-y-6 py-4">
              {/* Date and Time Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Vardiya Başlangıç Tarihi *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "dd MMM yyyy", { locale: tr }) : "Başlangıç tarihi"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white border shadow-lg z-50" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && setStartDate(date)}
                        initialFocus
                        locale={tr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Vardiya Bitiş Tarihi *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "dd MMM yyyy", { locale: tr }) : "Bitiş tarihi"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white border shadow-lg z-50" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => date && setEndDate(date)}
                        initialFocus
                        locale={tr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Başlangıç Saati *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Bitiş Saati *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Fuel Types Data Entry */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Fuel className="h-5 w-5 mr-2 text-blue-600" />
                  Akaryakıt Türleri
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {FUEL_TYPES.map((fuelType) => (
                    <Card key={fuelType} className="border-gray-200 hover:border-blue-300 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900">{fuelType}</h4>
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-600">Litre</Label>
                            <Input 
                              type="number" 
                              step="0.001"
                              placeholder="0.000"
                              value={fuelData[fuelType].liters}
                              onChange={(e) => updateFuelData(fuelType, 'liters', e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-600">Toplam (₺)</Label>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="0.00"
                              value={fuelData[fuelType].total_amount}
                              onChange={(e) => updateFuelData(fuelType, 'total_amount', e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-600">Litre Fiyatı (₺)</Label>
                            <div className="h-9 px-3 py-2 bg-gray-50 border rounded-md text-sm flex items-center">
                              ₺{fuelData[fuelType].price_per_liter || '0.000'}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Grand Total Calculation */}
              {grandTotal > 0 && (
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Calculator className="h-6 w-6 text-green-600" />
                        </div>
                        <span className="font-semibold text-green-800 text-lg">Genel Toplam:</span>
                      </div>
                      <span className="font-bold text-3xl text-green-600">₺{grandTotal.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200" 
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Satışları Kaydet
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sales List */}
      {Object.keys(groupedSales).length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="text-center py-12">
            <div className="max-w-sm mx-auto">
              <div className="p-4 bg-gray-50 rounded-full w-fit mx-auto mb-4">
                <Fuel className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz satış kaydı yok</h3>
              <p className="text-gray-600 mb-6">İlk akaryakıt satışınızı kaydetmek için yukarıdaki butonu kullanın.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {Object.values(groupedSales)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((group: any) => (
              <Card key={group.date} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl text-gray-900 flex items-center">
                        <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                        {format(new Date(group.date), "dd MMMM yyyy", { locale: tr })}
                      </CardTitle>
                      <CardDescription className="mt-1 text-gray-600">
                        {group.sales.length} akaryakıt türü satışı
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Günlük Toplam</p>
                      <p className="font-bold text-2xl text-green-600">₺{group.totalAmount.toFixed(3)}</p>
                    </div>
                  </div>
                </CardHeader>

                {/* Daily Fuel Type Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
                  <div className="flex items-center mb-3">
                    <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                    <h4 className="font-semibold text-gray-900">Günlük Akaryakıt Türü Özeti</h4>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {FUEL_TYPES.map((fuelType) => {
                      const typeData = group.fuelTypeTotals[fuelType];
                      if (typeData.amount === 0) return null;
                      return (
                        <div key={fuelType} className="bg-white p-3 rounded-lg border border-blue-200">
                          <div className="text-sm font-medium text-gray-700 mb-1">{fuelType}</div>
                          <div className="text-lg font-bold text-blue-600">₺{typeData.amount.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">{typeData.liters.toFixed(3)} L</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {group.sales.map((sale: any) => (
                      <div key={sale.id} className="relative p-4 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSale(sale.id)}
                          className="absolute top-2 right-2 h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <h4 className="font-semibold text-gray-900">{sale.fuel_type}</h4>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Litre:</span>
                              <span className="font-medium">{sale.liters.toFixed(3)} L</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Birim Fiyat:</span>
                              <span className="font-medium">₺{sale.price_per_liter.toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between font-semibold border-t pt-2">
                              <span>Toplam:</span>
                              <span className="text-green-600">₺{sale.total_amount.toFixed(3)}</span>
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
