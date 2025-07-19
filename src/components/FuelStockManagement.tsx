
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Fuel, Plus, Package, ShoppingCart, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useFuelStock } from '@/hooks/useFuelStock';
import { useFuelPurchases } from '@/hooks/useFuelPurchases';
import { formatCurrency } from '@/lib/numberUtils';
import { toast } from 'sonner';

const fuelTypes = [
  { value: 'MOTORİN', label: 'Motorin' },
  { value: 'LPG', label: 'LPG' },
  { value: 'BENZİN', label: 'Benzin' },
  { value: 'MOTORİN(DİĞER)', label: 'Motorin (Diğer)' }
];

export const FuelStockManagement = () => {
  const { fuelStock, loading: stockLoading, updateStock, recalculateStock } = useFuelStock();
  const { fuelPurchases, loading: purchasesLoading, addFuelPurchase, deleteFuelPurchase } = useFuelPurchases();
  
  const [showAddPurchaseDialog, setShowAddPurchaseDialog] = useState(false);
  const [purchaseData, setPurchaseData] = useState({
    fuel_type: '',
    liters: '',
    purchase_price_per_liter: '',
    purchase_date: new Date().toISOString().slice(0, 16),
    supplier: '',
    invoice_number: '',
    notes: ''
  });

  const handleAddPurchase = async () => {
    if (!purchaseData.fuel_type || !purchaseData.liters || !purchaseData.purchase_price_per_liter) {
      toast.error("Yakıt tipi, litre ve fiyat alanları zorunludur.");
      return;
    }

    const liters = parseFloat(purchaseData.liters);
    const pricePerLiter = parseFloat(purchaseData.purchase_price_per_liter);

    if (liters <= 0 || pricePerLiter <= 0) {
      toast.error("Litre ve fiyat değerleri pozitif olmalıdır.");
      return;
    }

    console.log('Adding purchase:', { 
      fuel_type: purchaseData.fuel_type, 
      liters, 
      price: pricePerLiter 
    });

    const newPurchase = {
      fuel_type: purchaseData.fuel_type,
      liters: liters,
      purchase_price_per_liter: pricePerLiter,
      total_amount: liters * pricePerLiter,
      purchase_date: new Date(purchaseData.purchase_date).toISOString(),
      supplier: purchaseData.supplier || null,
      invoice_number: purchaseData.invoice_number || null,
      notes: purchaseData.notes || null
    };

    const { error } = await addFuelPurchase(newPurchase);

    if (error) {
      console.error('Purchase add error:', error);
      toast.error("Yakıt alımı eklenirken bir hata oluştu.");
    } else {
      toast.success("Yakıt alımı başarıyla eklendi ve stok güncellendi.");
      setShowAddPurchaseDialog(false);
      setPurchaseData({
        fuel_type: '',
        liters: '',
        purchase_price_per_liter: '',
        purchase_date: new Date().toISOString().slice(0, 16),
        supplier: '',
        invoice_number: '',
        notes: ''
      });
      
      // Wait a bit then recalculate stock to ensure consistency
      setTimeout(async () => {
        await recalculateStock();
      }, 1000);
    }
  };

  const handleDeletePurchase = async (purchaseId: string) => {
    const confirmDelete = window.confirm("Bu yakıt alımını silmek istediğinizden emin misiniz? Stok da güncellenecektir.");
    if (!confirmDelete) return;

    console.log('Deleting purchase:', purchaseId);

    const { error } = await deleteFuelPurchase(purchaseId);

    if (error) {
      console.error('Purchase delete error:', error);
      toast.error("Yakıt alımı silinirken bir hata oluştu.");
    } else {
      toast.success("Yakıt alımı başarıyla silindi ve stok güncellendi.");
      
      // Wait a bit then recalculate stock to ensure consistency
      setTimeout(async () => {
        await recalculateStock();
      }, 1000);
    }
  };

  const handleRecalculateStock = async () => {
    console.log('Manual stock recalculation triggered');
    toast.info("Stok yeniden hesaplanıyor...");
    await recalculateStock();
    toast.success("Stok başarıyla yeniden hesaplandı.");
  };

  const getStockLevel = (currentStock: number) => {
    if (currentStock <= 0) return 'critical';
    if (currentStock <= 500) return 'low';
    if (currentStock <= 1000) return 'medium';
    return 'good';
  };

  const getStockColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'low': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  if (stockLoading || purchasesLoading) {
    return <div className="flex justify-center items-center h-64">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Stok & Alım Takibi</h2>
          <p className="text-gray-600">Yakıt stoklarınızı ve alımlarınızı takip edin</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleRecalculateStock}
            className="bg-yellow-50 hover:bg-yellow-100 border-yellow-200"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Stok Yeniden Hesapla
          </Button>
          <Dialog open={showAddPurchaseDialog} onOpenChange={setShowAddPurchaseDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Yakıt Alımı Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Yeni Yakıt Alımı</DialogTitle>
                <DialogDescription>
                  Yakıt alım bilgilerini girin. Stok otomatik olarak güncellenecektir.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Yakıt Tipi</Label>
                  <Select value={purchaseData.fuel_type} onValueChange={(value) => setPurchaseData(prev => ({ ...prev, fuel_type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Yakıt tipi seçin" />
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
                  <Label>Litre</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={purchaseData.liters}
                    onChange={(e) => setPurchaseData(prev => ({ ...prev, liters: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label>Alış Fiyatı (Litre)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={purchaseData.purchase_price_per_liter}
                    onChange={(e) => setPurchaseData(prev => ({ ...prev, purchase_price_per_liter: e.target.value }))}
                    placeholder="0.000"
                  />
                </div>

                {purchaseData.liters && purchaseData.purchase_price_per_liter && (
                  <div>
                    <Label>Toplam Tutar</Label>
                    <Input
                      type="text"
                      value={formatCurrency(parseFloat(purchaseData.liters) * parseFloat(purchaseData.purchase_price_per_liter))}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                )}

                <div>
                  <Label>Alım Tarihi</Label>
                  <Input
                    type="datetime-local"
                    value={purchaseData.purchase_date}
                    onChange={(e) => setPurchaseData(prev => ({ ...prev, purchase_date: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Tedarikçi (Opsiyonel)</Label>
                  <Input
                    value={purchaseData.supplier}
                    onChange={(e) => setPurchaseData(prev => ({ ...prev, supplier: e.target.value }))}
                    placeholder="Tedarikçi adı"
                  />
                </div>

                <div>
                  <Label>Fatura No (Opsiyonel)</Label>
                  <Input
                    value={purchaseData.invoice_number}
                    onChange={(e) => setPurchaseData(prev => ({ ...prev, invoice_number: e.target.value }))}
                    placeholder="Fatura numarası"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddPurchaseDialog(false)}>
                  İptal
                </Button>
                <Button onClick={handleAddPurchase}>
                  Alım Ekle
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="stock" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stock" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Mevcut Stoklar
          </TabsTrigger>
          <TabsTrigger value="purchases" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Alım Geçmişi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {fuelTypes.map(type => {
              const stock = fuelStock.find(s => s.fuel_type === type.value);
              const currentStock = stock?.current_stock || 0;
              const level = getStockLevel(currentStock);
              const colorClass = getStockColor(level);

              return (
                <Card key={type.value} className={`border-2 ${colorClass}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Fuel className="h-5 w-5" />
                      {type.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">
                      {currentStock.toFixed(2)} Lt
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      {level === 'critical' && <AlertTriangle className="h-4 w-4" />}
                      <span className="capitalize">
                        {level === 'critical' && 'Kritik Seviye'}
                        {level === 'low' && 'Düşük Stok'}
                        {level === 'medium' && 'Orta Seviye'}
                        {level === 'good' && 'İyi Seviye'}
                      </span>
                    </div>
                    {stock?.updated_at && (
                      <div className="text-xs text-gray-400 mt-1">
                        Son güncelleme: {new Date(stock.updated_at).toLocaleString('tr-TR')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="purchases">
          <Card>
            <CardHeader>
              <CardTitle>Yakıt Alım Geçmişi</CardTitle>
              <CardDescription>
                Yapılan yakıt alımları ve stok hareketleri
              </CardDescription>
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
                        Alış Fiyatı
                      </th>
                      <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                        Toplam
                      </th>
                      <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                        Tedarikçi
                      </th>
                      <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                        Alım Tarihi
                      </th>
                      <th className="px-4 py-3 bg-gray-50"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {fuelPurchases.map((purchase) => (
                      <tr key={purchase.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {purchase.fuel_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">{purchase.liters.toFixed(2)} Lt</td>
                        <td className="px-4 py-3 text-sm">{formatCurrency(purchase.purchase_price_per_liter)}</td>
                        <td className="px-4 py-3 text-sm font-bold text-green-600">{formatCurrency(purchase.total_amount)}</td>
                        <td className="px-4 py-3 text-sm">{purchase.supplier || '-'}</td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(purchase.purchase_date).toLocaleString('tr-TR')}
                        </td>
                        <td className="px-4 py-3">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 hover:text-red-700" 
                            onClick={() => handleDeletePurchase(purchase.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
