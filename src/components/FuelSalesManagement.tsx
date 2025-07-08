
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useFuelSales } from '@/hooks/useFuelSales';
import { usePersonnel } from '@/hooks/usePersonnel';
import { formatCurrency } from '@/lib/numberUtils';
import { Fuel, Plus, BarChart3, Droplets, TrendingUp, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const FuelSalesManagement = () => {
  const { fuelSales, addFuelSale, deleteFuelSale } = useFuelSales();
  const { personnel } = usePersonnel();

  const [selectedPersonnel, setSelectedPersonnel] = useState<string>('');
  const [fuelType, setFuelType] = useState<string>('');
  const [liters, setLiters] = useState<string>('');
  const [pricePerLiter, setPricePerLiter] = useState<string>('');
  const [transferLiters, setTransferLiters] = useState<string>('');
  const [transferPrice, setTransferPrice] = useState<string>('');

  // Calculate daily totals
  const dailyTotals = useMemo(() => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const todaysSales = fuelSales.filter(sale => {
      const saleDate = new Date(sale.sale_time);
      return saleDate >= startOfDay && saleDate <= endOfDay;
    });

    const totalsByType = {
      'MOTORİN': { liters: 0, amount: 0 },
      'BENZİN': { liters: 0, amount: 0 },
      'LPG': { liters: 0, amount: 0 },
      'MOTORİN(DİĞER)': { liters: 0, amount: 0 }
    };

    todaysSales.forEach(sale => {
      totalsByType[sale.fuel_type].liters += sale.liters;
      totalsByType[sale.fuel_type].amount += sale.total_amount;
    });

    const grandTotal = {
      liters: Object.values(totalsByType).reduce((sum, type) => sum + type.liters, 0),
      amount: Object.values(totalsByType).reduce((sum, type) => sum + type.amount, 0)
    };

    return { totalsByType, grandTotal };
  }, [fuelSales]);

  const handleAddFuelSale = async () => {
    if (!selectedPersonnel || !fuelType || !liters || !pricePerLiter) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    const literValue = parseFloat(liters);
    const priceValue = parseFloat(pricePerLiter);
    const totalAmount = literValue * priceValue;

    const result = await addFuelSale({
      fuel_type: fuelType,
      liters: literValue,
      price_per_liter: priceValue,
      total_amount: totalAmount,
      amount: totalAmount,
      sale_time: new Date().toISOString(),
      personnel_id: selectedPersonnel
    });

    if (result.error) {
      toast.error('Satış kaydedilirken hata oluştu');
    } else {
      toast.success('Akaryakıt satışı başarıyla kaydedildi');
      setFuelType('');
      setLiters('');
      setPricePerLiter('');
    }
  };

  const handleTransferSale = async () => {
    if (!selectedPersonnel || !transferLiters || !transferPrice) {
      toast.error('Lütfen transfer bilgilerini doldurun');
      return;
    }

    const literValue = parseFloat(transferLiters);
    const priceValue = parseFloat(transferPrice);

    const result = await addFuelSale({
      fuel_type: 'MOTORİN',
      liters: literValue,
      price_per_liter: priceValue / literValue,
      total_amount: priceValue,
      amount: priceValue,
      sale_time: new Date().toISOString(),
      personnel_id: selectedPersonnel
    });

    if (result.error) {
      toast.error('Transfer kaydedilirken hata oluştu');
    } else {
      toast.success('Köy tankeri transferi başarıyla kaydedildi');
      setTransferLiters('');
      setTransferPrice('');
    }
  };

  const getFuelTypeColor = (type: string) => {
    switch (type) {
      case 'MOTORİN': return 'bg-blue-500';
      case 'BENZİN': return 'bg-green-500';
      case 'LPG': return 'bg-orange-500';
      case 'MOTORİN(DİĞER)': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Akaryakıt Satış Yönetimi
          </h2>
          <p className="text-gray-600 mt-2">Günlük akaryakıt satışları ve stok takibi</p>
        </div>
      </div>

      {/* Daily Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(dailyTotals.totalsByType).map(([type, totals]) => (
          <Card key={type} className="relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1 ${getFuelTypeColor(type)}`} />
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">{type}</h3>
                <Droplets className="h-4 w-4 text-gray-500" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-blue-600">
                  {totals.liters.toFixed(2)} L
                </p>
                <p className="text-sm text-gray-600">
                  {formatCurrency(totals.amount)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">TOPLAM</h3>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-blue-600">
                {dailyTotals.grandTotal.liters.toFixed(2)} L
              </p>
              <p className="text-sm text-gray-600">
                {formatCurrency(dailyTotals.grandTotal.amount)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuel Sale Entry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Akaryakıt Satış Kaydet</span>
            </CardTitle>
            <CardDescription>
              Normal akaryakıt satış işlemlerini buradan kaydedin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Personel</Label>
              <Select value={selectedPersonnel} onValueChange={setSelectedPersonnel}>
                <SelectTrigger>
                  <SelectValue placeholder="Personel seçin" />
                </SelectTrigger>
                <SelectContent>
                  {personnel.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Akaryakıt Türü</Label>
              <Select value={fuelType} onValueChange={setFuelType}>
                <SelectTrigger>
                  <SelectValue placeholder="Akaryakıt türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MOTORİN">MOTORİN</SelectItem>
                  <SelectItem value="BENZİN">BENZİN</SelectItem>
                  <SelectItem value="LPG">LPG</SelectItem>
                  <SelectItem value="MOTORİN(DİĞER)">MOTORİN(DİĞER)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Litre</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={liters}
                  onChange={(e) => setLiters(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Litre Fiyatı</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={pricePerLiter}
                  onChange={(e) => setPricePerLiter(e.target.value)}
                />
              </div>
            </div>

            {liters && pricePerLiter && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Toplam Tutar:</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(parseFloat(liters) * parseFloat(pricePerLiter))}
                  </span>
                </div>
              </div>
            )}

            <Button onClick={handleAddFuelSale} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Satış Kaydet
            </Button>
          </CardContent>
        </Card>

        {/* Transfer - Köy Tankeri */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ArrowRight className="h-5 w-5" />
              <span>TRANSFER - KÖY TANKERİ</span>
            </CardTitle>
            <CardDescription>
              Köy tankerine yapılan motorin transferlerini kaydedin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Fuel className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">MOTORİN Transfer</span>
              </div>
              <p className="text-sm text-blue-700">
                Bu bölümde kaydedilen transferler otomatik olarak motorin stoktan düşülür.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Personel</Label>
              <Select value={selectedPersonnel} onValueChange={setSelectedPersonnel}>
                <SelectTrigger>
                  <SelectValue placeholder="Personel seçin" />
                </SelectTrigger>
                <SelectContent>
                  {personnel.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Transfer Litre</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={transferLiters}
                onChange={(e) => setTransferLiters(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Toplam Tutar</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={transferPrice}
                onChange={(e) => setTransferPrice(e.target.value)}
              />
            </div>

            {transferLiters && transferPrice && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Litre Başı Fiyat:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(parseFloat(transferPrice) / parseFloat(transferLiters))}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between">
                  <span className="font-medium">Toplam:</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(parseFloat(transferPrice))}
                  </span>
                </div>
              </div>
            )}

            <Button onClick={handleTransferSale} className="w-full" variant="outline">
              <ArrowRight className="h-4 w-4 mr-2" />
              Transfer Kaydet
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Son Satışlar</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Tarih</th>
                  <th className="px-4 py-2 text-left">Tür</th>
                  <th className="px-4 py-2 text-right">Litre</th>
                  <th className="px-4 py-2 text-right">Fiyat/L</th>
                  <th className="px-4 py-2 text-right">Toplam</th>
                  <th className="px-4 py-2 text-left">Personel</th>
                </tr>
              </thead>
              <tbody>
                {fuelSales.slice(0, 10).map((sale) => (
                  <tr key={sale.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {new Date(sale.sale_time).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-4 py-2">
                      <Badge variant="outline" className={`${getFuelTypeColor(sale.fuel_type)} text-white`}>
                        {sale.fuel_type}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-right font-medium">
                      {sale.liters.toFixed(2)} L
                    </td>
                    <td className="px-4 py-2 text-right">
                      {formatCurrency(sale.price_per_liter)}
                    </td>
                    <td className="px-4 py-2 text-right font-bold text-green-600">
                      {formatCurrency(sale.total_amount)}
                    </td>
                    <td className="px-4 py-2">
                      {personnel.find(p => p.id === sale.personnel_id)?.name || 'Bilinmeyen'}
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
