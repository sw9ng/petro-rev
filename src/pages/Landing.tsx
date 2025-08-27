import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Fuel, Users, BarChart3, Shield, Clock, DollarSign, Zap, CheckCircle, Star, Trophy, Code, Calculator, Mail, MessageCircle, Phone, Target, ArrowRight, Gauge, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Landing = () => {
  const navigate = useNavigate();

  const problemPoints = [
    "Kağıt ve kalem ile vardiya takibi yapıyorsunuz?",
    "Personel açık/fazla hesaplamalarında sürekli hata yapıyor?",
    "Hangi çalışanın ne kadar sattığını takip edemiyorsunuz?",
    "Günlük, haftalık, aylık raporları manuel hesaplıyorsunuz?",
    "Müşteri borçlarını takip etmekte zorlanıyorsunuz?"
  ];

  const solutions = [
    {
      icon: <Clock className="h-8 w-8 text-blue-600" />,
      title: "Vardiya Takip Sistemi",
      description: "Dijital vardiya girişi ile tüm satışları otomatik takip edin. Açık/fazla hesaplamaları sistem otomatik yapar.",
      benefit: "Günde 2 saat zaman tasarrufu"
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: "Sınırsız Personel Yönetimi",
      description: "İstediğiniz kadar personel ekleyin. Her personelin performansını detaylıca analiz edin.",
      benefit: "100% doğru personel takibi"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-purple-600" />,
      title: "Anlık Raporlama",
      description: "Günlük, haftalık, aylık raporlarınızı bir tıkla görün. Tüm analizler otomatik.",
      benefit: "Anlık karar verme yeteneği"
    },
    {
      icon: <Calculator className="h-8 w-8 text-orange-600" />,
      title: "Otomatik Hesaplamalar",
      description: "Açık/fazla, komisyon, satış tutarları otomatik hesaplanır. Hiç hata yapmayın.",
      benefit: "%100 doğru hesaplamalar"
    }
  ];

  const testimonials = [
    {
      name: "Mehmet Özkan",
      role: "İstasyon Sahibi",
      text: "6 aydır PetroRev kullanıyorum. Vardiya takibi artık çok kolay ve hiç hata yapmıyoruz.",
      rating: 5
    },
    {
      name: "Ayşe Demir", 
      role: "İstasyon Müdürü",
      text: "Personel performansını takip etmek hiç bu kadar kolay olmamıştı. Süper bir sistem.",
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
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src="/lovable-uploads/6b443a64-706a-401f-bdc5-fd18b2bcb790.png" 
                  alt="PetroRev - Akaryakıt İstasyonu Yönetim Sistemi Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold text-foreground">PetroRev</h1>
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                2025 Edition
              </Badge>
            </div>
            <Button 
              onClick={() => navigate('/dashboard')}
              variant="outline"
              size="sm"
            >
              Sisteme Giriş
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Alex Hormozi Style */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            {/* Problem Hook */}
            <div className="mb-8">
              <Badge className="bg-destructive text-destructive-foreground mb-4 text-lg px-6 py-2">
                DURUN! Bu Size Tanıdık Geliyor mu?
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                Akaryakıt İstasyonunuzda<br />
                <span className="text-destructive">Günde 2 Saat Kaybediyor,</span><br />
                <span className="text-primary">Binlerce Lira Hatalar Yapıyorsunuz!</span>
              </h1>
            </div>

            {/* Problem Points */}
            <div className="bg-card border rounded-lg p-6 mb-8 text-left max-w-2xl mx-auto">
              <h3 className="font-bold text-lg mb-4 text-center text-destructive">Bu Problemler Sizi Yoruyor mu?</h3>
              <ul className="space-y-3">
                {problemPoints.map((problem, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">{problem}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solution Promise */}
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                İşte Size <span className="text-primary">Kesin Çözüm:</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
                <strong>PetroRev Premium</strong> ile tüm bu problemleri <span className="text-primary font-bold">24 saat içinde</span> çözün. 
                Günde 2 saat kazanın, hataları %100 önleyin, karınızı %30 artırın.
              </p>
            </div>

            {/* Value Proposition */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-card border rounded-lg p-6">
                <div className="text-3xl font-bold text-primary mb-2">₺50.000+</div>
                <div className="text-sm text-muted-foreground">Yıllık Hata Tasarrufu</div>
              </div>
              <div className="bg-card border rounded-lg p-6">
                <div className="text-3xl font-bold text-primary mb-2">2 Saat</div>
                <div className="text-sm text-muted-foreground">Günlük Zaman Tasarrufu</div>
              </div>
              <div className="bg-card border rounded-lg p-6">
                <div className="text-3xl font-bold text-primary mb-2">%30</div>
                <div className="text-sm text-muted-foreground">Kar Artışı</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-lg px-8 py-6"
                onClick={() => navigate('/auth')}
              >
                <Target className="mr-2 h-5 w-5" />
                ÜCRETSİZ HESAP AÇ - HEMEN BAŞLA
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6"
                onClick={handleWhatsAppContact}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                WhatsApp ile Bilgi Al
              </Button>
            </div>

            {/* Risk Reversal */}
            <p className="text-sm text-muted-foreground">
              ✅ Ücretsiz başlayın ✅ İstediğiniz zaman iptal edin ✅ 7/24 destek
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Problemlerinizin <span className="text-primary">Kesin Çözümü</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Her probleminiz için özel tasarlanmış çözümler. Artık hiç hata yapmayacaksınız.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {solutions.map((solution, index) => (
              <Card key={index} className="border hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      {solution.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-foreground mb-2">
                        {solution.title}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {solution.benefit}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{solution.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - Alex Hormozi Style */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-destructive text-destructive-foreground mb-4 text-lg px-6 py-2">
              ÖZEL FIYAT - SINIRLII SÜRE
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Bu Sistemi Almanın Maliyeti Nedir?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Normalde bu sistem <span className="text-destructive font-bold line-through">₺50.000</span> değerinde. 
              Ama bugün sadece...
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-primary shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-3 font-bold">
                🔥 EN POPÜLER PAKET - %56 İNDİRİM 🔥
              </div>
              
              <CardHeader className="text-center pt-16 pb-6">
                <CardTitle className="text-3xl font-bold text-foreground mb-4">
                  PetroRev Premium 2025
                </CardTitle>
                
                {/* Price Comparison */}
                <div className="space-y-2 mb-6">
                  <div className="text-lg text-muted-foreground">
                    Normal Fiyat: <span className="line-through text-destructive">₺50.000/yıl</span>
                  </div>
                  <div className="text-lg text-muted-foreground">
                    Diğer Sistemler: <span className="line-through text-destructive">₺35.000/yıl</span>
                  </div>
                  <div className="text-6xl font-bold text-primary">
                    ₺22.000
                  </div>
                  <div className="text-lg text-muted-foreground">
                    /yıl + KDV
                  </div>
                  <div className="text-xl text-primary font-bold">
                    Aylık sadece ₺1.833
                  </div>
                </div>

                <Badge variant="secondary" className="text-lg px-4 py-2">
                  ☕ Günde sadece ₺60 - Bir kahve fiyatına!
                </Badge>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* What You Get */}
                <div className="bg-primary/10 rounded-lg p-6">
                  <h4 className="font-bold text-lg mb-4 text-center">Bu Fiyata Neler Alıyorsunuz?</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "Sınırsız personel hesabı",
                      "Otomatik vardiya takibi", 
                      "Hata-proof hesaplamalar",
                      "Anlık raporlama sistemi",
                      "API entegrasyonu",
                      "Müşteri borç takibi",
                      "Mobil erişim (7/24)",
                      "Sınırsız veri saklama",
                      "Premium destek hattı",
                      "Özel entegrasyonlar",
                      "Otomatik yedekleme",
                      "Güvenlik garantisi"
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Value Calculation */}
                <div className="bg-card border rounded-lg p-6">
                  <h4 className="font-bold text-lg mb-4 text-center">Bu Yatırımınız Size Ne Kazandırır?</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Günlük 2 saat zaman tasarrufu (₺200/gün)</span>
                      <span className="font-bold">₺73.000/yıl</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hata önleme tasarrufu</span>
                      <span className="font-bold">₺25.000/yıl</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Personel verimliliği artışı</span>
                      <span className="font-bold">₺15.000/yıl</span>
                    </div>
                    <hr />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Toplam Kazancınız:</span>
                      <span className="text-primary">₺113.000/yıl</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span>PetroRev Maliyeti:</span>
                      <span>₺22.000/yıl</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold border-t pt-2">
                      <span>Net Kârınız:</span>
                      <span className="text-primary">₺91.000/yıl</span>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
                    <Mail className="mr-2 h-4 w-4" />
                    Güvenli Satın Alma
                  </h4>
                  <p className="text-sm text-yellow-700 mb-4">
                    Güvenli ödeme için bizimle iletişime geçin. Size özel taksit planları sunuyoruz.
                  </p>
                  <div className="space-y-3">
                    <Button 
                      onClick={handleWhatsAppContact}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp ile Satın Al (Anında Yanıt)
                    </Button>
                    <Button 
                      onClick={handleEmailContact}
                      variant="outline"
                      className="w-full"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      E-posta ile İletişim
                    </Button>
                  </div>
                </div>

                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
                  onClick={() => navigate('/auth')}
                >
                  <Target className="mr-2 h-5 w-5" />
                  HEMEN ÜCRETSİZ BAŞLA
                </Button>

                {/* Guarantee */}
                <div className="text-center bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Shield className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-bold text-green-800">100% GARANTİ</span>
                  </div>
                  <p className="text-sm text-green-700">
                    30 gün içinde memnun kalmazsan, paranı iade ediyoruz.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trust Indicators */}
          <div className="text-center mt-12">
            <div className="flex justify-center space-x-8 text-sm text-muted-foreground mb-6">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                SSL Güvenlik
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Banka Havalesi
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                7/24 Destek
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              * Fiyatlar KDV hariçtir. Taksit seçenekleri için iletişime geçin.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Müşterilerimiz <span className="text-primary">Ne Diyor?</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              PetroRev kullanan istasyon sahipleri nasıl fark yarattı?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <div className="font-bold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Urgency Section */}
      <section className="py-16 px-4 bg-destructive text-destructive-foreground">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              ⚠️ DİKKAT: Bu Fırsat Sınırlı Sürelidir!
            </h2>
            <p className="text-xl mb-8">
              2025 özel fiyatı sadece <strong>31 Aralık</strong>'a kadar geçerli. 
              Sonrasında fiyat ₺35.000'e çıkacak.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-background text-foreground hover:bg-background/90 text-lg px-8 py-6"
                onClick={() => navigate('/auth')}
              >
                FIRSATI KAÇIRMA - HEMEN BAŞLA
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-background text-background hover:bg-background hover:text-foreground text-lg px-8 py-6"
                onClick={handleWhatsAppContact}
              >
                WhatsApp ile Hızlı İletişim
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Sıkça Sorulan Sorular
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: "Kurulum ne kadar sürer?",
                a: "Sistem 24 saat içinde kurulur ve kullanıma hazır hale gelir. Eğitim de dahil."
              },
              {
                q: "Mevcut sistemimle entegre olur mu?",
                a: "Evet, API entegrasyonu ile mevcut tüm sistemlerinizle sorunsuz çalışır."
              },
              {
                q: "Verilerim güvende mi?",
                a: "SSL şifreleme ve bulut güvenliği ile tüm verileriniz en üst düzeyde korunur."
              },
              {
                q: "Destek hizmeti nasıl?",
                a: "7/24 WhatsApp ve e-posta desteği. Ortalama yanıt süresi 5 dakika."
              },
              {
                q: "İptal edebilir miyim?",
                a: "Evet, 30 gün içinde memnun kalmazsanız tam para iadesi garantisi."
              }
            ].map((faq, index) => (
              <Card key={index} className="border">
                <CardContent className="p-6">
                  <h4 className="font-bold text-foreground mb-2">{faq.q}</h4>
                  <p className="text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Hazır mısınız? İstasyonunuzu Dijital Çağa Taşıyın!
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Bugün başlayın, yarından itibaren farkı görün. 
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
      <footer className="py-12 px-4 bg-background border-t">
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