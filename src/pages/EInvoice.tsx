
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCompanies } from '@/hooks/useCompanies';
import { EInvoiceManagement } from '@/components/EInvoiceManagement';
import { ArrowLeft, FileText } from 'lucide-react';

const EInvoice = () => {
  const { companies, loading, error } = useCompanies();
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

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

  if (selectedCompany) {
    const company = companies.find(c => c.id === selectedCompany);
    
    return (
      <div className="space-y-6">
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
          <h2 className="text-2xl font-bold">{company?.name} - E-Fatura Yönetimi</h2>
        </div>
        
        <EInvoiceManagement companyId={selectedCompany} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
          E-Fatura Yönetimi
        </h2>
        <p className="text-gray-600 mt-2">Şirketlerinizin e-faturalarını oluşturun ve yönetin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {companies.map(company => (
          <Card key={company.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedCompany(company.id)}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-green-500" />
                <span>{company.name}</span>
              </CardTitle>
              <CardDescription>
                {company.description || "E-fatura işlemlerini yönetin"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Oluşturulma: {new Date(company.created_at).toLocaleDateString('tr-TR')}
              </span>
              <Button variant="ghost" size="sm">E-Fatura Yönet</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EInvoice;
