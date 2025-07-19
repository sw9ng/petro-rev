
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FuelSalesManagement } from '@/components/FuelSalesManagement';
import { FuelPurchaseManagement } from '@/components/FuelPurchaseManagement';
import { FuelStockDisplay } from '@/components/FuelStockDisplay';
import { ShiftManagement } from '@/components/ShiftManagement';
import { PersonnelManagement } from '@/components/PersonnelManagement';
import { CustomerManagement } from '@/components/CustomerManagement';
import { ReportsView } from '@/components/ReportsView';
import { PaymentTracking } from '@/components/PaymentTracking';
import { DashboardOverview } from '@/components/DashboardOverview';
import { Fuel, Users, BarChart3, Calculator, ShoppingCart, Truck, Package, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const FuelStationDashboard = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Fuel className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">PetroRev Premium</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Hoşgeldiniz!
                <span className="font-medium text-blue-600 ml-1">Premium Üye</span>
              </div>
              <button
                onClick={signOut}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <DashboardOverview />}
        {activeTab === 'fuel-sales' && <FuelSalesManagement />}
        {activeTab === 'stock' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Mevcut Stok Durumu
                </CardTitle>
                <CardDescription>
                  Yakıt stoklarınızın anlık durumunu görün
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FuelStockDisplay />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Yakıt Alımları
                </CardTitle>
                <CardDescription>
                  Yeni yakıt alımı yapın ve stok geçmişini görün
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FuelPurchaseManagement />
              </CardContent>
            </Card>
          </div>
        )}
        {activeTab === 'shifts' && <ShiftManagement />}
        {activeTab === 'personnel' && <PersonnelManagement />}
        {activeTab === 'customers' && <CustomerManagement />}
        {activeTab === 'cari-satis' && <PaymentTracking />}
        {activeTab === 'reports' && <ReportsView />}
      </div>
    </div>
  );
};
