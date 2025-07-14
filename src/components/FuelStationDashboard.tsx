import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Fuel, GasPump, Package, Users, Cloud } from 'lucide-react';
import { useFuelSales } from '@/hooks/useFuelSales';
import { useCompanies } from '@/hooks/useCompanies';
import { usePersonnel } from '@/hooks/usePersonnel';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const FuelStationDashboard = () => {
  const navigate = useNavigate();
  const { fuelSales, isLoading: isFuelSalesLoading } = useFuelSales();
  const { companies, isLoading: isCompaniesLoading } = useCompanies();
  const { personnel, isLoading: isPersonnelLoading } = usePersonnel();

  const [totalSales, setTotalSales] = useState(0);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [totalPersonnel, setTotalPersonnel] = useState(0);

  useEffect(() => {
    if (!isFuelSalesLoading && fuelSales) {
      const sum = fuelSales.reduce((acc, sale) => acc + sale.total_amount, 0);
      setTotalSales(sum);
    }

    if (!isCompaniesLoading && companies) {
      setTotalCompanies(companies.length);
    }

    if (!isPersonnelLoading && personnel) {
      setTotalPersonnel(personnel.length);
    }
  }, [fuelSales, companies, personnel, isFuelSalesLoading, isCompaniesLoading, isPersonnelLoading]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Yakıt İstasyonu Yönetim Paneli</h2>
        <p className="text-sm lg:text-base text-gray-600">İstasyona genel bakış ve hızlı erişim</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium text-gray-900 flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span>Toplam Satış</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">{totalSales.toFixed(2)} ₺</div>
            <p className="text-sm text-gray-500">Tüm zamanlardaki toplam yakıt satışları</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium text-gray-900 flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Toplam Personel</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">{totalPersonnel}</div>
            <p className="text-sm text-gray-500">İstasyonda çalışan toplam personel</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium text-gray-900 flex items-center space-x-2">
                <Package className="h-5 w-5 text-orange-600" />
                <span>Toplam Şirket</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">{totalCompanies}</div>
            <p className="text-sm text-gray-500">İstasyonda kayıtlı toplam şirket</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border cursor-pointer hover:shadow-md transition-shadow" 
              onClick={() => navigate('/petronet-sync')}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium text-gray-900 flex items-center space-x-2">
                <Cloud className="h-5 w-5 text-blue-600" />
                <span>Petronet Senkronizasyon</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Petronet sisteminden otomatik dosya çekme
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Ayarları Yönet
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/fuel-sales')}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium text-gray-900 flex items-center space-x-2">
                <Fuel className="h-5 w-5 text-yellow-600" />
                <span>Yakıt Satışları</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Yakıt satışlarını görüntüle, ekle ve düzenle
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Satışları Yönet
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm border cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/shift-management')}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium text-gray-900 flex items-center space-x-2">
                <GasPump className="h-5 w-5 text-red-600" />
                <span>Vardiya Yönetimi</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Vardiya bilgilerini yönet, yeni vardiya oluştur
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Vardiyaları Yönet
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FuelStationDashboard;
