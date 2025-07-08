
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
import { formatCurrency } from '@/lib/numberUtils';
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
  
  const [newSale, setNewSale] = useState({
    fuel_type: '',
    liters: '',
    total_amount: '',
    shift: '',
        sale_time: format(new Date(), 'yyyy-MM-dd')
  });

  // Köy tankeri ve Motorin (Diğer) ayrı tutulacak - hesaplamadan çıkarılmadı
  const adjustedFuelSales = useMemo(() => {
    return fuelSales;
  }, [fuelSales]);

  const calculatePricePerLiter = () => {
    const liters = parseFloat(newSale.liters);
    const totalAmount = parseFloat(newSale.total_amount);
    
    if (liters > 0 && totalAmount > 0) {
      return (totalAmount / liters).toFixed(3);
    }
    return '0.000';
  };

  const handleAddSale = async () => {
    if (!newSale.fuel_type || !newSale.liters || !newSale.total_amount) {
      toast.error('Lütfen yakıt türü, litre ve toplam fiyat alanlarını doldurun');
      return;
    }

    const liters = parseFloat(newSale.liters);
    const totalAmount = parseFloat(newSale.total_amount);
    const pricePerLiter = totalAmount / liters;

    if (liters <= 0 || totalAmount <= 0) {
      toast.error('Litre ve toplam fiyat sıfırdan büyük olmalıdır');
      return;
    }

    const saleData = {
      fuel_type: newSale.fuel_type as 'MOTORİN' | 'LPG' | 'BENZİN' | 'MOTORİN(DİĞER)' | 'TRANSFER(KÖY-TANKERİ)',
      liters: liters,
      price_per_liter: pricePerLiter,
      total_amount: totalAmount,
      amount: totalAmount,
      sale_time: new Date(newSale.sale_time).toISOString(),
      shift: newSale.shift !== 'none' ? newSale.shift : undefined
    };

    const { error } = await addFuelSale(saleData);
    
    if (error) {
      toast.error('Yakıt satışı eklenirken hata oluştu');
    } else {
      toast.success('Yakıt satışı başarıyla eklendi');
      setNewSale({
        fuel_type: '',
        liters: '',
        total_amount: '',
        shift: 'none',
        sale_time: format(new Date(), 'yyyy-MM-dd')
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Yakıt Satışı</DialogTitle>
              <DialogDescription>
                Yeni bir yakıt satışı kaydı oluşturun
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Yakıt Türü</Label>
                <Select value={newSale.fuel_type} onValueChange={(value) => setNewSale({...newSale, fuel_type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Yakıt türü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {fuelTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Satılan Litre</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newSale.liters}
                  onChange={(e) => setNewSale({...newSale, liters: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Toplam Fiyat (₺)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newSale.total_amount}
                  onChange={(e) => setNewSale({...newSale, total_amount: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              {newSale.liters && newSale.total_amount && (
                <div>
                  <Label>Birim Fiyat (Otomatik)</Label>
                  <Input
                    type="text"
                    value={`₺${calculatePricePerLiter()}`}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
              )}
              <div>
                <Label>Vardiya (Opsiyonel)</Label>
                <Select value={newSale.shift} onValueChange={(value) => setNewSale({...newSale, shift: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vardiya seçin (opsiyonel)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Vardiya seçmeyin</SelectItem>
                    {shiftOptions.map(shift => (
                      <SelectItem key={shift.value} value={shift.value}>
                        {shift.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Satış Tarihi</Label>
                <Input
                  type="date"
                  value={newSale.sale_time}
                  onChange={(e) => setNewSale({...newSale, sale_time: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleAddSale}>
                Satış Ekle
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
