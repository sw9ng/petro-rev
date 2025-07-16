
import { useState } from 'react';
import { Settings, User, Moon, Sun, Building2, Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/components/providers/ThemeProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const SettingsDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [stationName, setStationName] = useState('');
  const { theme, setTheme } = useTheme();

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Tüm şifre alanları zorunludur.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Yeni şifre en az 6 karakter olmalıdır.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast.error('Şifre değiştirilemedi: ' + error.message);
      } else {
        toast.success('Şifre başarıyla değiştirildi.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      toast.error('Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStationNameUpdate = async () => {
    if (!stationName.trim()) {
      toast.error('İstasyon adı boş olamaz.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ station_name: stationName })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (error) {
        toast.error('İstasyon adı güncellenemedi: ' + error.message);
      } else {
        toast.success('İstasyon adı başarıyla güncellendi.');
      }
    } catch (error) {
      toast.error('Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Ayarlar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Ayarlar
          </DialogTitle>
          <DialogDescription>
            Hesap ayarlarınızı ve uygulama tercihlerinizi yönetin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tema Ayarı */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                Tema Ayarları
              </CardTitle>
              <CardDescription>
                Uygulamanın görünümünü karanlık veya aydınlık mod olarak ayarlayın.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch
                  id="theme-mode"
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                />
                <Label htmlFor="theme-mode">
                  Karanlık Mod {theme === 'dark' ? 'Açık' : 'Kapalı'}
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Şifre Değiştirme */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="h-5 w-5" />
                Şifre Değiştir
              </CardTitle>
              <CardDescription>
                Hesap güvenliğiniz için şifrenizi güncelleyin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Mevcut Şifre</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Mevcut şifrenizi girin"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Yeni Şifre</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Yeni şifrenizi girin"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Yeni Şifre Tekrar</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Yeni şifrenizi tekrar girin"
                />
              </div>
              <Button 
                onClick={handlePasswordChange} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
              </Button>
            </CardContent>
          </Card>

          {/* İstasyon Ayarları */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5" />
                İstasyon Ayarları
              </CardTitle>
              <CardDescription>
                İstasyon adınızı güncelleyin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="station-name">İstasyon Adı</Label>
                <Input
                  id="station-name"
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                  placeholder="İstasyon adınızı girin"
                />
              </div>
              <Button 
                onClick={handleStationNameUpdate} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Güncelleniyor...' : 'İstasyon Adını Güncelle'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
