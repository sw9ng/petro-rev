
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Search, TrendingUp, Users, DollarSign } from 'lucide-react';
import { useShifts } from '@/hooks/useShifts';
import { usePersonnel } from '@/hooks/usePersonnel';

export const ReportsView = () => {
  const { findShiftsByDateAndPersonnel } = useShifts();
  const { personnel } = usePersonnel();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPersonnel, setSelectedPersonnel] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Get unique dates from all shifts for dropdown
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  useEffect(() => {
    const loadAvailableDates = async () => {
      const allShifts = await findShiftsByDateAndPersonnel('', '');
      const dates = [...new Set(allShifts.map(shift => 
        new Date(shift.start_time).toLocaleDateString('tr-TR')
      ))].sort((a, b) => new Date(b.split('.').reverse().join('-')).getTime() - new Date(a.split('.').reverse().join('-')).getTime());
      setAvailableDates(dates);
    };

    loadAvailableDates();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    
    let searchDate = '';
    if (selectedDate) {
      // Convert Turkish date format to ISO format for search
      const [day, month, year] = selectedDate.split('.');
      searchDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    const results = await findShiftsByDateAndPersonnel(searchDate, selectedPersonnel);
    setSearchResults(results);
    setLoading(false);
  };

  const clearSearch = () => {
    setSelectedDate('');
    setSelectedPersonnel('');
    setSearchResults([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Raporlar</h2>
        <p className="text-muted-foreground">Vardiya ve personel raporlarını görüntüle</p>
      </div>

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
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger>
                  <SelectValue placeholder="Tarih seçin" />
                </SelectTrigger>
                <SelectContent>
                  {availableDates.map((date) => (
                    <SelectItem key={date} value={date}>{date}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                const totalSales = shift.cash_sales + shift.card_sales + shift.bank_transfers;
                
                return (
                  <div key={shift.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{shift.personnel.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(shift.start_time).toLocaleString('tr-TR')}</span>
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
                        <p className="text-muted-foreground">Transfer</p>
                        <p className="font-medium">₺{shift.bank_transfers.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Toplam</p>
                        <p className="font-semibold">₺{totalSales.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t">
                      <div className={`text-sm ${shift.over_short >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <span className="font-medium">
                          {shift.over_short >= 0 ? 'Fazla:' : 'Eksik:'} ₺{Math.abs(shift.over_short).toFixed(2)}
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
