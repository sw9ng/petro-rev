import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFuelSales } from '@/hooks/useFuelSales';
import { formatCurrency, getIstanbulTime } from '@/lib/numberUtils';
import { Plus, Fuel, Calendar as CalendarIcon, TrendingUp, BarChart3, Trash2 } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const fuelTypes = [
  { value: 'BENZİN', label: 'Benzin' },
  { value: 'LPG', label: 'LPG' },
  { value: 'MOTORİN', label: 'Motorin' },
  { value: 'MOTORİN(DİĞER)', label: 'Motorin (Diğer)' },
  { value: 'TRANSFER(KÖY-TANKERİ)', label: 'Köy Tankeri (Transfer)' }
];

const shiftOptions = [
  { value: 'V1', label: 'Vardiya 1' },
  { value: 'V2', label: 'Vardiya 2' }
];

export const FuelSalesManagement = () => {
  const { fuelSales, loading, addFuelSale, deleteFuelSale } = useFuelSales();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState('daily');
  
  const [newSales, setNewSales] = useState({
    BENZİN: { liters: '', total_amount: '' },
    LPG: { liters: '', total_amount: '' },
    MOTORİN: { liters: '', total_amount: '' },
    'MOTORİN(DİĞER)': { liters: '', total_amount: '' },
    'TRANSFER(KÖY-TANKERİ)': { liters: '', total_amount: '' },
    shift: '',
    sale_time: format(getIstanbulTime(), 'yyyy-MM-dd')
  });

  // Köy tankeri ve Motorin (Diğer) ayrı tutulacak - hesaplamadan çıkarılmadı
  const adjustedFuelSales = useMemo(() => {
    return fuelSales;
  }, [fuelSales]);

  const calculatePricePerLiter = (fuelType: string) => {
    const saleData = newSales[fuelType as keyof typeof newSales];
    if (typeof saleData === 'object' && 'liters' in saleData && 'total_amount' in saleData) {
      const liters = parseFloat(saleData.liters);
      const totalAmount = parseFloat(saleData.total_amount);
      
      if (liters > 0 && totalAmount > 0) {
        return (totalAmount / liters).toFixed(3);
      }
    }
    return '0.000';
  };

  const handleAddSales = async () => {
    let hasErrors = false;
    const salesToAdd = [];

    // Her yakıt türü için kontrol et ve veri varsa ekle
    for (const fuelType of Object.keys(fuelTypes.reduce((acc, fuel) => ({ ...acc, [fuel.value]: true }), {}))) {
      const saleData = newSales[fuelType as keyof typeof newSales];
      
      if (typeof saleData === 'object' && 'liters' in saleData && 'total_amount' in saleData && 
          saleData.liters && saleData.total_amount) {
        const liters = parseFloat(saleData.liters);
        const totalAmount = parseFloat(saleData.total_amount);
        
        if (liters <= 0 || totalAmount <= 0) {
          toast.error(`${fuelTypes.find(f => f.value === fuelType)?.label}: Litre ve toplam fiyat sıfırdan büyük olmalıdır`);
          hasErrors = true;
          continue;
        }

        const pricePerLiter = totalAmount / liters;
        const istanbulTime = getIstanbulTime(new Date(newSales.sale_time));

        salesToAdd.push({
          fuel_type: fuelType as 'MOTORİN' | 'LPG' | 'BENZİN' | 'MOTORİN(DİĞER)' | 'TRANSFER(KÖY-TANKERİ)',
          liters: liters,
          price_per_liter: pricePerLiter,
          total_amount: totalAmount,
          amount: totalAmount,
          sale_time: istanbulTime.toISOString(),
          shift: newSales.shift || null
        });
      }
    }

    if (salesToAdd.length === 0) {
      toast.error('Lütfen en az bir yakıt türü için veri girin');
      return;
    }

    if (hasErrors) return;

    // Tüm satışları ekle
    for (const saleData of salesToAdd) {
      try {
        const { error } = await addFuelSale(saleData);
        
        if (error) {
          console.error('Fuel sale error:', error);
          const errorMessage = typeof error === 'string' ? error : (error as any)?.message || 'Bilinmeyen hata';
          toast.error(`${fuelTypes.find(f => f.value === saleData.fuel_type)?.label} satışı eklenirken hata oluştu: ${errorMessage}`);
          hasErrors = true;
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        toast.error(`${fuelTypes.find(f => f.value === saleData.fuel_type)?.label} satışı eklenirken beklenmeyen hata oluştu`);
        hasErrors = true;
      }
    }

    if (!hasErrors) {
      toast.success('Yakıt satışları başarıyla eklendi');
      setNewSales({
        BENZİN: { liters: '', total_amount: '' },
        LPG: { liters: '', total_amount: '' },
        MOTORİN: { liters: '', total_amount: '' },
        'MOTORİN(DİĞER)': { liters: '', total_amount: '' },
        'TRANSFER(KÖY-TANKERİ)': { liters: '', total_amount: '' },
        shift: '',
        sale_time: format(getIstanbulTime(), 'yyyy-MM-dd')
      });
      setIsDialogOpen(false);
    }
  };

  const handleDeleteSale = async (saleId: string) => {
    const { error } = await deleteFuelSale(saleId);
    
    if (error) {
      toast.error('Yakıt satışı silinirken hata oluştu');
    } else {
      toast.success('Yakıt satışı başarıyla silindi');
    }
  };

  // Günlük satışlar
  const dailySales = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return adjustedFuelSales.filter(sale => sale.sale_time.startsWith(dateStr));
  }, [adjustedFuelSales, selectedDate]);

  // Haftalık satışlar
  const weeklySales = useMemo(() => {
    if (!selectedDate) return [];
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    
    return adjustedFuelSales.filter(sale => {
      const saleDate = new Date(sale.sale_time);
      return isWithinInterval(saleDate, { start: weekStart, end: weekEnd });
    });
  }, [adjustedFuelSales, selectedDate]);

  // Aylık satışlar
  const monthlySales = useMemo(() => {
    if (!selectedDate) return [];
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    
    return adjustedFuelSales.filter(sale => {
      const saleDate = new Date(sale.sale_time);
      return isWithinInterval(saleDate, { start: monthStart, end: monthEnd });
    });
  }, [adjustedFuelSales, selectedDate]);

  const getSalesData = () => {
    switch (activeTab) {
      case 'daily': return dailySales;
      case 'weekly': return weeklySales;
      case 'monthly': return monthlySales;
      default: return dailySales;
    }
  };

  const getSalesStats = (sales: any[]) => {
    const stats = {
      totalSales: sales.reduce((sum, sale) => sum + sale.total_amount, 0),
      totalLiters: sales.reduce((sum, sale) => sum + sale.liters, 0),
      fuelTypes: {} as Record<string, { liters: number, amount: number }>
    };

    sales.forEach(sale => {
      if (!stats.fuelTypes[sale.fuel_type]) {
        stats.fuelTypes[sale.fuel_type] = { liters: 0, amount: 0 };
      }
      stats.fuelTypes[sale.fuel_type].liters += sale.liters;
      stats.fuelTypes[sale.fuel_type].amount += sale.total_amount;
    });

    return stats;
  };

  const currentSales = getSalesData();
  const stats = getSalesStats(currentSales);

  const getPeriodText = () => {
    if (!selectedDate) return '';
    switch (activeTab) {
      case 'daily': return format(selectedDate, 'dd MMMM yyyy', { locale: tr });
      case 'weekly': return `${format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'dd MMM', { locale: tr })} - ${format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'dd MMM yyyy', { locale: tr })}`;
      case 'monthly': return format(selectedDate, 'MMMM yyyy', { locale: tr });
      default: return '';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Yakıt Satış Yönetimi
          </h2>
          <p className="text-gray-600 mt-2">Yakıt satışlarınızı takip edin ve analiz edin</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Yakıt Satışı Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tüm Yakıt Satışları</DialogTitle>
              <DialogDescription>
                Tüm yakıt türlerini tek seferde girin
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fuelTypes.map(fuelType => (
                  <Card key={fuelType.value} className="border border-gray-200 shadow-sm">
                    <CardHeader className="pb-3 bg-gray-50 rounded-t-lg">
                      <CardTitle className="text-lg text-gray-800">{fuelType.label}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4">
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Satılan Litre</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={(newSales[fuelType.value as keyof typeof newSales] as any).liters}
                            onChange={(e) => setNewSales({
                              ...newSales,
                              [fuelType.value]: {
                                ...(newSales[fuelType.value as keyof typeof newSales] as any),
                                liters: e.target.value
                              }
                            })}
                            placeholder="0.00"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Toplam Fiyat (₺)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={(newSales[fuelType.value as keyof typeof newSales] as any).total_amount}
                            onChange={(e) => setNewSales({
                              ...newSales,
                              [fuelType.value]: {
                                ...(newSales[fuelType.value as keyof typeof newSales] as any),
                                total_amount: e.target.value
                              }
                            })}
                            placeholder="0.00"
                            className="mt-1"
                          />
                        </div>
                        {(newSales[fuelType.value as keyof typeof newSales] as any).liters && 
                         (newSales[fuelType.value as keyof typeof newSales] as any).total_amount && (
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Birim Fiyat (Otomatik)</Label>
                            <Input
                              type="text"
                              value={`₺${calculatePricePerLiter(fuelType.value)}`}
                              readOnly
                              className="bg-green-50 border-green-200 text-green-800 mt-1"
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Vardiya (Opsiyonel)</Label>
                  <Select value={newSales.shift} onValueChange={(value) => setNewSales({...newSales, shift: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Vardiya seçin (opsiyonel)" />
                    </SelectTrigger>
                    <SelectContent>
                      {shiftOptions.map(shift => (
                        <SelectItem key={shift.value} value={shift.value}>
                          {shift.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Satış Tarihi</Label>
                  <Input
                    type="date"
                    value={newSales.sale_time}
                    onChange={(e) => setNewSales({...newSales, sale_time: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="border-t pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleAddSales} className="bg-blue-600 hover:bg-blue-700">
                Satışları Ekle
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs and Date Selector */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="daily">Günlük</TabsTrigger>
            <TabsTrigger value="weekly">Haftalık</TabsTrigger>
            <TabsTrigger value="monthly">Aylık</TabsTrigger>
          </TabsList>
        </Tabs>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {getPeriodText()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Satış</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalSales)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Litre</CardTitle>
            <Fuel className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalLiters.toFixed(2)} L
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">İşlem Sayısı</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {currentSales.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yakıt Türü Detayları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(stats.fuelTypes).map(([fuelType, data]) => (
          <Card key={fuelType}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                {fuelTypes.find(f => f.value === fuelType)?.label || fuelType}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Litre:</span>
                  <span className="text-sm font-medium">{data.liters.toFixed(2)} L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tutar:</span>
                  <span className="text-sm font-medium">{formatCurrency(data.amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Satış Detayları - {getPeriodText()}</CardTitle>
          <CardDescription>
            {activeTab === 'daily' && 'Günlük'}
            {activeTab === 'weekly' && 'Haftalık'}
            {activeTab === 'monthly' && 'Aylık'} yakıt satış detayları
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentSales.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Yakıt Türü</TableHead>
                    <TableHead>Vardiya</TableHead>
                    <TableHead>Litre</TableHead>
                    <TableHead>Birim Fiyat</TableHead>
                    <TableHead>Toplam</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>
                        {format(new Date(sale.sale_time), 'dd/MM/yyyy HH:mm', { locale: tr })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {fuelTypes.find(f => f.value === sale.fuel_type)?.label || sale.fuel_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {sale.shift ? (
                          <Badge variant="secondary">
                            {shiftOptions.find(s => s.value === sale.shift)?.label || sale.shift}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>{sale.liters.toFixed(2)} L</TableCell>
                      <TableCell>{formatCurrency(sale.price_per_liter)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(sale.total_amount)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSale(sale.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
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
            <div className="text-center py-8 text-gray-500">
              Seçili dönem için yakıt satışı bulunamadı.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
