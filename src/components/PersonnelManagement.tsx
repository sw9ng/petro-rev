
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, User, Clock, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const PersonnelManagement = () => {
  const { toast } = useToast();
  const [addStaffOpen, setAddStaffOpen] = useState(false);

  // Sample staff data
  const staff = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      role: 'Senior Attendant',
      status: 'active',
      currentShift: true,
      totalShifts: 145,
      totalSales: 125000.00,
      avgOverShort: 5.25,
      joinDate: '2023-01-15'
    },
    {
      id: 2,
      name: 'Maria Garcia',
      email: 'maria.garcia@email.com',
      phone: '+1 (555) 234-5678',
      role: 'Attendant',
      status: 'active',
      currentShift: true,
      totalShifts: 89,
      totalSales: 78000.00,
      avgOverShort: -2.10,
      joinDate: '2023-03-22'
    },
    {
      id: 3,
      name: 'Ahmed Hassan',
      email: 'ahmed.hassan@email.com',
      phone: '+1 (555) 345-6789',
      role: 'Night Supervisor',
      status: 'active',
      currentShift: false,
      totalShifts: 201,
      totalSales: 195000.00,
      avgOverShort: 8.75,
      joinDate: '2022-08-10'
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@email.com',
      phone: '+1 (555) 456-7890',
      role: 'Attendant',
      status: 'inactive',
      currentShift: false,
      totalShifts: 67,
      totalSales: 52000.00,
      avgOverShort: -1.50,
      joinDate: '2023-06-01'
    }
  ];

  const handleAddStaff = () => {
    toast({
      title: "Staff Added",
      description: "New staff member has been added successfully.",
    });
    setAddStaffOpen(false);
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Personnel Management</h2>
          <p className="text-muted-foreground">Manage staff and track performance</p>
        </div>
        <Dialog open={addStaffOpen} onOpenChange={setAddStaffOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>Enter the details of the new employee</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter email address" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="Enter phone number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" placeholder="e.g., Attendant, Supervisor" />
              </div>
              <Button onClick={handleAddStaff} className="w-full">
                Add Staff Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Staff Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Total Staff</span>
            </div>
            <p className="text-2xl font-bold mt-2">{staff.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Currently Working</span>
            </div>
            <p className="text-2xl font-bold mt-2">{staff.filter(s => s.currentShift).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">Avg Performance</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-green-600">+$2.10</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium">Active Staff</span>
            </div>
            <p className="text-2xl font-bold mt-2">{staff.filter(s => s.status === 'active').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Staff List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {staff.map((member) => (
          <Card key={member.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <CardDescription>{member.role}</CardDescription>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                    {member.status}
                  </Badge>
                  {member.currentShift && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      On Shift
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{member.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phone:</span>
                  <span>{member.phone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Joined:</span>
                  <span>{new Date(member.joinDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-lg font-semibold">{member.totalShifts}</p>
                  <p className="text-xs text-muted-foreground">Total Shifts</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">${(member.totalSales / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-muted-foreground">Total Sales</p>
                </div>
                <div className="text-center">
                  <p className={`text-lg font-semibold ${member.avgOverShort >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {member.avgOverShort >= 0 ? '+' : ''}${member.avgOverShort.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">Avg Over/Short</p>
                </div>
              </div>

              {/* Performance Indicator */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">Performance Trend</span>
                <div className="flex items-center space-x-2">
                  {member.avgOverShort >= 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">Positive</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-600 font-medium">Needs Attention</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View History
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Edit Info
                </Button>
                {!member.currentShift && member.status === 'active' && (
                  <Button size="sm" className="flex-1">
                    Start Shift
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
