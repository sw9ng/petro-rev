
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock, Users, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { useShifts } from '@/hooks/useShifts';
import { usePersonnel } from '@/hooks/usePersonnel';

export const DashboardOverview = () => {
  const { getWeeklyStats, getLatestShift } = useShifts();
  const { personnel } = usePersonnel();

  const weeklyStats = getWeeklyStats();
  const latestShift = getLatestShift();
  const activePersonnel = personnel.filter(p => p.status === 'active');

  return (
    <div className="space-y-6">
      {/* Metrik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Haftalık Toplam Satış</CardTitle>
            <DollarSign className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{weeklyStats.totalSales.toLocaleString('tr-TR')}</div>
            <p className="text-xs opacity-75">Son 7 gün</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Haftalık Vardiya</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats.shiftCount}</div>
            <p className="text-xs text-muted-foreground">
              Son 7 günde tamamlanan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Personel</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePersonnel.length}</div>
            <p className="text-xs text-muted-foreground">
              {personnel.length} toplam personelden
            </p>
          </CardContent>
        </Card>

        <Card className={weeklyStats.totalOverShort < 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Haftalık Fazla/Eksik</CardTitle>
            {weeklyStats.totalOverShort < 0 ? 
              <TrendingDown className="h-4 w-4 text-red-600" /> : 
              <TrendingUp className="h-4 w-4 text-green-600" />
            }
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${weeklyStats.totalOverShort < 0 ? 'text-red-700' : 'text-green-700'}`}>
              ₺{Math.abs(weeklyStats.totalOverShort).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {weeklyStats.totalOverShort < 0 ? 'Eksik' : 'Fazla'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Son Eklenen Vardiya */}
      <Card>
        <CardHeader>
          <CardTitle>Son Eklenen Vardiya</CardTitle>
          <CardDescription>En son kaydedilen vardiya bilgileri</CardDescription>
        </CardHeader>
        <CardContent>
          {!latestShift ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Henüz vardiya kaydı bulunmuyor.</p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Badge variant="secondary">Tamamlandı</Badge>
                <div>
                  <p className="font-medium text-sm">{latestShift.personnel.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(latestShift.start_time).toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-sm">
                  ₺{(latestShift.cash_sales + latestShift.card_sales + latestShift.bank_transfers).toLocaleString('tr-TR')}
                </p>
                <p className={`text-xs ${latestShift.over_short >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {latestShift.over_short >= 0 ? '+' : ''}₺{latestShift.over_short.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
