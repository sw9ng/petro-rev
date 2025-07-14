
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Settings, Link, FileText, Upload, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const UyumsoftIntegration = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    companyCode: '',
    apiKey: ''
  });

  const { toast } = useToast();

  const handleSaveCredentials = () => {
    // Bu kısımda credentials'ları güvenli bir şekilde saklayacağız
    console.log('Uyumsoft credentials:', credentials);
    toast({
      title: "Başarılı",
      description: "Uyumsoft bağlantı bilgileri kaydedildi",
    });
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Link className="h-5 w-5" />
            <span>Uyumsoft Entegrasyonu</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Bağlantı Durumu</h3>
                <p className="text-sm text-gray-600">
                  E-Fatura ve E-Arşiv işlemleri için Uyumsoft hesabınızı bağlayın
                </p>
              </div>
              <Badge variant="secondary">Bağlantı Yok</Badge>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Bağlantı Ayarları
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Uyumsoft Bağlantı Ayarları</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Kullanıcı Adı</Label>
                    <Input
                      id="username"
                      value={credentials.username}
                      onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                      placeholder="Uyumsoft kullanıcı adınız"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Şifre</Label>
                    <Input
                      id="password"
                      type="password"
                      value={credentials.password}
                      onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                      placeholder="Uyumsoft şifreniz"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyCode">Şirket Kodu</Label>
                    <Input
                      id="companyCode"
                      value={credentials.companyCode}
                      onChange={(e) => setCredentials({...credentials, companyCode: e.target.value})}
                      placeholder="Şirket kodunuz"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Anahtarı</Label>
                    <Input
                      id="apiKey"
                      value={credentials.apiKey}
                      onChange={(e) => setCredentials({...credentials, apiKey: e.target.value})}
                      placeholder="API anahtarınız"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    İptal
                  </Button>
                  <Button onClick={handleSaveCredentials}>
                    Kaydet
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* E-Fatura Operations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>E-Fatura İşlemleri</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Toplu Fatura Gönder</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Fatura İndir</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Durum Sorgula</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CSV Upload for Company Info */}
      <Card>
        <CardHeader>
          <CardTitle>Şirket Bilgileri Yükleme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              VKN içeren CSV dosyasını yükleyerek şirket bilgilerini otomatik olarak doldurun
            </p>
            <div className="flex items-center space-x-2">
              <Input type="file" accept=".csv" className="flex-1" />
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Yükle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
