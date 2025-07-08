
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Building2, Crown, Briefcase, TrendingUp, Calendar } from 'lucide-react';
import { useCompanies } from '@/hooks/useCompanies';
import { useToast } from '@/hooks/use-toast';
import { CompanyCashManagement } from './CompanyCashManagement';

export const CompanyManagement = () => {
  const { companies, loading, addCompany } = useCompanies();
  const { toast } = useToast();
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Hata",
        description: "Şirket adı gereklidir.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await addCompany(formData);
    
    if (error) {
      const errorMessage = typeof error === 'string' ? error : error.message || 'Şirket oluşturulurken bir hata oluştu.';
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Başarılı",
        description: "Şirket başarıyla oluşturuldu.",
      });
      setFormData({ name: '', description: '' });
      setIsDialogOpen(false);
    }
  };

  const selectedCompanyData = companies.find(c => c.id === selectedCompany);

  if (selectedCompany && selectedCompanyData) {
    return (
      <CompanyCashManagement 
        company={selectedCompanyData}
        onBack={() => setSelectedCompany(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <span>Kasa Yönetimi</span>
              <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            </h2>
            <p className="text-sm text-gray-600">Şirket kasalarınızı ve faturalarınızı yönetin</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              disabled={companies.length >= 2}
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Şirket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                <span>Yeni Şirket Oluştur</span>
              </DialogTitle>
              <DialogDescription>
                Maksimum 2 şirket oluşturabilirsiniz. ({companies.length}/2)
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Şirket Adı *
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Şirket adını giriniz"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Şirket açıklaması (opsiyonel)"
                  rows={3}
                />
              </div>
              <div className="flex space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Oluştur
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {companies.length >= 2 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-amber-600" />
            <p className="text-sm text-amber-800">
              <strong>Şirket Limiti:</strong> Maksimum 2 şirket limitine ulaştınız. Yeni şirket oluşturmak için mevcut şirketlerden birini silebilirsiniz.
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="shadow-sm border animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : companies.length === 0 ? (
        <Card className="shadow-sm border">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz şirket yok</h3>
            <p className="text-gray-600 mb-6">İlk şirketinizi oluşturmak için "Yeni Şirket" butonuna tıklayın.</p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  İlk Şirketini Oluştur
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5 text-purple-600" />
                    <span>Yeni Şirket Oluştur</span>
                  </DialogTitle>
                  <DialogDescription>
                    Maksimum 2 şirket oluşturabilirsiniz. ({companies.length}/2)
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Şirket Adı *
                    </label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Şirket adını giriniz"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Açıklama
                    </label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Şirket açıklaması (opsiyonel)"
                      rows={3}
                    />
                  </div>
                  <div className="flex space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1"
                    >
                      İptal
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      Oluştur
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {companies.map((company) => (
            <Card key={company.id} className="shadow-sm border hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {company.name}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {new Date(company.created_at).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                    Aktif
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {company.description && (
                  <CardDescription className="text-sm text-gray-600 mb-4">
                    {company.description}
                  </CardDescription>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>Fatura Takibi</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => setSelectedCompany(company.id)}
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    Kasaya Git
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
