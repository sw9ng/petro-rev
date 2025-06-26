
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto p-6">
        {/* Elegant Header */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  PetroRev
                </h1>
                <p className="text-gray-500 text-sm mt-1">Akaryakıt İstasyonu Yönetim Sistemi</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700 font-medium">{user.email}</span>
              </div>
              <Button 
                onClick={handleLogout}
                variant="outline" 
                size="sm"
                className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Çıkış</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content with Enhanced Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-0">
            <div className="bg-gray-50 border-b border-gray-200 px-6 pt-6">
              <TabsList className="grid w-full grid-cols-6 bg-white shadow-sm border border-gray-200 rounded-lg p-1">
                <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-md transition-all">
                  Pano
                </TabsTrigger>
                <TabsTrigger value="personnel" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-md transition-all">
                  Personel
                </TabsTrigger>
                <TabsTrigger value="shifts" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-md transition-all">
                  Vardiya Kaydet
                </TabsTrigger>
                <TabsTrigger value="shift-list" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-md transition-all">
                  Vardiya Listesi
                </TabsTrigger>
                <TabsTrigger value="fuel-sales" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-md transition-all">
                  Akaryakıt Satışı
                </TabsTrigger>
                <TabsTrigger value="reports" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-md transition-all">
                  Raporlar
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
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
