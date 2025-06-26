
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DashboardOverview } from '@/components/DashboardOverview';
import { PersonnelManagement } from '@/components/PersonnelManagement';
import { ShiftManagement } from '@/components/ShiftManagement';
import { ShiftList } from '@/components/ShiftList';
import { ReportsView } from '@/components/ReportsView';
import { FuelSalesManagement } from '@/components/FuelSalesManagement';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User } from 'lucide-react';
import Auth from './Auth';

const Index = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = async () => {
    await signOut();
  };

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src="/lovable-uploads/6b443a64-706a-401f-bdc5-fd18b2bcb790.png" 
                  alt="PetroRev Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  PetroRev
                </h1>
                <p className="text-gray-600 text-sm">Akaryakıt İstasyonu Yönetim Sistemi</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg flex-1 sm:flex-none">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700 text-sm font-medium truncate">{user.email}</span>
              </div>
              <Button 
                onClick={handleLogout}
                variant="outline" 
                size="sm"
                className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors whitespace-nowrap"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Çıkış</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-0">
            <div className="bg-white border-b px-4 lg:px-6 pt-4">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-gray-100 p-1 rounded-lg">
                <TabsTrigger 
                  value="dashboard" 
                  className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-xs lg:text-sm px-2 lg:px-4"
                >
                  Pano
                </TabsTrigger>
                <TabsTrigger 
                  value="personnel" 
                  className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-xs lg:text-sm px-2 lg:px-4"
                >
                  Personel
                </TabsTrigger>
                <TabsTrigger 
                  value="shifts" 
                  className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-xs lg:text-sm px-2 lg:px-4"
                >
                  <span className="hidden sm:inline">Vardiya Kaydet</span>
                  <span className="sm:hidden">Kaydet</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="shift-list" 
                  className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-xs lg:text-sm px-2 lg:px-4"
                >
                  <span className="hidden sm:inline">Vardiya Listesi</span>
                  <span className="sm:hidden">Liste</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="fuel-sales" 
                  className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-xs lg:text-sm px-2 lg:px-4"
                >
                  <span className="hidden sm:inline">Akaryakıt</span>
                  <span className="sm:hidden">Yakıt</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="reports" 
                  className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-xs lg:text-sm px-2 lg:px-4"
                >
                  Raporlar
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-4 lg:p-6">
              <TabsContent value="dashboard" className="mt-0">
                <DashboardOverview />
              </TabsContent>

              <TabsContent value="personnel" className="mt-0">
                <PersonnelManagement />
              </TabsContent>

              <TabsContent value="shifts" className="mt-0">
                <ShiftManagement />
              </TabsContent>

              <TabsContent value="shift-list" className="mt-0">
                <ShiftList />
              </TabsContent>

              <TabsContent value="fuel-sales" className="mt-0">
                <FuelSalesManagement />
              </TabsContent>

              <TabsContent value="reports" className="mt-0">
                <ReportsView />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;
