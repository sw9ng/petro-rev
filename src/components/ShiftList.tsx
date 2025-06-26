
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Calculator, Search, Eye, Trash2, Clock } from 'lucide-react';
import { useShifts } from '@/hooks/useShifts';
import { usePersonnel } from '@/hooks/usePersonnel';
import { ShiftDetailDialog } from './ShiftDetailDialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export const ShiftList = () => {
  const { toast } = useToast();
  const { fetchAllShifts, deleteShift } = useShifts();
  const { personnel } = usePersonnel();
  const [shifts, setShifts] = useState<any[]>([]);
  const [filteredShifts, setFilteredShifts] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
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
        const shiftDate = new Date(shift.start_time);
        return (
          shiftDate.getFullYear() === selectedDate.getFullYear() &&
          shiftDate.getMonth() === selectedDate.getMonth() &&
          shiftDate.getDate() === selectedDate.getDate()
        );
      });
    }

    if (selectedPersonnel) {
      filtered = filtered.filter(shift => shift.personnel_id === selectedPersonnel);
    }

    setFilteredShifts(filtered);
  }, [selectedDate, selectedPersonnel, shifts]);

  const clearFilters = () => {
    setSelectedDate(undefined);
    setSelectedPersonnel('');
  };

  const handleShiftDetail = (shift: any) => {
    setSelectedShift(shift);
    setDetailDialogOpen(true);
  };

  const handleDeleteShift = async (shiftId: string) => {
    if (window.confirm('Bu vardiyayı silmek istediğinizden emin misiniz?')) {
      const { error } = await deleteShift(shiftId);
      
      if (error) {
        toast({
          title: "Hata",
          description: "Vardiya silinirken bir hata oluştu.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Vardiya Silindi",
          description: "Vardiya başarıyla silindi.",
        });
        
        // Refresh the list
        const allShifts = await fetchAllShifts();
        setShifts(allShifts);
      }
    }
  };

  const calculateDuration = (startTime: string, endTime: string | null) => {
    if (!endTime) return 'Devam ediyor';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours}s ${diffMinutes}dk`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Vardiya geçmişi yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Vardiya Geçmişi</h2>
          <p className="text-sm md:text-base text-muted-foreground">Geçmiş vardiyaları görüntüle ve filtrele</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-sm border-0 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Search className="h-5 w-5 text-blue-600" />
            <span>Filtreleme</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tarih Seçin</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-11",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: tr }) : "Tarih seçin"}
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
                <SelectTrigger className="h-11">
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
              <Button variant="outline" onClick={clearFilters} className="w-full h-11">
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
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          {filteredShifts.map((shift) => {
            const totalExpenses = shift.cash_sales + shift.card_sales + shift.veresiye + shift.bank_transfers;
            
            return (
              <Card key={shift.id} className="shadow-md border-0 bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{shift.personnel.name}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center space-x-1 mb-1">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(shift.start_time), "PPP", { locale: tr })}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{format(new Date(shift.start_time), "HH:mm")}</span>
                            {shift.end_time && (
                              <>
                                <span>-</span>
                                <span>{format(new Date(shift.end_time), "HH:mm")}</span>
                              </>
                            )}
                          </div>
                          <div className="text-blue-600 font-medium">
                            {calculateDuration(shift.start_time, shift.end_time)}
                          </div>
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-700">Tamamlandı</Badge>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShiftDetail(shift)}
                          className="flex items-center space-x-1 h-8"
                        >
                          <Eye className="h-3 w-3" />
                          <span className="hidden sm:inline">Detay</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteShift(shift.id)}
                          className="flex items-center space-x-1 text-red-600 hover:text-red-700 h-8"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Satış Özeti */}
                  <div className="grid grid-cols-2 gap-2 md:gap-4 p-3 md:p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Otomasyon</p>
                      <p className="text-sm md:text-base font-semibold text-blue-600">₺{shift.otomasyon_satis.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Nakit</p>
                      <p className="text-sm md:text-base font-semibold text-green-600">₺{shift.cash_sales.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Kart</p>
                      <p className="text-sm md:text-base font-semibold text-purple-600">₺{shift.card_sales.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Veresiye</p>
                      <p className="text-sm md:text-base font-semibold text-orange-600">₺{shift.veresiye.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Havale</p>
                      <p className="text-sm md:text-base font-semibold text-indigo-600">₺{shift.bank_transfers.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Toplam</p>
                      <p className="text-sm md:text-base font-bold text-gray-800">₺{totalExpenses.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Açık/Fazla Hesaplama */}
                  <div className="p-3 md:p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm md:text-base font-medium">Açık/Fazla</span>
                      <Calculator className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className={`text-right font-bold text-base md:text-lg ${shift.over_short >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{shift.over_short >= 0 ? 'Fazla:' : 'Açık:'} ₺{Math.abs(shift.over_short).toFixed(2)}</span>
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
