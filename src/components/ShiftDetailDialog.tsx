
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Calculator, User, DollarSign, CreditCard, Clock } from 'lucide-react';
import { Shift } from '@/hooks/useShifts';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ShiftDetailDialogProps {
  shift: Shift | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BankDetail {
  bank_name: string;
  amount: number;
}

export const ShiftDetailDialog = ({ shift, isOpen, onOpenChange }: ShiftDetailDialogProps) => {
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([]);

  useEffect(() => {
    if (shift && isOpen) {
      fetchBankDetails();
    }
  }, [shift, isOpen]);

  const fetchBankDetails = async () => {
    if (!shift) return;

    try {
      const { data, error } = await supabase
        .from('shift_bank_details')
        .select('bank_name, amount')
        .eq('shift_id', shift.id);

      if (error) {
        console.error('Error fetching bank details:', error);
        setBankDetails([]);
      } else {
        setBankDetails(data || []);
      }
    } catch (error) {
      console.error('Error fetching bank details:', error);
      setBankDetails([]);
    }
  };

  const calculateDuration = (startTime: string, endTime: string | null) => {
    if (!endTime) return 'Devam ediyor';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours} saat ${diffMinutes} dakika`;
  };

  if (!shift) return null;

  const totalExpenses = shift.cash_sales + shift.card_sales + shift.veresiye + shift.bank_transfers;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>{shift.personnel.name} - Vardiya Detayı</span>
          </DialogTitle>
          <DialogDescription>
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(shift.start_time), "PPPp", { locale: tr })}</span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Genel Bilgiler */}
          <Card className="shadow-sm border-0 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <User className="h-4 w-4 text-blue-600" />
                <span>Genel Bilgiler</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Personel:</span>
                    <span className="font-medium">{shift.personnel.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Giriş:</span>
                    <span className="font-mono">{format(new Date(shift.start_time), "PPP HH:mm", { locale: tr })}</span>
                  </div>
                  {shift.end_time && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Çıkış:</span>
                      <span className="font-mono">{format(new Date(shift.end_time), "PPP HH:mm", { locale: tr })}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Durum:</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">Tamamlandı</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Süre:</span>
                    </span>
                    <span className="font-medium text-blue-600">{calculateDuration(shift.start_time, shift.end_time)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Satış Detayları */}
          <Card className="shadow-sm border-0 bg-gradient-to-br from-green-50 to-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span>Satış Detayları</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-muted-foreground">Otomasyon Satış:</span>
                    <span className="font-bold text-blue-600">₺{shift.otomasyon_satis.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-muted-foreground">Nakit Satış:</span>
                    <span className="font-bold text-green-600">₺{shift.cash_sales.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-muted-foreground">Kart Satış:</span>
                    <span className="font-bold text-purple-600">₺{shift.card_sales.toFixed(2)}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-muted-foreground">Veresiye:</span>
                    <span className="font-bold text-orange-600">₺{shift.veresiye.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-indigo-50 rounded-lg">
                    <span className="text-muted-foreground">Banka Havale:</span>
                    <span className="font-bold text-indigo-600">₺{shift.bank_transfers.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-100 rounded-lg border-2 border-gray-300">
                    <span className="font-bold">Toplam Giderler:</span>
                    <span className="font-bold text-lg">₺{totalExpenses.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kart Satış Banka Detayları */}
          <Card className="shadow-sm border-0 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-purple-600" />
                <span>Kart Satış Banka Detayları</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bankDetails.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {bankDetails.map((bank, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border shadow-sm">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{bank.bank_name}</span>
                        </div>
                        <span className="font-bold text-lg text-purple-600">₺{bank.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t-2 border-purple-200 bg-purple-50 p-4 rounded-lg">
                    <span className="font-bold text-lg">Toplam Kart Satış:</span>
                    <span className="font-bold text-xl text-purple-700">₺{shift.card_sales.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Kart satış detayı bulunmuyor</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Açık/Fazla Hesaplama */}
          <Card className="shadow-sm border-0 bg-gradient-to-br from-orange-50 to-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Calculator className="h-4 w-4 text-orange-600" />
                <span>Açık/Fazla Hesaplama</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between p-4 bg-blue-50 rounded-lg">
                  <span className="font-medium">Otomasyon Satış:</span>
                  <span className="font-bold text-blue-600">₺{shift.otomasyon_satis.toFixed(2)}</span>
                </div>
                <div className="flex justify-between p-4 bg-green-50 rounded-lg">
                  <span className="font-medium">Toplam Giderler:</span>
                  <span className="font-bold text-green-600">₺{totalExpenses.toFixed(2)}</span>
                </div>
              </div>
              <div className={`p-4 rounded-lg text-center border-2 ${shift.over_short >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className={`font-bold text-2xl ${shift.over_short >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <span>{shift.over_short >= 0 ? 'FAZLA: +' : 'AÇIK: '}₺{Math.abs(shift.over_short).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
