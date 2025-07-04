
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Fuel, MessageCircle, Mail, Crown, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function Auth() {
  const { signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(loginData.email, loginData.password);
    
    if (error) {
      toast({
        title: "Giriş Hatası",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Başarılı",
        description: "Giriş yapıldı"
      });
    }
    
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({
        title: "Hata",
        description: "E-posta adresi gerekli",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth`,
    });

    if (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Başarılı",
        description: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi."
      });
      setForgotPasswordOpen(false);
      setResetEmail('');
    }
    
    setLoading(false);
  };

  const handleWhatsAppContact = () => {
    window.open('https://wa.me/905364547717?text=PetroRev Premium hesabı oluşturmak istiyorum.', '_blank');
  };

  const handleEmailContact = () => {
    window.open('mailto:yusufsami.1061@gmail.com?subject=PetroRev Premium Hesap Talebi&body=Merhaba, PetroRev Premium hesabı oluşturmak istiyorum.', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg">
              <Fuel className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <CardTitle className="text-2xl">PetroRev Premium</CardTitle>
            <Crown className="h-5 w-5 text-yellow-500" />
          </div>
          <CardDescription>Premium Akaryakıt İstasyonu Yönetim Sistemi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Giriş Formu */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="Premium hesabınızın e-posta adresi"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="Şifrenizi girin"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" disabled={loading}>
              <Star className="mr-2 h-4 w-4" />
              {loading ? 'Giriş yapılıyor...' : 'Premium Giriş'}
            </Button>
            
            <div className="text-center">
              <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
                <DialogTrigger asChild>
                  <Button variant="link" className="text-sm">
                    Şifremi Unuttum
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Şifre Sıfırlama</DialogTitle>
                    <DialogDescription>
                      Premium hesabınızın e-posta adresini girin, size şifre sıfırlama bağlantısı gönderelim.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="resetEmail">E-posta</Label>
                      <Input
                        id="resetEmail"
                        type="email"
                        placeholder="Premium hesabınızın e-posta adresi"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </form>

          {/* Premium Üyelik Bilgilendirmesi */}
          <div className="border-t pt-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-center mb-2 flex items-center justify-center">
                <Crown className="mr-2 h-4 w-4 text-yellow-500" />
                Premium Hesap Gerekli
              </h3>
              <p className="text-sm text-gray-600 text-center mb-4">
                PetroRev sistemine erişim için premium üyelik gereklidir. 
                Hesap oluşturmak için bizimle iletişime geçin.
              </p>
              
              <div className="space-y-2">
                <Button 
                  onClick={handleWhatsAppContact}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp ile İletişim
                </Button>
                <Button 
                  onClick={handleEmailContact}
                  variant="outline"
                  className="w-full"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  E-posta Gönder
                </Button>
              </div>
              
              <div className="mt-4 text-xs text-gray-500 text-center">
                <p>📞 WhatsApp: +90 536 454 7717</p>
                <p>📧 Email: yusufsami.1061@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Ürün Bilgisi */}
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/landing')}
              className="w-full"
            >
              Ürün Bilgisi ve Fiyatlar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
