
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Calculator, Search, Eye, Trash2, Clock, Filter } from 'lucide-react';
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
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-600">Vardiya geçmişi yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Vardiya Geçmişi</h2>
        <p className="text-sm lg:text-base text-gray-600">Geçmiş vardiyaları görüntüle ve filtrele</p>
      </div>

      {/* Filters */}
      <Card className="shadow-sm border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center space-x-2 text-gray-900">
            <Filter className="h-5 w-5 text-gray-700" />
            <span>Filtreleme</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tarih Seçin</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-11 border-gray-300",
                      !selectedDate && "text-gray-500"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "dd MMM yyyy", { locale: tr }) : "Tarih seçin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border shadow-lg" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    locale={tr}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Personel Seçin</label>
              <Select value={selectedPersonnel} onValueChange={setSelectedPersonnel}>
                <SelectTrigger className="h-11 border-gray-300">
                  <SelectValue placeholder="Personel seçin" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg">
                  {personnel.map((person) => (
                    <SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end lg:col-span-2">
              <Button 
                variant="outline" 
                onClick={clearFilters} 
                className="w-full h-11 border-gray-300 hover:bg-gray-50"
              >
                Filtreleri Temizle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredShifts.length === 0 ? (
        <Card className="shadow-sm border">
          <CardContent className="text-center py-12">
            <div className="space-y-2">
              <Search className="h-12 w-12 text-gray-400 mx-auto" />
              <p className="text-gray-600 font-medium">
                {selectedDate || selectedPersonnel ? 'Seçilen kriterlere uygun vardiya bulunamadı.' : 'Henüz vardiya geçmişi bulunmuyor.'}
              </p>
              <p className="text-gray-500 text-sm">
                Filtreleri değiştirmeyi deneyin veya yeni vardiya ekleyin.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredShifts.map((shift) => {
            const totalExpenses = shift.cash_sales + shift.card_sales + shift.veresiye + shift.bank_transfers;
            
            return (
              <Card key={shift.id} className="shadow-sm border hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900">{shift.personnel.name}</CardTitle>
                      <CardDescription className="mt-1">
                        <div className="flex items-center space-x-1 mb-2">
                          <Calendar className="h-3 w-3" />
                          <span className="text-sm">{format(new Date(shift.start_time), "dd MMMM yyyy", { locale: tr })}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
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
                          <div className="text-gray-700 font-medium">
                            {calculateDuration(shift.start_time, shift.end_time)}
                          </div>
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <Badge variant="secondary" className="bg-green-50 text-green-700 border border-green-200">
                        Tamamlandı
                      </Badge>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShiftDetail(shift)}
                          className="flex items-center space-x-1 h-8 px-2"
                        >
                          <Eye className="h-3 w-3" />
                          <span className="hidden sm:inline text-xs">Detay</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteShift(shift.id)}
                          className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Satış Özeti */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg border">
                    <div className="text-center">
                      <p className="text-xs text-gray-600 font-medium">Otomasyon</p>
                      <p className="text-sm font-semibold text-gray-900">₺{shift.otomasyon_satis.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 font-medium">Nakit</p>
                      <p className="text-sm font-semibold text-gray-900">₺{shift.cash_sales.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 font-medium">Kart</p>
                      <p className="text-sm font-semibold text-gray-900">₺{shift.card_sales.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 font-medium">Veresiye</p>
                      <p className="text-sm font-semibold text-gray-900">₺{shift.veresiye.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 font-medium">Havale</p>
                      <p className="text-sm font-semibold text-gray-900">₺{shift.bank_transfers.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 font-medium">Toplam</p>
                      <p className="text-sm font-bold text-gray-900">₺{totalExpenses.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Açık/Fazla Hesaplama */}
                  <div className="p-4 border rounded-lg bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Açık/Fazla</span>
                      <Calculator className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className={`text-right font-bold text-lg ${shift.over_short >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
