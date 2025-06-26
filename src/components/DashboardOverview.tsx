
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, DollarSign, Clock, AlertTriangle, Fuel } from 'lucide-react';
import { useShifts } from '@/hooks/useShifts';
import { usePersonnel } from '@/hooks/usePersonnel';
import { useFuelSales } from '@/hooks/useFuelSales';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export const DashboardOverview = () => {
  const { allShifts, getWeeklyStats, getLatestShift, loading } = useShifts();
  const { personnel } = usePersonnel();
  const { fuelSales, getTotalFuelSales, getFuelSalesByType } = useFuelSales();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const weeklyStats = getWeeklyStats();
  const latestShift = getLatestShift();
  const activePersonnel = personnel.filter(p => p.status === 'active');
  const totalFuelSales = getTotalFuelSales();
  const fuelSalesByType = getFuelSalesByType();

  // Calculate daily stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayShifts = allShifts.filter(shift => {
    const shiftDate = new Date(shift.start_time);
    shiftDate.setHours(0, 0, 0, 0);
    return shiftDate.getTime() === today.getTime();
  });

  const todaySales = todayShifts.reduce((sum, shift) => 
    sum + shift.cash_sales + shift.card_sales, 0);

  // Calculate today's fuel sales
  const todayFuelSales = fuelSales.filter(sale => {
    const saleDate = new Date(sale.sale_time);
    saleDate.setHours(0, 0, 0, 0);
    return saleDate.getTime() === today.getTime();
  }).reduce((sum, sale) => sum + sale.total_amount, 0);

  // Calculate problematic shifts (large over/short amounts)
  const problematicShifts = allShifts.filter(shift => 
    Math.abs(shift.over_short) > 50
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold tracking-tight text-gray-900">Dashboard</h2>
        <p className="text-muted-foreground mt-2 text-lg">
          İstasyon genel durumuna genel bakış
        </p>
      </div>

      {/* Ana İstatistikler */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Bugünkü Vardiya Satış
            </CardTitle>
            <DollarSign className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">₺{todaySales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {todayShifts.length} vardiya tamamlandı
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Bugünkü Akaryakıt Satış
            </CardTitle>
            <Fuel className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">₺{todayFuelSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              akaryakıt satışları
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Haftalık Toplam Vardiya
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">₺{weeklyStats.totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              vardiya satışları
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Aktif Personel
            </CardTitle>
            <Users className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{activePersonnel.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              kayıtlı personel
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Akaryakıt Türleri Özeti */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Fuel className="h-6 w-6 text-blue-600" />
            <span>Akaryakıt Satış Özeti</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(fuelSalesByType).map(([fuelType, amount]) => (
              <div key={fuelType} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600">{fuelType}</p>
                <p className="text-xl font-bold text-gray-900">₺{amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Son Vardiya ve Uyarılar */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Son Vardiya</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestShift ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{latestShift.personnel.name}</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Tamamlandı</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(latestShift.start_time), "PPPp", { locale: tr })}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Toplam Satış:</span>
                    <span className="font-medium">
                      ₺{(latestShift.cash_sales + latestShift.card_sales).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Açık/Fazla:</span>
                    <span className={`font-medium ${latestShift.over_short >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₺{Math.abs(latestShift.over_short).toFixed(2)} 
                      {latestShift.over_short >= 0 ? ' (Fazla)' : ' (Açık)'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-muted-foreground">Henüz vardiya kaydı yok</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span>Sistem Durumu</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {problematicShifts > 0 && (
                <div className="flex items-center space-x-2 text-amber-600 p-3 bg-amber-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">
                    {problematicShifts} vardiyada yüksek açık/fazla var
                  </span>
                </div>
              )}
              {activePersonnel.length === 0 && (
                <div className="flex items-center space-x-2 text-red-600 p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">Aktif personel bulunmuyor</span>
                </div>
              )}
              {todayShifts.length === 0 && (
                <div className="flex items-center space-x-2 text-amber-600 p-3 bg-amber-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">Bugün henüz vardiya kaydı yok</span>
                </div>
              )}
              {problematicShifts === 0 && activePersonnel.length > 0 && todayShifts.length > 0 && (
                <div className="text-sm text-green-600 p-3 bg-green-50 rounded-lg">
                  ✓ Tüm sistemler normal çalışıyor
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
