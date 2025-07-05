import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, BarChart3, DollarSign, Users, TrendingUp, Filter, CalendarRange } from 'lucide-react';
import { useShifts } from '@/hooks/useShifts';
import { usePersonnel } from '@/hooks/usePersonnel';
import { useFuelSales } from '@/hooks/useFuelSales';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDateTimeForDisplay } from '@/lib/numberUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface PersonnelStat {
  name: string;
  shifts: number;
  revenue: number;
  overShort: number;
}

export const ReportsView = () => {
  const { toast } = useToast();
  const { fetchAllShifts } = useShifts();
  const { personnel } = usePersonnel();
  const { fetchAllFuelSales } = useFuelSales();
  
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedPersonnel, setSelectedPersonnel] = useState('');
  const [shiftType, setShiftType] = useState('');
  const [allShifts, setAllShifts] = useState<any[]>([]);
  const [fuelSales, setFuelSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [shiftsData, fuelData] = await Promise.all([
        fetchAllShifts(),
        fetchAllFuelSales()
      ]);
      console.log('All shifts loaded:', shiftsData);
      console.log('Fuel sales loaded:', fuelData);
      setAllShifts(shiftsData);
      setFuelSales(fuelData);
      setLoading(false);
    };

    loadData();
  }, []);

  const filteredShifts = useMemo(() => {
    if (!startDate || !endDate) return [];
    
    let filtered = allShifts.filter(shift => {
      const shiftDate = new Date(shift.start_time);
      // Set time to start of day for startDate and end of day for endDate to include full days
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      return shiftDate >= startOfDay && shiftDate <= endOfDay;
    });

    // Filter by shift type - Fixed the logic here
    if (shiftType) {
      console.log('Filtering by shift type:', shiftType);
      console.log('Before shift type filter:', filtered.length);
      
      if (shiftType === 'V1') {
        // Include shifts with shift_number = 'V1' OR null/undefined (default V1)
        filtered = filtered.filter(shift => 
          shift.shift_number === 'V1' || 
          !shift.shift_number || 
          shift.shift_number === null || 
          shift.shift_number === undefined
        );
      } else if (shiftType === 'V2') {
        filtered = filtered.filter(shift => shift.shift_number === 'V2');
      }
      
      console.log('After shift type filter:', filtered.length);
      console.log('Filtered shifts:', filtered.map(s => ({ id: s.id, shift_number: s.shift_number, personnel: s.personnel?.name })));
    }

    // Filter by personnel if selected
    if (selectedPersonnel) {
      filtered = filtered.filter(shift => shift.personnel_id === selectedPersonnel);
    }

    return filtered;
  }, [allShifts, startDate, endDate, shiftType, selectedPersonnel]);

  const filteredFuelSales = useMemo(() => {
    if (!startDate || !endDate) return [];
    
    let filtered = fuelSales.filter(sale => {
      const saleDate = new Date(sale.sale_time);
      // Set time to start of day for startDate and end of day for endDate to include full days
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      return saleDate >= startOfDay && saleDate <= endOfDay;
    });

    // Filter by personnel if selected
    if (selectedPersonnel) {
      filtered = filtered.filter(sale => sale.personnel_id === selectedPersonnel);
    }

    return filtered;
  }, [fuelSales, startDate, endDate, selectedPersonnel]);

  const totalRevenue = useMemo(() => {
    return filteredShifts.reduce((sum, shift) => 
      sum + (shift.cash_sales || 0) + (shift.card_sales || 0) + (shift.loyalty_card || 0), 0);
  }, [filteredShifts]);

  const totalAutomation = useMemo(() => {
    return filteredShifts.reduce((sum, shift) => sum + (shift.otomasyon_satis || 0), 0);
  }, [filteredShifts]);

  const totalCashSales = useMemo(() => {
    return filteredShifts.reduce((sum, shift) => sum + (shift.cash_sales || 0), 0);
  }, [filteredShifts]);

  const totalCardSales = useMemo(() => {
    return filteredShifts.reduce((sum, shift) => sum + (shift.card_sales || 0), 0);
  }, [filteredShifts]);

  const totalLoyaltyCard = useMemo(() => {
    return filteredShifts.reduce((sum, shift) => sum + (shift.loyalty_card || 0), 0);
  }, [filteredShifts]);

  const totalVeresiye = useMemo(() => {
    return filteredShifts.reduce((sum, shift) => sum + (shift.veresiye || 0), 0);
  }, [filteredShifts]);

  const totalBankTransfers = useMemo(() => {
    return filteredShifts.reduce((sum, shift) => sum + (shift.bank_transfers || 0), 0);
  }, [filteredShifts]);

  const totalOverShort = useMemo(() => {
    return filteredShifts.reduce((sum, shift) => sum + (shift.over_short || 0), 0);
  }, [filteredShifts]);

  const totalFuelRevenue = useMemo(() => {
    return filteredFuelSales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
  }, [filteredFuelSales]);

  const totalFuelLiters = useMemo(() => {
    return filteredFuelSales.reduce((sum, sale) => sum + (sale.liters || 0), 0);
  }, [filteredFuelSales]);

  const averagePerShift = useMemo(() => {
    return filteredShifts.length > 0 ? totalRevenue / filteredShifts.length : 0;
  }, [totalRevenue, filteredShifts]);

  const shiftCount = useMemo(() => {
    return filteredShifts.length;
  }, [filteredShifts]);

  const personnelStats = useMemo(() => {
    const stats = filteredShifts.reduce((acc, shift) => {
      const personnelName = shift.personnel?.name || 'Bilinmeyen';
      if (!acc[personnelName]) {
        acc[personnelName] = {
          name: personnelName,
          shifts: 0,
          revenue: 0,
          overShort: 0
        };
      }
      acc[personnelName].shifts += 1;
      acc[personnelName].revenue += (shift.cash_sales || 0) + (shift.card_sales || 0) + (shift.loyalty_card || 0);
      acc[personnelName].overShort += (shift.over_short || 0);
      return acc;
    }, {} as Record<string, PersonnelStat>);

    return Object.values(stats) as PersonnelStat[];
  }, [filteredShifts]);

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedPersonnel('');
    setShiftType('');
  };

  const chartData = personnelStats.map(stat => ({
    name: stat.name,
    revenue: stat.revenue,
    shifts: stat.shifts
  }));

  const pieData = [
    { name: 'Nakit', value: totalCashSales, color: '#10b981' },
    { name: 'Kart', value: totalCardSales, color: '#3b82f6' },
    { name: 'Sadakat Kartı', value: totalLoyaltyCard, color: '#f59e0b' },
    { name: 'Veresiye', value: totalVeresiye, color: '#ef4444' },
    { name: 'Banka Havale', value: totalBankTransfers, color: '#8b5cf6' }
  ].filter(item => item.value > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-600">Raporlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Raporlar</h2>
        <p className="text-sm lg:text-base text-gray-600">Satış ve performans raporlarını görüntüle</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Vardiya Türü</label>
              <Select value={shiftType} onValueChange={setShiftType}>
                <SelectTrigger className="h-11 border-gray-300">
                  <SelectValue placeholder="Vardiya seçin" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg">
                  <SelectItem value="V1">V1 (Gündüz)</SelectItem>
                  <SelectItem value="V2">V2 (Gece)</SelectItem>
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

      {!startDate || !endDate ? (
        <Card className="shadow-sm border">
          <CardContent className="text-center py-12">
            <CalendarRange className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Rapor görüntülemek için tarih aralığı seçin</p>
            <p className="text-gray-500 text-sm">Başlangıç ve bitiş tarihlerini seçerek raporları görüntüleyebilirsiniz.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-sm border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Toplam Satış</CardTitle>
                <DollarSign className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
                <p className="text-xs text-gray-600">
                  {shiftCount} vardiya
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Otomasyon Satış</CardTitle>
                <BarChart3 className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalAutomation)}</div>
                <p className="text-xs text-gray-600">
                  Sistem kayıtları
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Ortalama/Vardiya</CardTitle>
                <TrendingUp className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(averagePerShift)}</div>
                <p className="text-xs text-gray-600">
                  Vardiya başına ortalama
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Açık/Fazla</CardTitle>
                <DollarSign className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${totalOverShort >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(totalOverShort))}
                </div>
                <p className="text-xs text-gray-600">
                  {totalOverShort >= 0 ? 'Fazla' : 'Açık'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Method Breakdown */}
          <Card className="shadow-sm border">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Ödeme Yöntemleri Dağılımı</CardTitle>
              <CardDescription>Seçilen dönemde ödeme türlerine göre satış dağılımı</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-900">Nakit</p>
                  <p className="text-xl font-bold text-green-700">{formatCurrency(totalCashSales)}</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Kart</p>
                  <p className="text-xl font-bold text-blue-700">{formatCurrency(totalCardSales)}</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm font-medium text-amber-900">Sadakat Kartı</p>
                  <p className="text-xl font-bold text-amber-700">{formatCurrency(totalLoyaltyCard)}</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-sm font-medium text-red-900">Veresiye</p>
                  <p className="text-xl font-bold text-red-700">{formatCurrency(totalVeresiye)}</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm font-medium text-purple-900">Banka Havale</p>
                  <p className="text-xl font-bold text-purple-700">{formatCurrency(totalBankTransfers)}</p>
                </div>
              </div>
              
              {pieData.length > 0 && (
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personnel Performance */}
          {personnelStats.length > 0 && (
            <Card className="shadow-sm border">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Personel Performansı</CardTitle>
                <CardDescription>Seçilen dönemde personel bazlı satış performansı</CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="revenue" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6 space-y-4">
                  {personnelStats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{stat.name}</p>
                          <p className="text-sm text-gray-600">{stat.shifts} vardiya</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">{formatCurrency(stat.revenue)}</p>
                        <p className={`text-sm ${stat.overShort >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stat.overShort >= 0 ? 'Fazla:' : 'Açık:'} {formatCurrency(Math.abs(stat.overShort))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {filteredShifts.length === 0 && (
            <Card className="shadow-sm border">
              <CardContent className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Seçilen kriterlere uygun veri bulunamadı</p>
                <p className="text-gray-500 text-sm">Farklı tarih aralığı veya filtre seçenekleri deneyin.</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
