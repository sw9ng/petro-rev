
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, Calculator, Search } from 'lucide-react';
import { useShifts } from '@/hooks/useShifts';

export const ShiftList = () => {
  const { fetchAllShifts } = useShifts();
  const [shifts, setShifts] = useState<any[]>([]);
  const [filteredShifts, setFilteredShifts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadShifts = async () => {
      setLoading(true);
      const allShifts = await fetchAllShifts();
      setShifts(allShifts);
      setFilteredShifts(allShifts);
      setLoading(false);
    };

    loadShifts();
  }, []);

  useEffect(() => {
    const filtered = shifts.filter(shift =>
      shift.personnel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      new Date(shift.start_time).toLocaleDateString('tr-TR').includes(searchTerm)
    );
    setFilteredShifts(filtered);
  }, [searchTerm, shifts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Vardiya geçmişi yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Vardiya Geçmişi</h2>
          <p className="text-muted-foreground">Tüm geçmiş vardiyaları görüntüle</p>
        </div>
        <div className="w-72">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Personel adı veya tarih ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {filteredShifts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              {searchTerm ? 'Arama kriterlerine uygun vardiya bulunamadı.' : 'Henüz vardiya geçmişi bulunmuyor.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredShifts.map((shift) => {
            const totalSales = shift.cash_sales + shift.card_sales + shift.bank_transfers;
            
            return (
              <Card key={shift.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{shift.personnel.name}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(shift.start_time).toLocaleString('tr-TR')}</span>
                        </div>
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      Tamamlandı
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Satış Özeti */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Nakit</p>
                      <p className="font-semibold">₺{shift.cash_sales.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Kart</p>
                      <p className="font-semibold">₺{shift.card_sales.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Banka Transfer</p>
                      <p className="font-semibold">₺{shift.bank_transfers.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Toplam Satış</p>
                      <p className="font-semibold">₺{totalSales.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Fazla/Eksik Hesaplama */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Fazla/Eksik Hesaplama</span>
                      <Calculator className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Gerçek Tutar:</span>
                        <span>₺{shift.actual_amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Toplam Satış:</span>
                        <span>₺{totalSales.toFixed(2)}</span>
                      </div>
                      <hr className="my-2" />
                      <div className={`flex justify-between font-medium ${shift.over_short >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <span>{shift.over_short >= 0 ? 'Fazla:' : 'Eksik:'}</span>
                        <span>₺{Math.abs(shift.over_short).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
