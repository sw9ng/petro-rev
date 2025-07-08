import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CreditCard, Banknote, Users, TrendingUp, TrendingDown } from "lucide-react";
import { useShifts } from "@/hooks/useShifts";
import { useCustomers } from "@/hooks/useCustomers";
import { useCustomerTransactions } from "@/hooks/useCustomerTransactions";
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import { tr } from 'date-fns/locale';

export const ReportsView = () => {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const { shifts } = useShifts();
  const { customers } = useCustomers();
  const { transactions } = useCustomerTransactions();

  // Tarih aralığına göre vardiya filtreleme
  const filteredShifts = shifts.filter(shift => {
    const shiftDate = parseISO(shift.start_time);
    const start = startOfDay(parseISO(startDate));
    const end = endOfDay(parseISO(endDate));
    return shiftDate >= start && shiftDate <= end;
  });

  // Vardiya istatistikleri
  const totalCardSales = filteredShifts.reduce((sum, shift) => sum + (shift.card_sales || 0), 0);
  const totalCashSales = filteredShifts.reduce((sum, shift) => sum + (shift.cash_sales || 0), 0);
  const totalBankTransfers = filteredShifts.reduce((sum, shift) => sum + (shift.bank_transfers || 0), 0);
  const totalVersiye = filteredShifts.reduce((sum, shift) => sum + (shift.veresiye || 0), 0);
  const totalSales = totalCardSales + totalCashSales + totalBankTransfers + totalVersiye;

  // Cari satış istatistikleri (minimal)
  const filteredTransactions = transactions.filter(t => {
    const transactionDate = parseISO(t.transaction_date);
    const start = startOfDay(parseISO(startDate));
    const end = endOfDay(parseISO(endDate));
    return transactionDate >= start && transactionDate <= end;
  });

  const totalDebt = filteredTransactions
    .filter(t => t.transaction_type === 'debt')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalPayments = filteredTransactions
    .filter(t => t.transaction_type === 'payment')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rapor ve Analiz</h2>
          <p className="text-gray-600">Satış ve cari hesap raporlarını görüntüleyin</p>
        </div>
      </div>

      {/* Tarih Seçimi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarDays className="h-5 w-5 mr-2" />
            Rapor Tarihi
          </CardTitle>
          <CardDescription>Rapor alınacak tarih aralığını seçin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Başlangıç Tarihi</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-date">Bitiş Tarihi</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Satış Raporları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Kart Satışları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">₺{totalCardSales.toLocaleString()}</div>
            <p className="text-xs text-blue-600 mt-1">{filteredShifts.length} vardiya</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center">
              <Banknote className="h-4 w-4 mr-2" />
              Nakit Satışları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">₺{totalCashSales.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-1">Nakit tahsilatı</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Banka Transferi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">₺{totalBankTransfers.toLocaleString()}</div>
            <p className="text-xs text-purple-600 mt-1">Havale/EFT</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Veresiye Satış
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">₺{totalVersiye.toLocaleString()}</div>
            <p className="text-xs text-orange-600 mt-1">Vadeli satış</p>
          </CardContent>
        </Card>
      </div>

      {/* Cari Satış Özeti (Minimal) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Cari Satış Özeti
          </CardTitle>
          <CardDescription>
            Seçili tarih aralığındaki müşteri işlemleri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-700">₺{totalDebt.toLocaleString()}</div>
              <div className="text-sm text-red-600 mt-1">Toplam Borç</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">₺{totalPayments.toLocaleString()}</div>
              <div className="text-sm text-green-600 mt-1">Toplam Ödeme</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className={`text-2xl font-bold ${(totalDebt - totalPayments) > 0 ? 'text-red-700' : 'text-green-700'}`}>
                ₺{(totalDebt - totalPayments).toLocaleString()}
              </div>
              <div className="text-sm text-blue-600 mt-1">Net Borç</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Genel Özet */}
      <Card>
        <CardHeader>
          <CardTitle>Genel Özet</CardTitle>
          <CardDescription>
            {format(parseISO(startDate), 'dd MMMM yyyy', { locale: tr })} - {format(parseISO(endDate), 'dd MMMM yyyy', { locale: tr })} 
            tarihleri arası rapor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Satış Dağılımı</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Kart Satışları:</span>
                  <span className="font-medium">₺{totalCardSales.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nakit Satışları:</span>
                  <span className="font-medium">₺{totalCashSales.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Banka Transferi:</span>
                  <span className="font-medium">₺{totalBankTransfers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Veresiye:</span>
                  <span className="font-medium">₺{totalVersiye.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-1 font-semibold">
                  <span>Toplam Satış:</span>
                  <span>₺{totalSales.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Müşteri İşlemleri</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Aktif Müşteri:</span>
                  <span className="font-medium">{customers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Toplam İşlem:</span>
                  <span className="font-medium">{filteredTransactions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Borç İşlemleri:</span>
                  <span className="font-medium text-red-600">
                    {filteredTransactions.filter(t => t.transaction_type === 'debt').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Ödeme İşlemleri:</span>
                  <span className="font-medium text-green-600">
                    {filteredTransactions.filter(t => t.transaction_type === 'payment').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
