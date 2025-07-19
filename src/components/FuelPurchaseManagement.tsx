
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Truck, Trash2 } from 'lucide-react';
import { useFuelPurchases } from '@/hooks/useFuelPurchases';
import { formatCurrency } from '@/lib/numberUtils';
import { toast } from 'sonner';

export const FuelPurchaseManagement = () => {
  const { fuelPurchases, loading, addFuelPurchase, deleteFuelPurchase } = useFuelPurchases();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [purchaseData, setPurchaseData] = useState({
    fuel_type: '',
    liters: '',
    purchase_price_per_liter: '',
    purchase_date: new Date().toISOString().slice(0, 16),
    supplier: '',
    invoice_number: '',
    notes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPurchaseData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPurchase = async () => {
    if (!purchaseData.fuel_type || !purchaseData.liters || !purchaseData.purchase_price_per_liter) {
      toast.error("Lütfen zorunlu alanları doldurun.");
      return;
    }

    const liters = parseFloat(purchaseData.liters);
    const pricePerLiter = parseFloat(purchaseData.purchase_price_per_liter);

    if (liters <= 0 || pricePerLiter <= 0) {
      toast.error("Litre ve fiyat değerleri pozitif olmalıdır.");
      return;
    }

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
      toast.error("Yakıt alımı eklenirken bir hata oluştu.");
    } else {
      toast.success("Yakıt alımı başarıyla eklendi.");
      setShowAddDialog(false);
      setPurchaseData({
        fuel_type: '',
        liters: '',
        purchase_price_per_liter: '',
        purchase_date: new Date().toISOString().slice(0, 16),
        supplier: '',
        invoice_number: '',
        notes: ''
      });
    }
  };

  const handleDeletePurchase = async (purchaseId: string) => {
    const confirmDelete = window.confirm("Bu yakıt alımını silmek istediğinizden emin misiniz?");
    if (!confirmDelete) return;

    const { error } = await deleteFuelPurchase(purchaseId);

    if (error) {
      toast.error("Yakıt alımı silinirken bir hata oluştu.");
    } else {
      toast.success("Yakıt alımı başarıyla silindi.");
    }
  };

  const totalPurchases = fuelPurchases.reduce((sum, purchase) => sum + purchase.total_amount, 0);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Yakıt Alımları</h2>
          <p className="text-gray-600">İstasyonunuzun yakıt alımlarını kaydedin</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Alım Ekle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Yakıt Alımı</DialogTitle>
              <DialogDescription>
                Yakıt alım bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fuel_type">Yakıt Tipi *</Label>
                <Select onValueChange={(value) => setPurchaseData(prev => ({ ...prev, fuel_type: value }))}>
                  <SelectTrigger>
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
                <Label htmlFor="liters">Litre *</Label>
                <Input
                  type="number"
                  name="liters"
                  value={purchaseData.liters}
                  onChange={handleInputChange}
                  placeholder="Litre"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchase_price_per_liter">Alış Fiyatı (Litre) *</Label>
                <Input
                  type="number"
                  name="purchase_price_per_liter"
                  value={purchaseData.purchase_price_per_liter}
                  onChange={handleInputChange}
                  placeholder="Alış Fiyatı"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchase_date">Alım Tarihi</Label>
                <Input
                  type="datetime-local"
                  name="purchase_date"
                  value={purchaseData.purchase_date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier">Tedarikçi</Label>
                <Input
                  name="supplier"
                  value={purchaseData.supplier}
                  onChange={handleInputChange}
                  placeholder="Tedarikçi adı"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice_number">Fatura No</Label>
                <Input
                  name="invoice_number"
                  value={purchaseData.invoice_number}
                  onChange={handleInputChange}
                  placeholder="Fatura numarası"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notlar</Label>
                <Textarea
                  name="notes"
                  value={purchaseData.notes}
                  onChange={handleInputChange}
                  placeholder="Ek notlar"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                İptal
              </Button>
              <Button onClick={handleAddPurchase}>Ekle</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Toplam Alım: {formatCurrency(totalPurchases)}
          </CardTitle>
          <CardDescription>
            Toplam {fuelPurchases.length} alım kaydı
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
                    Tarih
                  </th>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                    Tedarikçi
                  </th>
                  <th className="px-4 py-3 bg-gray-50"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fuelPurchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {purchase.fuel_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{purchase.liters.toFixed(2)} Lt</td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(purchase.purchase_price_per_liter)}</td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600">{formatCurrency(purchase.total_amount)}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(purchase.purchase_date).toLocaleString('tr-TR')}
                    </td>
                    <td className="px-4 py-3 text-sm">{purchase.supplier || '-'}</td>
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
    </div>
  );
};
