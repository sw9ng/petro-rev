
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Fuel, DollarSign, Users, TrendingUp, Gauge, Clock, CreditCard, AlertTriangle } from 'lucide-react';
import { useShifts } from '@/hooks/useShifts';
import { usePersonnel } from '@/hooks/usePersonnel';
import { useFuelSales } from '@/hooks/useFuelSales';
import { formatCurrency } from '@/lib/numberUtils';
import { useMemo } from 'react';

export const FuelStationDashboard = () => {
  const { allShifts, loading: shiftsLoading } = useShifts();
  const { personnel } = usePersonnel();
  const { fuelSales } = useFuelSales();

  // Calculate key metrics
  const dashboardMetrics = useMemo(() => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);

    const todayShifts = allShifts.filter(shift => 
      new Date(shift.start_time).toDateString() === today.toDateString()
    );

    const weeklyShifts = allShifts.filter(shift => 
      new Date(shift.start_time) >= lastWeek
    );

    const monthlyShifts = allShifts.filter(shift => 
      new Date(shift.start_time) >= lastMonth
    );

    return {
      todayRevenue: todayShifts.reduce((sum, shift) => 
        sum + shift.cash_sales + shift.card_sales + shift.loyalty_card + shift.bank_transfers, 0),
      weeklyRevenue: weeklyShifts.reduce((sum, shift) => 
        sum + shift.cash_sales + shift.card_sales + shift.loyalty_card + shift.bank_transfers, 0),
      monthlyRevenue: monthlyShifts.reduce((sum, shift) => 
        sum + shift.cash_sales + shift.card_sales + shift.loyalty_card + shift.bank_transfers, 0),
      todayShiftsCount: todayShifts.length,
      activePersonnel: personnel.filter(p => p.status === 'active').length,
      totalPersonnel: personnel.length,
      averageShiftValue: weeklyShifts.length > 0 ? 
        weeklyShifts.reduce((sum, shift) => sum + shift.cash_sales + shift.card_sales + shift.loyalty_card + shift.bank_transfers, 0) / weeklyShifts.length : 0,
      loyaltyCardUsage: weeklyShifts.reduce((sum, shift) => sum + shift.loyalty_card, 0),
      overShortTotal: weeklyShifts.reduce((sum, shift) => sum + shift.over_short, 0)
    };
  }, [allShifts, personnel]);

  // Prepare chart data
  const weeklyChartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    return last7Days.map(date => {
      const dayShifts = allShifts.filter(shift => 
        new Date(shift.start_time).toDateString() === date.toDateString()
      );
      
      const revenue = dayShifts.reduce((sum, shift) => 
        sum + shift.cash_sales + shift.card_sales + shift.loyalty_card + shift.bank_transfers, 0);
      
      return {
        date: date.toLocaleDateString('tr-TR', { weekday: 'short' }),
        revenue,
        shifts: dayShifts.length
      };
    });
  }, [allShifts]);

  const paymentMethodData = useMemo(() => {
    const totals = allShifts.reduce((acc, shift) => ({
      nakit: acc.nakit + shift.cash_sales,
      kart: acc.kart + shift.card_sales,
      sadakat: acc.sadakat + shift.loyalty_card,
      havale: acc.havale + shift.bank_transfers,
      veresiye: acc.veresiye + shift.veresiye
    }), { nakit: 0, kart: 0, sadakat: 0, havale: 0, veresiye: 0 });

    return [
      { name: 'Nakit', value: totals.nakit, color: '#22c55e' },
      { name: 'Kart', value: totals.kart, color: '#3b82f6' },
      { name: 'Sadakat Kartı', value: totals.sadakat, color: '#f59e0b' },
      { name: 'Havale', value: totals.havale, color: '#8b5cf6' },
      { name: 'Veresiye', value: totals.veresiye, color: '#ef4444' }
    ].filter(item => item.value > 0);
  }, [allShifts]);

  if (shiftsLoading) {
    return <div className="flex justify-center items-center h-64">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Akaryakıt İstasyonu Özeti</h2>
        <p className="text-sm lg:text-base text-gray-600">Operasyonel performans ve satış özetleri</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bugün Ciro</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(dashboardMetrics.todayRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Haftalık Ciro</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(dashboardMetrics.weeklyRevenue)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktif Personel</p>
                <p className="text-2xl font-bold text-purple-600">{dashboardMetrics.activePersonnel}/{dashboardMetrics.totalPersonnel}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bugün Vardiya</p>
                <p className="text-2xl font-bold text-orange-600">{dashboardMetrics.todayShiftsCount}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>7 Günlük Ciro Trendi</span>
            </CardTitle>
            <CardDescription>Günlük satış performansı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `₺${value.toLocaleString()}`} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), 'Ciro']} />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Ödeme Yöntemleri</span>
            </CardTitle>
            <CardDescription>Ödeme türlerine göre dağılım</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} %${(percent * 100).toFixed(0)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ortalama Vardiya Değeri</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(dashboardMetrics.averageShiftValue)}</p>
              </div>
              <Gauge className="h-6 w-6 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sadakat Kartı Kullanımı</p>
                <p className="text-xl font-bold text-amber-600">{formatCurrency(dashboardMetrics.loyaltyCardUsage)}</p>
              </div>
              <CreditCard className="h-6 w-6 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Açık/Fazla</p>
                <p className={`text-xl font-bold ${dashboardMetrics.overShortTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {dashboardMetrics.overShortTotal >= 0 ? '+' : ''}{formatCurrency(dashboardMetrics.overShortTotal)}
                </p>
              </div>
              <AlertTriangle className={`h-6 w-6 ${dashboardMetrics.overShortTotal >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Operations Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart className="h-5 w-5" />
            <span>Günlük Operasyon Özeti</span>
          </CardTitle>
          <CardDescription>Son 7 günün vardiya ve ciro karşılaştırması</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => `₺${value.toLocaleString()}`} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'revenue' ? formatCurrency(value) : value,
                    name === 'revenue' ? 'Ciro' : 'Vardiya Sayısı'
                  ]} 
                />
                <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="revenue" />
                <Bar yAxisId="right" dataKey="shifts" fill="#10b981" name="shifts" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
