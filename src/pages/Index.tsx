
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardOverview } from '@/components/DashboardOverview';
import { PersonnelManagement } from '@/components/PersonnelManagement';
import { ShiftManagement } from '@/components/ShiftManagement';
import { ShiftList } from '@/components/ShiftList';
import { ReportsView } from '@/components/ReportsView';
import { FuelSalesManagement } from '@/components/FuelSalesManagement';
import { useAuth } from '@/contexts/AuthContext';
import { Auth } from './Auth';

const Index = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {profile?.station_name || 'Akaryakıt İstasyonu'} Yönetim Paneli
          </h1>
          <p className="text-gray-600 mt-2">Hoş geldiniz, {profile?.full_name}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Pano</TabsTrigger>
            <TabsTrigger value="personnel">Personel</TabsTrigger>
            <TabsTrigger value="shifts">Vardiya Kaydet</TabsTrigger>
            <TabsTrigger value="shift-list">Vardiya Listesi</TabsTrigger>
            <TabsTrigger value="fuel-sales">Akaryakıt Satışı</TabsTrigger>
            <TabsTrigger value="reports">Raporlar</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="personnel">
            <PersonnelManagement />
          </TabsContent>

          <TabsContent value="shifts">
            <ShiftManagement />
          </TabsContent>

          <TabsContent value="shift-list">
            <ShiftList />
          </TabsContent>

          <TabsContent value="fuel-sales">
            <FuelSalesManagement />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
