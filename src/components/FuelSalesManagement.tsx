
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFuelSales } from '@/hooks/useFuelSales';
import { usePersonnel } from '@/hooks/usePersonnel';
import { formatCurrency } from '@/lib/numberUtils';
import { Plus, Fuel, Edit, Trash2, Calendar, Filter, BarChart3, TrendingUp, Gauge } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Overview date filter states
  const [overviewDateFrom, setOverviewDateFrom] = useState<string>('');
  const [overviewDateTo, setOverviewDateTo] = useState<string>('');

  // Initialize form with current date/time
  useEffect(() => {
    const now = new Date();
    const formattedDateTime = now.toISOString().slice(0, 16);
    setSaleTime(formattedDateTime);
  }, []);

  const calculateAmount = () => {
    const literValue = parseFloat(liters) || 0;
    const priceValue = parseFloat(pricePerLiter) || 0;
    return literValue * priceValue;
  };

  // Filter sales for overview based on date range
  const getFilteredSalesForOverview = () => {
    if (!overviewDateFrom && !overviewDateTo) return fuelSales;
    
    return fuelSales.filter(sale => {
      const saleDate = sale.sale_time.split('T')[0];
      const matchesDateFrom = !overviewDateFrom || saleDate >= overviewDateFrom;
      const matchesDateTo = !overviewDateTo || saleDate <= overviewDateTo;
      return matchesDateFrom && matchesDateTo;
    });
  };

  // Detaylı istatistikler (filtered for overview)
  const getFuelStats = () => {
    const filteredSales = getFilteredSalesForOverview();
    const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0);
    
    const salesByType = {
      'MOTORİN': 0,
      'LPG': 0,
      'BENZİN': 0,
      'MOTORİN(DİĞER)': 0
    };

    filteredSales.forEach(sale => {
      if (salesByType.hasOwnProperty(sale.fuel_type)) {
        salesByType[sale.fuel_type] += sale.total_amount;
      }
    });
    
    const motorinSales = filteredSales.filter(sale => sale.fuel_type === 'MOTORİN');
    const lpgSales = filteredSales.filter(sale => sale.fuel_type === 'LPG');
    const benzinSales = filteredSales.filter(sale => sale.fuel_type === 'BENZİN');
    
    const totalLiters = filteredSales.reduce((sum, sale) => sum + sale.liters, 0);
    const avgPricePerLiter = totalLiters > 0 ? totalSales / totalLiters : 0;
    
    return {
      totalSales,
      totalLiters,
      avgPricePerLiter,
      salesByType,
      fuelCounts: {
        motorin: motorinSales.length,
        lpg: lpgSales.length,
        benzin: benzinSales.length
      },
      litersByType: {
        motorin: motorinSales.reduce((sum, sale) => sum + sale.liters, 0),
        lpg: lpgSales.reduce((sum, sale) => sum + sale.liters, 0),
        benzin: benzinSales.reduce((sum, sale) => sum + sale.liters, 0)
      },
      filteredSalesCount: filteredSales.length
    };
  };

  const stats = getFuelStats();

  const handleAddSale = async () => {
    if (!fuelType || !liters || !pricePerLiter || !selectedPersonnel) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    const literValue = parseFloat(liters);
    const priceValue = parseFloat(pricePerLiter);

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
    { value: 'MOTORİN', label: 'Motorin', color: 'bg-blue-100 text-blue-800' },
    { value: 'LPG', label: 'LPG', color: 'bg-green-100 text-green-800' },
    { value: 'BENZİN', label: 'Benzin', color: 'bg-red-100 text-red-800' },
    { value: 'MOTORİN(DİĞER)', label: 'Motorin (Diğer)', color: 'bg-purple-100 text-purple-800' }
  ];

  const getFuelTypeLabel = (type: string) => {
    const option = fuelTypeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  };

  const getFuelTypeColor = (type: string) => {
    const option = fuelTypeOptions.find(opt => opt.value === type);
    return option ? option.color : 'bg-gray-100 text-gray-800';
  };

  // Filtered sales
  const filteredSales = fuelSales.filter(sale => {
    const saleDate = sale.sale_time.split('T')[0];
    const matchesDateFrom = !filterDateFrom || saleDate >= filterDateFrom;
    const matchesDateTo = !filterDateTo || saleDate <= filterDateTo;
    const matchesFuelType = !filterFuelType || filterFuelType === 'all' || sale.fuel_type === filterFuelType;
    
    return matchesDateFrom && matchesDateTo && matchesFuelType;
  });

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
          <Badge variant="outline" className="text-lg px-4 py-2 bg-green-50 border-green-200">
            <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
            Toplam Satış: {formatCurrency(stats.totalSales)}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="add-sale">Satış Ekle</TabsTrigger>
          <TabsTrigger value="sales-list">Satış Listesi</TabsTrigger>
          <TabsTrigger value="analytics">Analitik</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Date Filter for Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <span>Tarih Filtresi</span>
              </CardTitle>
              <CardDescription>İncelemek istediğiniz tarih aralığını seçin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Başlangıç Tarihi</Label>
                  <Input
                    type="date"
                    value={overviewDateFrom}
                    onChange={(e) => setOverviewDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bitiş Tarihi</Label>
                  <Input
                    type="date"
                    value={overviewDateTo}
                    onChange={(e) => setOverviewDateTo(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setOverviewDateFrom('');
                      setOverviewDateTo('');
                    }}
                    className="w-full"
                  >
                    Filtreyi Temizle
                  </Button>
                </div>
              </div>
              {(overviewDateFrom || overviewDateTo) && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    {stats.filteredSalesCount} satış kaydı görüntüleniyor
                    {overviewDateFrom && ` (${new Date(overviewDateFrom).toLocaleDateString('tr-TR')} sonrası)`}
                    {overviewDateTo && ` (${new Date(overviewDateTo).toLocaleDateString('tr-TR')} öncesi)`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* İstatistik Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Toplam Satış</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalSales)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Toplam Litre</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalLiters.toFixed(2)} L</p>
                  </div>
                  <Gauge className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ort. Litre Fiyatı</p>
                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.avgPricePerLiter)}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Toplam İşlem</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.filteredSalesCount}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Yakıt Türlerine Göre Dağılım */}
          <Card>
            <CardHeader>
              <CardTitle>Yakıt Türlerine Göre Satış</CardTitle>
              <CardDescription>Toplam satış tutarları ve litre dağılımı</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fuelTypeOptions.map((option) => {
                  const amount = stats.salesByType[option.value] || 0;
                  const percentage = stats.totalSales > 0 ? (amount / stats.totalSales) * 100 : 0;
                  const literKey = option.value.toLowerCase() as keyof typeof stats.litersByType;
                  return (
                    <div key={option.value} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className={option.color}>
                          {option.label}
                        </Badge>
                        <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(amount)}</p>
                        <p className="text-sm text-gray-500">{stats.litersByType[literKey] || 0} L</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-sale" className="space-y-6">
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
                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Toplam Tutar:</span>
                    <span className="text-3xl font-bold text-green-600">
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
        </TabsContent>

        <TabsContent value="sales-list" className="space-y-6">
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
                          <Badge variant="outline" className={getFuelTypeColor(sale.fuel_type)}>
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
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Detaylı İstatistikler */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Motorin Satışı</CardTitle>
                <CardDescription>Toplam motorin satışı ve litre</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(stats.salesByType['MOTORİN'] || 0)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stats.litersByType.motorin || 0} Litre
                  </div>
                  <div className="text-xs text-gray-500">
                    {stats.fuelCounts.motorin} İşlem
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>LPG Satışı</CardTitle>
                <CardDescription>Toplam LPG satışı ve litre</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.salesByType['LPG'] || 0)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stats.litersByType.lpg || 0} Litre
                  </div>
                  <div className="text-xs text-gray-500">
                    {stats.fuelCounts.lpg} İşlem
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Benzin Satışı</CardTitle>
                <CardDescription>Toplam benzin satışı ve litre</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(stats.salesByType['BENZİN'] || 0)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stats.litersByType.benzin || 0} Litre
                  </div>
                  <div className="text-xs text-gray-500">
                    {stats.fuelCounts.benzin} İşlem
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performans Metrikleri */}
          <Card>
            <CardHeader>
              <CardTitle>Performans Metrikleri</CardTitle>
              <CardDescription>Yakıt satış performansınızın detaylı analizi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Ortalama Değerler</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Günlük Ortalama Satış:</span>
                      <span className="font-medium">{formatCurrency(stats.totalSales / Math.max(1, new Set(getFilteredSalesForOverview().map(s => s.sale_time.split('T')[0])).size))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">İşlem Başına Ortalama:</span>
                      <span className="font-medium">{formatCurrency(stats.totalSales / Math.max(1, stats.filteredSalesCount))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Ortalama Litre/İşlem:</span>
                      <span className="font-medium">{(stats.totalLiters / Math.max(1, stats.filteredSalesCount)).toFixed(2)} L</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Performans Göstergeleri</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Toplam İşlem Sayısı:</span>
                      <span className="font-medium">{stats.filteredSalesCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Aktif Günler:</span>
                      <span className="font-medium">{new Set(getFilteredSalesForOverview().map(s => s.sale_time.split('T')[0])).size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">En Çok Satan Yakıt:</span>
                      <span className="font-medium">
                        {Object.entries(stats.salesByType).reduce((a, b) => stats.salesByType[a[0]] > stats.salesByType[b[0]] ? a : b)[0]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
