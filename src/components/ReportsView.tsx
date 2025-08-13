import { useState, useEffect, useMemo, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, CreditCard, Calculator, DollarSign, User, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useShifts } from '@/hooks/useShifts';
import { usePersonnel } from '@/hooks/usePersonnel';
import { useFuelSales } from '@/hooks/useFuelSales';
import { useCustomerTransactions } from '@/hooks/useCustomerTransactions';
import { useCommissionRates } from '@/hooks/useCommissionRates';
import { formatCurrency } from '@/lib/numberUtils';
import { supabase } from '@/integrations/supabase/client';
import { FuelProfitCalculator } from './FuelProfitCalculator';
import { ReportsMetrics } from './ReportsMetrics';
import { ReportsCharts } from './ReportsCharts';

interface BankDetail {
  bank_name: string;
  amount: number;
}

// Memoized components for better performance
const PersonnelAnalysis = memo(({ personnelAnalysis }: { personnelAnalysis: any[] }) => {
  if (personnelAnalysis.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Pompacı Performans Analizi</span>
        </CardTitle>
        <CardDescription>
          Seçilen dönemde pompacıların performans verileri
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {personnelAnalysis.map((person) => (
            <div key={person.name} className="border rounded-lg p-4 bg-gray-50">
              <h5 className="font-medium text-gray-900 mb-3">{person.name}</h5>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Vardiya Sayısı</p>
                  <p className="font-semibold text-blue-600">{person.shiftCount}</p>
                </div>
                <div>
                  <p className="text-gray-600">Toplam Satış</p>
                  <p className="font-semibold text-green-600">{formatCurrency(person.totalSales)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Akaryakıt Satışı</p>
                  <p className="font-semibold text-purple-600">{formatCurrency(person.totalFuelSales)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Toplam Açık/Fazla</p>
                  <p className={`font-semibold ${person.totalOverShort >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {person.totalOverShort >= 0 ? '+' : ''}{formatCurrency(person.totalOverShort)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Ortalama Açık/Fazla</p>
                  <p className={`font-semibold ${person.averageOverShort >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {person.averageOverShort >= 0 ? '+' : ''}{formatCurrency(person.averageOverShort)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

PersonnelAnalysis.displayName = 'PersonnelAnalysis';

const SalesAnalysis = memo(({ 
  totalCashSales, 
  totalCardSales, 
  totalBankTransfers, 
  totalLoyaltyCard, 
  totalCustomerDebts, 
  totalSales 
}: {
  totalCashSales: number;
  totalCardSales: number;
  totalBankTransfers: number;
  totalLoyaltyCard: number;
  totalCustomerDebts: number;
  totalSales: number;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Nakit Satışlar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-green-600">{formatCurrency(totalCashSales)}</div>
        <p className="text-sm text-gray-600 mt-2">
          Toplam satışın %{((totalCashSales / totalSales) * 100).toFixed(1)}'i
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Kart Satışları</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-blue-600">{formatCurrency(totalCardSales)}</div>
        <p className="text-sm text-gray-600 mt-2">
          Toplam satışın %{((totalCardSales / totalSales) * 100).toFixed(1)}'i
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Banka Havaleleri</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-purple-600">{formatCurrency(totalBankTransfers)}</div>
        <p className="text-sm text-gray-600 mt-2">
          Toplam satışın %{((totalBankTransfers / totalSales) * 100).toFixed(1)}'i
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Sadakat Kartı</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-amber-600">{formatCurrency(totalLoyaltyCard)}</div>
        <p className="text-sm text-gray-600 mt-2">
          Toplam satışın %{((totalLoyaltyCard / totalSales) * 100).toFixed(1)}'i
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Müşteri Borçları</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-red-600">{formatCurrency(totalCustomerDebts)}</div>
        <p className="text-sm text-gray-600 mt-2">
          Aktif borç tutarı
        </p>
      </CardContent>
    </Card>
  </div>
));

SalesAnalysis.displayName = 'SalesAnalysis';

const CustomerTransactionsSummary = memo(({ 
  customerTransactions, 
  startDate, 
  endDate 
}: { 
  customerTransactions: any[];
  startDate?: Date;
  endDate?: Date;
}) => {
  const filteredTransactions = useMemo(() => {
    if (!startDate || !endDate) return customerTransactions;
    
    return customerTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.transaction_date);
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      return transactionDate >= startOfDay && transactionDate <= endOfDay;
    });
  }, [customerTransactions, startDate, endDate]);

  const totals = useMemo(() => {
    const totalDebts = filteredTransactions
      .filter(t => t.transaction_type === 'debt')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalPayments = filteredTransactions
      .filter(t => t.transaction_type === 'payment')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { totalDebts, totalPayments, netDebt: totalDebts - totalPayments };
  }, [filteredTransactions]);

  if (filteredTransactions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Cari Müşteri Hareketleri</span>
        </CardTitle>
        <CardDescription>
          Seçilen dönemde müşteri borç ve ödeme hareketleri
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <FileText className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-900">Toplam Borç</p>
                  <p className="text-2xl font-bold text-red-700">{formatCurrency(totals.totalDebts)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-900">Toplam Ödeme</p>
                  <p className="text-2xl font-bold text-green-700">{formatCurrency(totals.totalPayments)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calculator className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">Net Borç</p>
                  <p className={`text-2xl font-bold ${totals.netDebt >= 0 ? 'text-blue-700' : 'text-green-700'}`}>
                    {formatCurrency(Math.abs(totals.netDebt))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <h4 className="text-lg font-semibold mb-4">Hareket Detayları</h4>
          <div className="max-h-60 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Tarih</th>
                  <th className="px-4 py-2 text-left">Müşteri</th>
                  <th className="px-4 py-2 text-left">İşlem</th>
                  <th className="px-4 py-2 text-right">Tutar</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b">
                    <td className="px-4 py-2">
                      {format(new Date(transaction.transaction_date), 'dd/MM/yyyy', { locale: tr })}
                    </td>
                    <td className="px-4 py-2">{transaction.customer.name}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.transaction_type === 'debt' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {transaction.transaction_type === 'debt' ? 'Borç' : 'Ödeme'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right font-medium">
                      {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

CustomerTransactionsSummary.displayName = 'CustomerTransactionsSummary';

export const ReportsView = () => {
  const { allShifts, getEffectiveShiftDate } = useShifts();
  const { personnel } = usePersonnel();
  const { fuelSales } = useFuelSales();
  const { transactions, getTotalOutstandingDebt } = useCustomerTransactions();
  const { commissionRates, updateCommissionRate, getCommissionRate } = useCommissionRates();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedShiftType, setSelectedShiftType] = useState<string>('all');
  const [selectedPersonnel, setSelectedPersonnel] = useState<string>('all');
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([]);

  // Set default date range to current month
  useEffect(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setStartDate(startOfMonth);
    setEndDate(endOfMonth);
  }, []);

  // Memoize filtered data for better performance
  const filteredShifts = useMemo(() => {
    if (!startDate || !endDate) return allShifts;
    
    let filtered = allShifts.filter(shift => {
      const effectiveDate = getEffectiveShiftDate(shift.start_time, shift.end_time, shift.shift_number);
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      return effectiveDate >= startOfDay && effectiveDate <= endOfDay;
    });

    if (selectedShiftType !== 'all') {
      filtered = filtered.filter(shift => shift.shift_number === selectedShiftType);
    }

    if (selectedPersonnel !== 'all') {
      filtered = filtered.filter(shift => shift.personnel_id === selectedPersonnel);
    }

    return filtered;
  }, [allShifts, startDate, endDate, selectedShiftType, selectedPersonnel, getEffectiveShiftDate]);

  const filteredFuelSales = useMemo(() => {
    if (!startDate || !endDate) return fuelSales;
    
    let filtered = fuelSales.filter(sale => {
      const saleDate = new Date(sale.sale_time);
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      return saleDate >= startOfDay && saleDate <= endOfDay;
    });

    if (selectedPersonnel !== 'all') {
      filtered = filtered.filter(sale => sale.personnel_id === selectedPersonnel);
    }

    return filtered;
  }, [fuelSales, startDate, endDate, selectedPersonnel]);

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

  // Memoize personnel analysis for better performance
  const personnelAnalysis = useMemo(() => {
    return personnel.map(person => {
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
  }, [personnel, filteredShifts, filteredFuelSales]);

  // Memoize totals calculation
  const totals = useMemo(() => {
    const totalSales = filteredShifts.reduce((sum, shift) => 
      sum + shift.cash_sales + shift.card_sales + shift.veresiye + shift.bank_transfers + shift.loyalty_card, 0);
    const totalCashSales = filteredShifts.reduce((sum, shift) => sum + shift.cash_sales, 0);
    const totalCardSales = filteredShifts.reduce((sum, shift) => sum + shift.card_sales, 0);
    const totalBankTransfers = filteredShifts.reduce((sum, shift) => sum + shift.bank_transfers, 0);
    const totalLoyaltyCard = filteredShifts.reduce((sum, shift) => sum + shift.loyalty_card, 0);
    const totalCustomerDebts = getTotalOutstandingDebt();
    const totalOverShort = filteredShifts.reduce((sum, shift) => sum + shift.over_short, 0);
    const totalFuelSales = filteredFuelSales.reduce((sum, sale) => sum + sale.total_amount, 0);

    return {
      totalSales,
      totalCashSales,
      totalCardSales,
      totalBankTransfers,
      totalLoyaltyCard,
      totalCustomerDebts,
      totalOverShort,
      totalFuelSales
    };
  }, [filteredShifts, filteredFuelSales, getTotalOutstandingDebt]);

  // Memoize fuel sales data for profit calculator
  const fuelSalesForProfitCalc = useMemo(() => {
    const fuelTypeData = filteredFuelSales.reduce((acc, sale) => {
      const existing = acc.find(item => item.name === sale.fuel_type);
      if (existing) {
        existing.value += sale.total_amount;
        existing.liters += sale.liters;
      } else {
        acc.push({
          name: sale.fuel_type,
          value: sale.total_amount,
          liters: sale.liters
        });
      }
      return acc;
    }, [] as { name: string; value: number; liters: number }[]);

    return fuelTypeData.map(fuel => ({
      fuel_type: fuel.name,
      total_amount: fuel.value,
      total_liters: fuel.liters
    }));
  }, [filteredFuelSales]);

  // Calculate bank-wise net sales
  const bankWiseNetSales = useMemo(() => {
    return bankDetails.map(bank => {
      const commissionRate = getCommissionRate(bank.bank_name);
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
  }, [bankDetails, commissionRates, getCommissionRate]);

  const totalNetCardSales = bankWiseNetSales.reduce((sum, bank) => sum + bank.netAmount, 0);
  const totalCommission = bankWiseNetSales.reduce((sum, bank) => sum + bank.commission, 0);

  const handleCommissionRateChange = (bankName: string, rate: string) => {
    const numericRate = parseFloat(rate) || 0;
    updateCommissionRate(bankName, numericRate);
  };

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

          {/* Filter Controls */}
          <div className="flex items-center space-x-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Vardiya Tipi</Label>
              <Select value={selectedShiftType} onValueChange={setSelectedShiftType}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Vardiya" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="V1">V1</SelectItem>
                  <SelectItem value="V2">V2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Pompacı</Label>
              <Select value={selectedPersonnel} onValueChange={setSelectedPersonnel}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Pompacı" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {personnel.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <ReportsMetrics 
        totalSales={totals.totalSales}
        totalFuelSales={totals.totalFuelSales}
        totalOverShort={totals.totalOverShort}
        filteredShifts={filteredShifts}
        filteredFuelSales={filteredFuelSales}
      />

      {/* Fuel Profit Calculator */}
      <FuelProfitCalculator 
        fuelSalesData={fuelSalesForProfitCalc} 
        dateRange={startDate && endDate ? { startDate, endDate } : undefined}
      />

      {/* Customer Transactions Summary */}
      <CustomerTransactionsSummary 
        customerTransactions={transactions}
        startDate={startDate}
        endDate={endDate}
      />

      {/* Personnel Analysis */}
      <PersonnelAnalysis personnelAnalysis={personnelAnalysis} />

      {/* Charts */}
      <ReportsCharts 
        filteredShifts={filteredShifts}
        filteredFuelSales={filteredFuelSales}
        totalCashSales={totals.totalCashSales}
        totalCardSales={totals.totalCardSales}
        totalBankTransfers={totals.totalBankTransfers}
        totalLoyaltyCard={totals.totalLoyaltyCard}
        totalCustomerDebts={totals.totalCustomerDebts}
        getEffectiveShiftDate={getEffectiveShiftDate}
      />

      {/* Sales Analysis */}
      <SalesAnalysis 
        totalCashSales={totals.totalCashSales}
        totalCardSales={totals.totalCardSales}
        totalBankTransfers={totals.totalBankTransfers}
        totalLoyaltyCard={totals.totalLoyaltyCard}
        totalCustomerDebts={totals.totalCustomerDebts}
        totalSales={totals.totalSales}
      />

      {/* Fuel Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {fuelTypeData.map((fuel) => (
          <Card key={fuel.name}>
            <CardHeader>
              <CardTitle className="text-lg">{fuel.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: fuel.color }}>
                {formatCurrency(fuel.value)}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {fuel.liters.toFixed(2)} Litre
              </p>
              <p className="text-xs text-gray-500">
                Ort. Fiyat: {formatCurrency(fuel.value / fuel.liters)}/L
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Net Credit Card Calculation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Banka Bazında Net Kredi Kartı Hesaplaması</span>
          </CardTitle>
          <CardDescription>
            Banka komisyon oranlarını girerek banka bazında net kredi kartı satışını hesaplayın
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Commission Rate Inputs */}
          {bankDetails.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bankDetails.map((bank) => (
                <div key={bank.bank_name} className="space-y-2">
                  <Label className="text-sm font-medium">{bank.bank_name} Komisyon Oranı (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="0.00"
                    value={getCommissionRate(bank.bank_name) || ''}
                    onChange={(e) => handleCommissionRateChange(bank.bank_name, e.target.value)}
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Bank-wise breakdown */}
          {bankWiseNetSales.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Banka Bazında Detay</h4>
              <div className="grid gap-4">
                {bankWiseNetSales.map((bank) => (
                  <div key={bank.bankName} className="border rounded-lg p-4 bg-gray-50">
                    <h5 className="font-medium text-gray-900 mb-3">{bank.bankName}</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Brüt Satış</p>
                        <p className="font-semibold text-blue-600">{formatCurrency(bank.grossAmount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Komisyon Oranı</p>
                        <p className="font-semibold">%{bank.commissionRate.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Komisyon Tutarı</p>
                        <p className="font-semibold text-red-600">{formatCurrency(bank.commission)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Net Satış</p>
                        <p className="font-semibold text-green-600">{formatCurrency(bank.netAmount)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Toplam Brüt Kart Satışı</p>
                    <p className="text-2xl font-bold text-blue-700">{formatCurrency(totals.totalCardSales)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Calculator className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-900">Toplam Komisyon</p>
                    <p className="text-2xl font-bold text-red-700">{formatCurrency(totalCommission)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-900">Toplam Net Kart Satışı</p>
                    <p className="text-2xl font-bold text-green-700">{formatCurrency(totalNetCardSales)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-amber-100 rounded">
                <svg className="h-4 w-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-amber-800">Bilgi</p>
                <p className="text-sm text-amber-700 mt-1">
                  Komisyon oranları bir kez girildiğinde otomatik olarak kaydedilir ve sonraki ziyaretlerde korunur. 
                  Gerçek komisyon tutarları bankanızın kesintilerine göre değişiklik gösterebilir.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
