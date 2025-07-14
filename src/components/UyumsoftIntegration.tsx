
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Settings, Link, FileText, Upload, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUyumsoftAccounts } from '@/hooks/useUyumsoftAccounts';

interface UyumsoftIntegrationProps {
  companyId: string;
}

export const UyumsoftIntegration = ({ companyId }: UyumsoftIntegrationProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password_encrypted: '',
    company_code: '',
    api_key_encrypted: '',
    test_mode: true,
    is_active: true
  });

  const { toast } = useToast();
  const { uyumsoftAccount, isLoading, createOrUpdateAccount } = useUyumsoftAccounts(companyId);

  useEffect(() => {
    if (uyumsoftAccount) {
      setCredentials({
        username: uyumsoftAccount.username,
        password_encrypted: '', // Güvenlik için şifre gösterilmez
        company_code: uyumsoftAccount.company_code,
        api_key_encrypted: uyumsoftAccount.api_key_encrypted || '',
        test_mode: uyumsoftAccount.test_mode,
        is_active: uyumsoftAccount.is_active
      });
    }
  }, [uyumsoftAccount]);

  const handleSaveCredentials = () => {
    createOrUpdateAccount.mutate(credentials);
    setIsDialogOpen(false);
  };

  const isConnected = uyumsoftAccount && uyumsoftAccount.is_active;

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
                <h3 className="font-semibold flex items-center space-x-2">
                  <span>Bağlantı Durumu</span>
                  {isConnected ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  )}
                </h3>
                <p className="text-sm text-gray-600">
                  E-Fatura ve E-Arşiv işlemleri için Uyumsoft hesabınızı bağlayın
                </p>
                {isConnected && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500">Kullanıcı: {uyumsoftAccount.username}</p>
                    <p className="text-xs text-gray-500">Şirket Kodu: {uyumsoftAccount.company_code}</p>
                    <p className="text-xs text-gray-500">
                      Mod: {uyumsoftAccount.test_mode ? 'Test' : 'Canlı'}
                    </p>
                  </div>
                )}
              </div>
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? "Bağlı" : "Bağlantı Yok"}
              </Badge>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  {isConnected ? "Bağlantı Düzenle" : "Bağlantı Ayarları"}
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
                      value={credentials.password_encrypted}
                      onChange={(e) => setCredentials({...credentials, password_encrypted: e.target.value})}
                      placeholder="Uyumsoft şifreniz"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyCode">Şirket Kodu</Label>
                    <Input
                      id="companyCode"
                      value={credentials.company_code}
                      onChange={(e) => setCredentials({...credentials, company_code: e.target.value})}
                      placeholder="Şirket kodunuz"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Anahtarı (Opsiyonel)</Label>
                    <Input
                      id="apiKey"
                      value={credentials.api_key_encrypted}
                      onChange={(e) => setCredentials({...credentials, api_key_encrypted: e.target.value})}
                      placeholder="API anahtarınız"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="test-mode"
                      checked={credentials.test_mode}
                      onCheckedChange={(checked) => setCredentials({...credentials, test_mode: checked})}
                    />
                    <Label htmlFor="test-mode">Test Modu</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is-active"
                      checked={credentials.is_active}
                      onCheckedChange={(checked) => setCredentials({...credentials, is_active: checked})}
                    />
                    <Label htmlFor="is-active">Aktif</Label>
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
            <Button 
              variant="outline" 
              className="flex items-center space-x-2"
              disabled={!isConnected}
            >
              <Upload className="h-4 w-4" />
              <span>Toplu Fatura Gönder</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center space-x-2"
              disabled={!isConnected}
            >
              <Download className="h-4 w-4" />
              <span>Fatura İndir</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center space-x-2"
              disabled={!isConnected}
            >
              <FileText className="h-4 w-4" />
              <span>Durum Sorgula</span>
            </Button>
          </div>
          {!isConnected && (
            <p className="text-sm text-gray-500 mt-2">
              Bu işlevleri kullanmak için önce Uyumsoft hesabınızı bağlayın.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
