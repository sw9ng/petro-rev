
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FileCheck, Plus, Upload, Trash2, Eye, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/numberUtils';

interface Check {
  id: string;
  amount: number;
  dueDate: string;
  description: string;
  imageUrl?: string;
  status: 'pending' | 'paid';
  createdAt: string;
}

export const CheckManagement = () => {
  const [checks, setChecks] = useState<Check[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    dueDate: '',
    description: '',
    image: null as File | null
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.dueDate) {
      toast.error("Tutar ve vade tarihi zorunludur.");
      return;
    }

    const newCheck: Check = {
      id: Date.now().toString(),
      amount: parseFloat(formData.amount),
      dueDate: formData.dueDate,
      description: formData.description,
      imageUrl: formData.image ? URL.createObjectURL(formData.image) : undefined,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setChecks(prev => [...prev, newCheck]);
    setFormData({ amount: '', dueDate: '', description: '', image: null });
    setIsDialogOpen(false);
    toast.success("Çek başarıyla eklendi.");
  };

  const handleDeleteCheck = (checkId: string) => {
    setChecks(prev => prev.filter(check => check.id !== checkId));
    toast.success("Çek silindi.");
  };

  const handleMarkAsPaid = (checkId: string) => {
    setChecks(prev => prev.map(check => 
      check.id === checkId ? { ...check, status: 'paid' as const } : check
    ));
    toast.success("Çek ödendi olarak işaretlendi.");
  };

  const totalPendingAmount = checks
    .filter(check => check.status === 'pending')
    .reduce((sum, check) => sum + check.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <FileCheck className="h-5 w-5 text-blue-500" />
            <span>Ödenecek Çekler</span>
          </h3>
          <p className="text-sm text-gray-600">Çeklerinizi ve vade tarihlerini takip edin</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Çek Ekle</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Yeni Çek Ekle</DialogTitle>
              <DialogDescription>
                Çek bilgilerini ve fotoğrafını ekleyin
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="dueDate">Vade Tarihi *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  required
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
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit">Ekle</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Özet Kartı */}
      <Card className="bg-orange-50 border-orange-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-orange-800 text-lg">Toplam Ödenecek</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-800">
            {formatCurrency(totalPendingAmount)}
          </div>
          <p className="text-sm text-orange-600 mt-1">
            {checks.filter(c => c.status === 'pending').length} adet ödenmemiş çek
          </p>
        </CardContent>
      </Card>

      {/* Çek Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>Çek Listesi</CardTitle>
          <CardDescription>Tüm çeklerinizi görüntüleyin ve yönetin</CardDescription>
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
                            {check.status === 'paid' ? 'Ödendi' : 'Bekliyor'}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>Vade: {new Date(check.dueDate).toLocaleDateString('tr-TR')}</span>
                        </div>
                        {check.description && (
                          <p className="text-sm text-gray-600 mt-1">{check.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {check.imageUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedImage(check.imageUrl || null)}
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz çek yok</h3>
              <p className="text-gray-600">İlk çekinizi ekleyin</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resim Görüntüleme Dialog */}
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
