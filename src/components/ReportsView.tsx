
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Search, TrendingUp, Users, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useShifts } from '@/hooks/useShifts';
import { usePersonnel } from '@/hooks/usePersonnel';

export const ReportsView = () => {
  const { findShiftsByDateAndPersonnel } = useShifts();
  const { personnel } = usePersonnel();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedPersonnel, setSelectedPersonnel] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [monthlyStats, setMonthlyStats] = useState({
    totalSales: 0,
    totalShifts: 0,
    averagePerShift: 0,
    totalOverShort: 0
  });

  const handleSearch = async () => {
    setLoading(true);
    
    let searchDate = '';
    if (selectedDate) {
      searchDate = format(selectedDate, 'yyyy-MM-dd');
    }

    const results = await findShiftsByDateAndPersonnel(searchDate, selectedPersonnel);
    setSearchResults(results);
    
    // Calculate stats from results
    const totalSales = results.reduce((sum, shift) => 
      sum + shift.cash_sales + shift.card_sales, 0);
    const totalOverShort = results.reduce((sum, shift) => sum + shift.over_short, 0);
    
    setMonthlyStats({
      totalSales,
      totalShifts: results.length,
      averagePerShift: results.length > 0 ? totalSales / results.length : 0,
      totalOverShort
    });
    
    setLoading(false);
  };

  const clearSearch = () => {
    setSelectedDate(undefined);
    setSelectedPersonnel('');
    setSearchResults([]);
    setMonthlyStats({
      totalSales: 0,
      totalShifts: 0,
      averagePerShift: 0,
      totalOverShort: 0
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Raporlar</h2>
        <p className="text-muted-foreground">Vardiya ve personel raporlarını görüntüle ve analiz et</p>
      </div>

      {/* Advanced Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Gelişmiş Arama</span>
          </CardTitle>
          <CardDescription>Binlerce vardiya arasından kolayca arama yapın</CardDescription>
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
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "dd.MM.yyyy") : "Tarih seçin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Personel Seçin</label>
              <Select value={selectedPersonnel} onValueChange={setSelectedPersonnel}>
                <SelectTrigger>
                  <SelectValue placeholder="Tüm personel" />
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

      {/* Statistics Overview */}
      {searchResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Toplam Satış</p>
                  <p className="text-2xl font-bold">₺{monthlyStats.totalSales.toFixed(2)}</p>
                </div>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Toplam Vardiya</p>
                  <p className="text-2xl font-bold">{monthlyStats.totalShifts}</p>
                </div>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vardiya Ortalaması</p>
                  <p className="text-2xl font-bold">₺{monthlyStats.averagePerShift.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Toplam Açık/Fazla</p>
                  <p className={`text-2xl font-bold ${monthlyStats.totalOverShort >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₺{Math.abs(monthlyStats.totalOverShort).toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search Results */}
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
                          <CalendarIcon className="h-3 w-3" />
                          <span>{new Date(shift.start_time).toLocaleString('tr-TR')}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Sayaç Satışı</p>
                        <p className="font-medium">₺{(shift.sayac_satisi || 0).toFixed(2)}</p>
                      </div>
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
                        <p className="font-medium">₺{shift.actual_amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Açık/Fazla</p>
                        <p className={`font-semibold ${shift.over_short >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ₺{Math.abs(shift.over_short).toFixed(2)}
                        </p>
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
