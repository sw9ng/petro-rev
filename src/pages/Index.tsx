
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  BarChart3, 
  FileText,
  Fuel,
  UserPlus,
  CreditCard,
  LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { FuelStationDashboard } from "@/components/FuelStationDashboard";
import { PersonnelManagement } from "@/components/PersonnelManagement";
import { ShiftManagement } from "@/components/ShiftManagement";
import { ShiftList } from "@/components/ShiftList";
import { ReportsView } from "@/components/ReportsView";
import { FuelSalesManagement } from "@/components/FuelSalesManagement";
import { CustomerManagement } from "@/components/CustomerManagement";
import { PaymentTracking } from "@/components/PaymentTracking";

const Index = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Giriş Yapınız</CardTitle>
            <CardDescription>Akaryakıt istasyonu yönetim sistemine erişmek için giriş yapın</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.href = '/auth'}>
              Giriş Yap
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Fuel className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Akaryakıt İstasyonu</h1>
                <p className="text-sm text-gray-600">Yönetim Sistemi</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Hoşgeldiniz!</span>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Çıkış</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-white border shadow-sm">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Özet</span>
            </TabsTrigger>
            <TabsTrigger value="shifts" className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Vardiya</span>
            </TabsTrigger>
            <TabsTrigger value="shift-list" className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Liste</span>
            </TabsTrigger>
            <TabsTrigger value="personnel" className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Personel</span>
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Müşteri</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Cari Satış</span>
            </TabsTrigger>
            <TabsTrigger value="fuel" className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <Fuel className="h-4 w-4" />
              <span className="hidden sm:inline">Yakıt</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Rapor</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <FuelStationDashboard />
          </TabsContent>

          <TabsContent value="shifts" className="space-y-6">
            <ShiftManagement />
          </TabsContent>

          <TabsContent value="shift-list" className="space-y-6">
            <ShiftList />
          </TabsContent>

          <TabsContent value="personnel" className="space-y-6">
            <PersonnelManagement />
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <CustomerManagement />
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <PaymentTracking />
          </TabsContent>

          <TabsContent value="fuel" className="space-y-6">
            <FuelSalesManagement />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ReportsView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
