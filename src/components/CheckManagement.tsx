
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileCheck, Plus, Upload, Trash2, Eye, Calendar, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/numberUtils';
import { useChecks } from '@/hooks/useChecks';

interface CheckManagementProps {
  companyId: string;
}

export const CheckManagement = ({ companyId }: CheckManagementProps) => {
  const { 
    payableChecks, 
    receivableChecks, 
    totalPayableAmount, 
    totalReceivableAmount,
    loading, 
    addCheck, 
    updateCheckStatus, 
    deleteCheck 
  } = useChecks(companyId);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    check_type: 'payable' as 'payable' | 'receivable',
    amount: '',
    due_date: '',
    issue_date: '',
    description: '',
    bank_name: '',
    check_number: '',
    drawer_name: '',
    given_company: '',
    image: null as File | null
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Dosya boyutu 5MB'dan küçük olmalıdır.");
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error("Lütfen bir resim dosyası seçin.");
        return;
      }
      
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.due_date || !formData.check_number) {
      toast.error("Tutar, çek numarası ve vade tarihi zorunludur.");
      return;
    }

    const checkData = {
      company_id: companyId,
      check_type: formData.check_type,
      amount: parseFloat(formData.amount),
      due_date: formData.due_date,
      issue_date: formData.issue_date || undefined,
      description: formData.description || undefined,
      bank_name: formData.bank_name || undefined,
      check_number: formData.check_number,
      drawer_name: formData.drawer_name || undefined,
      given_company: formData.given_company || undefined,
      image_url: formData.image ? URL.createObjectURL(formData.image) : undefined
    };

    const { error } = await addCheck(checkData);
    
    if (!error) {
      setFormData({
        check_type: 'payable',
        amount: '',
        due_date: '',
        issue_date: '',
        description: '',
        bank_name: '',
        check_number: '',
        drawer_name: '',
        given_company: '',
        image: null
      });
      setIsDialogOpen(false);
    }
  };

  const handleDeleteCheck = async (checkId: string) => {
    await deleteCheck(checkId);
  };

  const handleMarkAsPaid = async (checkId: string) => {
    await updateCheckStatus(checkId, 'paid');
  };

  const renderCheckList = (checks: any[], title: string, icon: React.ReactNode, emptyMessage: string) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {icon}
          <span>{title}</span>
        </CardTitle>
        <CardDescription>
          {checks.filter(c => c.status === 'pending').length} adet bekleyen çek
        </CardDescription>
      </CardHeader>
      <CardContent>
        {checks.length > 0 ? (
          <div className="space-y-3">
            {checks.map((check) => (
              <div key={check.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{formatCurrency(check.amount)}</span>
                        <Badge 
                          variant={check.status === 'paid' ? 'default' : 'destructive'}
                          className={check.status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {check.status === 'paid' ? 'Ödendi' : check.status === 'cancelled' ? 'İptal' : 'Bekliyor'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>Vade: {new Date(check.due_date).toLocaleDateString('tr-TR')}</span>
                      </div>
                      {check.issue_date && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                          <span>Verildiği Tarih: {new Date(check.issue_date).toLocaleDateString('tr-TR')}</span>
                        </div>
                      )}
                      {check.check_number && (
                        <p className="text-sm text-gray-500 mt-1">Çek No: {check.check_number}</p>
                      )}
                      {check.given_company && (
                        <p className="text-sm text-gray-500 mt-1">Verilen Şirket: {check.given_company}</p>
                      )}
                      {check.description && (
                        <p className="text-sm text-gray-600 mt-1">{check.description}</p>
                      )}
                      {check.bank_name && (
                        <p className="text-sm text-gray-500 mt-1">Banka: {check.bank_name}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {check.image_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedImage(check.image_url)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {check.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsPaid(check.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          Ödendi
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCheck(check.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyMessage}</h3>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Çekler yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <FileCheck className="h-5 w-5 text-blue-500" />
            <span>Çek Yönetimi</span>
          </h3>
          <p className="text-sm text-gray-600">Ödenecek ve alacak çeklerinizi takip edin</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Çek Ekle</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni Çek Ekle</DialogTitle>
              <DialogDescription>
                Çek bilgilerini ve fotoğrafını ekleyin
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto px-1">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="check_type">Çek Türü *</Label>
                  <Select 
                    value={formData.check_type} 
                    onValueChange={(value: 'payable' | 'receivable') => 
                      setFormData(prev => ({ ...prev, check_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Çek türü seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payable">Ödenecek Çek</SelectItem>
                      <SelectItem value="receivable">Alacak Çek</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="check_number">Çek Numarası *</Label>
                  <Input
                    id="check_number"
                    value={formData.check_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, check_number: e.target.value }))}
                    placeholder="Çek numarası"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Tutar *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issue_date">Verildiği Tarih</Label>
                  <Input
                    id="issue_date"
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Vade Tarihi *</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="given_company">Verilen Şirket</Label>
                  <Input
                    id="given_company"
                    value={formData.given_company}
                    onChange={(e) => setFormData(prev => ({ ...prev, given_company: e.target.value }))}
                    placeholder="Şirket adı"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_name">Banka Adı</Label>
                  <Input
                    id="bank_name"
                    value={formData.bank_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
                    placeholder="Banka adı"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="drawer_name">Çek Sahibi</Label>
                  <Input
                    id="drawer_name"
                    value={formData.drawer_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, drawer_name: e.target.value }))}
                    placeholder="Çek sahibinin adı"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Açıklama</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Çek açıklaması"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Çek Fotoğrafı</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {formData.image && (
                    <p className="text-sm text-green-600">
                      Dosya seçildi: {formData.image.name}
                    </p>
                  )}
                </div>
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    İptal
                  </Button>
                  <Button type="submit">Ekle</Button>
                </DialogFooter>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-800 text-lg flex items-center space-x-2">
              <ArrowUpCircle className="h-4 w-4" />
              <span>Toplam Ödenecek</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">
              {formatCurrency(totalPayableAmount)}
            </div>
            <p className="text-sm text-red-600 mt-1">
              {payableChecks.filter(c => c.status === 'pending').length} adet ödenmemiş çek
            </p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-800 text-lg flex items-center space-x-2">
              <ArrowDownCircle className="h-4 w-4" />
              <span>Toplam Alacak</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">
              {formatCurrency(totalReceivableAmount)}
            </div>
            <p className="text-sm text-green-600 mt-1">
              {receivableChecks.filter(c => c.status === 'pending').length} adet tahsil edilmemiş çek
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payable" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="payable">Ödenecek Çekler</TabsTrigger>
          <TabsTrigger value="receivable">Alacak Çekler</TabsTrigger>
        </TabsList>

        <TabsContent value="payable" className="space-y-4">
          {renderCheckList(
            payableChecks, 
            "Ödenecek Çekler", 
            <ArrowUpCircle className="h-5 w-5 text-red-500" />,
            "Henüz ödenecek çek yok"
          )}
        </TabsContent>

        <TabsContent value="receivable" className="space-y-4">
          {renderCheckList(
            receivableChecks, 
            "Alacak Çekler", 
            <ArrowDownCircle className="h-5 w-5 text-green-500" />,
            "Henüz alacak çek yok"
          )}
        </TabsContent>
      </Tabs>

      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Çek Fotoğrafı</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center">
              <img 
                src={selectedImage} 
                alt="Çek fotoğrafı" 
                className="max-w-full max-h-96 object-contain rounded-lg"
              />
            </div>
            <DialogFooter>
              <Button onClick={() => setSelectedImage(null)}>Kapat</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
