
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
import { Package, Truck } from 'lucide-react';

export const FuelStationDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50">
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
