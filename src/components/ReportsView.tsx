import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CalendarIcon, TrendingUp, DollarSign, Users, Target, CreditCard, Calculator, User, ChevronDown, ChevronUp, FileText, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useShifts } from '@/hooks/useShifts';
import { usePersonnel } from '@/hooks/usePersonnel';
import { useFuelSales } from '@/hooks/useFuelSales';
import { useCustomerTransactions } from '@/hooks/useCustomerTransactions';
import { formatCurrency } from '@/lib/numberUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface BankDetail {
  bank_name: string;
  amount: number;
}

export const ReportsView = () => {
  const { allShifts } = useShifts();
  const { personnel } = usePersonnel();
  const { fuelSales } = useFuelSales();
  const { getTotalOutstandingDebt, getTransactionsByDateRange, getCustomerDebts, getAllTransactionsGroupedByCustomer } = useCustomerTransactions();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedShiftType, setSelectedShiftType] = useState<string>('all');
  const [selectedPersonnel, setSelectedPersonnel] = useState<string>('all');
  const [commissionRates, setCommissionRates] = useState<Record<string, number>>({});
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([]);
  const [creditSalesData, setCreditSalesData] = useState<any[]>([]);
  const [expandedCustomers, setExpandedCustomers] = useState<Record<string, boolean>>({});

  // Set default date range to current month
  useEffect(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setStartDate(startOfMonth);
    setEndDate(endOfMonth);
  }, []);

  // Load saved commission rates from localStorage
  useEffect(() => {
    const savedRates = localStorage.getItem('bankCommissionRates');
    if (savedRates) {
      setCommissionRates(JSON.parse(savedRates));
    }
  }, []);

  // Fetch credit sales data based on date range
  useEffect(() => {
    if (startDate && endDate) {
      fetchCreditSalesData();
    }
  }, [startDate, endDate]);

  const fetchCreditSalesData = async () => {
    if (!startDate || !endDate) return;
    
    const data = await getTransactionsByDateRange(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
    setCreditSalesData(data);
  };

  const toggleCustomerExpansion = (customerId: string) => {
    setExpandedCustomers(prev => ({
      ...prev,
      [customerId]: !prev[customerId]
    }));
  };

  // Get customer debts summary
  const customerDebts = getCustomerDebts();
  const groupedTransactions = getAllTransactionsGroupedByCustomer();

  // Get filtered data
  const getFilteredShifts = () => {
    if (!startDate || !endDate) return allShifts;
    
    let filtered = allShifts.filter(shift => {
      const shiftDate = new Date(shift.start_time);
      return shiftDate >= startDate && shiftDate <= endDate;
    });

    // Filter by shift type
    if (selectedShiftType !== 'all') {
      filtered = filtered.filter(shift => shift.shift_number === selectedShiftType);
    }

    // Filter by personnel
    if (selectedPersonnel !== 'all') {
      filtered = filtered.filter(shift => shift.personnel_id === selectedPersonnel);
    }

    return filtered;
  };

  const getFilteredFuelSales = () => {
    if (!startDate || !endDate) return fuelSales;
    
    let filtered = fuelSales.filter(sale => {
      const saleDate = new Date(sale.sale_time);
      return saleDate >= startDate && saleDate <= endDate;
    });

    // Filter by personnel if selected
    if (selectedPersonnel !== 'all') {
      filtered = filtered.filter(sale => sale.personnel_id === selectedPersonnel);
    }

    return filtered;
  };

  const filteredShifts = getFilteredShifts();
  const filteredFuelSales = getFilteredFuelSales();

  // Fetch bank details for filtered shifts
  useEffect(() => {
    if (filteredShifts.length > 0) {
      fetchBankDetails();
    }
  }, [filteredShifts]);

  const fetchBankDetails = async () => {
    const shiftIds = filteredShifts.map(shift => shift.id);
    if (shiftIds.length === 0) return;

    const { data, error } = await supabase
      .from('shift_bank_details')
      .select('*')
      .in('shift_id', shiftIds);

    if (error) {
      console.error('Error fetching bank details:', error);
    } else {
      // Group by bank name and sum amounts
      const grouped = (data || []).reduce((acc, detail) => {
        const existing = acc.find(item => item.bank_name === detail.bank_name);
        if (existing) {
          existing.amount += detail.amount;
        } else {
          acc.push({
            bank_name: detail.bank_name,
            amount: detail.amount
          });
        }
        return acc;
      }, [] as BankDetail[]);
      setBankDetails(grouped);
    }
  };

  // Personnel analysis data
  const getPersonnelAnalysis = () => {
    const personnelStats = personnel.map(person => {
      const personShifts = filteredShifts.filter(shift => shift.personnel_id === person.id);
      const personFuelSales = filteredFuelSales.filter(sale => sale.personnel_id === person.id);
      
      const totalSales = personShifts.reduce((sum, shift) => 
        sum + shift.cash_sales + shift.card_sales + shift.veresiye + shift.bank_transfers + shift.loyalty_card, 0);
      const totalOverShort = personShifts.reduce((sum, shift) => sum + shift.over_short, 0);
      const totalFuelSales = personFuelSales.reduce((sum, sale) => sum + sale.total_amount, 0);
      
      return {
        name: person.name,
        shiftCount: personShifts.length,
        totalSales,
        totalFuelSales,
        totalOverShort,
        averageOverShort: personShifts.length > 0 ? totalOverShort / personShifts.length : 0
      };
    }).filter(stat => stat.shiftCount > 0);

    return personnelStats;
  };

  const personnelAnalysis = getPersonnelAnalysis();

  // Calculate totals
  const totalSales = filteredShifts.reduce((sum, shift) => 
    sum + shift.cash_sales + shift.card_sales + shift.veresiye + shift.bank_transfers + shift.loyalty_card, 0);
  const totalCashSales = filteredShifts.reduce((sum, shift) => sum + shift.cash_sales, 0);
  const totalCardSales = filteredShifts.reduce((sum, shift) => sum + shift.card_sales, 0);
  const totalBankTransfers = filteredShifts.reduce((sum, shift) => sum + shift.bank_transfers, 0);
  const totalLoyaltyCard = filteredShifts.reduce((sum, shift) => sum + shift.loyalty_card, 0);
  const totalVeresiye = filteredShifts.reduce((sum, shift) => sum + shift.veresiye, 0);
  const totalCustomerDebts = getTotalOutstandingDebt();
  const totalOverShort = filteredShifts.reduce((sum, shift) => sum + shift.over_short, 0);
  const totalFuelSales = filteredFuelSales.reduce((sum, sale) => sum + sale.total_amount, 0);

  // Calculate bank-wise net sales
  const calculateBankWiseNetSales = () => {
    return bankDetails.map(bank => {
      const commissionRate = commissionRates[bank.bank_name] || 0;
      const commission = bank.amount * (commissionRate / 100);
      const netAmount = bank.amount - commission;
      
      return {
        bankName: bank.bank_name,
        grossAmount: bank.amount,
        commissionRate,
        commission,
        netAmount
      };
    });
  };

  const bankWiseNetSales = calculateBankWiseNetSales();
  const totalNetCardSales = bankWiseNetSales.reduce((sum, bank) => sum + bank.netAmount, 0);
  const totalCommission = bankWiseNetSales.reduce((sum, bank) => sum + bank.commission, 0);

  // Prepare chart data
  const dailySalesData = filteredShifts.reduce((acc, shift) => {
    const date = format(new Date(shift.start_time), 'dd/MM');
    const existingEntry = acc.find(entry => entry.date === date);
    const totalSale = shift.cash_sales + shift.card_sales + shift.veresiye + shift.bank_transfers + shift.loyalty_card;
    
    if (existingEntry) {
      existingEntry.sales += totalSale;
    } else {
      acc.push({ date, sales: totalSale });
    }
    return acc;
  }, [] as { date: string; sales: number }[]);

  const paymentMethodData = [
    { name: 'Nakit', value: totalCashSales, color: '#10B981' },
    { name: 'Kart', value: totalCardSales, color: '#3B82F6' },
    { name: 'Banka Havale', value: totalBankTransfers, color: '#8B5CF6' },
    { name: 'Sadakat Kartı', value: totalLoyaltyCard, color: '#F59E0B' },
    { name: 'Cari Satış', value: totalVeresiye, color: '#EC4899' },
    { name: 'Müşteri Borçları', value: totalCustomerDebts, color: '#EF4444' }
  ].filter(item => item.value > 0);

  const handleCommissionRateChange = (bankName: string, rate: string) => {
    const numericRate = parseFloat(rate) || 0;
    const updatedRates = {
      ...commissionRates,
      [bankName]: numericRate
    };
    setCommissionRates(updatedRates);
    localStorage.setItem('bankCommissionRates', JSON.stringify(updatedRates));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Raporlar ve Analizler
          </h2>
          <p className="text-gray-600 mt-2">Detaylı satış raporları ve performans analizleri</p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Date Range Selector */}
          <div className="flex items-center space-x-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Başlangıç Tarihi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[200px] justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd MMM yyyy", { locale: tr }) : "Başlangıç tarihi"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border shadow-lg z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    locale={tr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Bitiş Tarihi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[200px] justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd MMM yyyy", { locale: tr }) : "Bitiş tarihi"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border shadow-lg z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    locale={tr}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Satış</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalSales)}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredShifts.length} vardiya
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nakit Satış</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalCashSales)}
            </div>
            <p className="text-xs text-muted-foreground">
              {((totalCashSales / totalSales) * 100 || 0).toFixed(1)}% oranı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kart Satış</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(totalCardSales)}
            </div>
            <p className="text-xs text-muted-foreground">
              Net: {formatCurrency(totalNetCardSales)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cari Satış</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">
              {formatCurrency(totalVeresiye)}
            </div>
            <p className="text-xs text-muted-foreground">
              Dönem içi satış
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Müşteri Borçları</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalCustomerDebts)}
            </div>
            <p className="text-xs text-muted-foreground">
              Mevcut borçlar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Günlük Satış Grafiği</span>
            </CardTitle>
            <CardDescription>Seçilen tarih aralığındaki günlük satış performansı</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Bar dataKey="sales" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Method Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Ödeme Yöntemleri</span>
            </CardTitle>
            <CardDescription>Satış tutarlarının ödeme yöntemlerine göre dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Personnel Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Personel Performansı</span>
            </CardTitle>
            <CardDescription>Personel bazında satış ve performans analizi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {personnelAnalysis.map((person) => (
                <div key={person.name} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">{person.name}</h4>
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(person.totalSales)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <p>Vardiya: {person.shiftCount}</p>
                      <p>Yakıt: {formatCurrency(person.totalFuelSales)}</p>
                    </div>
                    <div>
                      <p>Fark: {formatCurrency(person.totalOverShort)}</p>
                      <p>Ortalama: {formatCurrency(person.averageOverShort)}</p>
                    </div>
                    <div className="text-right">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{width: `${(person.totalSales / Math.max(...personnelAnalysis.map(p => p.totalSales))) * 100}%`}}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bank Commission Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>Banka Komisyon Analizi</span>
            </CardTitle>
            <CardDescription>Banka bazında komisyon hesaplamaları</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bankWiseNetSales.map((bank) => (
                <div key={bank.bankName} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">{bank.bankName}</h4>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(bank.netAmount)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p>Brüt: {formatCurrency(bank.grossAmount)}</p>
                      <p>Komisyon Oranı: %{bank.commissionRate}</p>
                    </div>
                    <div className="text-right">
                      <p>Komisyon: {formatCurrency(bank.commission)}</p>
                      <p className="text-green-600 font-medium">Net: {formatCurrency(bank.netAmount)}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs">Komisyon Oranı:</span>
                      <input
                        type="number"
                        step="0.1"
                        className="w-16 px-2 py-1 text-xs border rounded"
                        value={commissionRates[bank.bankName] || 0}
                        onChange={(e) => handleCommissionRateChange(bank.bankName, e.target.value)}
                      />
                      <span className="text-xs">%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Sales Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Cari Satış Analizi</span>
          </CardTitle>
          <CardDescription>
            Seçilen tarih aralığındaki cari satış işlemleri ve müşteri borç durumları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Toplam Cari Satış</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(creditSalesData.filter(t => t.transaction_type === 'debt').reduce((sum, t) => sum + t.amount, 0))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {creditSalesData.filter(t => t.transaction_type === 'debt').length} işlem
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Toplam Ödeme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(creditSalesData.filter(t => t.transaction_type === 'payment').reduce((sum, t) => sum + t.amount, 0))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {creditSalesData.filter(t => t.transaction_type === 'payment').length} ödeme
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Mevcut Borçlar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(customerDebts.reduce((sum, c) => sum + c.balance, 0))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {customerDebts.length} müşteri
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Customer Debt Analysis */}
          {groupedTransactions.length > 0 ? (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 mb-3">Müşteri Borç Detayları</h4>
              {groupedTransactions
                .filter(group => group.balance > 0)
                .sort((a, b) => b.balance - a.balance)
                .map((customerGroup) => (
                  <Collapsible
                    key={customerGroup.customer.name}
                    open={expandedCustomers[customerGroup.customer.name]}
                    onOpenChange={() => toggleCustomerExpansion(customerGroup.customer.name)}
                  >
                    <div className="border rounded-lg bg-white">
                      <CollapsibleTrigger className="w-full">
                        <div className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-red-600" />
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-gray-900">{customerGroup.customer.name}</p>
                              <p className="text-sm text-gray-600">
                                {customerGroup.transactions.length} işlem
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <p className="text-lg font-bold text-red-600">
                                {formatCurrency(customerGroup.balance)}
                              </p>
                              <p className="text-sm text-gray-500">Borç</p>
                            </div>
                            {expandedCustomers[customerGroup.customer.name] ? (
                              <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="border-t bg-gray-50 p-4">
                          <h4 className="font-medium text-gray-900 mb-3">İşlem Geçmişi</h4>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {customerGroup.transactions
                              .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
                              .map((transaction) => (
                                <div key={transaction.id} className="flex justify-between items-center py-2 px-3 bg-white rounded border">
                                  <div>
                                    <p className="text-sm font-medium">
                                      {transaction.transaction_type === 'debt' ? 'Cari Satış' : 'Ödeme'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {format(new Date(transaction.transaction_date), 'dd MMM yyyy', { locale: tr })} • {transaction.personnel.name}
                                    </p>
                                    {transaction.description && (
                                      <p className="text-xs text-gray-600 mt-1">{transaction.description}</p>
                                    )}
                                  </div>
                                  <p className={`font-medium ${
                                    transaction.transaction_type === 'debt' ? 'text-red-600' : 'text-green-600'
                                  }`}>
                                    {transaction.transaction_type === 'debt' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                  </p>
                                </div>
                              ))}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Henüz borcu olan müşteri bulunmuyor</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
