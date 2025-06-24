
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Clock, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { useShifts } from '@/hooks/useShifts';
import { usePersonnel } from '@/hooks/usePersonnel';
import { useNavigate } from 'react-router-dom';

export const DashboardOverview = () => {
  const { shifts, getWeeklyStats } = useShifts();
  const { personnel } = usePersonnel();
  const navigate = useNavigate();

  const weeklyStats = getWeeklyStats();
  const activeShifts = shifts.filter(shift => shift.status === 'active');
  const activePersonnel = personnel.filter(p => p.status === 'active');

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-shift':
        // Switch to shifts tab - this would need to be implemented with context or props
        break;
      case 'add-personnel':
        // Switch to personnel tab
        break;
      default:
        break;
    }
  };

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
            <CardTitle className="text-sm font-medium">Aktif Vardiyalar</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeShifts.length}</div>
            <p className="text-xs text-muted-foreground">
              {activePersonnel.length} aktif personelden
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Personel</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personnel.length}</div>
            <p className="text-xs text-muted-foreground">
              {activePersonnel.length} aktif
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

      {/* Aktif Vardiyalar */}
      <Card>
        <CardHeader>
          <CardTitle>Aktif Vardiyalar</CardTitle>
          <CardDescription>Şu anda açık olan vardiyalar</CardDescription>
        </CardHeader>
        <CardContent>
          {activeShifts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Şu anda aktif vardiya bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeShifts.map((shift) => (
                <div key={shift.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="default">aktif</Badge>
                    <div>
                      <p className="font-medium text-sm">{shift.personnel.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Başlangıç: {new Date(shift.start_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      ₺{(shift.cash_sales + shift.card_sales + shift.bank_transfers).toLocaleString('tr-TR')}
                    </p>
                    <p className={`text-xs ${shift.over_short >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {shift.over_short >= 0 ? '+' : ''}₺{shift.over_short.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hızlı İşlemler */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı İşlemler</CardTitle>
          <CardDescription>Sık kullanılan işlemler için kısayollar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={() => handleQuickAction('new-shift')}
              className="h-20 flex-col space-y-2"
            >
              <Clock className="h-6 w-6" />
              <span>Yeni Vardiya Başlat</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleQuickAction('add-personnel')}
              className="h-20 flex-col space-y-2"
            >
              <Users className="h-6 w-6" />
              <span>Personel Ekle</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
