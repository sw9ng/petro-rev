
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, TrendingUp, DollarSign, Users, Fuel } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useShifts } from '@/hooks/useShifts';
import { usePersonnel } from '@/hooks/usePersonnel';
import { useFuelSales } from '@/hooks/useFuelSales';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const ReportsView = () => {
  const { fetchAllShifts } = useShifts();
  const { personnel } = usePersonnel();
  const { fuelSales } = useFuelSales();
  const [shifts, setShifts] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedPersonnel, setSelectedPersonnel] = useState('');
  const [loading, setLoading] = useState(false);

  const loadShifts = async () => {
    setLoading(true);
    const allShifts = await fetchAllShifts();
    setShifts(allShifts);
    setLoading(false);
  };

  useEffect(() => {
    loadShifts();
  }, []);

  const filteredShifts = shifts.filter(shift => {
    let include = true;

    if (startDate) {
      const shiftDate = new Date(shift.start_time);
      include = include && shiftDate >= startDate;
    }

    if (endDate) {
      const shiftDate = new Date(shift.start_time);
      const endDateWithTime = new Date(endDate);
      endDateWithTime.setHours(23, 59, 59, 999);
      include = include && shiftDate <= endDateWithTime;
    }

    if (selectedPersonnel) {
      include = include && shift.personnel_id === selectedPersonnel;
    }

    return include;
  });

  // Filter fuel sales by date range
  const filteredFuelSales = fuelSales.filter(sale => {
    let include = true;

    if (startDate) {
      const saleDate = new Date(sale.sale_time);
      include = include && saleDate >= startDate;
    }

    if (endDate) {
      const saleDate = new Date(sale.sale_time);
      const endDateWithTime = new Date(endDate);
      endDateWithTime.setHours(23, 59, 59, 999);
      include = include && saleDate <= endDateWithTime;
    }

    return include;
  });

  // Calculate statistics
  const totalRevenue = filteredShifts.reduce((sum, shift) => 
    sum + shift.cash_sales + shift.card_sales + shift.veresiye + shift.bank_transfers, 0);
  
  const totalFuelRevenue = filteredFuelSales.reduce((sum, sale) => sum + sale.total_amount, 0);
  
  const totalOverShort = filteredShifts.reduce((sum, shift) => sum + (shift.over_short || 0), 0);

  // Prepare chart data
  const dailyRevenue = filteredShifts.reduce((acc, shift) => {
    const date = format(new Date(shift.start_time), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = { date, revenue: 0, shifts: 0 };
    }
    acc[date].revenue += shift.cash_sales + shift.card_sales + shift.veresiye + shift.bank_transfers;
    acc[date].shifts += 1;
    return acc;
  }, {} as Record<string, any>);

  const chartData = Object.values(dailyRevenue).map((item: any) => ({
    date: format(new Date(item.date), 'dd/MM'),
    revenue: item.revenue,
    shifts: item.shifts
  }));

  // Fuel sales by type
  const fuelSalesByType = filteredFuelSales.reduce((acc, sale) => {
    if (!acc[sale.fuel_type]) {
      acc[sale.fuel_type] = 0;
    }
    acc[sale.fuel_type] += sale.total_amount;
    return acc;
  }, {} as Record<string, number>);

  const fuelPieData = Object.entries(fuelSalesByType).map(([type, amount]) => ({
    name: type,
    value: amount
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedPersonnel('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Raporlar</h2>
          <p className="text-muted-foreground">Detaylı analiz ve raporlar</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Başlangıç Tarihi</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP", { locale: tr }) : "Tarih seçin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
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
              <label className="text-sm font-medium">Bitiş Tarihi</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP", { locale: tr }) : "Tarih seçin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
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
              <label className="text-sm font-medium">Personel</label>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Ciro</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Akaryakıt Satışı</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{totalFuelRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Vardiya</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredShifts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Açık/Fazla</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalOverShort >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₺{totalOverShort.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Günlük Ciro</TabsTrigger>
          <TabsTrigger value="fuel">Akaryakıt Türü</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Günlük Ciro Analizi</CardTitle>
              <CardDescription>Seçilen tarih aralığındaki günlük ciro değişimi</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₺${Number(value).toFixed(2)}`, 'Ciro']} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" name="Günlük Ciro" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fuel">
          <Card>
            <CardHeader>
              <CardTitle>Akaryakıt Türü Dağılımı</CardTitle>
              <CardDescription>Akaryakıt türlerine göre satış dağılımı</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={fuelPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {fuelPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₺${Number(value).toFixed(2)}`, 'Tutar']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
