import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, Crown, Calendar, Clock } from 'lucide-react';
import { CreateUserDialog } from './CreateUserDialog';

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
  const [extendPremiumOpen, setExtendPremiumOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [extensionMonths, setExtensionMonths] = useState('12');

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

  const extendPremium = async () => {
    if (!selectedUser) return;

    try {
      const currentExpiry = selectedUser.premium_expires_at ? new Date(selectedUser.premium_expires_at) : new Date();
      const newExpiry = new Date(currentExpiry);
      newExpiry.setMonth(newExpiry.getMonth() + parseInt(extensionMonths));

      const { error } = await supabase
        .from('profiles')
        .update({
          is_premium: true,
          premium_expires_at: newExpiry.toISOString()
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: `Premium ${extensionMonths} ay uzatıldı`
      });

      setExtendPremiumOpen(false);
      setSelectedUser(null);
      setExtensionMonths('12');
      fetchProfiles();
    } catch (error) {
      console.error('Error extending premium:', error);
      toast({
        title: "Hata",
        description: "Premium uzatılamadı",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Panel</h2>
          <p className="text-gray-600">Kullanıcı yönetimi ve premium abonelik kontrolleri</p>
        </div>
        <div className="flex space-x-3">
          <CreateUserDialog onUserCreated={fetchProfiles} />
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Kullanıcı</p>
                <p className="text-3xl font-bold text-gray-900">{profiles.length}</p>
              </div>
              <Users className="h-12 w-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Premium Kullanıcılar</p>
                <p className="text-3xl font-bold text-green-600">
                  {profiles.filter(p => p.is_premium).length}
                </p>
              </div>
              <Crown className="h-12 w-12 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ücretsiz Kullanıcılar</p>
                <p className="text-3xl font-bold text-gray-600">
                  {profiles.filter(p => !p.is_premium).length}
                </p>
              </div>
              <Users className="h-12 w-12 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Premium Uzatma Dialogu */}
      <Dialog open={extendPremiumOpen} onOpenChange={setExtendPremiumOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Premium Uzat</DialogTitle>
            <DialogDescription>
              {selectedUser?.full_name || 'Kullanıcı'} için premium süresini uzatın
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Mevcut Bitiş Tarihi</Label>
              <p className="text-sm text-gray-600">
                {selectedUser?.premium_expires_at 
                  ? new Date(selectedUser.premium_expires_at).toLocaleDateString('tr-TR')
                  : 'Belirtilmemiş'
                }
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="extensionMonths">Uzatma Süresi</Label>
              <Select value={extensionMonths} onValueChange={setExtensionMonths}>
                <SelectTrigger>
                  <SelectValue placeholder="Süre seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Ay</SelectItem>
                  <SelectItem value="3">3 Ay</SelectItem>
                  <SelectItem value="6">6 Ay</SelectItem>
                  <SelectItem value="12">12 Ay</SelectItem>
                  <SelectItem value="24">24 Ay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button onClick={extendPremium} className="flex-1">
                <Clock className="mr-2 h-4 w-4" />
                Premium Uzat
              </Button>
              <Button variant="outline" onClick={() => setExtendPremiumOpen(false)}>
                İptal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-6 w-6" />
            <span>Kullanıcı Yönetimi</span>
          </CardTitle>
          <CardDescription>
            Kullanıcıları ve premium durumlarını yönetin
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Kullanıcılar yükleniyor...</p>
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Henüz kullanıcı bulunmuyor</p>
            </div>
          ) : (
            <div className="space-y-4">
              {profiles.map((profile) => (
                <div key={profile.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {profile.full_name || 'İsimsiz Kullanıcı'}
                        </h3>
                        {profile.is_premium ? (
                          <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                            <Crown className="mr-1 h-3 w-3" />
                            Premium
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">
                            Ücretsiz Plan
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 flex items-center">
                          <span className="font-medium min-w-[100px]">İstasyon:</span>
                          {profile.station_name || 'Belirtilmemiş'}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <span className="font-medium min-w-[100px]">Kayıt:</span>
                          {profile.created_at ? new Date(profile.created_at).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                        </p>
                        {profile.premium_expires_at && (
                          <p className="text-sm text-gray-600 flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            <span className="font-medium min-w-[100px]">Premium Bitiş:</span>
                            {new Date(profile.premium_expires_at).toLocaleDateString('tr-TR')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                    <Button
                      size="sm"
                      variant={profile.is_premium ? "outline" : "default"}
                      onClick={() => updatePremiumStatus(profile.id, !profile.is_premium, '2025-12-31')}
                      className={profile.is_premium ? 
                        "text-red-600 border-red-200 hover:bg-red-50" : 
                        "bg-green-600 hover:bg-green-700"
                      }
                    >
                      {profile.is_premium ? (
                        <>
                          <Users className="mr-1 h-3 w-3" />
                          Ücretsiz Plana Geçir
                        </>
                      ) : (
                        <>
                          <Crown className="mr-1 h-3 w-3" />
                          Premium Yap
                        </>
                      )}
                    </Button>
                    {profile.is_premium && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setSelectedUser(profile);
                          setExtendPremiumOpen(true);
                        }}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100"
                      >
                        <Clock className="mr-1 h-3 w-3" />
                        Premium Uzat
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-gray-600 hover:bg-gray-50"
                      onClick={() => {
                        navigator.clipboard.writeText(profile.id);
                        toast({ title: "Kullanıcı ID kopyalandı" });
                      }}
                    >
                      ID Kopyala
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
