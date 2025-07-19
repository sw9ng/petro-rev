import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FuelSalesEditDialog } from '@/components/FuelSalesEditDialog';
import { FuelSalesExcelUpload } from '@/components/FuelSalesExcelUpload';
import { Fuel, Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { useFuelSales } from '@/hooks/useFuelSales';
import { formatCurrency } from '@/lib/numberUtils';
import { toast } from 'sonner';

export const FuelSalesManagement = () => {
  const { fuelSales, loading, addFuelSale, deleteFuelSale, updateFuelSale } = useFuelSales();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSale, setEditingSale] = useState<any>(null);
  const [dateFilter, setDateFilter] = useState('');
  const [fuelTypeFilter, setFuelTypeFilter] = useState('all');
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

  const filteredSales = fuelSales.filter(sale => {
    if (dateFilter) {
      const saleDate = sale.sale_time.split('T')[0];
      if (saleDate !== dateFilter) {
        return false;
      }
    }

    if (fuelTypeFilter !== 'all') {
      return sale.fuel_type === fuelTypeFilter;
    }

    return true;
  });

  const totalSalesAmount = filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0);
  const totalLitersSold = filteredSales.reduce((sum, sale) => sum + sale.liters, 0);

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
                    <SelectTrigger className="w-[180px]">
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
                    <SelectTrigger className="w-[180px]">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Toplam Satış Tutarı</CardTitle>
            <CardDescription>Filtrelenmiş satışların toplam tutarı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSalesAmount)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Toplam Satılan Litre</CardTitle>
            <CardDescription>Filtrelenmiş satışlarda toplam satılan litre</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLitersSold.toFixed(2)} L</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-4">
        <div>
          <Label htmlFor="date">Tarihe Göre Filtrele</Label>
          <Input
            type="date"
            id="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="fuel_type_filter">Yakıt Tipine Göre Filtrele</Label>
          <Select onValueChange={setDateFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Yakıt Tipi Seç" />
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
        <Button variant="outline" onClick={() => {
          setDateFilter('');
          setFuelTypeFilter('all');
        }}>
          Filtreleri Temizle
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Satış Listesi</CardTitle>
          <CardDescription>Yakıt satışlarınızın listesi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Yakıt Tipi
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Litre
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Litre Fiyatı
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Toplam Tutar
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Satış Zamanı
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Vardiya
                  </th>
                  <th className="px-6 py-3 bg-gray-50"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sale.fuel_type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sale.liters}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(sale.price_per_liter)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(sale.total_amount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(sale.sale_time).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sale.shift}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditFuelSale(sale)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Düzenle
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteFuelSale(sale.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Sil
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
