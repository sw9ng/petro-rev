
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
import { SettingsDialog } from '@/components/SettingsDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DashboardOverview } from '@/components/DashboardOverview';
import { Fuel, Users, BarChart3, Settings, Calculator, ShoppingCart, Truck, Package } from 'lucide-react';
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
                <p className="text-xs text-gray-500">Akaryakıt İstasyonu Yönetim Sistemi</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Hoşgeldiniz!
                <span className="font-medium text-blue-600 ml-1">Premium Üye</span>
              </div>
              <ThemeToggle />
              <SettingsDialog />
              <button
                onClick={signOut}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium"
              >
                Çıkış
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-8 py-3 border-t">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'overview' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calculator className="h-4 w-4" />
              Özet
            </button>
            <button 
              onClick={() => setActiveTab('shifts')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                activeTab === 'shifts' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="h-4 w-4" />
              Vardiya
            </button>
            <button 
              onClick={() => setActiveTab('fuel-sales')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                activeTab === 'fuel-sales' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Fuel className="h-4 w-4" />
              Liste
            </button>
            <button 
              onClick={() => setActiveTab('personnel')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                activeTab === 'personnel' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="h-4 w-4" />
              Personel
            </button>
            <button 
              onClick={() => setActiveTab('customers')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                activeTab === 'customers' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="h-4 w-4" />
              Müşteri
            </button>
            <button 
              onClick={() => setActiveTab('cari-satis')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                activeTab === 'cari-satis' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              Cari Satış
            </button>
            <button 
              onClick={() => setActiveTab('stock')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                activeTab === 'stock' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Package className="h-4 w-4" />
              Stok & Alım
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 text-sm">
              <BarChart3 className="h-4 w-4" />
              Kasa
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 text-sm">
              <Calculator className="h-4 w-4" />
              Muhasebe
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 text-sm">
              <Fuel className="h-4 w-4" />
              Yakıt
            </button>
            <button 
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                activeTab === 'reports' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Rapor
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 text-sm">
              <Settings className="h-4 w-4" />
              Admin
            </button>
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
