
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Cloud, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PetronetSettings {
  petronet_email: string | null;
  petronet_password: string | null;
  petronet_auto_sync: boolean;
  last_sync_time: string | null;
}

export const PetronetSettings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [settings, setSettings] = useState<PetronetSettings>({
    petronet_email: '',
    petronet_password: '',
    petronet_auto_sync: false,
    last_sync_time: null
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('petronet_email, petronet_password, petronet_auto_sync, last_sync_time')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setSettings({
          petronet_email: data.petronet_email || '',
          petronet_password: data.petronet_password || '',
          petronet_auto_sync: data.petronet_auto_sync || false,
          last_sync_time: data.last_sync_time
        });
      }
    } catch (error) {
      console.error('Ayarlar yüklenirken hata:', error);
      toast({
        title: "Hata",
        description: "Ayarlar yüklenirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          petronet_email: settings.petronet_email,
          petronet_password: settings.petronet_password,
          petronet_auto_sync: settings.petronet_auto_sync
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast({
        title: "Başarılı",
        description: "Petronet ayarları kaydedildi.",
      });
    } catch (error) {
      console.error('Ayarlar kaydedilirken hata:', error);
      toast({
        title: "Hata",
        description: "Ayarlar kaydedilirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const syncNow = async () => {
    if (!user || !settings.petronet_email || !settings.petronet_password) {
      toast({
        title: "Eksik Bilgi",
        description: "Önce Petronet email ve şifrenizi girin.",
        variant: "destructive"
      });
      return;
    }

    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('petronet-sync', {
        body: {
          user_id: user.id,
          email: settings.petronet_email,
          password: settings.petronet_password
        }
      });

      if (error) throw error;
      
      toast({
        title: "Senkronizasyon Başarılı",
        description: `${data?.files_processed || 0} dosya işlendi.`,
      });
      
      // Ayarları yeniden yükle (son senkronizasyon zamanını güncellemek için)
      await loadSettings();
    } catch (error) {
      console.error('Senkronizasyon hatası:', error);
      toast({
        title: "Senkronizasyon Hatası",
        description: "Petronet senkronizasyonu sırasında bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  const formatLastSync = (lastSync: string | null) => {
    if (!lastSync) return 'Henüz senkronizasyon yapılmamış';
    return new Date(lastSync).toLocaleString('tr-TR');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Petronet Ayarları</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p>Yükleniyor...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <CardTitle>Petronet Ayarları</CardTitle>
        </div>
        <CardDescription>
          Petronet sisteminizden otomatik olarak vardiya dosyalarını çekmek için ayarlarınızı yapın
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="petronet-email">Petronet Email</Label>
            <Input
              id="petronet-email"
              type="email"
              value={settings.petronet_email || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, petronet_email: e.target.value }))}
              placeholder="petronet@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="petronet-password">Petronet Şifre</Label>
            <Input
              id="petronet-password"
              type="password"
              value={settings.petronet_password || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, petronet_password: e.target.value }))}
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="auto-sync"
              checked={settings.petronet_auto_sync}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, petronet_auto_sync: checked }))}
            />
            <Label htmlFor="auto-sync">Otomatik Senkronizasyon</Label>
          </div>
          
          <p className="text-sm text-gray-600">
            Etkinleştirildiğinde sistem günde bir kez otomatik olarak yeni dosyaları çeker
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Son Senkronizasyon</p>
              <p className="text-sm text-gray-500">{formatLastSync(settings.last_sync_time)}</p>
            </div>
            <div className="flex items-center space-x-2">
              {settings.last_sync_time && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              {!settings.last_sync_time && (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={syncNow} 
            disabled={syncing || !settings.petronet_email || !settings.petronet_password}
          >
            <Download className="h-4 w-4 mr-2" />
            {syncing ? 'Senkronize Ediliyor...' : 'Şimdi Senkronize Et'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
