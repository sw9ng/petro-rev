import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarIcon, TrendingUp, DollarSign, Users, Fuel, CreditCard, Calculator } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/numberUtils';
import { useShifts } from '@/hooks/useShifts';
import { usePersonnel } from '@/hooks/usePersonnel';
import { useFuelSales } from '@/hooks/useFuelSales';
import { useCustomerTransactions } from '@/hooks/useCustomerTransactions';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

export const ReportsView = () => {
  const { fetchAllShifts } = useShifts();
  const { personnel } = usePersonnel();
  const { fuelSales } = useFuelSales();
  const { getTransactionsByDateRange, getTotalOutstandingDebt } = useCustomerTransactions();
  const [shifts, setShifts] = useState<any[]>([]);
  const [customerTransactions, setCustomerTransactions] = useState<any[]>([]);
  const [bankDetails, setBankDetails] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedPersonnel, setSelectedPersonnel] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Net credit card calculation states
  const [commissionRates, setCommissionRates] = useState<Record<string, number>>({});
  const [showCommissionDialog, setShowCommissionDialog] = useState(false);

  const loadShifts = async () => {
    setLoading(true);
    const allShifts = await fetchAllShifts();
    setShifts(allShifts);
    setLoading(false);
  };

  const loadBankDetails = async () => {
    const { data, error } = await supabase
      .from('shift_bank_details')
      .select(`
        *,
        shifts!inner(
          station_id,
          start_time
        )
      `);

    if (error) {
      console.error('Error fetching bank details:', error);
    } else {
      setBankDetails(data || []);
    }
  };

  const loadCustomerTransactions = async () => {
    if (startDate && endDate) {
      const transactions = await getTransactionsByDateRange(
        startDate.toISOString(),
        endDate.toISOString()
      );
      setCustomerTransactions(transactions);
    }
  };

  useEffect(() => {
    loadShifts();
    loadBankDetails();
  }, []);

  useEffect(() => {
    loadCustomerTransactions();
  }, [startDate, endDate]);

  const filteredShifts = shifts.filter(shift => {
    let include = true;

    if (startDate) {
      const shiftDate = new Date(shift.start_time);
      include = include && shiftDate >= startDate;
    }

    if (endDate) {
      const shiftDate = new Date(shift.start_time);
      const endDateWithTime = new Date(endDate);
      endDateWithTime.setHours(23, 59, 59, 999);
      include = include && shiftDate <= endDateWithTime;
    }

    if (selectedPersonnel) {
      include = include && shift.personnel_id === selectedPersonnel;
    }

    if (selectedShift) {
      include = include && shift.shift_number === selectedShift;
    }

    return include;
  });

  // Filter fuel sales by date range
  const filteredFuelSales = fuelSales.filter(sale => {
    let include = true;

    if (startDate) {
      const saleDate = new Date(sale.sale_time);
      include = include && saleDate >= startDate;
    }

    if (endDate) {
      const saleDate = new Date(sale.sale_time);
      const endDateWithTime = new Date(endDate);
      endDateWithTime.setHours(23, 59, 59, 999);
      include = include && saleDate <= endDateWithTime;
    }

    return include;
  });

  // Filter bank details by date range and shift
  const filteredBankDetails = bankDetails.filter(detail => {
    // First check shift filter
    if (selectedShift) {
      const relatedShift = shifts.find(shift => shift.id === detail.shift_id);
      if (!relatedShift || relatedShift.shift_number !== selectedShift) {
        return false;
      }
    }
    
    // Then check date filters
    if (!startDate && !endDate) return true;
    
    const shiftDate = new Date(detail.shifts.start_time);
    
    if (startDate && endDate) {
      const endDateWithTime = new Date(endDate);
      endDateWithTime.setHours(23, 59, 59, 999);
      return shiftDate >= startDate && shiftDate <= endDateWithTime;
    } else if (startDate) {
      return shiftDate >= startDate;
    } else if (endDate) {
      const endDateWithTime = new Date(endDate);
      endDateWithTime.setHours(23, 59, 59, 999);
      return shiftDate <= endDateWithTime;
    }
    
    return true;
  });

  // Calculate statistics - removed veresiye
  const totalRevenue = filteredShifts.reduce((sum, shift) => 
    sum + shift.cash_sales + shift.card_sales + shift.bank_transfers, 0);
  
  const totalFuelRevenue = filteredFuelSales.reduce((sum, sale) => sum + sale.total_amount, 0);
  
  // Calculate net balance (fazlalık - açık) with significance threshold
  const netOverShort = filteredShifts.reduce((sum, shift) => {
    const overShort = shift.over_short || 0;
    // Include all over/short amounts with absolute value >= 5 TL
    if (Math.abs(overShort) >= 5) {
      return sum + overShort;
    }
    return sum;
  }, 0);

  // Calculate customer transaction totals
  const customerDebtTotal = customerTransactions
    .filter(t => t.transaction_type === 'debt')
    .reduce((sum, t) => sum + t.amount, 0);

  const customerPaymentTotal = customerTransactions
    .filter(t => t.transaction_type === 'payment')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutstandingDebt = getTotalOutstandingDebt();

  // Calculate credit card totals by bank from shift_bank_details
  const creditCardByBank = filteredBankDetails.reduce((acc, detail) => {
    const bankName = detail.bank_name;
    const amount = detail.amount;
    
    if (!acc[bankName]) {
      acc[bankName] = 0;
    }
    acc[bankName] += amount;
    return acc;
  }, {} as Record<string, number>);

  // Calculate net credit card amounts after commission
  const netCreditCardByBank = Object.entries(creditCardByBank).map(([bank, amount]) => {
    const commissionRate = commissionRates[bank] || 0;
    const commission = amount * (commissionRate / 100);
    const netAmount = amount - commission;
    return {
      bank,
      grossAmount: amount,
      commissionRate,
      commission,
      netAmount
    };
  });

  const totalNetCreditCard = netCreditCardByBank.reduce((sum, item) => sum + item.netAmount, 0);

  const handleCommissionRateChange = (bank: string, rate: string) => {
    setCommissionRates(prev => ({
      ...prev,
      [bank]: parseFloat(rate) || 0
    }));
  };

  // Prepare chart data - removed veresiye
  const dailyRevenue = filteredShifts.reduce((acc, shift) => {
    const date = format(new Date(shift.start_time), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = { date, revenue: 0, shifts: 0 };
    }
    acc[date].revenue += shift.cash_sales + shift.card_sales + shift.bank_transfers;
    acc[date].shifts += 1;
    return acc;
  }, {} as Record<string, any>);

  const chartData = Object.values(dailyRevenue).map((item: any) => ({
    date: format(new Date(item.date), 'dd/MM'),
    revenue: item.revenue,
    shifts: item.shifts
  }));

  // Fuel sales by type
  const fuelSalesByType = filteredFuelSales.reduce((acc, sale) => {
    if (!acc[sale.fuel_type]) {
      acc[sale.fuel_type] = 0;
    }
    acc[sale.fuel_type] += sale.total_amount;
    return acc;
  }, {} as Record<string, number>);

  const fuelPieData = Object.entries(fuelSalesByType).map(([type, amount]) => ({
    name: type,
    value: amount
  }));

  // Credit card data for chart
  const creditCardData = Object.entries(creditCardByBank).map(([bank, amount]) => ({
    bank,
    amount: amount as number
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedPersonnel('');
    setSelectedShift('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Raporlar</h2>
          <p className="text-muted-foreground">Detaylı analiz ve raporlar</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Başlangıç Tarihi</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP", { locale: tr }) : "Tarih seçin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
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
              <label className="text-sm font-medium">Bitiş Tarihi</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP", { locale: tr }) : "Tarih seçin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Personel</label>
              <Select value={selectedPersonnel} onValueChange={setSelectedPersonnel}>
                <SelectTrigger>
                  <SelectValue placeholder="Personel seçin" />
                </SelectTrigger>
                <SelectContent>
                  {personnel.map((person) => (
                    <SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Vardiya</label>
              <Select value={selectedShift} onValueChange={setSelectedShift}>
                <SelectTrigger>
                  <SelectValue placeholder="Vardiya seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="V1">V1</SelectItem>
                  <SelectItem value="V2">V2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={clearFilters} className="w-full">
              Filtreleri Temizle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards - removed veresiye card */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Ciro</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Akaryakıt Satışı</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalFuelRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Müşteri Borçları</CardTitle>
            <CreditCard className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalOutstandingDebt)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Vardiya</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredShifts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Denge (≥5₺)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netOverShort < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(netOverShort)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Net Credit Card Section */}
      {creditCardData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5 text-green-500" />
                  <span>Net Kredi Kartı Hesaplama</span>
                </CardTitle>
                <CardDescription>Banka komisyon oranlarını girerek net kredi kartı tutarını hesaplayın</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Toplam Net Tutar</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalNetCreditCard)}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {netCreditCardByBank.map((item, index) => (
                <Card key={item.bank} className="border-l-4" style={{borderLeftColor: COLORS[index % COLORS.length]}}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                      <div>
                        <Label className="font-medium text-gray-900">{item.bank}</Label>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Brüt Tutar</Label>
                        <div className="font-semibold">{formatCurrency(item.grossAmount)}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Komisyon Oranı (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={commissionRates[item.bank] || ''}
                          onChange={(e) => handleCommissionRateChange(item.bank, e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Komisyon Tutarı</Label>
                        <div className="font-semibold text-red-600">{formatCurrency(item.commission)}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Net Tutar</Label>
                        <div className="font-bold text-green-600">{formatCurrency(item.netAmount)}</div>
                      </div>
                      <div className="text-right">
                        <div 
                          className="w-4 h-4 rounded-full ml-auto" 
                          style={{backgroundColor: COLORS[index % COLORS.length]}}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Credit Card Processing by Bank */}
      {creditCardData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Summary Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-blue-500" />
                <span>Banka Bazında Kredi Kartı Satışları</span>
              </CardTitle>
              <CardDescription>Banka bazında kredi kartı satış tutarları</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {creditCardData.map((item, index) => (
                  <Card key={item.bank} className="border-l-4" style={{borderLeftColor: COLORS[index % COLORS.length]}}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{item.bank}</p>
                          <p className="text-sm text-gray-600">Kredi Kartı Satışı</p>
                        </div>
                        <p className="text-lg font-bold" style={{color: COLORS[index % COLORS.length]}}>
                          {formatCurrency(item.amount)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Table */}
          <Card>
            <CardHeader>
              <CardTitle>Banka Bazında Detay Tablo</CardTitle>
              <CardDescription>Kredi kartı satışlarının banka bazında detaylı listesi</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Banka Adı</TableHead>
                    <TableHead className="text-right">Satış Tutarı</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creditCardData.map((item, index) => (
                    <TableRow key={item.bank}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{backgroundColor: COLORS[index % COLORS.length]}}
                          />
                          <span>{item.bank}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 font-bold">
                    <TableCell>Toplam</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(creditCardData.reduce((sum, item) => sum + (typeof item.amount === 'number' ? item.amount : 0), 0))}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Günlük Ciro</TabsTrigger>
          <TabsTrigger value="fuel">Akaryakıt Türü</TabsTrigger>
          <TabsTrigger value="creditcard">Kredi Kartı Satışları</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Günlük Ciro Analizi</CardTitle>
              <CardDescription>Seçilen tarih aralığındaki günlük ciro değişimi</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: unknown) => {
                    const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
                    return [formatCurrency(numValue), 'Ciro'];
                  }} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" name="Günlük Ciro" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fuel">
          <Card>
            <CardHeader>
              <CardTitle>Akaryakıt Türü Dağılımı</CardTitle>
              <CardDescription>Akaryakıt türlerine göre satış dağılımı</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={fuelPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {fuelPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: unknown) => {
                    const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
                    return [formatCurrency(numValue), 'Tutar'];
                  }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="creditcard">
          <Card>
            <CardHeader>
              <CardTitle>Kredi Kartı Satış Analizi</CardTitle>
              <CardDescription>Banka bazında kredi kartı satış tutarları</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={creditCardData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bank" />
                  <YAxis />
                  <Tooltip formatter={(value: unknown) => {
                    const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
                    return [formatCurrency(numValue), 'Tutar'];
                  }} />
                  <Legend />
                  <Bar dataKey="amount" fill="#82ca9d" name="Kredi Kartı Satışı" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
