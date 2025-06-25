
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Calculator, Search, Eye } from 'lucide-react';
import { useShifts } from '@/hooks/useShifts';
import { usePersonnel } from '@/hooks/usePersonnel';
import { ShiftDetailDialog } from './ShiftDetailDialog';

export const ShiftList = () => {
  const { fetchAllShifts } = useShifts();
  const { personnel } = usePersonnel();
  const [shifts, setShifts] = useState<any[]>([]);
  const [filteredShifts, setFilteredShifts] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPersonnel, setSelectedPersonnel] = useState('');
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadShifts = async () => {
      setLoading(true);
      const allShifts = await fetchAllShifts();
      setShifts(allShifts);
      setFilteredShifts(allShifts);
      setLoading(false);
    };

    loadShifts();
  }, []);

  useEffect(() => {
    let filtered = shifts;

    if (selectedDate) {
      filtered = filtered.filter(shift => {
        const shiftDate = new Date(shift.start_time).toLocaleDateString('tr-TR');
        return shiftDate === selectedDate;
      });
    }

    if (selectedPersonnel) {
      filtered = filtered.filter(shift => shift.personnel_id === selectedPersonnel);
    }

    setFilteredShifts(filtered);
  }, [selectedDate, selectedPersonnel, shifts]);

  // Get unique dates from shifts
  const uniqueDates = [...new Set(shifts.map(shift => 
    new Date(shift.start_time).toLocaleDateString('tr-TR')
  ))].sort((a, b) => new Date(b.split('.').reverse().join('-')).getTime() - new Date(a.split('.').reverse().join('-')).getTime());

  const clearFilters = () => {
    setSelectedDate('');
    setSelectedPersonnel('');
  };

  const handleShiftDetail = (shift: any) => {
    setSelectedShift(shift);
    setDetailDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Vardiya geçmişi yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Vardiya Geçmişi</h2>
          <p className="text-muted-foreground">Geçmiş vardiyaları görüntüle ve filtrele</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Filtreleme</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tarih Seçin</label>
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger>
                  <SelectValue placeholder="Tarih seçin" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueDates.map((date) => (
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
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Filtreleri Temizle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredShifts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              {selectedDate || selectedPersonnel ? 'Seçilen kriterlere uygun vardiya bulunamadı.' : 'Henüz vardiya geçmişi bulunmuyor.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredShifts.map((shift) => {
            const totalSales = shift.cash_sales + shift.card_sales + shift.bank_transfers;
            
            return (
              <Card key={shift.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{shift.personnel.name}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(shift.start_time).toLocaleDateString('tr-TR')}</span>
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Badge variant="secondary">Tamamlandı</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShiftDetail(shift)}
                        className="flex items-center space-x-1"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Detaylı</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Satış Özeti */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Nakit</p>
                      <p className="font-semibold">₺{shift.cash_sales.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Kart</p>
                      <p className="font-semibold">₺{shift.card_sales.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Banka Transfer</p>
                      <p className="font-semibold">₺{shift.bank_transfers.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Toplam Satış</p>
                      <p className="font-semibold">₺{totalSales.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Fazla/Eksik Hesaplama */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Fazla/Eksik Hesaplama</span>
                      <Calculator className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className={`text-right font-medium ${shift.over_short >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{shift.over_short >= 0 ? 'Fazla:' : 'Eksik:'} ₺{Math.abs(shift.over_short).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ShiftDetailDialog
        shift={selectedShift}
        isOpen={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </div>
  );
};
