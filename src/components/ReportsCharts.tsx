
import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/numberUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { format } from 'date-fns';

interface ReportsChartsProps {
  filteredShifts: any[];
  filteredFuelSales: any[];
  totalCashSales: number;
  totalCardSales: number;
  totalBankTransfers: number;
  totalLoyaltyCard: number;
  totalCustomerDebts: number;
  getEffectiveShiftDate: (startTime: string, endTime: string | null, shiftNumber: string | null) => Date;
}

export const ReportsCharts = memo(({ 
  filteredShifts, 
  filteredFuelSales, 
  totalCashSales, 
  totalCardSales, 
  totalBankTransfers, 
  totalLoyaltyCard, 
  totalCustomerDebts,
  getEffectiveShiftDate 
}: ReportsChartsProps) => {
  
  const dailySalesData = useMemo(() => {
    return filteredShifts.reduce((acc, shift) => {
      const effectiveDate = getEffectiveShiftDate(shift.start_time, shift.end_time, shift.shift_number);
      const date = format(effectiveDate, 'dd/MM');
      const existingEntry = acc.find(entry => entry.date === date);
      const totalSale = shift.cash_sales + shift.card_sales + shift.veresiye + shift.bank_transfers + shift.loyalty_card;
      
      if (existingEntry) {
        existingEntry.sales += totalSale;
      } else {
        acc.push({ date, sales: totalSale });
      }
      return acc;
    }, [] as { date: string; sales: number }[]);
  }, [filteredShifts, getEffectiveShiftDate]);

  const paymentMethodData = useMemo(() => {
    return [
      { name: 'Nakit', value: totalCashSales, color: '#10B981' },
      { name: 'Kart', value: totalCardSales, color: '#3B82F6' },
      { name: 'Banka Havale', value: totalBankTransfers, color: '#8B5CF6' },
      { name: 'Sadakat Kartı', value: totalLoyaltyCard, color: '#F59E0B' },
      { name: 'Müşteri Borçları', value: totalCustomerDebts, color: '#EF4444' }
    ].filter(item => item.value > 0);
  }, [totalCashSales, totalCardSales, totalBankTransfers, totalLoyaltyCard, totalCustomerDebts]);

  const fuelTypeData = useMemo(() => {
    return filteredFuelSales.reduce((acc, sale) => {
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
  }, [filteredFuelSales]);

  return (
    <>
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
    </>
  );
});

ReportsCharts.displayName = 'ReportsCharts';
