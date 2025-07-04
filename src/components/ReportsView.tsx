import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CalendarIcon, TrendingUp, DollarSign, Users, Target, CreditCard, Calculator, User, ChevronDown, ChevronUp, FileText, Fuel } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useShifts } from '@/hooks/useShifts';
import { usePersonnel } from '@/hooks/usePersonnel';
import { useFuelSales } from '@/hooks/useFuelSales';
import { useCustomerTransactions } from '@/hooks/useCustomerTransactions';
import { formatCurrency } from '@/lib/numberUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
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

  // Filter data based on date range, shift type, and personnel
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
    { name: 'Cari Satış', value: filteredShifts.reduce((sum, shift) => sum + shift.veresiye, 0), color: '#F59E0B' },
    { name: 'Müşteri Borçları', value: totalCustomerDebts, color: '#EF4444' }
  ].filter(item => item.value > 0);

  const fuelTypeData = filteredFuelSales.reduce((acc, sale) => {
    const existing = acc.find(item => item.name === sale.fuel_type);
    if (existing) {
      existing.value += sale.total_amount;
      existing.liters += sale.liters;
    } else {
      acc.push({
        name: sale.fuel_type,
        value: sale.total_amount,
        liters: sale.liters,
        color: sale.fuel_type === 'MOTORİN' ? '#3B82F6' : 
               sale.fuel_type === 'BENZİN' ? '#10B981' :
               sale.fuel_type === 'LPG' ? '#F59E0B' : '#8B5CF6'
      });
    }
    return acc;
  }, [] as { name: string; value: number; liters: number; color: string }[]);

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

      {/* Main Reports Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="sales">Satış Analizi</TabsTrigger>
          <TabsTrigger value="fuel">Yakıt Analizi</TabsTrigger>
          <TabsTrigger value="credit-sales">Cari Satışlar</TabsTrigger>
        </TabsList>

          <TabsContent value="fuel" className="space-y-6">
            {/* Fuel Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Toplam Yakıt Satışı</CardTitle>
                  <Fuel className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(totalFuelSales)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {filteredFuelSales.length} satış
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Toplam Litre</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {filteredFuelSales.reduce((sum, sale) => sum + sale.liters, 0).toFixed(2)} L
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Günlük ortalama: {filteredFuelSales.length > 0 && startDate && endDate ? (filteredFuelSales.reduce((sum, sale) => sum + sale.liters, 0) / Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))).toFixed(1) : 0} L
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ortalama Fiyat</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {filteredFuelSales.length > 0 ? formatCurrency(filteredFuelSales.reduce((sum, sale) => sum + sale.price_per_liter, 0) / filteredFuelSales.length) : formatCurrency(0)}/L
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Litre başına
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Yakıt Türleri</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {fuelTypeData.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Farklı tür
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Fuel Types Chart */}
            {fuelTypeData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Fuel className="h-5 w-5" />
                    <span>Yakıt Türlerine Göre Satış</span>
                  </CardTitle>
                  <CardDescription>
                    Yakıt türlerinin toplam satış tutarları ve litre miktarları
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={fuelTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {fuelTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Daily Fuel Sales by Type */}
            {filteredFuelSales.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Günlük Yakıt Satış Detayları</span>
                  </CardTitle>
                  <CardDescription>
                    Günlük bazda yakıt türlerine göre satış miktarları
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {fuelTypeData.map((fuelType) => (
                      <div key={fuelType.name} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-gray-900">{fuelType.name}</h4>
                          <div className="text-right">
                            <span className="text-lg font-bold" style={{color: fuelType.color}}>
                              {formatCurrency(fuelType.value)}
                            </span>
                            <p className="text-sm text-gray-500">{fuelType.liters.toFixed(2)} L</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full" 
                            style={{
                              backgroundColor: fuelType.color,
                              width: `${(fuelType.value / Math.max(...fuelTypeData.map(f => f.value))) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            {/* Overview content would go here */}
          </TabsContent>

        <TabsContent value="credit-sales" className="space-y-6">
          {/* Credit Sales Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Cari Satış</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Ödeme</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mevcut Borçlar</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Müşteri Borç Analizi</span>
              </CardTitle>
              <CardDescription>
                Müşterilerin mevcut borç durumları ve işlem geçmişi
              </CardDescription>
            </CardHeader>
            <CardContent>
              {groupedTransactions.length > 0 ? (
                <div className="space-y-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};
