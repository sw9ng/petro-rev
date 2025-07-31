
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAttendantAuth } from '@/contexts/AttendantAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Fuel, MessageCircle, Mail, Crown, Star, User, UserPlus, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function Auth() {
  const { signIn, signUp, user } = useAuth();
  const { signIn: attendantSignIn, attendant } = useAttendantAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    stationName: ''
  });

  const [attendantLoginData, setAttendantLoginData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    if (user) {
      navigate('/');
    } else if (attendant) {
      navigate('/attendant-dashboard');
    }
  }, [user, attendant, navigate]);

  const handlePremiumLogin = async (e: React.FormEvent) => {
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
        description: "Premium giriş yapıldı"
      });
    }
    
    setLoading(false);
  };

  const handleAttendantLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await attendantSignIn(attendantLoginData.email, attendantLoginData.password);
    
    if (error) {
      toast({
        title: "Giriş Hatası",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Başarılı",
        description: "Pompacı girişi yapıldı"
      });
    }
    
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Hata",
        description: "Şifreler eşleşmiyor",
        variant: "destructive"
      });
      return;
    }

    if (registerData.password.length < 6) {
      toast({
        title: "Hata", 
        description: "Şifre en az 6 karakter olmalıdır",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const { error } = await signUp(
      registerData.email, 
      registerData.password, 
      registerData.fullName, 
      registerData.stationName
    );
    
    if (error) {
      toast({
        title: "Kayıt Hatası",
        description: error.message === 'User already registered' 
          ? 'Bu e-posta adresi zaten kayıtlı' 
          : error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Başarılı",
        description: "Hesabınız oluşturuldu! Giriş yapabilirsiniz."
      });
      // Reset form
      setRegisterData({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        stationName: ''
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
          <CardTitle className="text-2xl">PetroRev</CardTitle>
          <CardDescription>Akaryakıt İstasyonu Yönetim Sistemi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Login/Register Tabs */}
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login" className="flex items-center gap-1 text-xs">
                <Crown className="h-3 w-3" />
                Giriş
              </TabsTrigger>
              <TabsTrigger value="register" className="flex items-center gap-1 text-xs">
                <UserPlus className="h-3 w-3" />
                Kayıt
              </TabsTrigger>
              <TabsTrigger value="attendant" className="flex items-center gap-1 text-xs">
                <User className="h-3 w-3" />
                Pompacı
              </TabsTrigger>
            </TabsList>
            
            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Sisteme Giriş</h3>
                <p className="text-sm text-gray-600">Mevcut hesabınızla giriş yapın</p>
              </div>
              <form onSubmit={handlePremiumLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-posta</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="E-posta adresiniz"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Şifre</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Şifrenizi girin"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" disabled={loading}>
                  <Star className="mr-2 h-4 w-4" />
                  {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
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
                          Hesabınızın e-posta adresini girin, size şifre sıfırlama bağlantısı gönderelim.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="resetEmail">E-posta</Label>
                          <Input
                            id="resetEmail"
                            type="email"
                            placeholder="E-posta adresiniz"
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
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register" className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Ücretsiz Hesap Oluştur</h3>
                <p className="text-sm text-gray-600">Hemen başlayın - Kredi kartı gerekmez</p>
              </div>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-fullName">Ad Soyad</Label>
                    <Input
                      id="register-fullName"
                      type="text"
                      placeholder="Adınız Soyadınız"
                      value={registerData.fullName}
                      onChange={(e) => setRegisterData({...registerData, fullName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-stationName">İstasyon Adı</Label>
                    <Input
                      id="register-stationName"
                      type="text"
                      placeholder="İstasyon adınız"
                      value={registerData.stationName}
                      onChange={(e) => setRegisterData({...registerData, stationName: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">E-posta</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="E-posta adresiniz"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Şifre</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="En az 6 karakter"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-confirmPassword">Şifre Tekrar</Label>
                  <Input
                    id="register-confirmPassword"
                    type="password"
                    placeholder="Şifrenizi tekrar girin"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                    required
                  />
                </div>
                
                {/* Freemium Plan Info */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Crown className="h-4 w-4 text-green-600 mr-2" />
                    <span className="font-medium text-green-800">Ücretsiz Plan Dahil</span>
                  </div>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>✓ 5 personel hesabı</li>
                    <li>✓ 30 vardiya girişi</li>
                    <li>✓ Temel vardiya takibi</li>
                    <li>✓ Açık/fazla hesaplama</li>
                  </ul>
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700" disabled={loading}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {loading ? 'Hesap oluşturuluyor...' : 'Ücretsiz Hesap Oluştur'}
                </Button>
              </form>
            </TabsContent>

            {/* Attendant Login */}
            <TabsContent value="attendant" className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Pompacı Girişi</h3>
                <p className="text-sm text-gray-600">Vardiya takibi için pompacı girişi</p>
              </div>
              <form onSubmit={handleAttendantLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="attendant-email">E-posta</Label>
                  <Input
                    id="attendant-email"
                    type="email"
                    placeholder="Pompacı giriş e-posta adresi"
                    value={attendantLoginData.email}
                    onChange={(e) => setAttendantLoginData({...attendantLoginData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attendant-password">Şifre</Label>
                  <Input
                    id="attendant-password"
                    type="password"
                    placeholder="Pompacı giriş şifresi"
                    value={attendantLoginData.password}
                    onChange={(e) => setAttendantLoginData({...attendantLoginData, password: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700" disabled={loading}>
                  <User className="mr-2 h-4 w-4" />
                  {loading ? 'Giriş yapılıyor...' : 'Pompacı Girişi'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Premium Upgrade Info */}
          <div className="border-t pt-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-center mb-2 flex items-center justify-center">
                <Building className="mr-2 h-4 w-4 text-blue-500" />
                Premium'a Geçiş
              </h3>
              <p className="text-sm text-gray-600 text-center mb-4">
                Sınırsız özellikler için premium plana geçin. 
                Cari hesap, e-fatura entegrasyonu ve daha fazlası.
              </p>
              
              <div className="space-y-2">
                <Button 
                  onClick={handleWhatsAppContact}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Premium İçin İletişim
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
