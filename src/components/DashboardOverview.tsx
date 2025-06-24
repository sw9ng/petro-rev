
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Clock, Users, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

export const DashboardOverview = () => {
  // Sample data - in a real app this would come from your backend
  const todaysMetrics = {
    totalSales: 15420.50,
    cashSales: 8200.00,
    cardSales: 5120.50,
    bankTransfers: 2100.00,
    overShort: -45.25,
    activeShifts: 2,
    totalStaff: 8
  };

  const recentShifts = [
    { id: 1, employee: 'John Smith', startTime: '06:00', status: 'active', totalSales: 2450.00 },
    { id: 2, employee: 'Maria Garcia', startTime: '14:00', status: 'active', totalSales: 1890.50 },
    { id: 3, employee: 'Ahmed Hassan', startTime: '22:00', status: 'closed', totalSales: 3200.00, overShort: 15.50 }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Today's Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${todaysMetrics.totalSales.toLocaleString()}</div>
            <p className="text-xs opacity-90 mt-1">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12.5% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shifts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysMetrics.activeShifts}</div>
            <p className="text-xs text-muted-foreground">
              out of {todaysMetrics.totalStaff} staff members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash vs Card Split</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((todaysMetrics.cashSales / todaysMetrics.totalSales) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">Cash | Card: {Math.round((todaysMetrics.cardSales / todaysMetrics.totalSales) * 100)}%</p>
          </CardContent>
        </Card>

        <Card className={todaysMetrics.overShort < 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Over/Short Today</CardTitle>
            {todaysMetrics.overShort < 0 ? 
              <TrendingDown className="h-4 w-4 text-red-600" /> : 
              <TrendingUp className="h-4 w-4 text-green-600" />
            }
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${todaysMetrics.overShort < 0 ? 'text-red-700' : 'text-green-700'}`}>
              ${Math.abs(todaysMetrics.overShort).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {todaysMetrics.overShort < 0 ? 'Short' : 'Over'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Breakdown</CardTitle>
            <CardDescription>Today's payment method distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cash Sales</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(todaysMetrics.cashSales / todaysMetrics.totalSales) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold">${todaysMetrics.cashSales.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Card Sales</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(todaysMetrics.cardSales / todaysMetrics.totalSales) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold">${todaysMetrics.cardSales.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Bank Transfers</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${(todaysMetrics.bankTransfers / todaysMetrics.totalSales) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold">${todaysMetrics.bankTransfers.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Shift Activity</CardTitle>
            <CardDescription>Current and recent shift status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentShifts.map((shift) => (
                <div key={shift.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant={shift.status === 'active' ? 'default' : 'secondary'}>
                      {shift.status}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">{shift.employee}</p>
                      <p className="text-xs text-muted-foreground">Started at {shift.startTime}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">${shift.totalSales.toLocaleString()}</p>
                    {shift.overShort && (
                      <p className={`text-xs ${shift.overShort > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {shift.overShort > 0 ? '+' : ''}${shift.overShort}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex-col space-y-2">
              <Clock className="h-6 w-6" />
              <span>Start New Shift</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <DollarSign className="h-6 w-6" />
              <span>Record POS Transaction</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Users className="h-6 w-6" />
              <span>Add Staff Member</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
