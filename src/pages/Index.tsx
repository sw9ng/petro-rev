
import { useState, useEffect } from 'react';
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
  Crown,
  Banknote,
  Calculator
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FuelStationDashboard } from "@/components/FuelStationDashboard";
import { PersonnelManagement } from "@/components/PersonnelManagement";
import { ShiftManagement } from "@/components/ShiftManagement";
import { ShiftList } from "@/components/ShiftList";
import { ReportsView } from "@/components/ReportsView";
import { FuelSalesManagement } from "@/components/FuelSalesManagement";
import { CustomerManagement } from "@/components/CustomerManagement";
import { PaymentTracking } from "@/components/PaymentTracking";
import { AdminPanel } from "@/components/AdminPanel";
import CashRegister from "@/pages/CashRegister";
import Accounting from "@/pages/Accounting";

const Index = () => {
  const { user, signOut, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  // Show loading while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Fuel className="h-8 w-8 text-white" />
          </div>
          <p className="text-lg text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Admin kontrol - sadece belirli kullanıcı ID'si admin olabilir
  const isAdmin = user?.id === '3970497f-f994-4cdc-9e56-a319a84ac04b';

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Fuel className="h-8 w-8 text-white" />
            </div>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <CardTitle className="text-xl sm:text-2xl">PetroRev Premium</CardTitle>
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <Crown className="h-3 w-3 mr-1" />
                2025
              </Badge>
            </div>
            <CardDescription className="text-sm sm:text-base">
              Premium akaryakıt istasyonu yönetim sistemine giriş yapın
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Button 
              onClick={() => navigate('/auth')}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-base sm:text-lg py-3 sm:py-6"
            >
              <Star className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Premium Girişi
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/landing')}
              className="w-full border-gray-300 hover:bg-gray-50"
            >
              Ürün Bilgisi
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Fuel className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <h1 className="text-base sm:text-xl font-bold text-gray-900">PetroRev Premium</h1>
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs">
                    <Crown className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                    2025
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Akaryakıt İstasyonu Yönetim Sistemi</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="text-right hidden sm:block">
                <span className="text-sm font-medium text-gray-900">Hoşgeldiniz!</span>
                <div className="text-xs text-gray-500">Premium Üye</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-1 sm:space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-xs sm:text-sm"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Çıkış</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-2 sm:px-4 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto">
            <TabsList className={`flex w-max min-w-full ${isAdmin ? 'grid-cols-11' : 'grid-cols-10'} bg-white border shadow-sm rounded-xl p-1 gap-1`}>
              <TabsTrigger value="dashboard" className="flex items-center space-x-1 sm:space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">
                <LayoutDashboard className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Özet</span>
              </TabsTrigger>
              <TabsTrigger value="shifts" className="flex items-center space-x-1 sm:space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Vardiya</span>
              </TabsTrigger>
              <TabsTrigger value="shift-list" className="flex items-center space-x-1 sm:space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Liste</span>
              </TabsTrigger>
              <TabsTrigger value="personnel" className="flex items-center space-x-1 sm:space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Personel</span>
              </TabsTrigger>
              <TabsTrigger value="customers" className="flex items-center space-x-1 sm:space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">
                <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Müşteri</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center space-x-1 sm:space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">
                <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Cari Satış</span>
              </TabsTrigger>
              <TabsTrigger value="cash-register" className="flex items-center space-x-1 sm:space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">
                <Banknote className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Kasa</span>
              </TabsTrigger>
              <TabsTrigger value="accounting" className="flex items-center space-x-1 sm:space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">
                <Calculator className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Muhasebe</span>
              </TabsTrigger>
              <TabsTrigger value="fuel" className="flex items-center space-x-1 sm:space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">
                <Fuel className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Yakıt</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center space-x-1 sm:space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Rapor</span>
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="admin" className="flex items-center space-x-1 sm:space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">
                  <Crown className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Admin</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-4 sm:space-y-6">
            <FuelStationDashboard />
          </TabsContent>

          <TabsContent value="shifts" className="space-y-4 sm:space-y-6">
            <ShiftManagement />
          </TabsContent>

          <TabsContent value="shift-list" className="space-y-4 sm:space-y-6">
            <ShiftList />
          </TabsContent>

          <TabsContent value="personnel" className="space-y-4 sm:space-y-6">
            <PersonnelManagement />
          </TabsContent>

          <TabsContent value="customers" className="space-y-4 sm:space-y-6">
            <CustomerManagement />
          </TabsContent>

          <TabsContent value="payments" className="space-y-4 sm:space-y-6">
            <PaymentTracking />
          </TabsContent>

          <TabsContent value="cash-register" className="space-y-4 sm:space-y-6">
            {user && <CashRegister />}
          </TabsContent>

          <TabsContent value="accounting" className="space-y-4 sm:space-y-6">
            <Accounting />
          </TabsContent>

          <TabsContent value="fuel" className="space-y-4 sm:space-y-6">
            <FuelSalesManagement />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4 sm:space-y-6">
            <ReportsView />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin" className="space-y-4 sm:space-y-6">
              <AdminPanel />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
