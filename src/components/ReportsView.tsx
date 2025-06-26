
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Search, TrendingUp, Users, DollarSign, BarChart3, Trophy, Star, Fuel } from 'lucide-react';
import { useShifts } from '@/hooks/useShifts';
import { usePersonnel } from '@/hooks/usePersonnel';
import { useFuelSales } from '@/hooks/useFuelSales';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export const ReportsView = () => {
  const { findShiftsByDateAndPersonnel, fetchAllShifts } = useShifts();
  const { personnel } = usePersonnel();
  const { fuelSales, getTotalFuelSales, getFuelSalesByType } = useFuelSales();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedPersonnel, setSelectedPersonnel] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [allShifts, setAllShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('today');

  useEffect(() => {
    const loadAllShifts = async () => {
      const shifts = await fetchAllShifts();
      setAllShifts(shifts);
    };
    loadAllShifts();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    
    let searchDate = '';
    if (selectedDate) {
      searchDate = format(selectedDate, 'yyyy-MM-dd');
    }

    const results = await findShiftsByDateAndPersonnel(searchDate, selectedPersonnel);
    setSearchResults(results);
    setLoading(false);
  };

  const clearSearch = () => {
    setSelectedDate(undefined);
    setSelectedPersonnel('');
    setSearchResults([]);
  };

  // Calculate statistics including fuel sales
  const getStatistics = () => {
    let shiftsToAnalyze = allShifts;
    let fuelSalesToAnalyze = fuelSales;
    const now = new Date();
    
    if (dateRange === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      shiftsToAnalyze = allShifts.filter(shift => {
        const shiftDate = new Date(shift.start_time);
        return shiftDate >= today && shiftDate < tomorrow;
      });
      
      fuelSalesToAnalyze = fuelSales.filter(sale => {
        const saleDate = new Date(sale.sale_time);
        return saleDate >= today && saleDate < tomorrow;
      });
    } else if (dateRange === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      shiftsToAnalyze = allShifts.filter(shift => new Date(shift.start_time) >= weekAgo);
      fuelSalesToAnalyze = fuelSales.filter(sale => new Date(sale.sale_time) >= weekAgo);
    } else if (dateRange === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      shiftsToAnalyze = allShifts.filter(shift => new Date(shift.start_time) >= monthAgo);
      fuelSalesToAnalyze = fuelSales.filter(sale => new Date(sale.sale_time) >= monthAgo);
    }

    const totalShiftSales = shiftsToAnalyze.reduce((sum, shift) => 
      sum + shift.cash_sales + shift.card_sales, 0);
    const totalFuelSales = fuelSalesToAnalyze.reduce((sum, sale) => sum + sale.total_amount, 0);
    const totalSales = totalShiftSales + totalFuelSales;
    const totalOverShort = shiftsToAnalyze.reduce((sum, shift) => sum + (shift.over_short || 0), 0);
    const averageShift = shiftsToAnalyze.length > 0 ? totalShiftSales / shiftsToAnalyze.length : 0;
    
    return {
      totalSales,
      totalShiftSales,
      totalFuelSales,
      totalOverShort,
      averageShift,
      shiftCount: shiftsToAnalyze.length,
      fuelSalesCount: fuelSalesToAnalyze.length,
      shiftsToAnalyze,
      fuelSalesToAnalyze
    };
  };

  const getPersonnelStats = () => {
    const stats = getStatistics();
    const personnelStats = personnel.map(person => {
      const personShifts = stats.shiftsToAnalyze.filter(shift => 
        shift.personnel_id === person.id
      );
      
      const personFuelSales = stats.fuelSalesToAnalyze.filter(sale => 
        sale.personnel_id === person.id
      );
      
      const totalShiftSales = personShifts.reduce((sum, shift) => 
        sum + shift.cash_sales + shift.card_sales, 0);
      
      const totalFuelSales = personFuelSales.reduce((sum, sale) => 
        sum + sale.total_amount, 0);
      
      const totalSales = totalShiftSales + totalFuelSales;
      
      const totalOverShort = personShifts.reduce((sum, shift) => 
        sum + (shift.over_short || 0), 0);
        
      const avgSales = personShifts.length > 0 ? totalSales / personShifts.length : 0;
      
      return {
        ...person,
        shiftCount: personShifts.length,
        fuelSalesCount: personFuelSales.length,
        totalSales,
        totalShiftSales,
        totalFuelSales,
        avgSales,
        totalOverShort
      };
    }).filter(person => person.shiftCount > 0 || person.fuelSalesCount > 0);
    
    // Sort by total sales
    personnelStats.sort((a, b) => b.totalSales - a.totalSales);
    
    return personnelStats;
  };

  const stats = getStatistics();
  const personnelStats = getPersonnelStats();
  const fuelSalesByType = getFuelSalesByType();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900">Raporlar</h2>
        <p className="text-muted-foreground text-lg mt-2">Vardiya ve akaryakıt satış raporlarını görüntüle</p>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="border-l-4 border-l-blue-500 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vardiya Satış</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{stats.totalShiftSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {dateRange === 'today' ? 'Bugün' : 
               dateRange === 'week' ? 'Son 7 gün' : 
               dateRange === 'month' ? 'Son 30 gün' : 'Tüm zamanlar'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Akaryakıt Satış</CardTitle>
            <Fuel className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{stats.totalFuelSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.fuelSalesCount} satış kaydı
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Satış</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{stats.totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">vardiya + akaryakıt</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Vardiya</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.shiftCount}</div>
            <p className="text-xs text-muted-foreground">tamamlanmış</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Açık/Fazla</CardTitle>
            <BarChart3 className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.totalOverShort >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₺{Math.abs(stats.totalOverShort).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalOverShort >= 0 ? 'Fazla' : 'Açık'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Akaryakıt Türleri Detayı */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center space-x-2">
            <Fuel className="h-6 w-6 text-blue-600" />
            <span>Akaryakıt Satış Detayı</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(fuelSalesByType).map(([fuelType, amount]) => (
              <Card key={fuelType} className="p-4 bg-gradient-to-r from-blue-50 to-green-50">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-2">{fuelType}</p>
                  <p className="text-2xl font-bold text-gray-900">₺{amount.toFixed(2)}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((amount / Math.max(...Object.values(fuelSalesByType))) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Zaman Aralığı Seçimi */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Zaman Aralığı Seçimi</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-64 h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Bugün</SelectItem>
              <SelectItem value="week">Son 7 Gün</SelectItem>
              <SelectItem value="month">Son 30 Gün</SelectItem>
              <SelectItem value="all">Tüm Zamanlar</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Personel Performans */}
      {personnelStats.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <span>Personel Performansı</span>
            </CardTitle>
            <CardDescription className="text-base">
              {dateRange === 'today' ? 'Bugünkü' : 
               dateRange === 'week' ? 'Son 7 günün' : 
               dateRange === 'month' ? 'Son 30 günün' : 'Tüm zamanların'} performans sıralaması
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {personnelStats.slice(0, 5).map((person, index) => (
                <Card key={person.id} className="p-4 bg-gradient-to-r from-gray-50 to-blue-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                        {index === 0 ? <Trophy className="h-5 w-5 text-yellow-600" /> :
                         index === 1 ? <Star className="h-5 w-5 text-gray-400" /> :
                         index === 2 ? <Star className="h-5 w-5 text-amber-600" /> :
                         <span className="text-sm font-bold">{index + 1}</span>}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{person.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {person.shiftCount} vardiya • {person.fuelSalesCount} akaryakıt satış
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl">₺{person.totalSales.toFixed(2)}</p>
                      <div className="text-sm text-muted-foreground">
                        <p>Vardiya: ₺{person.totalShiftSales.toFixed(2)}</p>
                        <p>Akaryakıt: ₺{person.totalFuelSales.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Arama Bölümü */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center space-x-2">
            <Search className="h-6 w-6 text-blue-600" />
            <span>Vardiya Ara</span>
          </CardTitle>
          <CardDescription className="text-base">Tarih ve personele göre vardiya arayın</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tarih Seçin</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-12",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "dd MMMM yyyy", { locale: tr }) : "Tarih seçin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    locale={tr}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Personel Seçin</label>
              <Select value={selectedPersonnel} onValueChange={setSelectedPersonnel}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Personel seçin" />
                </SelectTrigger>
                <SelectContent>
                  {personnel.map((person) => (
                    <SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={loading} className="w-full h-12">
                {loading ? 'Aranıyor...' : 'Ara'}
              </Button>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={clearSearch} className="w-full h-12">
                Temizle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Arama Sonuçları */}
      {searchResults.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Arama Sonuçları</CardTitle>
            <CardDescription className="text-base">{searchResults.length} vardiya bulundu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.map((shift) => {
                const totalSales = shift.cash_sales + shift.card_sales;
                
                return (
                  <Card key={shift.id} className="p-6 bg-gradient-to-r from-blue-50 to-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{shift.personnel.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(shift.start_time), "dd MMMM yyyy, HH:mm", { locale: tr })}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <p className="text-muted-foreground">Nakit</p>
                        <p className="font-bold text-lg">₺{shift.cash_sales.toFixed(2)}</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <p className="text-muted-foreground">Kart</p>
                        <p className="font-bold text-lg">₺{shift.card_sales.toFixed(2)}</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <p className="text-muted-foreground">Veresiye</p>
                        <p className="font-bold text-lg">₺{(shift.veresiye || 0).toFixed(2)}</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <p className="text-muted-foreground">Otomasyon</p>
                        <p className="font-bold text-lg">₺{(shift.otomasyon_satis || 0).toFixed(2)}</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <p className="text-muted-foreground">Toplam</p>
                        <p className="font-bold text-lg text-blue-600">₺{totalSales.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className={`text-center p-3 rounded-lg ${(shift.over_short || 0) >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        <span className="font-bold text-lg">
                          {(shift.over_short || 0) >= 0 ? 'Fazla:' : 'Açık:'} ₺{Math.abs(shift.over_short || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {searchResults.length === 0 && (selectedDate || selectedPersonnel) && !loading && (
        <Card className="shadow-lg">
          <CardContent className="text-center py-12">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">Seçilen kriterlere uygun vardiya bulunamadı.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
