
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, Filter, TrendingUp, TrendingDown, DollarSign, Clock } from 'lucide-react';

export const ReportsView = () => {
  // Sample report data
  const weeklyData = [
    { date: '2024-01-15', shifts: 3, totalSales: 8250.00, overShort: 15.50, staff: ['John', 'Maria', 'Ahmed'] },
    { date: '2024-01-14', shifts: 3, totalSales: 7890.00, overShort: -8.25, staff: ['Sarah', 'Mike', 'Ahmed'] },
    { date: '2024-01-13', shifts: 2, totalSales: 6100.00, overShort: 22.00, staff: ['John', 'Maria'] },
    { date: '2024-01-12', shifts: 3, totalSales: 9200.00, overShort: -5.75, staff: ['Sarah', 'Ahmed', 'Mike'] },
    { date: '2024-01-11', shifts: 3, totalSales: 8450.00, overShort: 18.25, staff: ['John', 'Maria', 'Ahmed'] },
  ];

  const staffPerformance = [
    { name: 'John Smith', shifts: 12, totalSales: 32500.00, avgOverShort: 8.45, efficiency: 95 },
    { name: 'Ahmed Hassan', shifts: 15, totalSales: 41200.00, avgOverShort: 12.30, efficiency: 98 },
    { name: 'Maria Garcia', shifts: 10, totalSales: 24800.00, avgOverShort: -2.15, efficiency: 87 },
    { name: 'Sarah Wilson', shifts: 8, totalSales: 19500.00, avgOverShort: -4.80, efficiency: 82 },
    { name: 'Mike Johnson', shifts: 9, totalSales: 22100.00, avgOverShort: 1.25, efficiency: 90 }
  ];

  const totalWeekSales = weeklyData.reduce((sum, day) => sum + day.totalSales, 0);
  const totalWeekOverShort = weeklyData.reduce((sum, day) => sum + day.overShort, 0);
  const avgDailySales = totalWeekSales / weeklyData.length;

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-muted-foreground">Track performance and analyze trends</p>
        </div>
        <div className="flex space-x-2">
          <Select defaultValue="7days">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Week Total Sales</span>
            </div>
            <p className="text-2xl font-bold mt-2">${totalWeekSales.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12.5% vs last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Daily Average</span>
            </div>
            <p className="text-2xl font-bold mt-2">${avgDailySales.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Per day average</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">Total Shifts</span>
            </div>
            <p className="text-2xl font-bold mt-2">{weeklyData.reduce((sum, day) => sum + day.shifts, 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">This week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              {totalWeekOverShort >= 0 ? 
                <TrendingUp className="h-5 w-5 text-green-600" /> : 
                <TrendingDown className="h-5 w-5 text-red-600" />
              }
              <span className="text-sm font-medium">Week Over/Short</span>
            </div>
            <p className={`text-2xl font-bold mt-2 ${totalWeekOverShort >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalWeekOverShort >= 0 ? '+' : ''}${totalWeekOverShort.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalWeekOverShort >= 0 ? 'Overage' : 'Shortage'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Performance</CardTitle>
          <CardDescription>Sales and over/short trends for the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyData.map((day, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="font-semibold">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                    <p className="text-xs text-muted-foreground">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="font-medium">${day.totalSales.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{day.shifts} shifts</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className={`font-medium ${day.overShort >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {day.overShort >= 0 ? '+' : ''}${day.overShort.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">Over/Short</p>
                  </div>
                  <div className="flex space-x-1">
                    {day.staff.map((name) => (
                      <Badge key={name} variant="outline" className="text-xs">
                        {name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Staff Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Performance</CardTitle>
          <CardDescription>Individual employee performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {staffPerformance.map((staff, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-700">
                      {staff.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{staff.name}</p>
                    <p className="text-sm text-muted-foreground">{staff.shifts} shifts</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-8 text-center">
                  <div>
                    <p className="font-semibold">${(staff.totalSales / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-muted-foreground">Total Sales</p>
                  </div>
                  <div>
                    <p className={`font-semibold ${staff.avgOverShort >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {staff.avgOverShort >= 0 ? '+' : ''}${staff.avgOverShort.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">Avg Over/Short</p>
                  </div>
                  <div>
                    <p className="font-semibold">{staff.efficiency}%</p>
                    <p className="text-xs text-muted-foreground">Efficiency</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
