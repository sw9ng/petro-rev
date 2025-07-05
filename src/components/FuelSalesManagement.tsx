
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, CalendarIcon, Fuel, Trash2, BarChart3, Droplets } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useFuelSales } from '@/hooks/useFuelSales';
import { usePersonnel } from '@/hooks/usePersonnel';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDateForInput } from '@/lib/numberUtils';

const FUEL_TYPES = [
  { value: 'MOTORİN', label: 'Motorin', color: 'text-blue-600' },
  { value: 'BENZİN', label: 'Benzin', color: 'text-green-600' },
  { value: 'LPG', label: 'LPG', color: 'text-orange-600' },
  { value: 'MOTORİN(DİĞER)', label: 'Motorin (Diğer)', color: 'text-purple-600' }
];

export const FuelSalesManagement = () => {
  const { toast } = useToast();
  const { fuelSales, loading, addFuelSale, deleteFuelSale } = useFuelSales();
  const { personnel } = usePersonnel();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const [fuelSaleData, setFuelSaleData] = useState({
    fuel_type: '' as 'MOTORİN' | 'BENZİN' | 'LPG' | 'MOTORİN(DİĞER)' | '',
    amount: 0,
    price_per_liter: 0,
    liters: 0,
    personnel_id: '',
    sale_time: formatDateForInput(new Date())
  });

  const resetForm = () => {
    setFuelSaleData({
      fuel_type: '' as any,
      amount: 0,
      price_per_liter: 0,
      liters: 0,
      personnel_id: '',
      sale_time: formatDateForInput(new Date())
    });
  };

  // Calculate total amount when price or liters change
  useEffect(() => {
    if (fuelSaleData.price_per_liter > 0 && fuelSaleData.liters > 0) {
      const totalAmount = fuelSaleData.price_per_liter * fuelSaleData.liters;
      setFuelSaleData(prev => ({ ...prev, amount: totalAmount }));
    }
  }, [fuelSaleData.price_per_liter, fuelSaleData.liters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fuelSaleData.fuel_type || !fuelSaleData.personnel_id || fuelSaleData.amount <= 0 || fuelSaleData.liters <= 0) {
      toast({
        title: "Hata",
        description: "Lütfen tüm zorunlu alanları doldurun.",
        variant: "destructive"
      });
      return;
    }

    // Create the sale time in the correct format
    const saleTime = new Date(fuelSaleData.sale_time);
    saleTime.setHours(new Date().getHours(), new Date().getMinutes(), new Date().getSeconds());

    const submitData = {
      ...fuelSaleData,
      total_amount: fuelSaleData.amount,
      sale_time: saleTime.toISOString()
    };

    const { error } = await addFuelSale(submitData);

    if (error) {
      console.error('Fuel sale error:', error);
      const errorMessage = typeof error === 'string' ? error : error.message || 'Bilinmeyen hata';
      toast({
        title: "Hata",
        description: "Akaryakıt satışı kaydedilirken bir hata oluştu: " + errorMessage,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Satış Kaydedildi",
        description: "Akaryakıt satışı başarıyla kaydedildi.",
      });
      
      resetForm();
      setShowAddDialog(false);
    }
  };

  const handleDelete = async (saleId: string) => {
    if (window.confirm('Bu satış kaydını silmek istediğinizden emin misiniz?')) {
      const { error } = await deleteFuelSale(saleId);
      
      if (error) {
        toast({
          title: "Hata",
          description: "Satış kaydı silinirken bir hata oluştu.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Başarılı",
          description: "Satış kaydı silindi.",
        });
      }
    }
  };

  const getFuelTypeLabel = (type: string) => {
    const fuelType = FUEL_TYPES.find(ft => ft.value === type);
    return fuelType ? fuelType.label : type;
  };

  const getFuelTypeColor = (type: string) => {
    const fuelType = FUEL_TYPES.find(ft => ft.value === type);
    return fuelType ? fuelType.color : 'text-gray-600';
  };

  // Filter sales by selected date
  const getFilteredSales = () => {
    if (!selectedDate) return fuelSales;
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return fuelSales.filter(sale => {
      const saleDate = format(new Date(sale.sale_time), 'yyyy-MM-dd');
      return saleDate === dateStr;
    });
  };

  const filteredSales = getFilteredSales();

  // Calculate daily totals
  const getDailyTotals = () => {
    const totals = {
      totalAmount: 0,
      totalLiters: 0,
      fuelTypeTotals: {} as Record<string, { amount: number; liters: number }>
    };

    filteredSales.forEach(sale => {
      totals.totalAmount += sale.total_amount;
      totals.totalLiters += sale.liters;
      
      if (!totals.fuelTypeTotals[sale.fuel_type]) {
        totals.fuelTypeTotals[sale.fuel_type] = { amount: 0, liters: 0 };
      }
      
      totals.fuelTypeTotals[sale.fuel_type].amount += sale.total_amount;
      totals.fuelTypeTotals[sale.fuel_type].liters += sale.liters;
    });

    return totals;
  };

  const dailyTotals = getDailyTotals();

  if (loading) {
    return <div className="flex justify-center items-center h-64">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Akaryakıt Satışları</h2>
        <p className="text-sm lg:text-base text-gray-600">Günlük akaryakıt satış kayıtlarını yönetin</p>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tarih Seçin</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
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
                  locale={tr}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Satış Ekle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Akaryakıt Satışı</DialogTitle>
              <DialogDescription>
                Akaryakıt satış bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Akaryakıt Türü *</Label>
                <Select value={fuelSaleData.fuel_type} onValueChange={(value: any) => setFuelSaleData(prev => ({ ...prev, fuel_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Akaryakıt türü seçin" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg">
                    {FUEL_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className={type.color}>{type.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Personel *</Label>
                <Select value={fuelSaleData.personnel_id} onValueChange={(value) => setFuelSaleData(prev => ({ ...prev, personnel_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Personel seçin" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg">
                    {personnel.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tarih *</Label>
                <Input
                  type="date"
                  value={fuelSaleData.sale_time}
                  onChange={(e) => setFuelSaleData(prev => ({ ...prev, sale_time: e.target.value }))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Litre Fiyatı (₺) *</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={fuelSaleData.price_per_liter}
                    onChange={(e) => setFuelSaleData(prev => ({ ...prev, price_per_liter: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Litre *</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={fuelSaleData.liters}
                    onChange={(e) => setFuelSaleData(prev => ({ ...prev, liters: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.000"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Toplam Tutar (₺)</Label>
                <Input
                  type="number"
                  step="0.001"
                  value={fuelSaleData.amount}
                  onChange={(e) => setFuelSaleData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="Otomatik hesaplanır"
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  İptal
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Satışı Kaydet
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Daily Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Günlük Toplam</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dailyTotals.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredSales.length} satış
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Litre</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyTotals.totalLiters.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Litre satışı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ort. Litre Fiyatı</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dailyTotals.totalLiters > 0 
                ? formatCurrency(dailyTotals.totalAmount / dailyTotals.totalLiters)
                : formatCurrency(0)
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Per litre
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Akaryakıt Türü</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(dailyTotals.fuelTypeTotals).length}</div>
            <p className="text-xs text-muted-foreground">
              Farklı tür
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fuel Type Breakdown */}
      {Object.keys(dailyTotals.fuelTypeTotals).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Fuel className="h-5 w-5" />
              <span>Günlük Akaryakıt Türü Detayı</span>
            </CardTitle>
            <CardDescription>
              {selectedDate && format(selectedDate, "PPP", { locale: tr })} tarihindeki akaryakıt türü bazında satışlar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(dailyTotals.fuelTypeTotals).map(([fuelType, totals]) => (
                <div key={fuelType} className="border rounded-lg p-4 bg-gray-50">
                  <h5 className={`font-medium mb-3 ${getFuelTypeColor(fuelType)}`}>
                    {getFuelTypeLabel(fuelType)}
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tutar:</span>
                      <span className="font-semibold">{formatCurrency(totals.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Litre:</span>
                      <span className="font-semibold">{totals.liters.toFixed(2)} L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ort. Fiyat:</span>
                      <span className="font-semibold">{formatCurrency(totals.amount / totals.liters)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sales List */}
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Fuel className="h-5 w-5 text-blue-500" />
            <span>Satış Listesi</span>
            {selectedDate && (
              <span className="text-sm text-gray-500">
                ({format(selectedDate, 'dd/MM/yyyy', { locale: tr })})
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Günlük akaryakıt satış kayıtları
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSales.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Saat</TableHead>
                    <TableHead>Akaryakıt Türü</TableHead>
                    <TableHead>Personel</TableHead>
                    <TableHead>Litre</TableHead>
                    <TableHead>Litre Fiyatı</TableHead>
                    <TableHead>Toplam Tutar</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-mono text-sm">
                        {new Date(sale.sale_time).toLocaleTimeString('tr-TR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${getFuelTypeColor(sale.fuel_type)}`}>
                          {getFuelTypeLabel(sale.fuel_type)}
                        </span>
                      </TableCell>
                      <TableCell>{personnel.find(p => p.id === sale.personnel_id)?.name || 'Bilinmeyen'}</TableCell>
                      <TableCell className="font-mono">{sale.liters.toFixed(3)} L</TableCell>
                      <TableCell className="font-mono">{formatCurrency(sale.price_per_liter)}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatCurrency(sale.total_amount)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(sale.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Fuel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Bu tarihte satış yok
              </h3>
              <p className="text-gray-600">
                {selectedDate && format(selectedDate, "PPP", { locale: tr })} tarihinde henüz akaryakıt satışı kaydı bulunmuyor.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
