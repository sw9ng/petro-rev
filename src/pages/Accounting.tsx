
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Building2, 
  Plus, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  Calculator,
  Users,
  Eye,
  Edit,
  Trash2,
  Settings,
  Link as LinkIcon
} from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";
import { CompanyAccountsList } from "@/components/CompanyAccountsList";
import { CompanyCashManagement } from "@/components/CompanyCashManagement";
import { UyumsoftIntegration } from "@/components/UyumsoftIntegration";
import { ThemeToggle } from "@/components/ThemeToggle";

const Accounting = () => {
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [companyFormData, setCompanyFormData] = useState({
    name: "",
    description: ""
  });

  const { companies, createCompany, isLoading } = useCompanies();

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    createCompany.mutate(companyFormData);
    setIsCompanyDialogOpen(false);
    setCompanyFormData({ name: "", description: "" });
  };

  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.name).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
                <Calculator className="h-8 w-8 text-blue-600" />
                <span>Muhasebe Modülü</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                E-Fatura, cari hesap ve finansal yönetim sistemi - Uyumsoft entegrasyonu ile
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Dialog open={isCompanyDialogOpen} onOpenChange={setIsCompanyDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Şirket
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Yeni Şirket Oluştur</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateCompany} className="space-y-4">
                    <div>
                      <Label htmlFor="company-name">Şirket Adı *</Label>
                      <Input
                        id="company-name"
                        value={companyFormData.name}
                        onChange={(e) => setCompanyFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="company-description">Açıklama</Label>
                      <Textarea
                        id="company-description"
                        value={companyFormData.description}
                        onChange={(e) => setCompanyFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsCompanyDialogOpen(false)}>
                        İptal
                      </Button>
                      <Button type="submit">Kaydet</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Toplam Şirket</p>
                  <p className="text-3xl font-bold">{totalCompanies}</p>
                </div>
                <Building2 className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Aktif Şirket</p>
                  <p className="text-3xl font-bold">{activeCompanies}</p>
                </div>
                <TrendingUp className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">E-Fatura</p>
                  <p className="text-3xl font-bold">0</p>
                </div>
                <FileText className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">E-Arşiv</p>
                  <p className="text-3xl font-bold">0</p>
                </div>
                <TrendingDown className="h-12 w-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Company Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Şirketlerim</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Yükleniyor...</div>
            ) : companies.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Henüz şirket oluşturmadınız. İlk şirketinizi oluşturun.
                </p>
                <Button onClick={() => setIsCompanyDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  İlk Şirketimi Oluştur
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companies.map((company) => (
                  <Card 
                    key={company.id} 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedCompany === company.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : ''
                    }`}
                    onClick={() => setSelectedCompany(company.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{company.name}</h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            {company.description || "Açıklama yok"}
                          </p>
                          <Badge variant="outline" className="mt-2">
                            {new Date(company.created_at).toLocaleDateString("tr-TR")}
                          </Badge>
                        </div>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company Management */}
        {selectedCompany && (
          <Tabs defaultValue="accounts" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="accounts" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Cari Hesaplar</span>
              </TabsTrigger>
              <TabsTrigger value="e-invoice" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>E-Fatura</span>
              </TabsTrigger>
              <TabsTrigger value="e-archive" className="flex items-center space-x-2">
                <TrendingDown className="h-4 w-4" />
                <span>E-Arşiv</span>
              </TabsTrigger>
              <TabsTrigger value="integration" className="flex items-center space-x-2">
                <LinkIcon className="h-4 w-4" />
                <span>Uyumsoft</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Raporlar</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="accounts">
              <CompanyAccountsList companyId={selectedCompany} />
            </TabsContent>

            <TabsContent value="e-invoice">
              <CompanyCashManagement companyId={selectedCompany} type="income" />
            </TabsContent>

            <TabsContent value="e-archive">
              <CompanyCashManagement companyId={selectedCompany} type="expense" />
            </TabsContent>

            <TabsContent value="integration">
              <UyumsoftIntegration />
            </TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Mali Raporlar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">
                      Rapor modülü yakında eklenecek
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Accounting;
