
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Fuel, Users, BarChart3, Shield, Clock, DollarSign, Zap, CheckCircle, Star, Trophy, Code, Calculator, Mail, MessageCircle, Phone, Target, TrendingUp, Award, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Landing = () => {
  const navigate = useNavigate();

  const painPoints = [
    "Kağıt üzerinde vardiya tutmaktan yoruldunuz mu?",
    "Personel hatalarından dolayı para kaybediyor musunuz?", 
    "Hangi personelin ne kadar sattığını takip edemiyor musunuz?",
    "Cari hesaplarınız karışık ve kontrolsüz mü?",
    "Raporlama yapmak saatlerinizi alıyor mu?"
  ];

  const solutions = [
    {
      icon: <Target className="h-8 w-8 text-red-600" />,
      title: "Vardiya Hatalarını %95 Azaltın",
      description: "Otomatik hesaplamalar ile insan hatasını minimuma indirin. Artık hiçbir açık/fazla gözden kaçmayacak."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-green-600" />,
      title: "Verimliliği %300 Artırın", 
      description: "Kağıt işlemlerden kurtulun. Bir tıkla tüm raporlarınıza erişin ve zamandan tasarruf edin."
    },
    {
      icon: <Award className="h-8 w-8 text-blue-600" />,
      title: "Personel Performansını Görün",
      description: "Her personelin satış performansını detaylı takip edin. En iyi çalışanlarınızı ödüllendirin."
    },
    {
      icon: <Shield className="h-8 w-8 text-purple-600" />,
      title: "Güvenli ve Yedekli Sistem",
      description: "Verileriniz bulutta güvenle saklanır. Hiçbir zaman veri kaybı yaşamazsınız."
    }
  ];

  const features = [
    "✅ Sınırsız personel ve vardiya takibi",
    "✅ Otomatik açık/fazla hesaplama",
    "✅ Detaylı satış ve performans raporları", 
    "✅ Cari hesap ve müşteri borç takibi",
    "✅ E-fatura ve muhasebe entegrasyonu",
    "✅ Mobil erişim - her yerden kontrol",
    "✅ API entegrasyonu ve özel çözümler",
    "✅ 7/24 teknik destek ve eğitim"
  ];

  const testimonials = [
    {
      name: "Mehmet Kaya",
      business: "Kaya Akaryakıt - İstanbul",
      text: "PetroRev'den önce vardiya hesaplarım hep yanlıştı. Şimdi her şey otomatik ve hatasız. 3 ayda kendini amorti etti."
    },
    {
      name: "Ayşe Demir", 
      business: "Demir Petrol - Ankara",
      text: "Personel performansını takip etmek hiç bu kadar kolay olmamıştı. En iyi çalışanlarımı artık net görebiliyorum."
    },
    {
      name: "Ali Yılmaz",
      business: "Yılmaz Benzin - İzmir", 
      text: "Muhasebeci arkadaşım da çok memnun. Tüm veriler otomatik geliyor, elle hiçbir şey yapmıyoruz."
    }
  ];

  const handleWhatsAppContact = () => {
    window.open('https://wa.me/905364547717?text=PetroRev hakkında bilgi almak istiyorum. Hemen demo görmek istiyorum!', '_blank');
  };

  const handleEmailContact = () => {
    window.open('mailto:yusufsami.1061@gmail.com?subject=PetroRev Demo Talebi&body=Merhaba, PetroRev için hemen demo görüşmesi talep ediyorum.', '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src="/lovable-uploads/6b443a64-706a-401f-bdc5-fd18b2bcb790.png" 
                  alt="PetroRev - Akaryakıt İstasyonu Yönetim Sistemi" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">PetroRev</h1>
              <Badge className="bg-red-100 text-red-800 border-red-200 font-bold">
                YENİ!
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                onClick={handleWhatsAppContact}
                className="bg-green-600 hover:bg-green-700 text-white font-bold"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                HEMEN ARA
              </Button>
              <Button 
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50"
              >
                Giriş Yap
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Alex Hormozi Style */}
      <section className="py-12 px-4 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="container mx-auto text-center">
          <div className="max-w-5xl mx-auto">
            <Badge className="bg-red-600 text-white px-6 py-3 text-lg font-bold mb-6 animate-pulse">
              🔥 SINIRLI SÜRE: %25 İNDİRİM FIRSATI!
            </Badge>
            
            <h1 className="text-4xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
              AKARYAKIT İSTASYONUNUZU
              <span className="text-red-600 block">DİJİTAL ÇAĞA TAŞIYIN!</span>
            </h1>
            
            <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-6 mb-8">
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                🚨 SON 30 GÜN İÇİNDE 500+ İSTASYON KAYIT OLDU!
              </p>
              <p className="text-xl text-gray-700">
                Rakipleriniz zaten başladı. Siz de geride kalmayın!
              </p>
            </div>

            <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed font-medium">
              Vardiya karmaşası, personel hataları ve para kayıpları ile uğraşmak yerine...
              <br />
              <span className="font-bold text-red-600">İŞLETMENİZİ BÜYÜTMEYE ODAKLANIN!</span>
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg p-4 shadow-lg border-2 border-green-200">
                <div className="text-2xl font-bold text-green-600">%95</div>
                <div className="text-sm text-gray-600">Hata Azalması</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-lg border-2 border-blue-200">
                <div className="text-2xl font-bold text-blue-600">%300</div>
                <div className="text-sm text-gray-600">Verimlilik Artışı</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-lg border-2 border-purple-200">
                <div className="text-2xl font-bold text-purple-600">24/7</div>
                <div className="text-sm text-gray-600">Sistem Erişimi</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-lg border-2 border-orange-200">
                <div className="text-2xl font-bold text-orange-600">∞</div>
                <div className="text-sm text-gray-600">Sınırsız Özellik</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white text-xl px-12 py-6 font-bold shadow-2xl transform hover:scale-105 transition-all"
                onClick={handleWhatsAppContact}
              >
                🚀 HEMEN DEMO İSTİYORUM!
              </Button>
              <Button 
                size="lg" 
                className="bg-green-600 hover:bg-green-700 text-white text-xl px-12 py-6 font-bold shadow-2xl transform hover:scale-105 transition-all"
                onClick={() => navigate('/auth')}
              >
                ⚡ ÜCRETSİZ BAŞLA
              </Button>
            </div>

            <p className="text-lg text-gray-600">
              ⭐ <span className="font-bold">1000+</span> memnun işletme | 
              ⭐ <span className="font-bold">%98</span> müşteri memnuniyeti |
              ⭐ <span className="font-bold">7/24</span> destek
            </p>
          </div>
        </div>
      </section>

      {/* Problem-Solution Section */}
      <section className="py-20 px-4 bg-gray-900 text-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              BU PROBLEMLER TANİDİK GELİYOR MU?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Her gün binlerce akaryakıt istasyonu sahibi aynı sorunları yaşıyor...
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h3 className="text-3xl font-bold text-red-400 mb-8">😫 GÜNLÜK KABUSU:</h3>
              <ul className="space-y-6">
                {painPoints.map((point, index) => (
                  <li key={index} className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold">✗</span>
                    </div>
                    <span className="text-xl text-gray-300">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-green-400 mb-8">🚀 ÇÖZÜM PetroRev:</h3>
              <div className="grid gap-6">
                {solutions.map((solution, index) => (
                  <Card key={index} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-gray-700 rounded-lg">
                          {solution.icon}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white mb-2">{solution.title}</h4>
                          <p className="text-gray-300">{solution.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Single Plan */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto text-center">
          <Badge className="bg-red-600 text-white px-6 py-3 text-lg font-bold mb-6 animate-bounce">
            🔥 SINIRLI SÜRE TEKLİFİ!
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            SADECE BU AY: %25 İNDİRİM!
          </h2>
          
          <div className="max-w-2xl mx-auto">
            <Card className="relative shadow-2xl border-4 border-red-500 bg-white">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-red-600 text-white px-8 py-3 text-xl font-bold">
                  🏆 EN POPÜLER PAKET
                </Badge>
              </div>
              
              <CardHeader className="text-center pb-6 pt-12">
                <CardTitle className="text-3xl font-black text-gray-900 mb-4">
                  PetroRev PREMIUM
                </CardTitle>
                <div className="space-y-4">
                  <div className="text-2xl text-gray-500 line-through">
                    ₺29.333/yıl
                  </div>
                  <div className="text-6xl font-black text-red-600">
                    ₺22.000
                  </div>
                  <div className="text-xl text-gray-700">
                    /yıl + KDV
                  </div>
                  <div className="bg-green-100 text-green-800 font-bold px-4 py-2 rounded-lg">
                    ₺7.333 TASARRUF EDİYORSUNUZ!
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="font-medium text-gray-900">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
                  <h4 className="font-black text-yellow-800 mb-4 flex items-center text-lg">
                    ⚡ BONUS: HEMEN BAŞLAYIN!
                  </h4>
                  <ul className="text-yellow-700 space-y-2">
                    <li>🎁 Ücretsiz kurulum ve eğitim</li>
                    <li>🎁 Kişisel danışmanlık desteği</li>
                    <li>🎁 Özel WhatsApp destek hattı</li>
                    <li>🎁 Tüm verilerin aktarımı</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-xl py-8 font-black shadow-2xl animate-pulse"
                    onClick={handleWhatsAppContact}
                  >
                    🚀 HEMEN DEMO GÖRÜŞMESI İSTİYORUM!
                  </Button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      onClick={handleEmailContact}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4"
                    >
                      📧 E-POSTA İLE İLETİŞİM
                    </Button>
                    <Button 
                      onClick={() => navigate('/auth')}
                      variant="outline"
                      className="border-2 border-green-600 text-green-600 hover:bg-green-50 font-bold py-4"
                    >
                      ⚡ ÜCRETSİZ DENE
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-12 text-center">
            <div className="inline-flex items-center bg-red-100 text-red-800 px-6 py-3 rounded-full font-bold text-lg">
              ⏰ Bu fiyat sadece bu ay geçerli!
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              MÜŞTERİLERİMİZ NE DİYOR?
            </h2>
            <p className="text-xl text-gray-600">
              Gerçek işletme sahiplerinden gerçek yorumlar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="shadow-xl border-2 border-gray-100 hover:border-blue-300 transition-all">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic font-medium text-lg">
                    "{testimonial.text}"
                  </p>
                  <div className="border-t pt-4">
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-blue-600 font-medium">{testimonial.business}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black mb-8">
              ARTIK KARAR VERME ZAMANI!
            </h2>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border-2 border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div>
                  <h3 className="text-2xl font-bold mb-4">❌ PetroRev KULLANMAZSANIZ:</h3>
                  <ul className="space-y-2">
                    <li>• Vardiya hatalarından para kaybetmeye devam edeceksiniz</li>
                    <li>• Personel takibinde problemler yaşayacaksınız</li>
                    <li>• Rakiplerinizin gerisinde kalacaksınız</li>
                    <li>• Zaman kaybetmeye devam edeceksiniz</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4">✅ PetroRev KULLANIRSAN IZ:</h3>
                  <ul className="space-y-2">
                    <li>• Hataları %95 azaltacaksınız</li>
                    <li>• Verimliliği %300 artıracaksınız</li>
                    <li>• Personel performansını optimize edeceksiniz</li>
                    <li>• İşletmenizi büyütmeye odaklanacaksınız</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-4xl font-black mb-8">
              SADECE ₺22.000/YIL
              <div className="text-xl font-normal mt-2">
                (Günde sadece ₺60 - bir çay parasından az!)
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
              <Button 
                size="lg" 
                className="bg-white text-red-600 hover:bg-gray-100 text-2xl px-16 py-8 font-black shadow-2xl transform hover:scale-105 transition-all"
                onClick={handleWhatsAppContact}
              >
                🚀 HEMEN DEMO İSTİYORUM!
              </Button>
              <Button 
                size="lg" 
                className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 text-2xl px-16 py-8 font-black shadow-2xl transform hover:scale-105 transition-all"
                onClick={() => navigate('/auth')}
              >
                ⚡ ÜCRETSİZ BAŞLA
              </Button>
            </div>

            <p className="text-xl">
              ⚡ HIZLI HAREKET EDİN - Bu fiyat sadece bu ay geçerli!
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src="/lovable-uploads/6b443a64-706a-401f-bdc5-fd18b2bcb790.png" 
                    alt="PetroRev Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold">PetroRev</h3>
              </div>
              <p className="text-gray-400">
                Türkiye'nin #1 akaryakıt istasyonu yönetim sistemi
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Özellikler</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Vardiya Takip Sistemi</li>
                <li>Personel Yönetimi</li>
                <li>Cari Hesap Takibi</li>
                <li>Raporlama Sistemi</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Destek</h4>
              <ul className="space-y-2 text-gray-400">
                <li>7/24 Canlı Destek</li>
                <li>Ücretsiz Eğitim</li>
                <li>Video Kütüphanesi</li>
                <li>Kişisel Danışmanlık</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">İletişim</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button 
                    onClick={handleEmailContact}
                    className="hover:text-white transition-colors"
                  >
                    yusufsami.1061@gmail.com
                  </button>
                </li>
                <li>
                  <button 
                    onClick={handleWhatsAppContact}
                    className="hover:text-white transition-colors"
                  >
                    WhatsApp: +90 536 454 7717
                  </button>
                </li>
                <li>Türkiye</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 PetroRev. Tüm hakları saklıdır.</p>
            <p className="text-sm mt-2">Akaryakıt İstasyonu Yönetim Sistemi | Vardiya Takip Programı</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
