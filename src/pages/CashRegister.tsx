import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCompanies } from '@/hooks/useCompanies';
import { CompanyCashManagement } from '@/components/CompanyCashManagement';
import { CompanyAccountsList } from '@/components/CompanyAccountsList';
import { CustomerDetailView } from '@/components/CustomerDetailView';
import { CheckManagement } from '@/components/CheckManagement';
import { Plus, Building2, ArrowLeft, ChevronRight, Users, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCustomerTransactions } from '@/hooks/useCustomerTransactions';
import { formatCurrency } from '@/lib/numberUtils';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CashRegister = () => {
  const { companies, loading, addCompany, error } = useCompanies();
  const { getTotalOutstandingDebt } = useCustomerTransactions();
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'income' | 'expense' | 'accounts' | 'checks'>('income');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCompanyData, setNewCompanyData] = useState({
    name: '',
    description: ''
  });

  const totalOutstandingDebt = getTotalOutstandingDebt();

  const handleCreateCompany = async () => {
    if (!newCompanyData.name.trim()) {
      toast.error("Şirket adı zorunludur.");
      return;
    }

    const { error } = await addCompany({
      name: newCompanyData.name,
      description: newCompanyData.description || undefined
    });

    if (error) {
      if (error.message?.includes('Maksimum 2 şirket')) {
        toast.error("Maksimum 2 şirket oluşturabilirsiniz.");
      } else {
        toast.error("Şirket oluşturulurken bir hata oluştu.");
      }
      return;
    }

    toast.success("Şirket başarıyla oluşturuldu.");
    setNewCompanyData({ name: '', description: '' });
    setIsDialogOpen(false);
  };

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
  };

  const handleBackFromCustomer = () => {
    setSelectedCustomerId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Hata: {error}</div>
      </div>
    );
  }

  // If customer is selected, show customer detail
  if (selectedCustomerId) {
    return <CustomerDetailView customerId={selectedCustomerId} onBack={handleBackFromCustomer} />;
  }

  if (selectedCompany) {
    const company = companies.find(c => c.id === selectedCompany);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedCompany(null)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Geri
            </Button>
            <h2 className="text-2xl font-bold">{company?.name} - Kasa Yönetimi</h2>
          </div>
        </div>
        
        {/* Tahsil Edilmemiş Gelirler Kutusu - Şirket seçildiğinde */}
        {totalOutstandingDebt > 0 && (
          <Card className="border-orange-200 bg-orange-50 max-w-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-orange-800 text-lg">
                <AlertCircle className="h-4 w-4" />
                <span>Tahsil Edilmemiş Gelirler</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-orange-800">
                {formatCurrency(totalOutstandingDebt)}
              </div>
              <p className="text-xs text-orange-600 mt-1">
                Müşterilerden tahsil edilmemiş borçlar
              </p>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="income">Gelir Faturaları</TabsTrigger>
            <TabsTrigger value="expense">Gider Faturaları</TabsTrigger>
            <TabsTrigger value="accounts">Cari Listesi</TabsTrigger>
            <TabsTrigger value="checks">Çek Yönetimi</TabsTrigger>
          </TabsList>

          <TabsContent value="income" className="space-y-4">
            <CompanyCashManagement companyId={selectedCompany} type="income" />
          </TabsContent>

          <TabsContent value="expense" className="space-y-4">
            <CompanyCashManagement companyId={selectedCompany} type="expense" />
          </TabsContent>

          <TabsContent value="accounts" className="space-y-4">
            <CompanyAccountsList companyId={selectedCompany} onCustomerSelect={handleCustomerSelect} />
          </TabsContent>

          <TabsContent value="checks" className="space-y-4">
            <CheckManagement companyId={selectedCompany} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Kasa Yönetimi
        </h2>
        <p className="text-gray-600 mt-2">Şirketlerinizin gelir ve gider faturalarını takip edin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {companies.map(company => (
          <Card key={company.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedCompany(company.id)}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-500" />
                <span>{company.name}</span>
              </CardTitle>
              <CardDescription>
                {company.description || "Şirket açıklaması bulunmuyor."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Oluşturulma: {new Date(company.created_at).toLocaleDateString('tr-TR')}
              </span>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                Yönet <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}

        {companies.length < 2 && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Card className="border-dashed hover:shadow-md transition-shadow cursor-pointer flex items-center justify-center min-h-[180px]">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <Plus className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-lg font-medium text-blue-600">Yeni Şirket Oluştur</p>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Gelir ve giderlerinizi takip etmek için yeni bir şirket oluşturun
                  </p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Yeni Şirket Oluştur</DialogTitle>
                <DialogDescription>
                  Finansal işlemlerinizi takip etmek için bir şirket oluşturun. Maksimum 2 şirket oluşturabilirsiniz.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Şirket Adı</Label>
                  <Input 
                    id="company-name" 
                    value={newCompanyData.name}
                    onChange={(e) => setNewCompanyData({...newCompanyData, name: e.target.value})}
                    placeholder="ABC Şirketi"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-desc">Açıklama (Opsiyonel)</Label>
                  <Textarea 
                    id="company-desc" 
                    value={newCompanyData.description}
                    onChange={(e) => setNewCompanyData({...newCompanyData, description: e.target.value})}
                    placeholder="Şirketin faaliyet alanı veya açıklama"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>İptal</Button>
                <Button onClick={handleCreateCompany}>Oluştur</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {companies.length === 2 && (
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <p className="text-gray-500 text-center">
                Maksimum şirket sayısına ulaştınız (2/2).
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CashRegister;
