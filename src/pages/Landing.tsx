import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Fuel, Users, BarChart3, Shield, Clock, DollarSign, Zap, CheckCircle, Star, Trophy, Code, Calculator, Mail, MessageCircle, Phone, Target, ArrowRight, Gauge, Settings, TrendingUp, Database, FileText, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Gauge className="h-12 w-12" />,
      title: "Vardiya Takip Sistemi",
      description: "PetroRev ile akaryakıt personelinin vardiya saatlerini otomatik takip edin. Kim ne zaman çalıştı, hepsini kaydedin.",
      stats: "Günde 2 saat tasarruf"
    },
    {
      icon: <BarChart3 className="h-12 w-12" />,
      title: "Akaryakıt Satış Raporları",
      description: "PetroRev ile benzin, motorin satışlarınızı detaylı olarak görün. Hangi günler daha karlı?",
      stats: "Daha iyi kararlar"
    },
    {
      icon: <Shield className="h-12 w-12" />,
      title: "Güvenli",
      description: "Bilgilerin güvende. Hiç kimse göremez. Sadece sen görebilirsin.",
      stats: "Süper güvenli"
    },
    {
      icon: <Smartphone className="h-12 w-12" />,
      title: "Telefonda da Çalışır",
      description: "Evde, işte, her yerde kullan. İnternetsiz de çalışır.",
      stats: "Her zaman açık"
    },
    {
      icon: <Database className="h-12 w-12" />,
      title: "Diğer Programlarla Çalışır",
      description: "Zaten kullandığın programlar var mı? Onlarla da çalışır.",
      stats: "Hepsiyle çalışır"
    },
    {
      icon: <TrendingUp className="h-12 w-12" />,
      title: "Daha Çok Para Kazan",
      description: "Nerelerde para kaybediyorsun? Göster. Daha çok para kazan.",
      stats: "Daha çok para"
    }
  ];

  const pricingPlans = [
    {
      name: "Ücretsiz",
      price: "0₺",
      period: "her zaman",
      description: "Başlamak için her şey var",
      features: [
        "Temel vardiya takibi",
        "Basit raporlar",
        "E-posta ile yardım"
      ],
      cta: "Hemen Başla",
      popular: false,
      savings: null
    },
    {
      name: "Premium",
      price: "22.000₺",
      period: "yıllık",
      description: "İşinizi büyütün, daha çok para kazanın",
      features: [
        "Sınırsız kullanıcı",
        "Gelişmiş raporlar",
        "WhatsApp desteği",
        "Tüm özellikler",
        "Mobil uygulama"
      ],
      cta: "Şimdi Al",
      popular: true,
      savings: "88.000₺"
    }
  ];

  const testimonials = [
    {
      name: "Mehmet Özkan",
      company: "Özkan Petrol",
      role: "İstasyon Sahibi",
      text: "PetroRev sayesinde operasyonel verimliliğimiz %40 arttı. Artık her şey otomatik ve hatasız.",
      image: "/placeholder.svg",
      rating: 5
    },
    {
      name: "Ayşe Demir", 
      company: "Demir Akaryakıt",
      role: "Genel Müdür",
      text: "6 aylık kullanım sonunda ROI'miz %300'ü geçti. Kesinlikle öneriyorum.",
      image: "/placeholder.svg",
      rating: 5
    },
    {
      name: "Okan Yılmaz",
      company: "Yılmaz Petrol Zinciri", 
      role: "İş Geliştirme Müdürü",
      text: "Çoklu istasyon yönetimi hiç bu kadar kolay olmamıştı. Gerçek zamanlı kontrol mükemmel.",
      image: "/placeholder.svg",
      rating: 5
    }
  ];

  const handleWhatsAppContact = () => {
    window.open('https://wa.me/905364547717?text=PetroRev Premium hakkında bilgi almak istiyorum.', '_blank');
  };

  const handleEmailContact = () => {
    window.open('mailto:yusufsami.1061@gmail.com?subject=PetroRev Premium Bilgi Talebi&body=Merhaba, PetroRev Premium hakkında bilgi almak istiyorum.', '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
              <img 
                src="/lovable-uploads/6b443a64-706a-401f-bdc5-fd18b2bcb790.png" 
                alt="PetroRev Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                PetroRev
              </h1>
              <Badge variant="secondary" className="text-xs font-medium">
                2025
              </Badge>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Özellikler
            </a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Fiyatlandırma
            </a>
            <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Referanslar
            </a>
            <Button 
              onClick={() => navigate('/auth')}
              size="sm"
            >
              Giriş Yap
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-6 bg-gradient-to-br from-background via-primary/5 to-background">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 text-sm font-medium px-4 py-2">
              🚀 PetroRev - Akaryakıt Vardiya Programı
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Akaryakıt İstasyonu
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent block">
                Vardiya Takip Sistemi
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              PetroRev ile akaryakıt istasyonunuzu dijital olarak yönetin. Vardiya programı, 
              personel takibi, satış raporları ve cari hesap yönetimi tek platformda.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="text-lg px-8 py-4 h-14"
                onClick={() => navigate('/auth')}
              >
                <Target className="mr-2 h-5 w-5" />
                Ücretsiz Dene
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-4 h-14"
                onClick={handleWhatsAppContact}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Demo İzle
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">10+</div>
                <div className="text-sm text-muted-foreground">Aktif İstasyon</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime Garantisi</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">Destek Hizmeti</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Özellikler
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              PetroRev <span className="text-primary">Özellikleri</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Akaryakıt istasyonu yönetimini kolaylaştıran vardiya takip sistemi özellikleri
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader className="text-center">
                  <div className="w-20 h-20 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <div className="text-primary">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold mb-2">
                    {feature.title}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs font-medium">
                    {feature.stats}
                  </Badge>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Fiyatlandırma
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Hangi Paketi <span className="text-primary">İstiyorsun?</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Kolay fiyatlar. Gizli ücret yok!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative overflow-hidden ${plan.popular ? 'border-2 border-primary shadow-xl scale-105' : 'border'}`}>
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
                    🔥 En Popüler
                  </div>
                )}
                
                <CardHeader className={`text-center ${plan.popular ? 'pt-12' : 'pt-6'}`}>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <div className="text-4xl font-bold text-primary">{plan.price}</div>
                    <div className="text-sm text-muted-foreground">/{plan.period}</div>
                  </div>
                  <p className="text-muted-foreground mt-2">{plan.description}</p>
                  
                  {plan.savings && (
                    <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="text-lg font-bold text-green-800 dark:text-green-400">
                        Yılda {plan.savings} kazanç!
                      </div>
                      <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                        Ortalama istasyon verilerine göre
                      </div>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center space-x-3">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full mt-6 ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => navigate('/auth')}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground mb-4">
              Tüm planlar 14 günlük ücretsiz deneme ile gelir
            </p>
            <div className="flex justify-center space-x-8 text-xs text-muted-foreground">
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 text-primary mr-1" />
                SSL Güvenlik
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 text-primary mr-1" />
                GDPR Uyumlu
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 text-primary mr-1" />
                24/7 Destek
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Müşteri Görüşleri
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Müşteriler <span className="text-primary">Ne Diyor?</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              PetroRev kullanan kişiler çok memnun
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  <blockquote className="text-muted-foreground mb-6 italic">
                    "{testimonial.text}"
                  </blockquote>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              PetroRev ile Akaryakıt İstasyonunuzu Dijitalleştirin!
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Türkiye'nin en gelişmiş akaryakıt vardiya programı ile bugün başlayın. 
              İlk 100 müşteriye özel %50 indirim!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-background text-foreground hover:bg-background/90 text-lg px-8 py-6"
                onClick={() => navigate('/auth')}
              >
                <Target className="mr-2 h-5 w-5" />
                EVET, HEMEN BAŞLAMAK İSTİYORUM
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-background text-background hover:bg-background hover:text-foreground text-lg px-8 py-6"
                onClick={handleWhatsAppContact}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Önce Konuşalım
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-background border-t">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/lovable-uploads/6b443a64-706a-401f-bdc5-fd18b2bcb790.png" 
                  alt="PetroRev Logo" 
                  className="w-8 h-8"
                />
                <h3 className="text-xl font-bold text-foreground">PetroRev</h3>
              </div>
              <p className="text-muted-foreground">
                Akaryakıt istasyonu yönetim sistemi ve vardiya takip çözümleri.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">İletişim</h4>
              <div className="space-y-2 text-muted-foreground">
                <div>E-posta: yusufsami.1061@gmail.com</div>
                <div>WhatsApp: +90 536 454 77 17</div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">Özellikler</h4>
              <div className="space-y-2 text-muted-foreground text-sm">
                <div>• Vardiya Takip Sistemi</div>
                <div>• Personel Yönetimi</div>
                <div>• API Entegrasyonu</div>
                <div>• Detaylı Raporlama</div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-muted-foreground text-sm">
            <p>&copy; 2025 PetroRev. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};