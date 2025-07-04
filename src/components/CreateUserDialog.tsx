
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const CreateUserDialog = ({ onUserCreated }: { onUserCreated: () => void }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    stationName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          stationName: formData.stationName
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Başarılı",
          description: "Kullanıcı başarıyla oluşturuldu"
        });
        setFormData({ email: '', password: '', fullName: '', stationName: '' });
        setOpen(false);
        onUserCreated();
      } else {
        throw new Error(data.error || 'Bilinmeyen hata');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Hata",
        description: error.message || "Kullanıcı oluşturulamadı",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <UserPlus className="mr-2 h-4 w-4" />
          Yeni Hesap Oluştur
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni Premium Hesap Oluştur</DialogTitle>
          <DialogDescription>
            Yeni müşteri için premium hesap oluşturun
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Ad Soyad</Label>
            <Input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stationName">İstasyon Adı</Label>
            <Input
              id="stationName"
              type="text"
              value={formData.stationName}
              onChange={(e) => setFormData({...formData, stationName: e.target.value})}
              required
            />
          </div>
          <div className="flex space-x-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Oluşturuluyor...' : 'Hesap Oluştur'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
