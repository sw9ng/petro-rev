
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FuelSalesManagement } from '@/components/FuelSalesManagement';
import { FuelPurchaseManagement } from '@/components/FuelPurchaseManagement';
import { FuelStockDisplay } from '@/components/FuelStockDisplay';
import { ShiftManagement } from '@/components/ShiftManagement';
import { PersonnelManagement } from '@/components/PersonnelManagement';
import { CustomerManagement } from '@/components/CustomerManagement';
import { ReportsView } from '@/components/ReportsView';
import { PaymentTracking } from '@/components/PaymentTracking';
import { SettingsDialog } from '@/components/SettingsDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FuelProfitCalculator } from '@/components/FuelProfitCalculator';
import { Fuel, Users, BarChart3, Settings, Calculator, ShoppingCart, Truck, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const FuelStationDashboard = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('fuel-sales');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Fuel className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Akaryakıt İstasyonu Yönetimi</h1>
                <p className="text-sm text-gray-500">Hoş geldiniz, {user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <SettingsDialog />
              <button
                onClick={signOut}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="fuel-sales" className="flex items-center gap-2">
              <Fuel className="h-4 w-4" />
              Yakıt Satışları
            </TabsTrigger>
            <TabsTrigger value="fuel-purchases" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Yakıt Alımları
            </TabsTrigger>
            <TabsTrigger value="stock" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Stok Takibi
            </TabsTrigger>
            <TabsTrigger value="shifts" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Vardiyalar
            </TabsTrigger>
            <TabsTrigger value="personnel" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Personel
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Müşteriler
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Raporlar
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Kâr Hesap
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fuel-sales">
            <FuelSalesManagement />
          </TabsContent>

          <TabsContent value="fuel-purchases">
            <FuelPurchaseManagement />
          </TabsContent>

          <TabsContent value="stock">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Stok Takibi
                </CardTitle>
                <CardDescription>
                  Yakıt stoklarınızın anlık durumunu takip edin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FuelStockDisplay />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shifts">
            <ShiftManagement />
          </TabsContent>

          <TabsContent value="personnel">
            <PersonnelManagement />
          </TabsContent>

          <TabsContent value="customers">
            <CustomerManagement />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsView />
          </TabsContent>

          <TabsContent value="calculator">
            <FuelProfitCalculator 
              fuelSalesData={[]}
              dateRange={{
                startDate: new Date(),
                endDate: new Date()
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
