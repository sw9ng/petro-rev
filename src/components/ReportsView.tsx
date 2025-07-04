import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, TrendingUp, DollarSign, Users, Target, CreditCard, Calculator, User } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useShifts } from '@/hooks/useShifts';
import { usePersonnel } from '@/hooks/usePersonnel';
import { useFuelSales } from '@/hooks/useFuelSales';
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
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedShiftType, setSelectedShiftType] = useState<string>('all');
  const [selectedPersonnel, setSelectedPersonnel] = useState<string>('all');
  const [commissionRates, setCommissionRates] = useState<Record<string, number>>({});
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([]);

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
  const totalVeResiye = filteredShifts.reduce((sum, shift) => sum + shift.veresiye, 0);
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
    { name: 'Veresiye', value: totalVeResiye, color: '#EF4444' }
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
    // Save to localStorage for persistence
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Vardiya</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredShifts.filter(shift => shift.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Toplam: {filteredShifts.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Personnel Analysis */}
      {personnelAnalysis.length > 0 && (
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
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Günlük Satış Trendi</CardTitle>
            <CardDescription>Seçilen dönemdeki günlük satış performansı</CardDescription>
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
            <CardTitle className="text-lg">Veresiye Satışlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{formatCurrency(totalVeResiye)}</div>
            <p className="text-sm text-gray-600 mt-2">
              Toplam satışın %{((totalVeResiye / totalSales) * 100).toFixed(1)}'i
            </p>
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
                    value={commissionRates[bank.bank_name] || ''}
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

          {/* Summary - Updated to use correct totalCardSales variable */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Toplam Brüt Kart Satışı</p>
                    <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalCardSales)}</p>
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
