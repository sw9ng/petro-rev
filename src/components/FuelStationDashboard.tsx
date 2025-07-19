
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
import { Package, Truck, Fuel, Users, Clock, FileText, CreditCard, BarChart3 } from 'lucide-react';

export const FuelStationDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Özet', icon: BarChart3 },
    { id: 'fuel-sales', label: 'Yakıt Satışları', icon: Fuel },
    { id: 'stock', label: 'Stok & Alım', icon: Package },
    { id: 'shifts', label: 'Vardiyalar', icon: Clock },
    { id: 'personnel', label: 'Personel', icon: Users },
    { id: 'customers', label: 'Müşteriler', icon: Users },
    { id: 'cari-satis', label: 'Cari Satış', icon: CreditCard },
    { id: 'reports', label: 'Raporlar', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
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
