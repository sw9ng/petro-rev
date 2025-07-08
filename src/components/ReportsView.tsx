
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Download,
  Filter,
  Crown,
  Users,
  Fuel,
  CreditCard
} from 'lucide-react';
import { ReportsCharts } from './ReportsCharts';
import { ReportsMetrics } from './ReportsMetrics';
import { useShifts } from '@/hooks/useShifts';
import { useFuelSales } from '@/hooks/useFuelSales';
import { useCustomerTransactions } from '@/hooks/useCustomerTransactions';
import { useCustomers } from '@/hooks/useCustomers';
import { formatCurrency } from '@/lib/numberUtils';

export const ReportsView = () => {
  const { shifts } = useShifts();
  const { fuelSales } = useFuelSales();
  const { transactions } = useCustomerTransactions();
  const { customers } = useCustomers();

  const [dateFilter, setDateFilter] = useState('');
  const [reportType, setReportType] = useState('overview');

  const filterDataByDate = (data: any[], dateField: string = 'created_at') => {
    if (!dateFilter) return data;
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      const filterDate = new Date(dateFilter);
      return itemDate.getFullYear() === filterDate.getFullYear() && 
             itemDate.getMonth() === filterDate.getMonth();
    });
  };

  const filteredShifts = filterDataByDate(shifts, 'start_time');
  const filteredFuelSales = filterDataByDate(fuelSales, 'sale_time');
  const filteredTransactions = filterDataByDate(transactions, 'transaction_date');

  // Genel İstatistikler
  const totalRevenue = filteredShifts.reduce((sum, shift) => {
    return sum + (shift.cash_sales || 0) + (shift.card_sales || 0) + (shift.bank_transfers || 0);
  }, 0);

  const totalFuelRevenue = filteredFuelSales.reduce((sum, sale) => sum + sale.total_amount, 0);
  
  const totalCustomerPayments = filteredTransactions
    .filter(t => t.transaction_type === 'payment')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCustomerDebts = filteredTransactions
    .filter(t => t.transaction_type === 'debt')
    .reduce((sum, t) => sum + t.amount, 0);

  const completedShifts = filteredShifts.filter(s => s.status === 'completed').length;
  const activeCustomers = customers.filter(c => {
    const hasRecentTransaction = transactions.some(t => 
      t.customer_id === c.id && 
      new Date(t.transaction_date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    return hasRecentTransaction;
  }).length;

  // Calculate additional metrics for charts and metrics components
  const totalCashSales = filteredShifts.reduce((sum, shift) => sum + (shift.cash_sales || 0), 0);
  const totalCardSales = filteredShifts.reduce((sum, shift) => sum + (shift.card_sales || 0), 0);
  const totalBankTransfers = filteredShifts.reduce((sum, shift) => sum + (shift.bank_transfers || 0), 0);
  const totalOverShort = filteredShifts.reduce((sum, shift) => sum + (shift.over_short || 0), 0);
  const totalSales = totalCashSales + totalCardSales + totalBankTransfers;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <span>Raporlar ve Analizler</span>
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            </h2>
            <p className="text-sm text-gray-600">İstasyon performansını detaylı olarak analiz edin</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Rapor İndir
          </Button>
        </div>
      </div>

      {/* Filtreler */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <Input
            type="month"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-auto"
            placeholder="Tarih seçiniz"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Genel Bakış</SelectItem>
              <SelectItem value="fuel">Yakıt Satışları</SelectItem>
              <SelectItem value="customers">Müşteri Analizi</SelectItem>
              <SelectItem value="personnel">Personel Performansı</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {dateFilter && (
          <Button variant="outline" size="sm" onClick={() => setDateFilter('')}>
            Filtreyi Temizle
          </Button>
        )}
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Ciro</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Fuel className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Yakıt Satışı</p>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(totalFuelRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Müşteri Ödemeleri</p>
                <p className="text-lg font-bold text-purple-600">{formatCurrency(totalCustomerPayments)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Aktif Müşteri</p>
                <p className="text-lg font-bold text-orange-600">{activeCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detaylı Raporlar */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="charts">Grafikler</TabsTrigger>
          <TabsTrigger value="metrics">Metrikler</TabsTrigger>
          <TabsTrigger value="analysis">Detay Analiz</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm border">
              <CardHeader>
                <CardTitle className="text-green-600">Gelir Özeti</CardTitle>
                <CardDescription>Toplam gelirinizin kaynakları</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Nakit Satışlar</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(filteredShifts.reduce((sum, s) => sum + (s.cash_sales || 0), 0))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Kart Satışları</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(filteredShifts.reduce((sum, s) => sum + (s.card_sales || 0), 0))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Banka Transferleri</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(filteredShifts.reduce((sum, s) => sum + (s.bank_transfers || 0), 0))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Müşteri Ödemeleri</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(totalCustomerPayments)}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">Toplam Gelir</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(totalRevenue + totalCustomerPayments)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border">
              <CardHeader>
                <CardTitle className="text-blue-600">Operasyonel Durum</CardTitle>
                <CardDescription>İstasyon operasyonları hakkında genel bilgiler</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tamamlanan Vardiya</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    {completedShifts} adet
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Toplam Müşteri</span>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                    {customers.length} müşteri
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Aktif Müşteri (30 gün)</span>
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                    {activeCustomers} müşteri
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Toplam İşlem</span>
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                    {filteredTransactions.length} işlem
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Bekleyen Alacak</span>
                  <span className="font-medium text-red-600">
                    {formatCurrency(totalCustomerDebts)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Minimal Müşteri Satış Bilgileri */}
          <Card className="shadow-sm border">
            <CardHeader>
              <CardTitle className="text-purple-600">En Fazla İşlem Yapan Müşteriler</CardTitle>
              <CardDescription>En aktif müşterilerinizin özet bilgileri</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const customerStats = customers.map(customer => {
                  const customerTransactions = transactions.filter(t => t.customer_id === customer.id);
                  const totalAmount = customerTransactions.reduce((sum, t) => sum + t.amount, 0);
                  const transactionCount = customerTransactions.length;
                  
                  return {
                    customer,
                    totalAmount,
                    transactionCount
                  };
                }).sort((a, b) => b.transactionCount - a.transactionCount).slice(0, 5);

                return customerStats.length > 0 ? (
                  <div className="space-y-3">
                    {customerStats.map(({ customer, totalAmount, transactionCount }) => (
                      <div key={customer.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{customer.name}</p>
                          <p className="text-sm text-gray-600">{transactionCount} işlem</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-purple-600">{formatCurrency(totalAmount)}</p>
                          <p className="text-xs text-gray-500">toplam tutar</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Henüz müşteri işlemi bulunmuyor.</p>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts">
          <ReportsCharts 
            filteredShifts={filteredShifts}
            filteredFuelSales={filteredFuelSales}
            totalCashSales={totalCashSales}
            totalCardSales={totalCardSales}
            totalBankTransfers={totalBankTransfers}
            totalFuelRevenue={totalFuelRevenue}
            totalCustomerPayments={totalCustomerPayments}
          />
        </TabsContent>

        <TabsContent value="metrics">
          <ReportsMetrics 
            totalSales={totalSales}
            totalFuelSales={totalFuelRevenue}
            totalOverShort={totalOverShort}
            filteredShifts={filteredShifts}
            filteredFuelSales={filteredFuelSales}
          />
        </TabsContent>

        <TabsContent value="analysis">
          <Card className="shadow-sm border">
            <CardHeader>
              <CardTitle>Detaylı Analiz</CardTitle>
              <CardDescription>
                Gelişmiş analiz araçları yakında eklenecek
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Detaylı Analiz</h3>
                <p className="text-gray-600 mb-4">
                  Gelişmiş analiz araçları ve özel raporlar yakında kullanıma sunulacak.
                </p>
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <Crown className="h-3 w-3 mr-1" />
                  Çok Yakında
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
