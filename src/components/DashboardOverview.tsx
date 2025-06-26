
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { useShifts } from '@/hooks/useShifts';
import { usePersonnel } from '@/hooks/usePersonnel';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export const DashboardOverview = () => {
  const { allShifts, getWeeklyStats, getLatestShift, loading } = useShifts();
  const { personnel } = usePersonnel();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  const weeklyStats = getWeeklyStats();
  const latestShift = getLatestShift();
  const activePersonnel = personnel.filter(p => p.status === 'active');

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

  // Calculate problematic shifts (large over/short amounts)
  const problematicShifts = allShifts.filter(shift => 
    Math.abs(shift.over_short) > 50
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          İstasyon genel durumuna genel bakış
        </p>
      </div>

      {/* Ana İstatistikler */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bugünkü Satış
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{todaySales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {todayShifts.length} vardiya
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Haftalık Satış
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{weeklyStats.totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {weeklyStats.shiftCount} vardiya
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aktif Personel
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePersonnel.length}</div>
            <p className="text-xs text-muted-foreground">
              kayıtlı personel
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Haftalık Açık/Fazla
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${weeklyStats.totalOverShort >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₺{Math.abs(weeklyStats.totalOverShort).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {weeklyStats.totalOverShort >= 0 ? 'Fazla' : 'Açık'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Son Vardiya ve Uyarılar */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Son Vardiya</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestShift ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{latestShift.personnel.name}</span>
                  <Badge variant="secondary">Tamamlandı</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(latestShift.start_time), "PPPp", { locale: tr })}
                </div>
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
            ) : (
              <p className="text-muted-foreground">Henüz vardiya kaydı yok</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Uyarılar</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {problematicShifts > 0 && (
                <div className="flex items-center space-x-2 text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">
                    {problematicShifts} vardiyada yüksek açık/fazla var
                  </span>
                </div>
              )}
              {activePersonnel.length === 0 && (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">Aktif personel bulunmuyor</span>
                </div>
              )}
              {todayShifts.length === 0 && (
                <div className="flex items-center space-x-2 text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">Bugün henüz vardiya kaydı yok</span>
                </div>
              )}
              {problematicShifts === 0 && activePersonnel.length > 0 && todayShifts.length > 0 && (
                <div className="text-sm text-green-600">
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
