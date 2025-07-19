
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
        </div>
      </div>

      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8 py-3">
            <button className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-md text-sm font-medium">
              <Calculator className="h-4 w-4" />
              Özet
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 text-sm">
              <Users className="h-4 w-4" />
              Vardiya
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 text-sm">
              <Fuel className="h-4 w-4" />
              Liste
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 text-sm">
              <Users className="h-4 w-4" />
              Personel
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 text-sm">
              <Users className="h-4 w-4" />
              Müşteri
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 text-sm">
              <ShoppingCart className="h-4 w-4" />
              Cari Satış
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 text-sm">
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
            <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 text-sm">
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

    </div>
  );
};
