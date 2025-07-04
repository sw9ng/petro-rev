
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  LogOut,
  Star,
  Crown
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
import { AdminPanel } from "@/components/AdminPanel";

const Index = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Admin kontrol - sadece belirli kullanıcı ID'si admin olabilir
  const isAdmin = user?.id === '3970497f-f994-4cdc-9e56-a319a84ac04b';

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Fuel className="h-8 w-8 text-white" />
            </div>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <CardTitle className="text-2xl">PetroRev Premium</CardTitle>
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <Crown className="h-3 w-3 mr-1" />
                2025
              </Badge>
            </div>
            <CardDescription className="text-base">
              Premium akaryakıt istasyonu yönetim sistemine giriş yapın
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Button 
              onClick={() => window.location.href = '/auth'}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
            >
              <Star className="mr-2 h-5 w-5" />
              Premium Girişi
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/landing'}
              className="w-full border-gray-300 hover:bg-gray-50"
            >
              Ürün Bilgisi
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Fuel className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold text-gray-900">PetroRev Premium</h1>
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs">
                    <Crown className="h-3 w-3 mr-1" />
                    2025
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">Akaryakıt İstasyonu Yönetim Sistemi</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-sm font-medium text-gray-900">Hoşgeldiniz!</span>
                <div className="text-xs text-gray-500">Premium Üye</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
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
          <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-4 lg:grid-cols-9' : 'grid-cols-4 lg:grid-cols-8'} bg-white border shadow-sm rounded-xl p-1`}>
            <TabsTrigger value="dashboard" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Özet</span>
            </TabsTrigger>
            <TabsTrigger value="shifts" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Vardiya</span>
            </TabsTrigger>
            <TabsTrigger value="shift-list" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Liste</span>
            </TabsTrigger>
            <TabsTrigger value="personnel" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Personel</span>
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Müşteri</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Cari Satış</span>
            </TabsTrigger>
            <TabsTrigger value="fuel" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all">
              <Fuel className="h-4 w-4" />
              <span className="hidden sm:inline">Yakıt</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Rapor</span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all">
                <Crown className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </TabsTrigger>
            )}
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

          {isAdmin && (
            <TabsContent value="admin" className="space-y-6">
              <AdminPanel />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
