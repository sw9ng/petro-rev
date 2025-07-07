
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Target, TrendingUp, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/numberUtils';

interface ReportsMetricsProps {
  totalSales: number;
  totalFuelSales: number;
  totalOverShort: number;
  filteredShifts: any[];
  filteredFuelSales: any[];
}

export const ReportsMetrics = memo(({ 
  totalSales, 
  totalFuelSales, 
  totalOverShort, 
  filteredShifts, 
  filteredFuelSales 
}: ReportsMetricsProps) => {
  return (
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
  );
});

ReportsMetrics.displayName = 'ReportsMetrics';
