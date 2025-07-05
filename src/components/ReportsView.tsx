import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon, TrendingUp, DollarSign, Users, Target, Calendar as CalendarDays, CreditCard, Edit, Save, X, Building2 } from 'lucide-react';
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

interface BankCommissionData {
  [bankName: string]: {
    amount: number;
    commissionRate: number;
    commission: number;
    netIncome: number;
  };
}

// Default commission rates for different banks
const DEFAULT_BANK_COMMISSION_RATES: { [key: string]: number } = {
  'Ziraat Bankası': 1.5,
  'İş Bankası': 1.8,
  'Garanti BBVA': 2.0,
  'Yapı Kredi': 1.9,
  'Akbank': 1.7,
  'Halkbank': 1.6,
  'Vakıfbank': 1.5,
  'QNB Finansbank': 2.1,
  'DenizBank': 1.8,
  'TEB': 2.2,
  'Şekerbank': 2.0,
  'Diğer': 2.5
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
  const [bankCommissionData, setBankCommissionData] = useState<BankCommissionData>({});
  const [editingBank, setEditingBank] = useState<string | null>(null);
  const [tempCommissionRate, setTempCommissionRate] = useState<number>(0);

  // Set default date to today
  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  // Fetch daily transactions based on selected date(s) - Stable version to prevent glitching
  useEffect(() => {
    const fetchDailyTransactions = async () => {
      try {
        let transactions = [];
        
        if (dateMode === 'single' && selectedDate) {
          const dateString = selectedDate.toISOString().split('T')[0];
          transactions = await findTransactionsByDate(dateString);
        } else if (dateMode === 'range' && selectedDateRange?.from && selectedDateRange?.to) {
          const startDate = selectedDateRange.from.toISOString().split('T')[0];
          const endDate = selectedDateRange.to.toISOString().split('T')[0];
          transactions = await getTransactionsByDateRange(startDate, endDate);
        }
        
        // Only update if transactions actually changed to prevent unnecessary re-renders
        setDailyTransactions(prevTransactions => {
          if (JSON.stringify(prevTransactions) !== JSON.stringify(transactions)) {
            return transactions;
          }
          return prevTransactions;
        });
      } catch (error) {
        console.error('Error fetching daily transactions:', error);
        setDailyTransactions([]);
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

  // Calculate bank commission data
  useEffect(() => {
    const calculateBankCommissions = () => {
      const bankTotals: BankCommissionData = {};
      
      Object.values(bankDetails).forEach(details => {
        details.forEach(detail => {
          const defaultRate = DEFAULT_BANK_COMMISSION_RATES[detail.bank_name] || 2.5;
          const currentRate = bankCommissionData[detail.bank_name]?.commissionRate || defaultRate;
          const commission = (detail.amount * currentRate) / 100;
          const netIncome = detail.amount - commission;
          
          if (bankTotals[detail.bank_name]) {
            bankTotals[detail.bank_name].amount += detail.amount;
            bankTotals[detail.bank_name].commission += commission;
            bankTotals[detail.bank_name].netIncome += netIncome;
          } else {
            bankTotals[detail.bank_name] = {
              amount: detail.amount,
              commissionRate: currentRate,
              commission: commission,
              netIncome: netIncome
            };
          }
        });
      });
      
      setBankCommissionData(bankTotals);
    };

    calculateBankCommissions();
  }, [bankDetails]);

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

  // Calculate daily veresiye/debt transactions with memoization to prevent glitching
  const dailyVeresiye = useMemo(() => {
    return dailyTransactions
      .filter(t => t.transaction_type === 'debt')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [dailyTransactions]);

  const dailyPayments = useMemo(() => {
    return dailyTransactions
      .filter(t => t.transaction_type === 'payment')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [dailyTransactions]);

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

  // Calculate totals with memoization to prevent glitching
  const totalSales = useMemo(() => {
    return filteredShifts.reduce((sum, shift) => 
      sum + (shift.cash_sales || 0) + (shift.card_sales || 0) + (shift.veresiye || 0) + (shift.bank_transfers || 0) + (shift.loyalty_card || 0), 0);
  }, [filteredShifts]);

  const totalCashSales = useMemo(() => {
    return filteredShifts.reduce((sum, shift) => sum + (shift.cash_sales || 0), 0);
  }, [filteredShifts]);

  const totalCardSales = useMemo(() => {
    return filteredShifts.reduce((sum, shift) => sum + (shift.card_sales || 0), 0);
  }, [filteredShifts]);

  const totalBankTransfers = useMemo(() => {
    return filteredShifts.reduce((sum, shift) => sum + (shift.bank_transfers || 0), 0);
  }, [filteredShifts]);

  const totalLoyaltyCard = useMemo(() => {
    return filteredShifts.reduce((sum, shift) => sum + (shift.loyalty_card || 0), 0);
  }, [filteredShifts]);

  const totalShiftVeresiye = useMemo(() => {
    return filteredShifts.reduce((sum, shift) => sum + (shift.veresiye || 0), 0);
  }, [filteredShifts]);

  const totalCustomerDebts = getTotalOutstandingDebt();
  const totalOverShort = useMemo(() => {
    return filteredShifts.reduce((sum, shift) => sum + (shift.over_short || 0), 0);
  }, [filteredShifts]);

  const totalFuelSales = useMemo(() => {
    return filteredFuelSales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
  }, [filteredFuelSales]);

  const totalCommission = useMemo(() => {
    return Object.values(bankCommissionData).reduce((sum, bank) => sum + (bank.commission || 0), 0);
  }, [bankCommissionData]);

  const totalNetIncome = useMemo(() => {
    return Object.values(bankCommissionData).reduce((sum, bank) => sum + (bank.netIncome || 0), 0);
  }, [bankCommissionData]);

  // Stable calculation for total current sales to prevent glitching
  const totalCurrentSales = useMemo(() => {
    return (totalShiftVeresiye || 0) + (dailyVeresiye || 0);
  }, [totalShiftVeresiye, dailyVeresiye]);

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

  const bankChartData = Object.entries(bankCommissionData).map(([bank, data]) => ({
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
    console.log('Bank details updated:', details);
  };

  const handleCommissionEdit = (bankName: string) => {
    setEditingBank(bankName);
    setTempCommissionRate(bankCommissionData[bankName]?.commissionRate || DEFAULT_BANK_COMMISSION_RATES[bankName] || 2.5);
  };

  const handleCommissionSave = (bankName: string) => {
    setBankCommissionData(prev => ({
      ...prev,
      [bankName]: {
        ...prev[bankName],
        commissionRate: tempCommissionRate,
        commission: (prev[bankName].amount * tempCommissionRate) / 100,
        netIncome: prev[bankName].amount - (prev[bankName].amount * tempCommissionRate) / 100
      }
    }));
    setEditingBank(null);
  };

  const handleCommissionCancel = () => {
    setEditingBank(null);
    setTempCommissionRate(0);
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
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalCurrentSales)}</div>
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

      {/* Bank Sales List */}
      {Object.keys(bankCommissionData).length > 0 && (
        <Card className="border-2 border-green-100">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Building2 className="h-6 w-6 text-green-600" />
                  Banka Bazlı Satış Listesi
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Seçilen tarih aralığındaki bankalara göre kart satış tutarları
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Toplam Banka Sayısı</div>
                <div className="text-2xl font-bold text-green-600">{Object.keys(bankCommissionData).length}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Object.entries(bankCommissionData)
                .sort(([,a], [,b]) => b.amount - a.amount)
                .map(([bankName, data], index) => (
                <Card key={bankName} className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800 text-sm">{bankName}</h3>
                      <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        #{index + 1}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Satış Tutarı</span>
                        <span className="font-bold text-green-600">{formatCurrency(data.amount)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Pay Oranı</span>
                        <span className="text-xs font-medium text-blue-600">
                          %{((data.amount / totalCardSales) * 100).toFixed(1)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${(data.amount / totalCardSales) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary Statistics */}
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-600">En Yüksek Satış</div>
                  <div className="font-bold text-green-600">
                    {Object.entries(bankCommissionData).length > 0 
                      ? formatCurrency(Math.max(...Object.values(bankCommissionData).map(b => b.amount)))
                      : '₺0'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {Object.entries(bankCommissionData).length > 0 
                      ? Object.entries(bankCommissionData).reduce((max, [bank, data]) => 
                          data.amount > max.amount ? { bank, amount: data.amount } : max, 
                          { bank: '', amount: 0 }).bank
                      : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">En Düşük Satış</div>
                  <div className="font-bold text-orange-600">
                    {Object.entries(bankCommissionData).length > 0 
                      ? formatCurrency(Math.min(...Object.values(bankCommissionData).map(b => b.amount)))
                      : '₺0'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {Object.entries(bankCommissionData).length > 0 
                      ? Object.entries(bankCommissionData).reduce((min, [bank, data]) => 
                          data.amount < min.amount ? { bank, amount: data.amount } : min, 
                          { bank: '', amount: Infinity }).bank
                      : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Ortalama Satış</div>
                  <div className="font-bold text-blue-600">
                    {Object.entries(bankCommissionData).length > 0 
                      ? formatCurrency(totalCardSales / Object.keys(bankCommissionData).length)
                      : '₺0'}
                  </div>
                  <div className="text-xs text-gray-500">
                    Banka başına ortalama
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Toplam Satış</div>
                  <div className="font-bold text-purple-600">{formatCurrency(totalCardSales)}</div>
                  <div className="text-xs text-gray-500">
                    {Object.keys(bankCommissionData).length} bankada
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bank-wise Card Sales Analysis */}
      {Object.keys(bankCommissionData).length > 0 && (
        <Card className="border-2 border-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                  Banka Bazlı Kart Satışları ve Komisyon Analizi
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Seçilen tarih aralığındaki banka bazında kart satış dağılımı ve komisyon hesaplamaları
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Toplam Kart Satışı</div>
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalCardSales)}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Bank Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {Object.entries(bankCommissionData).map(([bankName, data]) => (
                <Card key={bankName} className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-800">{bankName}</CardTitle>
                      <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {((data.amount / totalCardSales) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Sales Amount */}
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Toplam Satış</span>
                      <span className="text-lg font-bold text-blue-600">{formatCurrency(data.amount)}</span>
                    </div>

                    {/* Commission Rate - Editable */}
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Komisyon Oranı</span>
                      <div className="flex items-center gap-2">
                        {editingBank === bankName ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={tempCommissionRate}
                              onChange={(e) => setTempCommissionRate(Number(e.target.value))}
                              className="w-16 h-8 text-sm"
                              step="0.1"
                            />
                            <span className="text-sm">%</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCommissionSave(bankName)}
                              className="h-8 w-8 p-0"
                            >
                              <Save className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCommissionCancel}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-orange-600">%{data.commissionRate.toFixed(1)}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCommissionEdit(bankName)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4 text-gray-500" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Commission Amount */}
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Komisyon</span>
                      <span className="text-lg font-bold text-red-600">-{formatCurrency(data.commission)}</span>
                    </div>

                    {/* Net Income */}
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border-t-2 border-green-200">
                      <span className="text-sm font-semibold text-gray-800">Net Gelir</span>
                      <span className="text-xl font-bold text-green-600">{formatCurrency(data.netIncome)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-sm text-gray-600 mb-2">Toplam Kart Satışı</div>
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalCardSales)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {Object.keys(bankCommissionData).length} banka
                </div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-sm text-gray-600 mb-2">Toplam Komisyon</div>
                <div className="text-2xl font-bold text-red-600">-{formatCurrency(totalCommission)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Ort. %{totalCardSales > 0 ? ((totalCommission / totalCardSales) * 100).toFixed(2) : '0'}
                </div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-sm text-gray-600 mb-2">Toplam Net Gelir</div>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(totalNetIncome)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Kar Oranı: %{totalCardSales > 0 ? ((totalNetIncome / totalCardSales) * 100).toFixed(1) : '0'}
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Bank Sales Comparison */}
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Banka Bazlı Satış Karşılaştırması</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(bankCommissionData).map(([bank, data]) => ({
                    bank: bank.length > 10 ? `${bank.substring(0, 10)}...` : bank,
                    amount: data.amount,
                    commission: data.commission,
                    netIncome: data.netIncome
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bank" angle={-45} textAnchor="end" height={80} />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value, name) => [
                      formatCurrency(Number(value)), 
                      name === 'amount' ? 'Toplam Satış' : 
                      name === 'commission' ? 'Komisyon' : 'Net Gelir'
                    ]} />
                    <Bar dataKey="amount" fill="#3B82F6" name="amount" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Commission vs Net Income */}
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Komisyon vs Net Gelir</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(bankCommissionData).map(([bank, data]) => ({
                    bank: bank.length > 10 ? `${bank.substring(0, 10)}...` : bank,
                    commission: data.commission,
                    netIncome: data.netIncome
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bank" angle={-45} textAnchor="end" height={80} />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value, name) => [
                      formatCurrency(Number(value)), 
                      name === 'commission' ? 'Komisyon' : 'Net Gelir'
                    ]} />
                    <Bar dataKey="commission" fill="#EF4444" name="commission" />
                    <Bar dataKey="netIncome" fill="#10B981" name="netIncome" />
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
