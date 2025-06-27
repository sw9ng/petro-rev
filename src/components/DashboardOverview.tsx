import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Fuel, Users, TrendingUp, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { useFuelSales } from '@/hooks/useFuelSales';
import { usePersonnel } from '@/hooks/usePersonnel';
import { useShifts } from '@/hooks/useShifts';
import { formatCurrency, formatDateTimeForDisplay } from '@/lib/numberUtils';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export const DashboardOverview = () => {
  const { fuelSales, loading: fuelLoading } = useFuelSales();
  const { personnel, loading: personnelLoading } = usePersonnel();
  const { shifts, loading: shiftsLoading } = useShifts();

  const loading = fuelLoading || personnelLoading || shiftsLoading;

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-40"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate totals
  const totalFuelSales = fuelSales.reduce((sum, sale) => sum + sale.total_amount, 0);
  const totalPersonnel = personnel.filter(p => p.status === 'active').length;
  const activeShifts = shifts.filter(shift => shift.status === 'active').length;
  const totalShifts = shifts.length;

  // Get recent fuel sales (last 5)
  const recentFuelSales = fuelSales
    .sort((a, b) => new Date(b.sale_time).getTime() - new Date(a.sale_time).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Toplam Akaryakıt Satışı</CardTitle>
            <Fuel className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{formatCurrency(totalFuelSales)}</div>
            <p className="text-xs text-blue-600 mt-1">Toplam satış tutarı</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Aktif Personel</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{totalPersonnel}</div>
            <p className="text-xs text-green-600 mt-1">Çalışan personel sayısı</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Aktif Vardiyalar</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{activeShifts}</div>
            <p className="text-xs text-orange-600 mt-1">Devam eden vardiya sayısı</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Toplam Vardiya</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{totalShifts}</div>
            <p className="text-xs text-purple-600 mt-1">Tüm vardiya kayıtları</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Fuel Sales */}
      {recentFuelSales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Fuel className="h-5 w-5 mr-2 text-blue-600" />
              Son Akaryakıt Satışları
            </CardTitle>
            <CardDescription>En son kaydedilen 5 satış</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentFuelSales.map((sale) => {
                const saleDate = formatDateTimeForDisplay(sale.sale_time);
                return (
                  <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">{sale.fuel_type}</p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {format(saleDate, "dd MMM yyyy HH:mm", { locale: tr })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{formatCurrency(sale.total_amount)}</p>
                      <p className="text-xs text-gray-500">{sale.liters.toFixed(3)} L</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
