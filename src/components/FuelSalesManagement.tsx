
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useFuelSales } from '@/hooks/useFuelSales';
import { usePersonnel } from '@/hooks/usePersonnel';
import { formatCurrency } from '@/lib/numberUtils';
import { Plus, Fuel, Edit, Trash2, Calendar, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { FuelSalesEditDialog } from './FuelSalesEditDialog';

export const FuelSalesManagement = () => {
  const { 
    fuelSales, 
    loading, 
    addFuelSale, 
    updateFuelSale, 
    deleteFuelSale,
    getFuelSalesByType,
    getTotalFuelSales
  } = useFuelSales();
  const { personnel } = usePersonnel();

  // Form state
  const [fuelType, setFuelType] = useState<string>('');
  const [liters, setLiters] = useState<string>('');
  const [pricePerLiter, setPricePerLiter] = useState<string>('');
  const [shift, setShift] = useState<string>('');
  const [saleTime, setSaleTime] = useState<string>('');
  const [selectedPersonnel, setSelectedPersonnel] = useState<string>('');

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<any>(null);

  // Filter states
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [filterFuelType, setFilterFuelType] = useState<string>('');

  // Initialize form with current date/time
  useEffect(() => {
    const now = new Date();
    const formattedDateTime = now.toISOString().slice(0, 16);
    setSaleTime(formattedDateTime);
  }, []);

  // Motorin stok takibi için yardımcı fonksiyonlar
  const getMotorijnStock = () => {
    const motorinSales = fuelSales.filter(sale => sale.fuel_type === 'MOTORİN');
    const transferSales = fuelSales.filter(sale => sale.fuel_type === 'TRANSFER(KÖY-TANKERİ)');
    
    const totalMotorin = motorinSales.reduce((sum, sale) => sum + sale.liters, 0);
    const totalTransfer = transferSales.reduce((sum, sale) => sum + sale.liters, 0);
    
    return totalMotorin - totalTransfer;
  };

  const currentMotorinStock = getMotorijnStock();

  const calculateAmount = () => {
    const literValue = parseFloat(liters) || 0;
    const priceValue = parseFloat(pricePerLiter) || 0;
    return literValue * priceValue;
  };

  const handleAddSale = async () => {
    if (!fuelType || !liters || !pricePerLiter || !selectedPersonnel) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    const literValue = parseFloat(liters);
    const priceValue = parseFloat(pricePerLiter);
    
    // Köy tankeri transferi için stok kontrolü
    if (fuelType === 'TRANSFER(KÖY-TANKERİ)') {
      if (literValue > currentMotorinStock) {
        toast.error(`Yetersiz motorin stoku. Mevcut: ${currentMotorinStock.toFixed(2)} litre`);
        return;
      }
    }

    const saleData = {
      fuel_type: fuelType,
      liters: literValue,
      price_per_liter: priceValue,
      total_amount: literValue * priceValue,
      amount: literValue * priceValue,
      sale_time: saleTime ? new Date(saleTime).toISOString() : new Date().toISOString(),
      shift: shift || undefined,
      personnel_id: selectedPersonnel
    };

    const { error } = await addFuelSale(saleData);

    if (error) {
      toast.error('Satış kaydedilirken hata oluştu');
      console.error('Error adding fuel sale:', error);
    } else {
      toast.success('Yakıt satışı başarıyla kaydedildi');
      
      // Köy tankeri transferi başarılı mesajı
      if (fuelType === 'TRANSFER(KÖY-TANKERİ)') {
        const remainingStock = currentMotorinStock - literValue;
        toast.success(`Transfer tamamlandı. Kalan motorin stoku: ${remainingStock.toFixed(2)} litre`);
      }
      
      // Form sıfırla
      setFuelType('');
      setLiters('');
      setPricePerLiter('');
      setShift('');
      setSelectedPersonnel('');
      
      // Zamanı güncelle
      const now = new Date();
      setSaleTime(now.toISOString().slice(0, 16));
    }
  };

  const handleEditSale = (sale: any) => {
    setEditingSale(sale);
    setEditDialogOpen(true);
  };

  const handleDeleteSale = async (saleId: string) => {
    const { error } = await deleteFuelSale(saleId);
    
    if (error) {
      toast.error('Satış silinirken hata oluştu');
    } else {
      toast.success('Satış başarıyla silindi');
    }
  };

  const fuelTypeOptions = [
    { value: 'MOTORİN', label: 'Motorin' },
    { value: 'LPG', label: 'LPG' },
    { value: 'BENZİN', label: 'Benzin' },
    { value: 'MOTORİN(DİĞER)', label: 'Motorin (Diğer)' },
    { value: 'TRANSFER(KÖY-TANKERİ)', label: 'Transfer (Köy Tankeri)' }
  ];

  const getFuelTypeLabel = (type: string) => {
    const option = fuelTypeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  };

  // Filtered sales
  const filteredSales = fuelSales.filter(sale => {
    const saleDate = sale.sale_time.split('T')[0];
    const matchesDateFrom = !filterDateFrom || saleDate >= filterDateFrom;
    const matchesDateTo = !filterDateTo || saleDate <= filterDateTo;
    const matchesFuelType = !filterFuelType || filterFuelType === 'all' || sale.fuel_type === filterFuelType;
    
    return matchesDateFrom && matchesDateTo && matchesFuelType;
  });

  const salesByType = getFuelSalesByType();
  const totalSales = getTotalFuelSales();

  if (loading) {
    return <div className="flex justify-center items-center h-64">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Yakıt Satış Yönetimi
          </h2>
          <p className="text-gray-600 mt-2">Yakıt satışlarını kaydedin ve takip edin</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-lg px-4 py-2">
            Toplam Satış: {formatCurrency(totalSales)}
          </Badge>
          <Badge variant="outline" className="text-lg px-4 py-2 bg-blue-50 text-blue-800">
            Motorin Stok: {currentMotorinStock.toFixed(2)} L
          </Badge>
        </div>
      </div>

      {/* Add Sale Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Fuel className="h-5 w-5 text-blue-500" />
            <span>Yeni Yakıt Satışı</span>
          </CardTitle>
          <CardDescription>Yakıt satış bilgilerini girin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Yakıt Türü</Label>
              <Select value={fuelType} onValueChange={setFuelType}>
                <SelectTrigger>
                  <SelectValue placeholder="Yakıt türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  {fuelTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fuelType === 'TRANSFER(KÖY-TANKERİ)' && (
                <p className="text-sm text-amber-600">
                  ⚠️ Bu işlem motorin stokunu azaltacaktır
                </p>
              )}
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
              <Label>Litre Fiyatı (₺)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={pricePerLiter}
                onChange={(e) => setPricePerLiter(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Vardiya</Label>
              <Input
                type="text"
                placeholder="Vardiya bilgisi"
                value={shift}
                onChange={(e) => setShift(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Satış Zamanı</Label>
              <Input
                type="datetime-local"
                value={saleTime}
                onChange={(e) => setSaleTime(e.target.value)}
              />
            </div>
          </div>

          {liters && pricePerLiter && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Toplam Tutar:</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(calculateAmount())}
                </span>
              </div>
            </div>
          )}

          <Button onClick={handleAddSale} className="w-full" size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Satış Kaydet
          </Button>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <span>Filtreler</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Başlangıç Tarihi</Label>
              <Input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Bitiş Tarihi</Label>
              <Input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Yakıt Türü</Label>
              <Select value={filterFuelType} onValueChange={setFilterFuelType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tüm yakıt türleri" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm yakıt türleri</SelectItem>
                  {fuelTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales List */}
      <Card>
        <CardHeader>
          <CardTitle>Yakıt Satış Listesi ({filteredSales.length} kayıt)</CardTitle>
          <CardDescription>Tüm yakıt satışları</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Saat</TableHead>
                  <TableHead>Yakıt Türü</TableHead>
                  <TableHead>Litre</TableHead>
                  <TableHead>Birim Fiyat</TableHead>
                  <TableHead>Toplam</TableHead>
                  <TableHead>Personel</TableHead>
                  <TableHead>Vardiya</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      {new Date(sale.sale_time).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell>
                      {new Date(sale.sale_time).toLocaleTimeString('tr-TR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${
                        sale.fuel_type === 'MOTORİN' ? 'bg-blue-100 text-blue-800' :
                        sale.fuel_type === 'LPG' ? 'bg-green-100 text-green-800' :
                        sale.fuel_type === 'BENZİN' ? 'bg-red-100 text-red-800' :
                        sale.fuel_type === 'TRANSFER(KÖY-TANKERİ)' ? 'bg-amber-100 text-amber-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getFuelTypeLabel(sale.fuel_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>{sale.liters.toFixed(2)} L</TableCell>
                    <TableCell>{formatCurrency(sale.price_per_liter)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(sale.total_amount)}
                    </TableCell>
                    <TableCell>
                      {personnel.find(p => p.id === sale.personnel_id)?.name || 'Bilinmiyor'}
                    </TableCell>
                    <TableCell>{sale.shift || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSale(sale)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Satışı Sil</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bu yakıt satışını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>İptal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteSale(sale.id)}>
                                Sil
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredSales.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {filterDateFrom || filterDateTo || filterFuelType ? 'Filtrelere uygun satış bulunamadı' : 'Henüz yakıt satışı kaydı yok'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Toplam Satış</CardTitle>
            <CardDescription>Tüm yakıt türlerinin toplam satışı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalSales)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Motorin Satışı</CardTitle>
            <CardDescription>Toplam motorin satışı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(salesByType['MOTORİN'])}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LPG Satışı</CardTitle>
            <CardDescription>Toplam LPG satışı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(salesByType['LPG'])}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <FuelSalesEditDialog
        sale={editingSale}
        isOpen={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setEditingSale(null);
        }}
      />
    </div>
  );
};
