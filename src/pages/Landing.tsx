
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Fuel, Users, BarChart3, Shield, Clock, DollarSign, Zap, CheckCircle, Star, Trophy, Code, Calculator, Mail, MessageCircle, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Sınırsız Personel Yönetimi", 
      description: "İstediğiniz kadar personel ekleyin, vardiya takibi yapın ve performansları izleyin."
    },
    {
      icon: <Clock className="h-8 w-8 text-green-600" />,
      title: "Vardiya Takibi",
      description: "Detaylı vardiya kaydı tutun, satış verilerini girin ve tüm işlemleri takip edin."
    },
    {
      icon: <Calculator className="h-8 w-8 text-purple-600" />,
      title: "Açık/Fazla Takibi",
      description: "Otomatik açık/fazla hesaplama ile kasa kontrolünü kolaylaştırın ve hataları minimize edin."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-orange-600" />,
      title: "Detaylı Raporlar",
      description: "Günlük, haftalık ve aylık satış raporları ile istasyonunuzun performansını analiz edin."
    },
    {
      icon: <Code className="h-8 w-8 text-indigo-600" />,
      title: "API Entegrasyonu",
      description: "Kendi sistemlerinizle entegre olun, özel çözümler geliştirin ve verileri senkronize edin."
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: "Güvenli Veri",
      description: "Tüm verileriniz güvenli bulut ortamında saklanır ve sadece sizin erişiminize açıktır."
    }
  ];

  const benefits = [
    "Sınırsız personel hesabı",
    "Kolay kullanım ve hızlı öğrenme",
    "Mobil uyumlu tasarım", 
    "Gerçek zamanlı veri senkronizasyonu",
    "Detaylı analiz ve raporlama",
    "API entegrasyonu desteği",
    "7/24 teknik destek"
  ];

  const handleWhatsAppContact = () => {
    window.open('https://wa.me/905364547717?text=PetroRev Premium hakkında bilgi almak istiyorum.', '_blank');
  };

  const handleEmailContact = () => {
    window.open('mailto:yusufsami.1061@gmail.com?subject=PetroRev Premium Bilgi Talebi&body=Merhaba, PetroRev Premium hakkında bilgi almak istiyorum.', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src="/lovable-uploads/6b443a64-706a-401f-bdc5-fd18b2bcb790.png" 
                  alt="PetroRev Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">PetroRev</h1>
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                2025 Premium
              </Badge>
            </div>
            <Button 
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
              <Star className="mr-2 h-4 w-4" />
              Premium Giriş
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 text-lg">
                <Star className="mr-2 h-4 w-4" />
                2025 Yıllık Abonelik Sistemi
              </Badge>
            </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Akaryakıt İstasyonunuz İçin 
              <span className="text-blue-600 block">Freemium Çözüm</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              PetroRev ile başlayın, büyüdükçe premium özelliklerle gelişin. 
              Ücretsiz vardiya takibi ile başlayın, premium ile sınırsız özelliklere erişin.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Ücretsiz Plan */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="text-center">
                  <Badge className="bg-green-100 text-green-800 border-green-200 mb-4">
                    Ücretsiz Plan
                  </Badge>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    ₺0
                  </div>
                  <div className="text-lg text-gray-600 mb-4">
                    Sonsuza kadar ücretsiz
                  </div>
                  <ul className="text-sm text-left space-y-2 mb-4">
                    <li>✓ 5 personel hesabı</li>
                    <li>✓ 30 vardiya girişi</li>
                    <li>✓ Temel vardiya takibi</li>
                    <li>✓ Açık/fazla hesaplama</li>
                  </ul>
                </div>
              </div>

              {/* Premium Plan */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 shadow-lg border-2 border-blue-500 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1">
                    En Popüler
                  </Badge>
                </div>
                <div className="text-center">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 mb-4">
                    Premium Plan
                  </Badge>
                  <div className="text-red-500 line-through text-lg mb-1">
                    ₺24.000/yıl
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    ₺18.000/yıl
                  </div>
                  <div className="text-lg text-gray-600 mb-4">
                    Sadece ₺1.500/ay
                  </div>
                  <ul className="text-sm text-left space-y-2 mb-4">
                    <li>✓ Sınırsız personel</li>
                    <li>✓ Sınırsız vardiya</li>
                    <li>✓ Cari hesap yönetimi</li>
                    <li>✓ Detaylı raporlama</li>
                    <li>✓ API entegrasyonu</li>
                    <li>✓ E-fatura entegrasyonu</li>
                    <li>✓ 7/24 premium destek</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-lg px-8 py-4 shadow-lg"
                onClick={() => navigate('/')}
              >
                <Star className="mr-2 h-5 w-5" />
                Ücretsiz Başla
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-4 border-gray-300 hover:bg-gray-50"
                onClick={handleWhatsAppContact}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Premium İçin İletişim
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tek Pakette Her Şey Dahil
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Sınırsız personel, API entegrasyonu, vardiya takibi ve daha fazlası. Hiçbir kısıtlama yok!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-gray-50 to-blue-50 rounded-full w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-center leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Single Package Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tek Paket - Sınırsız Özellik
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Karmaşık paket seçimlerine son! Tek pakette ihtiyacınız olan her şey.
            </p>
            <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full">
              <Trophy className="mr-2 h-4 w-4" />
              %25 yıllık indirim ile 6.000₺ tasarruf!
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="relative shadow-2xl border-2 border-blue-500 ring-2 ring-blue-300">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 text-lg">
                  En Popüler Tek Seçenek
                </Badge>
              </div>
              <CardHeader className="text-center pb-6 pt-8">
                <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                  PetroRev Premium
                </CardTitle>
                <div className="space-y-2">
                  <div className="text-lg text-gray-500 line-through">
                    ₺24.000/yıl
                  </div>
                  <div className="text-5xl font-bold text-blue-600">
                    ₺18.000
                  </div>
                  <div className="text-lg text-gray-600">
                    /yıl + KDV
                  </div>
                  <div className="text-lg text-green-600 font-medium">
                    Aylık sadece ₺1.500
                  </div>
                </div>
                <CardDescription className="mt-4 text-lg">
                  Sınırsız özellik, sınırsız personel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-4">
                  {[
                    "Sınırsız personel hesabı",
                    "Gelişmiş vardiya takibi",
                    "Otomatik açık/fazla hesaplama",
                    "API entegrasyonu",
                    "Detaylı raporlama sistemi",
                    "Müşteri borç takibi",
                    "Yakıt satış yönetimi",
                    "Mobil erişim",
                    "7/24 premium destek",
                    "Sınırsız veri saklama",
                    "Özel entegrasyonlar",
                    "SLA garantisi"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* İletişim Bilgileri */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
                  <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
                    <Mail className="mr-2 h-4 w-4" />
                    Satın Almak İçin İletişime Geçin
                  </h4>
                  <p className="text-sm text-yellow-700 mb-4">
                    Güvenli ödeme için öncelikle bizimle iletişime geçin. Size özel ödeme planı hazırlayalım.
                  </p>
                  <div className="space-y-3">
                    <Button 
                      onClick={handleEmailContact}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      yusufsami.1061@gmail.com
                    </Button>
                    <Button 
                      onClick={handleWhatsAppContact}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp İletişim
                    </Button>
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6 shadow-lg mt-4"
                  onClick={() => navigate('/')}
                >
                  <Star className="mr-2 h-5 w-5" />
                  Premium Sisteme Giriş
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              İletişime geçin, size özel fiyat teklifi hazırlayalım.
            </p>
            <div className="flex justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Güvenli banka havalesi
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                7/24 destek
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Kişisel danışmanlık
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                İstasyonunuzu Dijital Çağa Taşıyın
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                PetroRev Premium ile akaryakıt istasyonu yönetiminizi modernleştirin. 
                Kağıt işlemlerden kurtulun, hataları minimize edin ve 
                operasyonel verimliliğinizi %40'a kadar artırın.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    </div>
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-2xl p-8 border border-blue-100">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Premium Deneyim
                  </h3>
                  <p className="text-gray-600">
                    14 gün ücretsiz deneme ile başlayın
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Sınırsız personel</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">API entegrasyonu</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Açık/fazla takibi</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Mobil erişim</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600">Premium destek</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6 shadow-lg"
                  onClick={() => navigate('/')}
                >
                  <Star className="mr-2 h-5 w-5" />
                  Premium'u Deneyin
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Methods Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              İletişim ve Ödeme Bilgileri
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Size özel ödeme planları için bizimle iletişime geçin.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Email İletişim</h3>
                <p className="text-gray-600 mb-4">Detaylı bilgi ve teklif için</p>
                <Button 
                  onClick={handleEmailContact}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  yusufsami.1061@gmail.com
                </Button>
              </Card>
              
              <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-center mb-4">
                  <MessageCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">WhatsApp İletişim</h3>
                <p className="text-gray-600 mb-4">Anında destek ve bilgi</p>
                <Button 
                  onClick={handleWhatsAppContact}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  WhatsApp ile İletişim
                </Button>
              </Card>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h4 className="font-semibold text-lg mb-3">Ödeme Seçenekleri</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Banka Havalesi</span>
                </div>
                <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Taksitli Ödeme</span>
                </div>
                <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Özel Ödeme Planı</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              İstasyonunuzun Potansiyelini Keşfedin
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Binlerce akaryakıt istasyonu PetroRev Premium ile operasyonlarını optimize etti. 
              Tek pakette sınırsız özellik ile %25 tasarruf edin.
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
              <div className="text-4xl font-bold text-white mb-2">
                Sadece ₺18.000/yıl
              </div>
              <div className="text-blue-100">
                Aylık ₺1.500 - 6.000₺ tasarruf
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-4 shadow-lg"
                onClick={() => navigate('/')}
              >
                <Star className="mr-2 h-5 w-5" />
                Premium Sisteme Giriş
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-white border-white hover:bg-white/10 text-lg px-8 py-4"
                onClick={handleWhatsAppContact}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                İletişime Geç
              </Button>
            </div>
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
                <Badge variant="secondary" className="bg-green-900 text-green-100 border-green-800">
                  Premium
                </Badge>
              </div>
              <p className="text-gray-400">
                Akaryakıt istasyonları için tek paket premium yönetim çözümü.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Premium Özellikler</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Sınırsız Personel Yönetimi</li>
                <li>Otomatik Vardiya Takibi</li>
                <li>API Entegrasyonu</li>
                <li>Açık/Fazla Takibi</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Premium Destek</h4>
              <ul className="space-y-2 text-gray-400">
                <li>7/24 Öncelikli Destek</li>
                <li>Canlı Chat Desteği</li>
                <li>Video Eğitimler</li>
                <li>Özel Danışmanlık</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">İletişim</h4>
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
                <li>İzmir, Türkiye</li>
                <li className="text-green-400">Premium Müşteri Hattı</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 PetroRev Premium. Tüm hakları saklıdır.</p>
            <p className="text-sm mt-2">Tek paket sistemi ile sınırsız özellik.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
