
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, User, CreditCard, Building2, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/numberUtils';
import { Shift } from '@/hooks/useShifts';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ShiftDetailDialogProps {
  shift: Shift | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BankDetail {
  id: string;
  bank_name: string;
  amount: number;
}

export const ShiftDetailDialog = ({ shift, isOpen, onOpenChange }: ShiftDetailDialogProps) => {
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([]);
  const [loadingBankDetails, setLoadingBankDetails] = useState(false);

  useEffect(() => {
    if (shift && isOpen) {
      fetchBankDetails();
    }
  }, [shift, isOpen]);

  const fetchBankDetails = async () => {
    if (!shift) return;
    
    setLoadingBankDetails(true);
    const { data, error } = await supabase
      .from('shift_bank_details')
      .select('*')
      .eq('shift_id', shift.id)
      .order('bank_name');

    if (error) {
      console.error('Error fetching bank details:', error);
    } else {
      setBankDetails(data || []);
    }
    setLoadingBankDetails(false);
  };

  if (!shift) return null;

  const startTime = new Date(shift.start_time);
  const endTime = shift.end_time ? new Date(shift.end_time) : null;
  
  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Vardiya Detayları - {shift.personnel.name}</span>
          </DialogTitle>
          <DialogDescription>
            {formatDateTime(startTime)} - {endTime ? formatDateTime(endTime) : 'Devam ediyor'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Time Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Zaman Bilgileri</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Başlangıç</p>
                <p className="text-sm">{formatDateTime(startTime)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Bitiş</p>
                <p className="text-sm">{endTime ? formatDateTime(endTime) : 'Devam ediyor'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Sales Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Satış Bilgileri</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Otomasyon Satış</p>
                  <p className="text-lg font-bold text-blue-700">{formatCurrency(shift.otomasyon_satis)}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-green-900">Nakit Satış</p>
                  <p className="text-lg font-bold text-green-700">{formatCurrency(shift.cash_sales)}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-purple-900">Kart Satış</p>
                  <p className="text-lg font-bold text-purple-700">{formatCurrency(shift.card_sales)}</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-amber-900">Sadakat Kartı</p>
                  <p className="text-lg font-bold text-amber-700">{formatCurrency(shift.loyalty_card)}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-red-900">Veresiye</p>
                  <p className="text-lg font-bold text-red-700">{formatCurrency(shift.veresiye)}</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-indigo-900">Banka Havale</p>
                  <p className="text-lg font-bold text-indigo-700">{formatCurrency(shift.bank_transfers)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          {bankDetails.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>Kart Satış Detayları</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {bankDetails.map((detail) => (
                    <div key={detail.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">{detail.bank_name}</span>
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(detail.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border-t-2 border-blue-200 mt-3">
                    <span className="text-sm font-bold text-blue-900">Toplam Kart Satış</span>
                    <span className="text-sm font-bold text-blue-900">{formatCurrency(shift.card_sales)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bank Transfer Description */}
          {shift.bank_transfer_description && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Havale Açıklaması</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{shift.bank_transfer_description}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Özet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Toplam Satış</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(shift.cash_sales + shift.card_sales + shift.veresiye + shift.bank_transfers + shift.loyalty_card)}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Otomasyon</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(shift.otomasyon_satis)}</p>
                </div>
                <div className={`text-center p-3 rounded-lg ${shift.over_short >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className="text-sm font-medium text-gray-700">Açık/Fazla</p>
                  <p className={`text-lg font-bold ${shift.over_short >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {shift.over_short >= 0 ? '+' : ''}{formatCurrency(shift.over_short)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <div className="flex justify-center">
            <Badge variant={shift.status === 'completed' ? 'default' : 'secondary'}>
              {shift.status === 'completed' ? 'Tamamlandı' : 'Aktif'}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
