import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, TrendingUp, DollarSign, Users, Target, Calendar as CalendarDays, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useShifts } from '@/hooks/useShifts';
import { usePersonnel } from '@/hooks/usePersonnel';
import { useFuelSales } from '@/hooks/useFuelSales';
import { useCustomerTransactions } from '@/hooks/useCustomerTransactions';
import { formatCurrency } from '@/lib/numberUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { DateRange } from 'react-day-picker';
import { BankSelectionDialog } from './BankSelectionDialog';

interface BankDetail {
  bank_name: string;
  amount: number;
}

// Commission rates for different banks (example rates - adjust as needed)
const BANK_COMMISSION_RATES: { [key: string]: number } = {
  'Ziraat Bankası': 0.015, // 1.5%
  'İş Bankası': 0.018, // 1.8%
  'Garanti BBVA': 0.020, // 2.0%
  'Yapı Kredi': 0.019, // 1.9%
  'Akbank': 0.017, // 1.7%
  'Halkbank': 0.016, // 1.6%
  'Vakıfbank': 0.015, // 1.5%
  'QNB Finansbank': 0.021, // 2.1%
  'DenizBank': 0.018, // 1.8%
  'TEB': 0.022, // 2.2%
  'Şekerbank': 0.020, // 2.0%
  'Diğer': 0.025 // 2.5%
};

export const ReportsView = () => {
  const { allShifts, getShiftBankDetails } = useShifts();
  const { personnel } = usePersonnel();
  const { fuelSales } = useFuelSales();
  const { getTotalOutstandingDebt, getTransactionsByDateRange, findTransactionsByDate } = useCustomerTransactions();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>();
  const [dateMode, setDateMode] = useState<'single' | 'range'>('single');
  const [selectedShiftType, setSelectedShiftType] = useState<string>('all');
  const [selectedPersonnel, setSelectedPersonnel] = useState<string>('all');
  const [dailyTransactions, setDailyTransactions] = useState<any[]>([]);
  const [bankDetails, setBankDetails] = useState<{ [shiftId: string]: BankDetail[] }>({});
  const [showBankDialog, setShowBankDialog] = useState(false);
  const [selectedShiftForBank, setSelectedShiftForBank] = useState<string>('');

  // Set default date to today
  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  // Fetch daily transactions based on selected date(s)
  useEffect(() => {
    const fetchDailyTransactions = async () => {
      if (dateMode === 'single' && selectedDate) {
        const transactions = await findTransactionsByDate(selectedDate.toISOString().split('T')[0]);
        setDailyTransactions(transactions);
      } else if (dateMode === 'range' && selectedDateRange?.from && selectedDateRange?.to) {
        const transactions = await getTransactionsByDateRange(
          selectedDateRange.from.toISOString().split('T')[0],
          selectedDateRange.to.toISOString().split('T')[0]
        );
        setDailyTransactions(transactions);
      }
    };

    fetchDailyTransactions();
  }, [selectedDate, selectedDateRange, dateMode, findTransactionsByDate, getTransactionsByDateRange]);

  // Fetch bank details for filtered shifts
  useEffect(() => {
    const fetchBankDetails = async () => {
      const filtered = getFilteredShifts();
      const details: { [shiftId: string]: BankDetail[] } = {};
      
      for (const shift of filtered) {
        if (shift.card_sales && shift.card_sales > 0) {
          const bankData = await getShiftBankDetails(shift.id);
          details[shift.id] = bankData || [];
        }
      }
      
      setBankDetails(details);
    };

    fetchBankDetails();
  }, [selectedDate, selectedDateRange, dateMode, selectedShiftType, selectedPersonnel, getShiftBankDetails]);

  // Filter data based on selected date(s), shift type, and personnel
  const getFilteredShifts = () => {
    let filtered = allShifts;
    
    if (dateMode === 'single' && selectedDate) {
      filtered = allShifts.filter(shift => {
        const shiftDate = new Date(shift.start_time);
        const selectedDateStart = new Date(selectedDate);
        selectedDateStart.setHours(0, 0, 0, 0);
        const selectedDateEnd = new Date(selectedDate);
        selectedDateEnd.setHours(23, 59, 59, 999);
        
        return shiftDate >= selectedDateStart && shiftDate <= selectedDateEnd;
      });
    } else if (dateMode === 'range' && selectedDateRange?.from && selectedDateRange?.to) {
      filtered = allShifts.filter(shift => {
        const shiftDate = new Date(shift.start_time);
        const startDate = new Date(selectedDateRange.from!);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(selectedDateRange.to!);
        endDate.setHours(23, 59, 59, 999);
        
        return shiftDate >= startDate && shiftDate <= endDate;
      });
    }

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
    let filtered = fuelSales;
    
    if (dateMode === 'single' && selectedDate) {
      filtered = fuelSales.filter(sale => {
        const saleDate = new Date(sale.sale_time);
        const selectedDateStart = new Date(selectedDate);
        selectedDateStart.setHours(0, 0, 0, 0);
        const selectedDateEnd = new Date(selectedDate);
        selectedDateEnd.setHours(23, 59, 59, 999);
        
        return saleDate >= selectedDateStart && saleDate <= selectedDateEnd;
      });
    } else if (dateMode === 'range' && selectedDateRange?.from && selectedDateRange?.to) {
      filtered = fuelSales.filter(sale => {
        const saleDate = new Date(sale.sale_time);
        const startDate = new Date(selectedDateRange.from!);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(selectedDateRange.to!);
        endDate.setHours(23, 59, 59, 999);
        
        return saleDate >= startDate && saleDate <= endDate;
      });
    }

    // Filter by personnel if selected
    if (selectedPersonnel !== 'all') {
      filtered = filtered.filter(sale => sale.personnel_id === selectedPersonnel);
    }

    return filtered;
  };

  const filteredShifts = getFilteredShifts();
  const filteredFuelSales = getFilteredFuelSales();

  // Calculate daily veresiye/debt transactions
  const dailyVeresiye = dailyTransactions.filter(t => t.transaction_type === 'debt').reduce((sum, t) => sum + t.amount, 0);
  const dailyPayments = dailyTransactions.filter(t => t.transaction_type === 'payment').reduce((sum, t) => sum + t.amount, 0);

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
  const totalShiftVeresiye = filteredShifts.reduce((sum, shift) => sum + shift.veresiye, 0);
  const totalCustomerDebts = getTotalOutstandingDebt();
  const totalOverShort = filteredShifts.reduce((sum, shift) => sum + shift.over_short, 0);
  const totalFuelSales = filteredFuelSales.reduce((sum, sale) => sum + sale.total_amount, 0);

  // Calculate bank-wise totals and commissions
  const getBankWiseTotals = () => {
    const bankTotals: { [bankName: string]: { amount: number; commission: number; netIncome: number } } = {};
    
    Object.values(bankDetails).forEach(details => {
      details.forEach(detail => {
        const commissionRate = BANK_COMMISSION_RATES[detail.bank_name] || 0.025;
        const commission = detail.amount * commissionRate;
        const netIncome = detail.amount - commission;
        
        if (bankTotals[detail.bank_name]) {
          bankTotals[detail.bank_name].amount += detail.amount;
          bankTotals[detail.bank_name].commission += commission;
          bankTotals[detail.bank_name].netIncome += netIncome;
        } else {
          bankTotals[detail.bank_name] = {
            amount: detail.amount,
            commission: commission,
            netIncome: netIncome
          };
        }
      });
    });
    
    return bankTotals;
  };

  const bankWiseTotals = getBankWiseTotals();
  const totalCommission = Object.values(bankWiseTotals).reduce((sum, bank) => sum + bank.commission, 0);
  const totalNetIncome = Object.values(bankWiseTotals).reduce((sum, bank) => sum + bank.netIncome, 0);

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
    { name: 'Cari Satış', value: totalShiftVeresiye + dailyVeresiye, color: '#EF4444' }
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

  const bankChartData = Object.entries(bankWiseTotals).map(([bank, data]) => ({
    bank,
    amount: data.amount,
    commission: data.commission,
    netIncome: data.netIncome,
    color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`
  }));

  const getDateRangeText = () => {
    if (dateMode === 'single' && selectedDate) {
      return format(selectedDate, "dd MMM yyyy", { locale: tr });
    } else if (dateMode === 'range' && selectedDateRange?.from && selectedDateRange?.to) {
      return `${format(selectedDateRange.from, "dd MMM yyyy", { locale: tr })} - ${format(selectedDateRange.to, "dd MMM yyyy", { locale: tr })}`;
    }
    return "Tarih seçin";
  };

  const handleBankDetailsUpdate = async (details: BankDetail[]) => {
    // This would typically save to database
    console.log('Bank details updated:', details);
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
          {/* Date Mode Toggle */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <Button
              variant={dateMode === 'single' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDateMode('single')}
              className="text-xs"
            >
              <CalendarIcon className="h-3 w-3 mr-1" />
              Tek Tarih
            </Button>
            <Button
              variant={dateMode === 'range' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDateMode('range')}
              className="text-xs"
            >
              <CalendarDays className="h-3 w-3 mr-1" />
              Aralık
            </Button>
          </div>

          {/* Date Selector */}
          <div className="space-y-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    (!selectedDate && !selectedDateRange) && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {getDateRangeText()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white border shadow-lg z-50" align="start">
                {dateMode === 'single' ? (
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    locale={tr}
                    className="pointer-events-auto"
                  />
                ) : (
                  <Calendar
                    mode="range"
                    selected={selectedDateRange}
                    onSelect={setSelectedDateRange}
                    initialFocus
                    locale={tr}
                    className="pointer-events-auto"
                  />
                )}
              </PopoverContent>
            </Popover>
          </div>

          {/* Filter Controls */}
          <div className="flex items-center space-x-4">
            <div className="space-y-2">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Satış</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredShifts.length} vardiya
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kart Satışları</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalCardSales)}</div>
            <p className="text-xs text-muted-foreground">
              Komisyon: {formatCurrency(totalCommission)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Gelir</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalNetIncome)}</div>
            <p className="text-xs text-muted-foreground">
              Kart satışından net
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Akaryakıt Satışı</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalFuelSales)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredFuelSales.length} işlem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cari Satış</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalShiftVeresiye + dailyVeresiye)}</div>
            <p className="text-xs text-muted-foreground">
              Ödeme: {formatCurrency(dailyPayments)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Açık/Fazla</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalOverShort >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalOverShort >= 0 ? '+' : ''}{formatCurrency(totalOverShort)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ortalama: {formatCurrency(totalOverShort / Math.max(filteredShifts.length, 1))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bank Details Section */}
      {Object.keys(bankWiseTotals).length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Banka Bazlı Kart Satışları ve Komisyon Analizi
              </CardTitle>
              <CardDescription>
                Seçilen tarih(ler)deki banka bazında kart satış dağılımı, komisyon gideri ve net gelir
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBankDialog(true)}
              className="text-xs"
            >
              Detay Görüntüle
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {Object.entries(bankWiseTotals).map(([bank, data]) => (
                <div key={bank} className="p-4 bg-gray-50 rounded-lg border">
                  <h5 className="font-medium text-gray-900 text-sm mb-3">{bank}</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Toplam Satış:</span>
                      <span className="font-semibold text-blue-600">{formatCurrency(data.amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Komisyon ({((BANK_COMMISSION_RATES[bank] || 0.025) * 100).toFixed(1)}%):</span>
                      <span className="font-semibold text-red-600">-{formatCurrency(data.commission)}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-2">
                      <span className="text-gray-900 font-medium">Net Gelir:</span>
                      <span className="font-bold text-green-600">{formatCurrency(data.netIncome)}</span>
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      Toplam kart satışının %{totalCardSales > 0 ? ((data.amount / totalCardSales) * 100).toFixed(1) : '0'}'i
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Commission Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Toplam Kart Satışı</p>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(totalCardSales)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Toplam Komisyon</p>
                <p className="text-xl font-bold text-red-600">-{formatCurrency(totalCommission)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Toplam Net Gelir</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(totalNetIncome)}</p>
              </div>
            </div>

            {/* Bank Comparison Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h6 className="font-medium mb-3">Banka Bazlı Satış Karşılaştırması</h6>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={bankChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="bank" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Tutar']} />
                    <Bar dataKey="amount" fill="#3B82F6" name="Toplam Satış" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div>
                <h6 className="font-medium mb-3">Net Gelir Karşılaştırması</h6>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={bankChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="bank" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value, name) => [
                      formatCurrency(Number(value)), 
                      name === 'netIncome' ? 'Net Gelir' : name === 'commission' ? 'Komisyon' : name
                    ]} />
                    <Bar dataKey="netIncome" fill="#10B981" name="Net Gelir" />
                    <Bar dataKey="commission" fill="#EF4444" name="Komisyon" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personnel Analysis */}
      {personnelAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pompacı Performans Analizi</CardTitle>
            <CardDescription>
              Seçilen tarih(ler)deki pompacıların performans verileri
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
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Günlük Satış Trendi</CardTitle>
            <CardDescription>Seçilen tarih(ler)deki satış performansı</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Satış']} />
                <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ödeme Yöntemi Dağılımı</CardTitle>
            <CardDescription>Satışların ödeme yöntemlerine göre dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sales Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Nakit Satışlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{formatCurrency(totalCashSales)}</div>
            <p className="text-sm text-gray-600 mt-2">
              Toplam satışın %{totalSales > 0 ? ((totalCashSales / totalSales) * 100).toFixed(1) : '0'}'i
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
              Toplam satışın %{totalSales > 0 ? ((totalCardSales / totalSales) * 100).toFixed(1) : '0'}'i
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
              Toplam satışın %{totalSales > 0 ? ((totalBankTransfers / totalSales) * 100).toFixed(1) : '0'}'i
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cari Satışlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{formatCurrency(totalShiftVeresiye + dailyVeresiye)}</div>
            <p className="text-sm text-gray-600 mt-2">
              Toplam satışın %{totalSales > 0 ? (((totalShiftVeresiye + dailyVeresiye) / totalSales) * 100).toFixed(1) : '0'}'i
            </p>
          </CardContent>
        </Card>
      </div>

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

      {/* Fuel Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Akaryakıt Türü Satış Dağılımı</CardTitle>
            <CardDescription>Akaryakıt türlerine göre satış tutarları</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={fuelTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {fuelTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Akaryakıt Türü Karşılaştırması</CardTitle>
            <CardDescription>Litre bazında satış karşılaştırması</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fuelTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value.toFixed(0)}L`} />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} Litre`, 'Satış']} />
                <Bar dataKey="liters" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Ödeme Yöntemi Karşılaştırması</CardTitle>
          <CardDescription>Farklı ödeme yöntemlerinin karşılaştırmalı analizi</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={paymentMethodData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Tutar']} />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bank Selection Dialog */}
      <BankSelectionDialog
        isOpen={showBankDialog}
        onOpenChange={setShowBankDialog}
        onBankDetailsUpdate={handleBankDetailsUpdate}
        currentDetails={[]}
      />
    </div>
  );
};
