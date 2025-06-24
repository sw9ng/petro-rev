
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Clock, DollarSign, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ShiftManagement = () => {
  const { toast } = useToast();
  const [selectedShift, setSelectedShift] = useState(null);
  const [newShiftOpen, setNewShiftOpen] = useState(false);

  // Sample data
  const activeShifts = [
    {
      id: 1,
      employee: 'John Smith',
      startTime: '2024-01-15 06:00',
      cashSales: 1200.00,
      cardSales: 800.50,
      bankTransfers: 300.00,
      posTransactions: [
        { bank: 'Chase Bank', amount: 450.00 },
        { bank: 'Wells Fargo', amount: 350.50 }
      ],
      paidAmount: 2250.00,
      status: 'active'
    },
    {
      id: 2,
      employee: 'Maria Garcia',
      startTime: '2024-01-15 14:00',
      cashSales: 950.00,
      cardSales: 1200.00,
      bankTransfers: 150.00,
      posTransactions: [
        { bank: 'Bank of America', amount: 1200.00 }
      ],
      paidAmount: 2300.00,
      status: 'active'
    }
  ];

  const staff = ['John Smith', 'Maria Garcia', 'Ahmed Hassan', 'Sarah Wilson', 'Mike Johnson'];
  const banks = ['Chase Bank', 'Wells Fargo', 'Bank of America', 'CitiBank', 'TD Bank'];

  const calculateOverShort = (shift) => {
    const totalPOS = shift.posTransactions.reduce((sum, pos) => sum + pos.amount, 0);
    const totalSales = shift.cashSales + shift.bankTransfers + totalPOS;
    return shift.paidAmount - totalSales;
  };

  const handleCreateShift = () => {
    toast({
      title: "Shift Created",
      description: "New shift has been started successfully.",
    });
    setNewShiftOpen(false);
  };

  const handleCloseShift = (shiftId) => {
    toast({
      title: "Shift Closed",
      description: "Shift has been closed and recorded.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Shift Management</h2>
          <p className="text-muted-foreground">Manage daily shifts and track sales</p>
        </div>
        <Dialog open={newShiftOpen} onOpenChange={setNewShiftOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Start New Shift
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Start New Shift</DialogTitle>
              <DialogDescription>Create a new shift and assign an employee</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="employee">Assign Employee</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((employee) => (
                      <SelectItem key={employee} value={employee}>{employee}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input type="datetime-local" defaultValue={new Date().toISOString().slice(0, 16)} />
              </div>
              <Button onClick={handleCreateShift} className="w-full">
                Create Shift
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Shifts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeShifts.map((shift) => {
          const overShort = calculateOverShort(shift);
          const totalSales = shift.cashSales + shift.bankTransfers + shift.posTransactions.reduce((sum, pos) => sum + pos.amount, 0);
          
          return (
            <Card key={shift.id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{shift.employee}</CardTitle>
                    <CardDescription>
                      Started: {new Date(shift.startTime).toLocaleString()}
                    </CardDescription>
                  </div>
                  <Badge variant="default">
                    <Clock className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sales Summary */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Cash Sales</p>
                    <p className="font-semibold">${shift.cashSales.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bank Transfers</p>
                    <p className="font-semibold">${shift.bankTransfers.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">POS Sales</p>
                    <p className="font-semibold">
                      ${shift.posTransactions.reduce((sum, pos) => sum + pos.amount, 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sales</p>
                    <p className="font-semibold">${totalSales.toFixed(2)}</p>
                  </div>
                </div>

                {/* POS Transactions */}
                {shift.posTransactions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">POS Transactions</p>
                    <div className="space-y-2">
                      {shift.posTransactions.map((pos, index) => (
                        <div key={index} className="flex justify-between text-sm p-2 bg-blue-50 rounded">
                          <span>{pos.bank}</span>
                          <span className="font-medium">${pos.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Over/Short Calculation */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Over/Short Calculation</span>
                    <Calculator className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Paid Amount:</span>
                      <span>${shift.paidAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Sales:</span>
                      <span>${totalSales.toFixed(2)}</span>
                    </div>
                    <hr className="my-2" />
                    <div className={`flex justify-between font-medium ${overShort >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{overShort >= 0 ? 'Over:' : 'Short:'}</span>
                      <span>${Math.abs(overShort).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit Sales
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleCloseShift(shift.id)}
                  >
                    Close Shift
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Closed Shifts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Closed Shifts</CardTitle>
          <CardDescription>Last 10 completed shifts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { employee: 'Ahmed Hassan', date: '2024-01-14', shift: 'Night', sales: 3200.00, overShort: 15.50 },
              { employee: 'Sarah Wilson', date: '2024-01-14', shift: 'Evening', sales: 2800.00, overShort: -8.25 },
              { employee: 'Mike Johnson', date: '2024-01-14', shift: 'Morning', sales: 4100.00, overShort: 0.00 }
            ].map((shift, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="font-medium">{shift.employee}</p>
                    <p className="text-sm text-muted-foreground">{shift.date} - {shift.shift} Shift</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-medium">${shift.sales.toFixed(2)}</p>
                    <p className={`text-sm ${shift.overShort >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {shift.overShort >= 0 ? '+' : ''}${shift.overShort.toFixed(2)}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">View Details</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
