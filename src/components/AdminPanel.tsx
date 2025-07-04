
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, Crown, Calendar, Clock, AlertCircle } from 'lucide-react';

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
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          <p className="text-gray-600">Mevcut kullanıcıları yönetin</p>
        </div>
      </div>

      {/* Yeni Hesap Oluşturma İçin Bilgilendirme */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-800">
            <AlertCircle className="h-5 w-5" />
            <span>Yeni Hesap Oluşturma</span>
          </CardTitle>
          <CardDescription className="text-orange-700">
            Yeni premium hesap oluşturmak için Supabase Dashboard kullanın
          </CardDescription>
        </CardHeader>
        <CardContent className="text-orange-700">
          <p className="mb-3">
            Güvenlik nedeniyle yeni kullanıcı hesapları sadece Supabase Dashboard üzerinden oluşturulabilir.
          </p>
          <div className="space-y-2 text-sm">
            <p><strong>1.</strong> Supabase Dashboard → Authentication → Users</p>
            <p><strong>2.</strong> "Add user" butonuna tıklayın</p>
            <p><strong>3.</strong> E-posta ve şifre girin</p>
            <p><strong>4.</strong> User Metadata bölümüne şunları ekleyin:</p>
            <div className="ml-4 font-mono text-xs bg-white p-2 rounded border">
              {`{`}<br />
              &nbsp;&nbsp;"full_name": "Kullanıcı Adı",<br />
              &nbsp;&nbsp;"station_name": "İstasyon Adı"<br />
              {`}`}
            </div>
            <p><strong>5.</strong> Kullanıcı oluşturulduktan sonra burada premium durumunu ayarlayabilirsiniz.</p>
          </div>
        </CardContent>
      </Card>

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
                    {profile.is_premium && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setSelectedUser(profile);
                          setExtendPremiumOpen(true);
                        }}
                      >
                        <Clock className="mr-1 h-3 w-3" />
                        Premium Uzat
                      </Button>
                    )}
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
