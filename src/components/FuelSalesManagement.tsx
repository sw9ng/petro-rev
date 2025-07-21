
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { FuelSalesEditDialog } from '@/components/FuelSalesEditDialog';
import { FuelSalesExcelUpload } from '@/components/FuelSalesExcelUpload';
import { Fuel, Plus, Edit, Trash2, Calendar as CalendarIcon, TrendingUp, BarChart3, Check, X } from 'lucide-react';
import { useFuelSales } from '@/hooks/useFuelSales';
import { formatCurrency } from '@/lib/numberUtils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface FuelSaleEntry {
  fuel_type: string;
  liters: string;
  total_amount: string;
  price_per_liter?: number;
}

export const FuelSalesManagement = () => {
  const { fuelSales, loading, addFuelSale, deleteFuelSale, updateFuelSale } = useFuelSales();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSale, setEditingSale] = useState<any>(null);
  const [dateRange, setDateRange] = useState('today');
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [fuelTypeFilter, setFuelTypeFilter] = useState('all');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [selectedSales, setSelectedSales] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const [fuelEntries, setFuelEntries] = useState<FuelSaleEntry[]>([
    { fuel_type: 'MOTORİN', liters: '', total_amount: '' },
    { fuel_type: 'LPG', liters: '', total_amount: '' },
    { fuel_type: 'BENZİN', liters: '', total_amount: '' },
    { fuel_type: 'MOTORİN(DİĞER)', liters: '', total_amount: '' },
  ]);

  const [saleDateTime, setSaleDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [shift, setShift] = useState('V1');

  const calculatePricePerLiter = (liters: string, totalAmount: string): number => {
    const litersNum = parseFloat(liters) || 0;
    const totalNum = parseFloat(totalAmount) || 0;
    return litersNum > 0 ? totalNum / litersNum : 0;
  };

  const handleEntryChange = (index: number, field: 'liters' | 'total_amount', value: string) => {
    const newEntries = [...fuelEntries];
    newEntries[index][field] = value;
    
    // Otomatik hesaplama
    if (field === 'liters' || field === 'total_amount') {
      const liters = newEntries[index].liters;
      const totalAmount = newEntries[index].total_amount;
      newEntries[index].price_per_liter = calculatePricePerLiter(liters, totalAmount);
    }
    
    setFuelEntries(newEntries);
  };

  const handleBulkAddSales = async () => {
    const validEntries = fuelEntries.filter(entry => 
      parseFloat(entry.liters) > 0 && parseFloat(entry.total_amount) > 0
    );

    if (validEntries.length === 0) {
      toast.error("En az bir yakıt türü için litre ve tutar giriniz.");
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const entry of validEntries) {
      const liters = parseFloat(entry.liters);
      const totalAmount = parseFloat(entry.total_amount);
      const pricePerLiter = calculatePricePerLiter(entry.liters, entry.total_amount);

      const newFuelSale = {
        fuel_type: entry.fuel_type,
        liters: liters,
        price_per_liter: pricePerLiter,
        total_amount: totalAmount,
        amount: totalAmount,
        sale_time: new Date(saleDateTime).toISOString(),
        shift: shift
      };

      const { error } = await addFuelSale(newFuelSale);

      if (error) {
        errorCount++;
        console.error(`${entry.fuel_type} satışı eklenirken hata:`, error);
      } else {
        successCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} yakıt satışı başarıyla eklendi.`);
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} yakıt satışı eklenirken hata oluştu.`);
    }

    if (successCount > 0) {
      setShowAddDialog(false);
      // Formu temizle
      setFuelEntries([
        { fuel_type: 'MOTORİN', liters: '', total_amount: '' },
        { fuel_type: 'LPG', liters: '', total_amount: '' },
        { fuel_type: 'BENZİN', liters: '', total_amount: '' },
        { fuel_type: 'MOTORİN(DİĞER)', liters: '', total_amount: '' },
      ]);
      setSaleDateTime(new Date().toISOString().slice(0, 16));
      setShift('V1');
    }
  };

  const handleEditFuelSale = (sale: any) => {
    setEditingSale(sale);
  };

  const handleUpdateFuelSale = async (saleId: string, updatedData: any) => {
    const { error } = await updateFuelSale(saleId, updatedData);
    if (error) {
      toast.error("Yakıt satışı güncellenirken bir hata oluştu.");
    } else {
      toast.success("Yakıt satışı başarıyla güncellendi.");
      setEditingSale(null);
    }
  };

  const handleDeleteFuelSale = async (saleId: string) => {
    const confirmDelete = window.confirm("Bu yakıt satışını silmek istediğinizden emin misiniz?");
    if (!confirmDelete) return;

    const { error } = await deleteFuelSale(saleId);

    if (error) {
      toast.error("Yakıt satışı silinirken bir hata oluştu.");
    } else {
      toast.success("Yakıt satışı başarıyla silindi.");
    }
  };

  const handleSaleSelection = (saleId: string, checked: boolean) => {
    if (checked) {
      setSelectedSales(prev => [...prev, saleId]);
    } else {
      setSelectedSales(prev => prev.filter(id => id !== saleId));
    }
  };

  const handleSelectAll = () => {
    if (selectedSales.length === filteredSales.length) {
      setSelectedSales([]);
    } else {
      setSelectedSales(filteredSales.map(sale => sale.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSales.length === 0) {
      toast.error("Silinecek satış seçiniz.");
      return;
    }

    const confirmDelete = window.confirm(`${selectedSales.length} adet yakıt satışını silmek istediğinizden emin misiniz?`);
    if (!confirmDelete) return;

    let successCount = 0;
    let errorCount = 0;

    for (const saleId of selectedSales) {
      const { error } = await deleteFuelSale(saleId);
      if (error) {
        errorCount++;
      } else {
        successCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} adet yakıt satışı başarıyla silindi.`);
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} adet yakıt satışı silinirken hata oluştu.`);
    }

    setSelectedSales([]);
    setIsSelectionMode(false);
  };

  const getDateFilter = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateRange) {
      case 'today':
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        return { start: weekStart, end: weekEnd };
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return { start: monthStart, end: monthEnd };
      case 'custom':
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          return { start, end };
        }
        return null;
      default:
        return null;
    }
  };

  const filteredSales = fuelSales.filter(sale => {
    const dateFilter = getDateFilter();
    if (dateFilter) {
      const saleDate = new Date(sale.sale_time);
      if (saleDate < dateFilter.start || saleDate >= dateFilter.end) {
        return false;
      }
    }

    if (fuelTypeFilter !== 'all' && sale.fuel_type !== fuelTypeFilter) {
      return false;
    }

    if (shiftFilter !== 'all' && sale.shift !== shiftFilter) {
      return false;
    }

    return true;
  });

  const totalSalesAmount = filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0);
  const totalLitersSold = filteredSales.reduce((sum, sale) => sum + sale.liters, 0);

  const salesByType = filteredSales.reduce((acc, sale) => {
    if (!acc[sale.fuel_type]) {
      acc[sale.fuel_type] = { amount: 0, liters: 0 };
    }
    acc[sale.fuel_type].amount += sale.total_amount;
    acc[sale.fuel_type].liters += sale.liters;
    return acc;
  }, {} as Record<string, { amount: number; liters: number }>);

  const getTotalForEntry = () => {
    return fuelEntries.reduce((sum, entry) => sum + (parseFloat(entry.total_amount) || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Yakıt Satışları</h2>
          <p className="text-gray-600">Yakıt satışlarınızı kaydedin ve takip edin</p>
        </div>
        <div className="flex space-x-2">
          <FuelSalesExcelUpload />
          {isSelectionMode ? (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => {
                setIsSelectionMode(false);
                setSelectedSales([]);
              }}>
                <X className="h-4 w-4 mr-2" />
                İptal
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleBulkDelete}
                disabled={selectedSales.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Seçilenleri Sil ({selectedSales.length})
              </Button>
            </div>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => setIsSelectionMode(true)}
                disabled={filteredSales.length === 0}
              >
                <Check className="h-4 w-4 mr-2" />
                Seçmeli Sil
              </Button>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                    <Plus className="h-4 w-4 mr-2" />
                    Yakıt Satışı Ekle
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Yakıt Satışları Ekle</DialogTitle>
                    <DialogDescription>
                      Tüm yakıt türleri için satış bilgilerini girin. Litre ve tutar girdiğinizde litre fiyatı otomatik hesaplanacak.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sale_time">Satış Zamanı</Label>
                        <Input
                          type="datetime-local"
                          value={saleDateTime}
                          onChange={(e) => setSaleDateTime(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shift">Vardiya</Label>
                        <Select value={shift} onValueChange={setShift}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="V1">V1</SelectItem>
                            <SelectItem value="V2">V2</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="text-lg font-semibold">Yakıt Satışları</div>
                      <div className="grid gap-4">
                        {fuelEntries.map((entry, index) => (
                          <Card key={entry.fuel_type} className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <Fuel className="h-5 w-5 text-blue-600" />
                                <span className="font-medium">{entry.fuel_type}</span>
                              </div>
                              {entry.price_per_liter && entry.price_per_liter > 0 && (
                                <span className="text-sm text-gray-500">
                                  {entry.price_per_liter.toFixed(2)} ₺/Lt
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label className="text-sm">Litre</Label>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={entry.liters}
                                  onChange={(e) => handleEntryChange(index, 'liters', e.target.value)}
                                  className="text-right"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm">Tutar (₺)</Label>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={entry.total_amount}
                                  onChange={(e) => handleEntryChange(index, 'total_amount', e.target.value)}
                                  className="text-right"
                                />
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {getTotalForEntry() > 0 && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-lg font-semibold text-green-800">
                          Toplam Tutar: {formatCurrency(getTotalForEntry())}
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      İptal
                    </Button>
                    <Button onClick={handleBulkAddSales} className="bg-green-600 hover:bg-green-700">
                      Satışları Ekle
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Filtreler ve Tarih Seçimi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Zaman Aralığı</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Bugün</SelectItem>
                  <SelectItem value="week">Bu Hafta</SelectItem>
                  <SelectItem value="month">Bu Ay</SelectItem>
                  <SelectItem value="custom">Özel Tarih</SelectItem>
                  <SelectItem value="all">Tümü</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Yakıt Tipi</Label>
              <Select value={fuelTypeFilter} onValueChange={setFuelTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="MOTORİN">Motorin</SelectItem>
                  <SelectItem value="LPG">LPG</SelectItem>
                  <SelectItem value="BENZİN">Benzin</SelectItem>
                  <SelectItem value="MOTORİN(DİĞER)">Motorin (Diğer)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Vardiya</Label>
              <Select value={shiftFilter} onValueChange={setShiftFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="V1">V1</SelectItem>
                  <SelectItem value="V2">V2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === 'custom' && (
              <div className="col-span-1 md:col-span-2 lg:col-span-1">
                <Label>Tarih Aralığı</Label>
                <div className="flex space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !customStartDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customStartDate ? format(customStartDate, "dd.MM.yyyy", { locale: tr }) : "Başlangıç"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={customStartDate}
                        onSelect={setCustomStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !customEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customEndDate ? format(customEndDate, "dd.MM.yyyy", { locale: tr }) : "Bitiş"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={customEndDate}
                        onSelect={setCustomEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Toplam Satış
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSalesAmount)}</div>
            <p className="text-xs text-green-100">{totalLitersSold.toFixed(2)} Litre</p>
          </CardContent>
        </Card>

        {Object.entries(salesByType).map(([fuelType, data]) => (
          <Card key={fuelType} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Fuel className="h-4 w-4" />
                {fuelType}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{formatCurrency(data.amount)}</div>
              <p className="text-xs text-blue-100">{data.liters.toFixed(2)} Litre</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Satış Listesi ({filteredSales.length} kayıt)</span>
            {isSelectionMode && filteredSales.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedSales.length === filteredSales.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            Seçilen kriterlere göre yakıt satışları - Toplam: {formatCurrency(totalSalesAmount)} / {totalLitersSold.toFixed(2)} Litre
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  {isSelectionMode && (
                    <th className="px-4 py-3">
                      <Checkbox
                        checked={selectedSales.length === filteredSales.length && filteredSales.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Yakıt Tipi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Litre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Birim Fiyat
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Toplam
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tarih/Saat
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vardiya
                  </th>
                  {!isSelectionMode && (
                    <th className="px-4 py-3"></th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    {isSelectionMode && (
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedSales.includes(sale.id)}
                          onCheckedChange={(checked) => handleSaleSelection(sale.id, checked as boolean)}
                        />
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {sale.fuel_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{sale.liters.toFixed(2)} Lt</td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(sale.price_per_liter)}</td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600">{formatCurrency(sale.total_amount)}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(sale.sale_time).toLocaleString('tr-TR')}
                    </td>
                    <td className="px-4 py-3">
                      {sale.shift && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {sale.shift}
                        </span>
                      )}
                    </td>
                    {!isSelectionMode && (
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditFuelSale(sale)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 hover:text-red-700" 
                            onClick={() => handleDeleteFuelSale(sale.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {editingSale && (
        <FuelSalesEditDialog
          open={!!editingSale}
          onClose={() => setEditingSale(null)}
          sale={editingSale}
          onUpdate={handleUpdateFuelSale}
        />
      )}
    </div>
  );
};
