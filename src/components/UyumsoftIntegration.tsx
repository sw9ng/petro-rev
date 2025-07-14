import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Settings, Link, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUyumsoftAccounts } from '@/hooks/useUyumsoftAccounts';
import { supabase } from '@/integrations/supabase/client';

interface UyumsoftIntegrationProps {
  companyId: string;
}

export const UyumsoftIntegration = ({ companyId }: UyumsoftIntegrationProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    test_mode: true,
  });

  const { toast } = useToast();
  const { uyumsoftAccount, isLoading } = useUyumsoftAccounts(companyId);

  useEffect(() => {
    if (uyumsoftAccount) {
      setCredentials({
        username: uyumsoftAccount.username,
        password: '', // Güvenlik için şifre gösterilmez
        test_mode: uyumsoftAccount.test_mode,
      });
    }
  }, [uyumsoftAccount]);

  const handleTestConnection = async () => {
    if (!credentials.username || !credentials.password) {
      toast({
        title: "Hata",
        description: "Kullanıcı adı ve şifre gereklidir",
        variant: "destructive",
      });
      return;
    }

    setIsAuthenticating(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Oturum bulunamadı");

      const response = await fetch(`https://duebejkrrvuodwbforkd.supabase.co/functions/v1/authenticate-uyumsoft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          companyId,
          username: credentials.username,
          password: credentials.password,
          testMode: credentials.test_mode
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Başarılı",
          description: "Uyumsoft bağlantısı başarıyla kuruldu",
        });
        setIsDialogOpen(false);
        // Refresh the page to update the connection status
        window.location.reload();
      } else {
        throw new Error(result.error || 'Bağlantı başarısız');
      }
    } catch (error: any) {
      toast({
        title: "Bağlantı Hatası",
        description: error.message || "Uyumsoft bağlantısı kurulamadı",
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }
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
                    <p className="text-xs text-gray-500">
                      Mod: {uyumsoftAccount.test_mode ? 'Test' : 'Canlı'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Son Senkronizasyon: {uyumsoftAccount.last_sync_at ? 
                        new Date(uyumsoftAccount.last_sync_at).toLocaleString('tr-TR') : 
                        'Henüz yapılmadı'
                      }
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
                <Button disabled={isLoading}>
                  <Settings className="h-4 w-4 mr-2" />
                  {isConnected ? "Bağlantıyı Yenile" : "Bağlantı Kurulumu"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Uyumsoft Bağlantı Ayarları</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Kullanıcı Adı *</Label>
                    <Input
                      id="username"
                      value={credentials.username}
                      onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                      placeholder="Uyumsoft kullanıcı adınız"
                      disabled={isAuthenticating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Şifre *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={credentials.password}
                      onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                      placeholder="Uyumsoft şifreniz"
                      disabled={isAuthenticating}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="test-mode"
                      checked={credentials.test_mode}
                      onCheckedChange={(checked) => setCredentials({...credentials, test_mode: checked})}
                      disabled={isAuthenticating}
                    />
                    <Label htmlFor="test-mode">Test Modu</Label>
                  </div>
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                    <p className="font-medium">Bilgi:</p>
                    <p>Bağlantı testi yapılacak ve kimlik bilgileri doğrulanacaktır.</p>
                    <p>Yanlış bilgiler girerseniz bağlantı kurulmayacaktır.</p>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isAuthenticating}
                  >
                    İptal
                  </Button>
                  <Button 
                    onClick={handleTestConnection}
                    disabled={isAuthenticating}
                  >
                    {isAuthenticating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Bağlanıyor...
                      </>
                    ) : (
                      'Bağlantıyı Test Et'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Fatura İşlemleri</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Tüm faturalarınızı tek yerden yönetin ve Uyumsoft'a gönderin
            </p>
            {!isConnected && (
              <p className="text-sm text-gray-500">
                Bu işlevleri kullanmak için önce Uyumsoft hesabınızı bağlayın.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
