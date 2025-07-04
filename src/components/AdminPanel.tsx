
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Users, Crown, Calendar } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string | null;
  station_name: string | null;
  is_premium: boolean | null;
  premium_expires_at: string | null;
  created_at: string | null;
}

export const AdminPanel = () => {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [createAccountOpen, setCreateAccountOpen] = useState(false);

  const [newAccount, setNewAccount] = useState({
    email: '',
    password: '',
    fullName: '',
    stationName: '',
    isPremium: true,
    premiumExpires: '2025-12-31'
  });

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Hata",
        description: "Profiller yüklenemedi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Yeni kullanıcı oluştur
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newAccount.email,
        password: newAccount.password,
        user_metadata: {
          full_name: newAccount.fullName,
          station_name: newAccount.stationName
        }
      });

      if (authError) throw authError;

      // Profile güncelle
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: newAccount.fullName,
            station_name: newAccount.stationName,
            is_premium: newAccount.isPremium,
            premium_expires_at: newAccount.isPremium ? new Date(newAccount.premiumExpires).toISOString() : null
          })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;
      }

      toast({
        title: "Başarılı",
        description: "Yeni hesap oluşturuldu"
      });

      setCreateAccountOpen(false);
      setNewAccount({
        email: '',
        password: '',
        fullName: '',
        stationName: '',
        isPremium: true,
        premiumExpires: '2025-12-31'
      });
      fetchProfiles();
    } catch (error: any) {
      console.error('Error creating account:', error);
      toast({
        title: "Hata",
        description: error.message || "Hesap oluşturulamadı",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePremiumStatus = async (userId: string, isPremium: boolean, expiresAt?: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_premium: isPremium,
          premium_expires_at: isPremium && expiresAt ? new Date(expiresAt).toISOString() : null
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Premium durumu güncellendi"
      });
      fetchProfiles();
    } catch (error) {
      console.error('Error updating premium status:', error);
      toast({
        title: "Hata",
        description: "Premium durumu güncellenemedi",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          <p className="text-gray-600">Kullanıcı hesaplarını yönetin</p>
        </div>
        <Dialog open={createAccountOpen} onOpenChange={setCreateAccountOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <UserPlus className="mr-2 h-4 w-4" />
              Yeni Hesap Oluştur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Yeni Premium Hesap</DialogTitle>
              <DialogDescription>
                Ödeme alan müşteri için yeni hesap oluşturun
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createNewAccount} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  value={newAccount.email}
                  onChange={(e) => setNewAccount({...newAccount, email: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Geçici Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  value={newAccount.password}
                  onChange={(e) => setNewAccount({...newAccount, password: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Ad Soyad</Label>
                <Input
                  id="fullName"
                  value={newAccount.fullName}
                  onChange={(e) => setNewAccount({...newAccount, fullName: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stationName">İstasyon Adı</Label>
                <Input
                  id="stationName"
                  value={newAccount.stationName}
                  onChange={(e) => setNewAccount({...newAccount, stationName: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="premiumExpires">Premium Bitiş Tarihi</Label>
                <Input
                  id="premiumExpires"
                  type="date"
                  value={newAccount.premiumExpires}
                  onChange={(e) => setNewAccount({...newAccount, premiumExpires: e.target.value})}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Oluşturuluyor...' : 'Hesap Oluştur'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Kullanıcı Listesi</span>
          </CardTitle>
          <CardDescription>
            Toplam {profiles.length} kullanıcı
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Yükleniyor...</div>
          ) : (
            <div className="space-y-4">
              {profiles.map((profile) => (
                <div key={profile.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{profile.full_name || 'İsimsiz'}</h3>
                      <p className="text-sm text-gray-600">{profile.station_name || 'İstasyon adı yok'}</p>
                      <p className="text-xs text-gray-500">ID: {profile.id}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {profile.is_premium ? (
                        <Badge className="bg-green-100 text-green-800">
                          <Crown className="mr-1 h-3 w-3" />
                          Premium
                        </Badge>
                      ) : (
                        <Badge variant="outline">Free</Badge>
                      )}
                    </div>
                  </div>
                  
                  {profile.premium_expires_at && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="mr-1 h-3 w-3" />
                      Bitiş: {new Date(profile.premium_expires_at).toLocaleDateString('tr-TR')}
                    </div>
                  )}
                  
                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      variant={profile.is_premium ? "outline" : "default"}
                      onClick={() => updatePremiumStatus(profile.id, !profile.is_premium, '2025-12-31')}
                    >
                      {profile.is_premium ? 'Premium İptal' : 'Premium Yap'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
