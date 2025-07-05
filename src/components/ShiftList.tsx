
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Calculator, Search, Eye, Trash2, Clock, Filter, Edit, CalendarRange } from 'lucide-react';
import { useShifts } from '@/hooks/useShifts';
import { usePersonnel } from '@/hooks/usePersonnel';
import { ShiftDetailDialog } from './ShiftDetailDialog';
import { ShiftEditDialog } from './ShiftEditDialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDateTimeForDisplay } from '@/lib/numberUtils';

export const ShiftList = () => {
  const { toast } = useToast();
  const { fetchAllShifts, deleteShift } = useShifts();
  const { personnel } = usePersonnel();
  const [shifts, setShifts] = useState<any[]>([]);
  const [filteredShifts, setFilteredShifts] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedPersonnel, setSelectedPersonnel] = useState('');
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [editingShift, setEditingShift] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
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

    // Filter by date range - now using end_time instead of start_time
    if (startDate || endDate) {
      filtered = filtered.filter(shift => {
        // Skip shifts without end_time for date filtering
        if (!shift.end_time) return false;
        
        const shiftDate = formatDateTimeForDisplay(shift.end_time);
        const shiftDateString = format(shiftDate, 'yyyy-MM-dd');
        
        if (startDate && endDate) {
          const startDateString = format(startDate, 'yyyy-MM-dd');
          const endDateString = format(endDate, 'yyyy-MM-dd');
          return shiftDateString >= startDateString && shiftDateString <= endDateString;
        } else if (startDate) {
          const startDateString = format(startDate, 'yyyy-MM-dd');
          return shiftDateString >= startDateString;
        } else if (endDate) {
          const endDateString = format(endDate, 'yyyy-MM-dd');
          return shiftDateString <= endDateString;
        }
        
        return true;
      });
    }

    if (selectedPersonnel) {
      filtered = filtered.filter(shift => shift.personnel_id === selectedPersonnel);
    }

    setFilteredShifts(filtered);
  }, [startDate, endDate, selectedPersonnel, shifts]);

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedPersonnel('');
  };

  const handleShiftDetail = (shift: any) => {
    setSelectedShift(shift);
    setDetailDialogOpen(true);
  };

  const handleEditShift = (shift: any) => {
    setEditingShift(shift);
    setEditDialogOpen(true);
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

  const handleShiftUpdated = async () => {
    const allShifts = await fetchAllShifts();
    setShifts(allShifts);
    setEditDialogOpen(false);
    toast({
      title: "Vardiya Güncellendi",
      description: "Vardiya başarıyla güncellendi.",
    });
  };

  const calculateDuration = (startTime: string, endTime: string | null) => {
    if (!endTime) return 'Devam ediyor';
    
    const start = formatDateTimeForDisplay(startTime);
    const end = formatDateTimeForDisplay(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours}s ${diffMinutes}dk`;
  };

  const getShiftDisplayDate = (shift: any) => {
    // Use end_time for display date, fallback to start_time if end_time is null
    const dateToUse = shift.end_time || shift.start_time;
    return formatDateTimeForDisplay(dateToUse);
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
        <p className="text-sm lg:text-base text-gray-600">Geçmiş vardiyaları görüntüle, filtrele ve düzenle</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Başlangıç Tarihi</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-11 border-gray-300",
                      !startDate && "text-gray-500"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd MMM yyyy", { locale: tr }) : "Başlangıç"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border shadow-lg" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    locale={tr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Bitiş Tarihi</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-11 border-gray-300",
                      !endDate && "text-gray-500"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd MMM yyyy", { locale: tr }) : "Bitiş"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border shadow-lg" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
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
                {startDate || endDate || selectedPersonnel ? 'Seçilen kriterlere uygun vardiya bulunamadı.' : 'Henüz vardiya geçmişi bulunmuyor.'}
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
            const displayDate = getShiftDisplayDate(shift);
            
            return (
              <Card key={shift.id} className="shadow-sm border hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900">{shift.personnel.name}</CardTitle>
                      <CardDescription className="mt-1">
                        <div className="flex items-center space-x-1 mb-2">
                          <Calendar className="h-3 w-3" />
                          <span className="text-sm">{format(displayDate, "dd MMMM yyyy", { locale: tr })}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{format(formatDateTimeForDisplay(shift.start_time), "HH:mm")}</span>
                            {shift.end_time && (
                              <>
                                <span>-</span>
                                <span>{format(formatDateTimeForDisplay(shift.end_time), "HH:mm")}</span>
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
                          onClick={() => handleEditShift(shift)}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 px-2"
                        >
                          <Edit className="h-3 w-3" />
                          <span className="hidden sm:inline text-xs">Düzenle</span>
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
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(shift.otomasyon_satis)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 font-medium">Nakit</p>
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(shift.cash_sales)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 font-medium">Kart</p>
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(shift.card_sales)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 font-medium">Veresiye</p>
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(shift.veresiye)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 font-medium">Havale</p>
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(shift.bank_transfers)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 font-medium">Toplam</p>
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Açık/Fazla</span>
                      <Calculator className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className={`text-right font-bold text-lg ${shift.over_short >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{shift.over_short >= 0 ? 'Fazla:' : 'Açık:'} {formatCurrency(Math.abs(shift.over_short))}</span>
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

      <ShiftEditDialog
        shift={editingShift}
        isOpen={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onShiftUpdated={handleShiftUpdated}
      />
    </div>
  );
};
