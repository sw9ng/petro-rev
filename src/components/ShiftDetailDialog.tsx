
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Calculator, User, DollarSign, CreditCard, Clock } from 'lucide-react';
import { Shift } from '@/hooks/useShifts';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, getIstanbulTime } from '@/lib/numberUtils';

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
    
    const start = getIstanbulTime(new Date(startTime));
    const end = getIstanbulTime(new Date(endTime));
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours} saat ${diffMinutes} dakika`;
  };

  if (!shift) return null;

  const totalExpenses = shift.cash_sales + shift.card_sales + shift.veresiye + shift.bank_transfers;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center space-x-2 text-gray-900">
            <User className="h-5 w-5 text-gray-700" />
            <span>{shift.personnel.name} - Vardiya Detayı</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{format(getIstanbulTime(new Date(shift.start_time)), "PPPp", { locale: tr })}</span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Genel Bilgiler */}
          <Card className="shadow-sm border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center space-x-2 text-gray-900">
                <User className="h-4 w-4 text-gray-700" />
                <span>Genel Bilgiler</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Personel:</span>
                    <span className="font-semibold text-gray-900">{shift.personnel.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Giriş:</span>
                    <span className="font-mono text-gray-900">{format(getIstanbulTime(new Date(shift.start_time)), "dd MMM yyyy HH:mm", { locale: tr })}</span>
                  </div>
                  {shift.end_time && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Çıkış:</span>
                      <span className="font-mono text-gray-900">{format(getIstanbulTime(new Date(shift.end_time)), "dd MMM yyyy HH:mm", { locale: tr })}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Durum:</span>
                    <Badge variant="secondary" className="bg-green-50 text-green-700 border border-green-200">
                      Tamamlandı
                    </Badge>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Süre:</span>
                    </span>
                    <span className="font-semibold text-gray-900">{calculateDuration(shift.start_time, shift.end_time)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Satış Detayları */}
          <Card className="shadow-sm border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center space-x-2 text-gray-900">
                <DollarSign className="h-4 w-4 text-gray-700" />
                <span>Satış Detayları</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                    <span className="text-gray-700 font-medium">Otomasyon Satış:</span>
                    <span className="font-bold text-gray-900 text-lg">{formatCurrency(shift.otomasyon_satis)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                    <span className="text-gray-700 font-medium">Nakit Satış:</span>
                    <span className="font-bold text-gray-900 text-lg">{formatCurrency(shift.cash_sales)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                    <span className="text-gray-700 font-medium">Kart Satış:</span>
                    <span className="font-bold text-gray-900 text-lg">{formatCurrency(shift.card_sales)}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                    <span className="text-gray-700 font-medium">Veresiye:</span>
                    <span className="font-bold text-gray-900 text-lg">{formatCurrency(shift.veresiye)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                    <span className="text-gray-700 font-medium">Banka Havale:</span>
                    <span className="font-bold text-gray-900 text-lg">{formatCurrency(shift.bank_transfers)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg border-2">
                    <span className="font-bold text-gray-900">Toplam Giderler:</span>
                    <span className="font-bold text-gray-900 text-xl">{formatCurrency(totalExpenses)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kart Satış Banka Detayları */}
          <Card className="shadow-sm border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center space-x-2 text-gray-900">
                <CreditCard className="h-4 w-4 text-gray-700" />
                <span>Kart Satış Banka Detayları</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bankDetails.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bankDetails.map((bank, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-5 w-5 text-gray-700" />
                          <span className="font-medium text-gray-900">{bank.bank_name}</span>
                        </div>
                        <span className="font-bold text-lg text-gray-900">{formatCurrency(bank.amount)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t-2 bg-gray-100 p-4 rounded-lg">
                    <span className="font-bold text-lg text-gray-900">Toplam Kart Satış:</span>
                    <span className="font-bold text-xl text-gray-900">{formatCurrency(shift.card_sales)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Kart satış detayı bulunmuyor</p>
                  <p className="text-sm mt-1">Bu vardiya için banka bazında kart satış bilgisi kaydedilmemiş.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Açık/Fazla Hesaplama */}
          <Card className="shadow-sm border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center space-x-2 text-gray-900">
                <Calculator className="h-4 w-4 text-gray-700" />
                <span>Açık/Fazla Hesaplama</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                  <span className="font-medium text-gray-900">Otomasyon Satış:</span>
                  <span className="font-bold text-gray-900 text-lg">{formatCurrency(shift.otomasyon_satis)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                  <span className="font-medium text-gray-900">Toplam Giderler:</span>
                  <span className="font-bold text-gray-900 text-lg">{formatCurrency(totalExpenses)}</span>
                </div>
              </div>
              <div className={`p-6 rounded-lg text-center border-2 ${shift.over_short >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className={`font-bold text-3xl ${shift.over_short >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <span>{shift.over_short >= 0 ? 'FAZLA: +' : 'AÇIK: '}{formatCurrency(Math.abs(shift.over_short))}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {shift.over_short >= 0 ? 'Beklenen tutardan fazla gelir elde edildi' : 'Beklenen tutardan az gelir elde edildi'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
