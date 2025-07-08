
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Trash2, Edit, TrendingUp, TrendingDown } from 'lucide-react';
import { useCompanies } from '@/hooks/useCompanies';
import { useInvoices } from '@/hooks/useInvoices';

interface CompanyManagementProps {
  onCompanySelect: (companyId: string) => void;
}

export const CompanyManagement = ({ onCompanySelect }: CompanyManagementProps) => {
  const { companies, isLoading, createCompany, deleteCompany } = useCompanies();
  const [newCompany, setNewCompany] = useState({ name: '', description: '' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateCompany = async () => {
    if (!newCompany.name.trim()) return;
    
    await createCompany.mutateAsync(newCompany);
    setNewCompany({ name: '', description: '' });
    setIsDialogOpen(false);
  };

  const CompanyCard = ({ company }: { company: any }) => {
    const { incomeInvoices, expenseInvoices } = useInvoices(company.id);
    
    const totalIncome = incomeInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
    const totalExpense = expenseInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
    const netProfit = totalIncome - totalExpense;

    return (
      <Card className="hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">{company.name}</CardTitle>
                <CardDescription className="text-sm">{company.description || 'Açıklama yok'}</CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteCompany.mutate(company.id)}
              className="hover:bg-red-50 hover:border-red-200"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-sm font-medium text-green-600">Gelir</div>
              <div className="text-lg font-bold text-green-700">₺{totalIncome.toLocaleString()}</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
              <div className="text-sm font-medium text-red-600">Gider</div>
              <div className="text-lg font-bold text-red-700">₺{totalExpense.toLocaleString()}</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-600">Net</div>
              <div className={`text-lg font-bold ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                ₺{netProfit.toLocaleString()}
              </div>
            </div>
          </div>
          <Button 
            onClick={() => onCompanySelect(company.id)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Kasa Yönetimi
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Şirket Yönetimi</h2>
          <p className="text-gray-600">Şirketlerinizi yönetin ve kasalarını takip edin</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={companies.length >= 2}
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Şirket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Şirket Oluştur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="company-name">Şirket Adı</Label>
                <Input
                  id="company-name"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  placeholder="Şirket adını giriniz"
                />
              </div>
              <div>
                <Label htmlFor="company-description">Açıklama</Label>
                <Textarea
                  id="company-description"
                  value={newCompany.description}
                  onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                  placeholder="Şirket açıklaması (opsiyonel)"
                />
              </div>
              <Button onClick={handleCreateCompany} className="w-full">
                Oluştur
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <Badge variant="outline">{companies.length}/2 Şirket</Badge>
        {companies.length >= 2 && (
          <Badge variant="destructive">Maksimum limit</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {companies.map((company) => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </div>

      {companies.length === 0 && (
        <Card className="text-center p-8">
          <CardHeader>
            <Building2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <CardTitle>Henüz şirket oluşturmadınız</CardTitle>
            <CardDescription>
              İlk şirketinizi oluşturun ve kasa yönetimi başlayın
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};
