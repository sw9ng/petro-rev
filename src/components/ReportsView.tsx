
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, TrendingUp, TrendingDown, DollarSign, Clock, Users } from 'lucide-react';
import { useShifts } from '@/hooks/useShifts';
import { usePersonnel } from '@/hooks/usePersonnel';

export const ReportsView = () => {
  const { fetchAllShifts } = useShifts();
  const { personnel } = usePersonnel();
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7days');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const allShifts = await fetchAllShifts();
      setShifts(allShifts);
      setLoading(false);
    };

    loadData();
  }, []);

  const getFilteredShifts = () => {
    const now = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    return shifts.filter(shift => new Date(shift.start_time) >= startDate);
  };

  const filteredShifts = getFilteredShifts();

  const getTotalSales = () => {
    return filteredShifts.reduce((sum, shift) => 
      sum + shift.cash_sales + shift.card_sales + shift.bank_transfers, 0
    );
  };

  const getTotalOverShort = () => {
    return filteredShifts.reduce((sum, shift) => sum + shift.over_short, 0);
  };

  const getAverageDailySales = () => {
    const totalSales = getTotalSales();
    const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90;
    return totalSales / days;
  };

  const getStaffPerformance = () => {
    const staffStats: any = {};
    
    filteredShifts.forEach(shift => {
      const staffId = shift.personnel_id;
      const totalSales = shift.cash_sales + shift.card_sales + shift.bank_transfers;
      
      if (!staffStats[staffId]) {
        staffStats[staffId] = {
          name: shift.personnel.name,
          shifts: 0,
          totalSales: 0,
          overShortSum: 0,
        };
      }
      
      staffStats[staffId].shifts += 1;
      staffStats[staffId].totalSales += totalSales;
      staffStats[staffId].overShortSum += shift.over_short;
    });

    return Object.values(staffStats).map((staff: any) => ({
      ...staff,
      avgOverShort: staff.overShortSum / staff.shifts || 0,
      efficiency: Math.min(100, Math.max(0, 95 + (staff.overShortSum / staff.shifts) * 2))
    }));
  };

  const getDailyData = () => {
    const dailyStats: any = {};
    
    filteredShifts.forEach(shift => {
      const date = new Date(shift.start_time).toISOString().split('T')[0];
      const totalSales = shift.cash_sales + shift.card_sales + shift.bank_transfers;
      
      if (!dailyStats[date]) {
        dailyStats[date] = {
          date,
          shifts: 0,
          totalSales: 0,
          overShort: 0,
          staff: new Set()
        };
      }
      
      dailyStats[date].shifts += 1;
      dailyStats[date].totalSales += totalSales;
      dailyStats[date].overShort += shift.over_short;
      dailyStats[date].staff.add(shift.personnel.name);
    });

    return Object.values(dailyStats)
      .map((day: any) => ({
        ...day,
        staff: Array.from(day.staff)
      }))
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Raporlar yükleniyor...</p>
      </div>
    );
  }

  const totalSales = getTotalSales();
  const totalOverShort = getTotalOverShort();
  const avgDailySales = getAverageDailySales();
  const staffPerformance = getStaffPerformance();
  const dailyData = getDailyData();

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Raporlar ve Analizler</h2>
          <p className="text-muted-foreground">Performansı takip et ve trendleri analiz et</p>
        </div>
        <div className="flex space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Son 7 Gün</SelectItem>
              <SelectItem value="30days">Son 30 Gün</SelectItem>
              <SelectItem value="90days">Son 90 Gün</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Dışa Aktar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Toplam Satış</span>
            </div>
            <p className="text-2xl font-bold mt-2">₺{totalSales.toLocaleString('tr-TR')}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {dateRange === '7days' ? 'Son 7 gün' : dateRange === '30days' ? 'Son 30 gün' : 'Son 90 gün'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Günlük Ortalama</span>
            </div>
            <p className="text-2xl font-bold mt-2">₺{avgDailySales.toLocaleString('tr-TR')}</p>
            <p className="text-xs text-muted-foreground mt-1">Günlük ortalama satış</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">Toplam Vardiya</span>
            </div>
            <p className="text-2xl font-bold mt-2">{filteredShifts.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Seçilen dönemde</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              {totalOverShort >= 0 ? 
                <TrendingUp className="h-5 w-5 text-green-600" /> : 
                <TrendingDown className="h-5 w-5 text-red-600" />
              }
              <span className="text-sm font-medium">Toplam Fazla/Eksik</span>
            </div>
            <p className={`text-2xl font-bold mt-2 ${totalOverShort >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalOverShort >= 0 ? '+' : ''}₺{totalOverShort.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalOverShort >= 0 ? 'Fazlalık' : 'Eksiklik'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Performance Chart */}
      {dailyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Günlük Performans</CardTitle>
            <CardDescription>Son günlerdeki satış ve fazla/eksik trendleri</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dailyData.map((day: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="font-semibold">{new Date(day.date).toLocaleDateString('tr-TR', { weekday: 'short' })}</p>
                      <p className="text-xs text-muted-foreground">{new Date(day.date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })}</p>
                    </div>
                    <div>
                      <p className="font-medium">₺{day.totalSales.toLocaleString('tr-TR')}</p>
                      <p className="text-sm text-muted-foreground">{day.shifts} vardiya</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className={`font-medium ${day.overShort >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {day.overShort >= 0 ? '+' : ''}₺{day.overShort.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">Fazla/Eksik</p>
                    </div>
                    <div className="flex space-x-1">
                      {day.staff.slice(0, 3).map((name: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {name.split(' ')[0]}
                        </Badge>
                      ))}
                      {day.staff.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{day.staff.length - 3}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff Performance Table */}
      {staffPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Personel Performansı</CardTitle>
            <CardDescription>Bireysel çalışan performans metrikleri</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {staffPerformance.map((staff: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-700">
                        {staff.name.split(' ').map((n: string) => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{staff.name}</p>
                      <p className="text-sm text-muted-foreground">{staff.shifts} vardiya</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-8 text-center">
                    <div>
                      <p className="font-semibold">₺{(staff.totalSales / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-muted-foreground">Toplam Satış</p>
                    </div>
                    <div>
                      <p className={`font-semibold ${staff.avgOverShort >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {staff.avgOverShort >= 0 ? '+' : ''}₺{staff.avgOverShort.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">Ort. Fazla/Eksik</p>
                    </div>
                    <div>
                      <p className="font-semibold">%{Math.round(staff.efficiency)}</p>
                      <p className="text-xs text-muted-foreground">Verimlilik</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
