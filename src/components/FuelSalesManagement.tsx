
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FuelSalesEditDialog } from '@/components/FuelSalesEditDialog';
import { FuelSalesExcelUpload } from '@/components/FuelSalesExcelUpload';
import { Fuel, Plus, Edit, Trash2, Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import { useFuelSales } from '@/hooks/useFuelSales';
import { formatCurrency } from '@/lib/numberUtils';
import { toast } from 'sonner';

export const FuelSalesManagement = () => {
  const { fuelSales, loading, addFuelSale, deleteFuelSale, updateFuelSale } = useFuelSales();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSale, setEditingSale] = useState<any>(null);
  const [dateRange, setDateRange] = useState('today');
  const [fuelTypeFilter, setFuelTypeFilter] = useState('all');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [fuelSaleData, setFuelSaleData] = useState({
    fuel_type: '',
    liters: '',
    price_per_liter: '',
    sale_time: new Date().toISOString().slice(0, 16),
    shift: 'Gündüz'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFuelSaleData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddFuelSale = async () => {
    if (!fuelSaleData.fuel_type || !fuelSaleData.liters || !fuelSaleData.price_per_liter) {
      toast.error("Lütfen tüm alanları doldurun.");
      return;
    }

    const liters = parseFloat(fuelSaleData.liters);
    const pricePerLiter = parseFloat(fuelSaleData.price_per_liter);

    if (liters <= 0 || pricePerLiter <= 0) {
      toast.error("Litre ve fiyat değerleri pozitif olmalıdır.");
      return;
    }

    const saleTime = new Date(fuelSaleData.sale_time).toISOString();

    const newFuelSale = {
      fuel_type: fuelSaleData.fuel_type,
      liters: liters,
      price_per_liter: pricePerLiter,
      total_amount: liters * pricePerLiter,
      amount: liters * pricePerLiter,
      sale_time: saleTime,
      shift: fuelSaleData.shift
    };

    const { error } = await addFuelSale(newFuelSale);

    if (error) {
      toast.error("Yakıt satışı eklenirken bir hata oluştu.");
    } else {
      toast.success("Yakıt satışı başarıyla eklendi.");
      setShowAddDialog(false);
      setFuelSaleData({
        fuel_type: '',
        liters: '',
        price_per_liter: '',
        sale_time: new Date().toISOString().slice(0, 16),
        shift: 'Gündüz'
      });
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

  // Date filtering logic
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

  // Calculate sales by fuel type
  const salesByType = filteredSales.reduce((acc, sale) => {
    if (!acc[sale.fuel_type]) {
      acc[sale.fuel_type] = { amount: 0, liters: 0 };
    }
    acc[sale.fuel_type].amount += sale.total_amount;
    acc[sale.fuel_type].liters += sale.liters;
    return acc;
  }, {} as Record<string, { amount: number; liters: number }>);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Yakıt Satışları</h2>
          <p className="text-gray-600">Yakıt satışlarınızı kaydedin ve takip edin</p>
        </div>
        <div className="flex space-x-2">
          <FuelSalesExcelUpload />
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Satış Ekle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Yakıt Satışı Ekle</DialogTitle>
                <DialogDescription>
                  Yakıt satış bilgilerini girin.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="fuel_type">Yakıt Tipi</Label>
                  <Select onValueChange={(value) => setFuelSaleData(prev => ({ ...prev, fuel_type: value }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Yakıt Tipi Seç" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MOTORİN">Motorin</SelectItem>
                      <SelectItem value="LPG">LPG</SelectItem>
                      <SelectItem value="BENZİN">Benzin</SelectItem>
                      <SelectItem value="MOTORİN(DİĞER)">Motorin (Diğer)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="liters">Litre</Label>
                  <Input
                    type="number"
                    name="liters"
                    value={fuelSaleData.liters}
                    onChange={handleInputChange}
                    placeholder="Litre"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_per_liter">Litre Fiyatı</Label>
                  <Input
                    type="number"
                    name="price_per_liter"
                    value={fuelSaleData.price_per_liter}
                    onChange={handleInputChange}
                    placeholder="Litre Fiyatı"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sale_time">Satış Zamanı</Label>
                  <Input
                    type="datetime-local"
                    name="sale_time"
                    value={fuelSaleData.sale_time}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shift">Vardiya</Label>
                  <Select onValueChange={(value) => setFuelSaleData(prev => ({ ...prev, shift: value }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Vardiya Seç" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gündüz">Gündüz</SelectItem>
                      <SelectItem value="Gece">Gece</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  İptal
                </Button>
                <Button onClick={handleAddFuelSale}>Ekle</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Filtreler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <SelectItem value="Gündüz">Gündüz</SelectItem>
                  <SelectItem value="Gece">Gece</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Toplam Satış
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalSalesAmount)}</div>
            <p className="text-xs text-gray-500">{totalLitersSold.toFixed(2)} Litre</p>
          </CardContent>
        </Card>

        {Object.entries(salesByType).map(([fuelType, data]) => (
          <Card key={fuelType}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Fuel className="h-4 w-4" />
                {fuelType}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{formatCurrency(data.amount)}</div>
              <p className="text-xs text-gray-500">{data.liters.toFixed(2)} Litre</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sales List */}
      <Card>
        <CardHeader>
          <CardTitle>Satış Listesi ({filteredSales.length} kayıt)</CardTitle>
          <CardDescription>Seçilen kriterlere göre yakıt satışları</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                    Yakıt Tipi
                  </th>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                    Litre
                  </th>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                    Birim Fiyat
                  </th>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                    Toplam
                  </th>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                    Tarih/Saat
                  </th>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                    Vardiya
                  </th>
                  <th className="px-4 py-3 bg-gray-50"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {sale.fuel_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{sale.liters.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(sale.price_per_liter)}</td>
                    <td className="px-4 py-3 text-sm font-medium">{formatCurrency(sale.total_amount)}</td>
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
