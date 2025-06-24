
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, Filter, TrendingUp, TrendingDown, DollarSign, Clock } from 'lucide-react';

export const ReportsView = () => {
  // Sample report data
  const weeklyData = [
    { date: '2024-01-15', shifts: 3, totalSales: 8250.00, overShort: 15.50, staff: ['Ahmet', 'Fatma', 'Mehmet'] },
    { date: '2024-01-14', shifts: 3, totalSales: 7890.00, overShort: -8.25, staff: ['Ayşe', 'Mustafa', 'Mehmet'] },
    { date: '2024-01-13', shifts: 2, totalSales: 6100.00, overShort: 22.00, staff: ['Ahmet', 'Fatma'] },
    { date: '2024-01-12', shifts: 3, totalSales: 9200.00, overShort: -5.75, staff: ['Ayşe', 'Mehmet', 'Mustafa'] },
    { date: '2024-01-11', shifts: 3, totalSales: 8450.00, overShort: 18.25, staff: ['Ahmet', 'Fatma', 'Mehmet'] },
  ];

  const staffPerformance = [
    { name: 'Ahmet Yılmaz', shifts: 12, totalSales: 32500.00, avgOverShort: 8.45, efficiency: 95 },
    { name: 'Mehmet Kaya', shifts: 15, totalSales: 41200.00, avgOverShort: 12.30, efficiency: 98 },
    { name: 'Fatma Demir', shifts: 10, totalSales: 24800.00, avgOverShort: -2.15, efficiency: 87 },
    { name: 'Ayşe Özkan', shifts: 8, totalSales: 19500.00, avgOverShort: -4.80, efficiency: 82 },
    { name: 'Mustafa Çelik', shifts: 9, totalSales: 22100.00, avgOverShort: 1.25, efficiency: 90 }
  ];

  const totalWeekSales = weeklyData.reduce((sum, day) => sum + day.totalSales, 0);
  const totalWeekOverShort = weeklyData.reduce((sum, day) => sum + day.overShort, 0);
  const avgDailySales = totalWeekSales / weeklyData.length;

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Raporlar ve Analizler</h2>
          <p className="text-muted-foreground">Performansı takip et ve trendleri analiz et</p>
        </div>
        <div className="flex space-x-2">
          <Select defaultValue="7days">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Son 7 Gün</SelectItem>
              <SelectItem value="30days">Son 30 Gün</SelectItem>
              <SelectItem value="90days">Son 90 Gün</SelectItem>
              <SelectItem value="custom">Özel Aralık</SelectItem>
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
              <span className="text-sm font-medium">Haftalık Toplam Satış</span>
            </div>
            <p className="text-2xl font-bold mt-2">₺{totalWeekSales.toLocaleString('tr-TR')}</p>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              Geçen haftaya göre %12,5 fazla
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
            <p className="text-xs text-muted-foreground mt-1">Günlük ortalama</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">Toplam Vardiya</span>
            </div>
            <p className="text-2xl font-bold mt-2">{weeklyData.reduce((sum, day) => sum + day.shifts, 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">Bu hafta</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              {totalWeekOverShort >= 0 ? 
                <TrendingUp className="h-5 w-5 text-green-600" /> : 
                <TrendingDown className="h-5 w-5 text-red-600" />
              }
              <span className="text-sm font-medium">Haftalık Fazla/Eksik</span>
            </div>
            <p className={`text-2xl font-bold mt-2 ${totalWeekOverShort >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalWeekOverShort >= 0 ? '+' : ''}₺{totalWeekOverShort.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalWeekOverShort >= 0 ? 'Fazlalık' : 'Eksiklik'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Günlük Performans</CardTitle>
          <CardDescription>Geçen hafta için satış ve fazla/eksik trendleri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyData.map((day, index) => (
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
                    {day.staff.map((name) => (
                      <Badge key={name} variant="outline" className="text-xs">
                        {name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Staff Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Personel Performansı</CardTitle>
          <CardDescription>Bireysel çalışan performans metrikleri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {staffPerformance.map((staff, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-700">
                      {staff.name.split(' ').map(n => n[0]).join('')}
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
                    <p className="font-semibold">%{staff.efficiency}</p>
                    <p className="text-xs text-muted-foreground">Verimlilik</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
