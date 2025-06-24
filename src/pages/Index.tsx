
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DashboardOverview } from '@/components/DashboardOverview';
import { ShiftManagement } from '@/components/ShiftManagement';
import { PersonnelManagement } from '@/components/PersonnelManagement';
import { ReportsView } from '@/components/ReportsView';
import { Fuel, Users, BarChart3, Clock } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Fuel className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Akaryakıt Pro</h1>
                <p className="text-sm text-gray-600">Vardiya Yönetim Sistemi</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                İstasyon Aktif
              </Badge>
              <Button variant="outline">Ayarlar</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Pano</span>
            </TabsTrigger>
            <TabsTrigger value="shifts" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Vardiyalar</span>
            </TabsTrigger>
            <TabsTrigger value="personnel" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Personel</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Raporlar</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="shifts">
            <ShiftManagement />
          </TabsContent>

          <TabsContent value="personnel">
            <PersonnelManagement />
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
