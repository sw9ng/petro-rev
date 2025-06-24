
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Clock, Users, TrendingUp, TrendingDown, Plus } from 'lucide-react';

export const DashboardOverview = () => {
  // Basit örnek veriler
  const todaysMetrics = {
    totalSales: 15420.50,
    cashSales: 8200.00,
    cardSales: 5120.50,
    bankTransfers: 2100.00,
    overShort: -45.25,
    activeShifts: 2,
    totalStaff: 8
  };

  const recentShifts = [
    { id: 1, employee: 'Ahmet Yılmaz', startTime: '06:00', status: 'aktif', totalSales: 2450.00 },
    { id: 2, employee: 'Fatma Demir', startTime: '14:00', status: 'aktif', totalSales: 1890.50 },
    { id: 3, employee: 'Mehmet Kaya', startTime: '22:00', status: 'kapalı', totalSales: 3200.00, overShort: 15.50 }
  ];

  const handleNewShift = () => {
    // Basit alert - gerçek uygulamada vardiya sekmesine yönlendirir
    alert('Yeni vardiya başlatmak için "Vardiyalar" sekmesine gidin');
  };

  const handlePOSTransaction = () => {
    // Manuel POS işlemi girişi için basit prompt
    const amount = prompt('POS işlem tutarını girin (₺):');
    if (amount) {
      alert(`₺${amount} tutarında POS işlemi kaydedildi`);
    }
  };

  const handleAddStaff = () => {
    // Personel ekleme için basit prompt
    const name = prompt('Personel adını girin:');
    if (name) {
      alert(`${name} personel listesine eklendi`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Basit Metrik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Bugünün Toplam Satışı</CardTitle>
            <DollarSign className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{todaysMetrics.totalSales.toLocaleString('tr-TR')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Vardiyalar</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysMetrics.activeShifts}</div>
            <p className="text-xs text-muted-foreground">
              {todaysMetrics.totalStaff} personelden
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nakit Satışlar</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{todaysMetrics.cashSales.toLocaleString('tr-TR')}</div>
          </CardContent>
        </Card>

        <Card className={todaysMetrics.overShort < 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugünün Fazla/Eksik</CardTitle>
            {todaysMetrics.overShort < 0 ? 
              <TrendingDown className="h-4 w-4 text-red-600" /> : 
              <TrendingUp className="h-4 w-4 text-green-600" />
            }
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${todaysMetrics.overShort < 0 ? 'text-red-700' : 'text-green-700'}`}>
              ₺{Math.abs(todaysMetrics.overShort).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {todaysMetrics.overShort < 0 ? 'Eksik' : 'Fazla'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Son Vardiya Hareketleri */}
      <Card>
        <CardHeader>
          <CardTitle>Aktif Vardiyalar</CardTitle>
          <CardDescription>Şu anda açık olan vardiyalar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentShifts.filter(shift => shift.status === 'aktif').map((shift) => (
              <div key={shift.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant="default">aktif</Badge>
                  <div>
                    <p className="font-medium text-sm">{shift.employee}</p>
                    <p className="text-xs text-muted-foreground">Başlangıç: {shift.startTime}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">₺{shift.totalSales.toLocaleString('tr-TR')}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hızlı İşlemler - Düzeltilmiş */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı İşlemler</CardTitle>
          <CardDescription>Manuel işlemler için hızlı kısayollar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={handleNewShift}
              className="h-20 flex-col space-y-2"
            >
              <Clock className="h-6 w-6" />
              <span>Yeni Vardiya Başlat</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={handlePOSTransaction}
              className="h-20 flex-col space-y-2"
            >
              <DollarSign className="h-6 w-6" />
              <span>POS İşlemi Kaydet</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleAddStaff}
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
