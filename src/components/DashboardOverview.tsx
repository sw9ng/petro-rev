
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FuelStationDashboard } from '@/components/FuelStationDashboard';
import { ShiftManagement } from '@/components/ShiftManagement';
import { PersonnelManagement } from '@/components/PersonnelManagement';
import { CustomerManagement } from '@/components/CustomerManagement';
import { FuelSalesManagement } from '@/components/FuelSalesManagement';
import { ReportsView } from '@/components/ReportsView';
import { SettingsDialog } from '@/components/SettingsDialog';
import { BarChart3, Users, UserCheck, Store, Fuel, FileText, Settings } from 'lucide-react';

export const DashboardOverview = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Akaryakıt İstasyonu Yönetimi</h1>
              <p className="text-gray-600">İstasyonunuzu etkili bir şekilde yönetin</p>
            </div>
            <SettingsDialog />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Özet</span>
            </TabsTrigger>
            <TabsTrigger value="shifts" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Vardiyalar</span>
            </TabsTrigger>
            <TabsTrigger value="personnel" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Personel</span>
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Müşteriler</span>
            </TabsTrigger>
            <TabsTrigger value="fuel-sales" className="flex items-center gap-2">
              <Fuel className="h-4 w-4" />
              <span className="hidden sm:inline">Yakıt Satışları</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Raporlar</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <FuelStationDashboard />
          </TabsContent>

          <TabsContent value="shifts" className="space-y-6">
            <ShiftManagement />
          </TabsContent>

          <TabsContent value="personnel" className="space-y-6">
            <PersonnelManagement />
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <CustomerManagement />
          </TabsContent>

          <TabsContent value="fuel-sales" className="space-y-6">
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
