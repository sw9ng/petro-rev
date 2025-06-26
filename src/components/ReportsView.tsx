
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Search, TrendingUp, Users, DollarSign, BarChart3, Trophy, Star } from 'lucide-react';
import { useShifts } from '@/hooks/useShifts';
import { usePersonnel } from '@/hooks/usePersonnel';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export const ReportsView = () => {
  const { findShiftsByDateAndPersonnel, fetchAllShifts } = useShifts();
  const { personnel } = usePersonnel();
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

  // Calculate statistics
  const getStatistics = () => {
    let shiftsToAnalyze = allShifts;
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
    } else if (dateRange === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      shiftsToAnalyze = allShifts.filter(shift => new Date(shift.start_time) >= weekAgo);
    } else if (dateRange === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      shiftsToAnalyze = allShifts.filter(shift => new Date(shift.start_time) >= monthAgo);
    }

    const totalSales = shiftsToAnalyze.reduce((sum, shift) => 
      sum + shift.cash_sales + shift.card_sales, 0);
    const totalOverShort = shiftsToAnalyze.reduce((sum, shift) => sum + (shift.over_short || 0), 0);
    const averageShift = shiftsToAnalyze.length > 0 ? totalSales / shiftsToAnalyze.length : 0;
    
    return {
      totalSales,
      totalOverShort,
      averageShift,
      shiftCount: shiftsToAnalyze.length,
      shiftsToAnalyze
    };
  };

  const getPersonnelStats = () => {
    const stats = getStatistics();
    const personnelStats = personnel.map(person => {
      const personShifts = stats.shiftsToAnalyze.filter(shift => 
        shift.personnel_id === person.id
      );
      
      const totalSales = personShifts.reduce((sum, shift) => 
        sum + shift.cash_sales + shift.card_sales, 0);
      
      const totalOverShort = personShifts.reduce((sum, shift) => 
        sum + (shift.over_short || 0), 0);
        
      const avgSales = personShifts.length > 0 ? totalSales / personShifts.length : 0;
      
      return {
        ...person,
        shiftCount: personShifts.length,
        totalSales,
        avgSales,
        totalOverShort
      };
    }).filter(person => person.shiftCount > 0);
    
    // Sort by total sales
    personnelStats.sort((a, b) => b.totalSales - a.totalSales);
    
    return personnelStats;
  };

  const stats = getStatistics();
  const personnelStats = getPersonnelStats();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Raporlar</h2>
        <p className="text-muted-foreground">Vardiya ve personel raporlarını görüntüle</p>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Satış</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{stats.totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {dateRange === 'today' ? 'Bugün' : 
               dateRange === 'week' ? 'Son 7 gün' : 
               dateRange === 'month' ? 'Son 30 gün' : 'Tüm zamanlar'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Vardiya</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.shiftCount}</div>
            <p className="text-xs text-muted-foreground">
              {dateRange === 'today' ? 'Bugün' : 
               dateRange === 'week' ? 'Son 7 gün' : 
               dateRange === 'month' ? 'Son 30 gün' : 'Tüm zamanlar'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Vardiya</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{stats.averageShift.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Vardiya başına ortalama</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Açık/Fazla</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
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

      {/* Zaman Aralığı Seçimi */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Zaman Aralığı</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Personel Performansı</span>
            </CardTitle>
            <CardDescription>
              {dateRange === 'today' ? 'Bugünkü' : 
               dateRange === 'week' ? 'Son 7 günün' : 
               dateRange === 'month' ? 'Son 30 günün' : 'Tüm zamanların'} performans sıralaması
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {personnelStats.slice(0, 5).map((person, index) => (
                <div key={person.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                      {index === 0 ? <Trophy className="h-4 w-4 text-yellow-600" /> :
                       index === 1 ? <Star className="h-4 w-4 text-gray-400" /> :
                       index === 2 ? <Star className="h-4 w-4 text-amber-600" /> :
                       <span className="text-sm font-medium">{index + 1}</span>}
                    </div>
                    <div>
                      <p className="font-medium">{person.name}</p>
                      <p className="text-sm text-muted-foreground">{person.shiftCount} vardiya</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₺{person.totalSales.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      Ort: ₺{person.avgSales.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Arama Bölümü */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Vardiya Ara</span>
          </CardTitle>
          <CardDescription>Tarih ve personele göre vardiya arayın</CardDescription>
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
                      "w-full justify-start text-left font-normal",
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
                <SelectTrigger>
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
              <Button onClick={handleSearch} disabled={loading} className="w-full">
                {loading ? 'Aranıyor...' : 'Ara'}
              </Button>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={clearSearch} className="w-full">
                Temizle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Arama Sonuçları */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Arama Sonuçları</CardTitle>
            <CardDescription>{searchResults.length} vardiya bulundu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.map((shift) => {
                const totalSales = shift.cash_sales + shift.card_sales;
                
                return (
                  <div key={shift.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{shift.personnel.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(shift.start_time), "dd MMMM yyyy, HH:mm", { locale: tr })}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Nakit</p>
                        <p className="font-medium">₺{shift.cash_sales.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Kart</p>
                        <p className="font-medium">₺{shift.card_sales.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Personel Ödenen</p>
                        <p className="font-medium">₺{(shift.personel_odenen || 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Toplam</p>
                        <p className="font-semibold">₺{totalSales.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t">
                      <div className={`text-sm ${(shift.over_short || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <span className="font-medium">
                          {(shift.over_short || 0) >= 0 ? 'Fazla:' : 'Açık:'} ₺{Math.abs(shift.over_short || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {searchResults.length === 0 && (selectedDate || selectedPersonnel) && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Seçilen kriterlere uygun vardiya bulunamadı.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
