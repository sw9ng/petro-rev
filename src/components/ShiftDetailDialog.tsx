import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Calculator, User, DollarSign } from 'lucide-react';
import { Shift } from '@/hooks/useShifts';

interface ShiftDetailDialogProps {
  shift: Shift | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShiftDetailDialog = ({ shift, isOpen, onOpenChange }: ShiftDetailDialogProps) => {
  if (!shift) return null;

  const totalSales = shift.cash_sales + shift.card_sales;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>{shift.personnel.name} - Vardiya Detayı</span>
          </DialogTitle>
          <DialogDescription>
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(shift.start_time).toLocaleString('tr-TR')}</span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Genel Bilgiler */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Genel Bilgiler</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Personel:</span>
                <span className="font-medium">{shift.personnel.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Başlangıç Zamanı:</span>
                <span>{new Date(shift.start_time).toLocaleString('tr-TR')}</span>
              </div>
              {shift.end_time && (
                <div className="flex justify-between">
                  <span>Bitiş Zamanı:</span>
                  <span>{new Date(shift.end_time).toLocaleString('tr-TR')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Durum:</span>
                <Badge variant="secondary">Tamamlandı</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Satış Detayları */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Satış Detayları</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sayaç Satışı:</span>
                    <span className="font-medium">₺{(shift.sayac_satisi || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nakit Satış:</span>
                    <span className="font-medium">₺{shift.cash_sales.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kart Satış:</span>
                    <span className="font-medium">₺{shift.card_sales.toFixed(2)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Veresiye:</span>
                    <span className="font-medium">₺{(shift.veresiye || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Personel Ödenen:</span>
                    <span className="font-medium">₺{shift.actual_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Toplam Nakit+Kart:</span>
                    <span className="font-bold">₺{totalSales.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fazla/Eksik Hesaplama */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Calculator className="h-4 w-4" />
                <span>Açık/Fazla Hesaplama</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Sayaç Satışı:</span>
                <span className="font-medium">₺{(shift.sayac_satisi || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Personel Ödenen:</span>
                <span className="font-medium">₺{shift.actual_amount.toFixed(2)}</span>
              </div>
              <hr className="my-2" />
              <div className={`flex justify-between font-bold text-lg ${shift.over_short >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span>{shift.over_short >= 0 ? 'Fazla:' : 'Açık:'}</span>
                <span>₺{Math.abs(shift.over_short).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
