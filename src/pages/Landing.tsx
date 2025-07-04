
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Fuel, Users, BarChart3, Shield, Clock, DollarSign, Zap, CheckCircle, Star, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Personel Yönetimi",
      description: "Akaryakıt istasyonu personelinizi kolayca yönetin, vardiya takibi yapın ve performansları izleyin."
    },
    {
      icon: <Clock className="h-8 w-8 text-green-600" />,
      title: "Vardiya Takibi",
      description: "Detaylı vardiya kaydı tutun, satış verilerini girin ve açık/fazla hesaplamalarını otomatik yapın."
    },
    {
      icon: <DollarSign className="h-8 w-8 text-purple-600" />,
      title: "Satış Analizi",
      description: "Nakit, kart, sadakat kartı ve havale ödemelerini ayrı ayrı takip edin, raporlar alın."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-orange-600" />,
      title: "Detaylı Raporlar",
      description: "Günlük, haftalık ve aylık satış raporları ile istasyonunuzun performansını analiz edin."
    },
    {
      icon: <Fuel className="h-8 w-8 text-red-600" />,
      title: "Akaryakıt Takibi",
      description: "Yakıt satışlarını pompaya göre takip edin, stok yönetimi yapın ve litre bazında analiz edin."
    },
    {
      icon: <Shield className="h-8 w-8 text-indigo-600" />,
      title: "Güvenli Veri",
      description: "Tüm verileriniz güvenli bulut ortamında saklanır ve sadece sizin erişiminize açıktır."
    }
  ];

  const benefits = [
    "Kolay kullanım ve hızlı öğrenme",
    "Mobil uyumlu tasarım",
    "Gerçek zamanlı veri senkronizasyonu",
    "Detaylı analiz ve raporlama",
    "Çoklu ödeme yöntemi desteği",
    "7/24 teknik destek"
  ];

  const pricingPlans = [
    {
      name: "Başlangıç",
      price: "2.400",
      originalPrice: "3.600",
      period: "yıl",
      description: "Küçük istasyonlar için ideal",
      features: [
        "5 personel hesabı",
        "Temel raporlama",
        "Vardiya takibi",
        "Email destek",
        "Temel analitik"
      ],
      popular: false,
      color: "border-gray-200"
    },
    {
      name: "Profesyonel",
      price: "4.800",
      originalPrice: "7.200",
      period: "yıl",
      description: "Orta büyüklükteki istasyonlar için",
      features: [
        "15 personel hesabı",
        "Gelişmiş raporlama",
        "Stok yönetimi",
        "Müşteri takibi",
        "Öncelikli destek",
        "API entegrasyonu"
      ],
      popular: true,
      color: "border-blue-500"
    },
    {
      name: "Kurumsal",
      price: "8.400",
      originalPrice: "12.000",
      period: "yıl",
      description: "Büyük istasyon zincirleri için",
      features: [
        "Sınırsız personel",
        "Çoklu istasyon yönetimi",
        "Özel raporlama",
        "Dedicated destek",
        "Özel entegrasyonlar",
        "SLA garantisi"
      ],
      popular: false,
      color: "border-purple-500"
    }
  ];

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
              className="bg-blue-600 hover:bg-blue-700"
            >
              Sisteme Giriş
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
              <span className="text-blue-600 block">Premium Yönetim Sistemi</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              PetroRev ile akaryakıt istasyonunuzun tüm operasyonlarını dijitalleştirin. 
              Yıllık abonelik ile %33 tasarruf edin ve premium özelliklerin keyfini çıkarın.
            </p>
            <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg border border-blue-100">
              <div className="flex items-center justify-center space-x-4 text-center">
                <div className="text-red-500 line-through text-lg">
                  Aylık ₺600/ay
                </div>
                <div className="text-3xl font-bold text-green-600">
                  Yıllık ₺4.800/yıl
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  %33 İndirim
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Sadece ₺400/ay - 2 ay ücretsiz kullanım!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4 shadow-lg"
                onClick={() => navigate('/')}
              >
                <Zap className="mr-2 h-5 w-5" />
                Ücretsiz Deneyin
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-4 border-gray-300 hover:bg-gray-50"
              >
                Demo İzle
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
              Neden PetroRev Premium?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Akaryakıt istasyonu işletmeciliğinde ihtiyaç duyduğunuz tüm premium araçları tek platformda sunuyoruz.
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

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Yıllık Abonelik Paketleri
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              İstasyonunuzun büyüklüğüne göre tasarlanmış paketler ile en uygun çözümü seçin.
            </p>
            <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full">
              <Trophy className="mr-2 h-4 w-4" />
              Tüm paketlerde %33 yıllık indirim!
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.color} ${plan.popular ? 'ring-2 ring-blue-500 shadow-2xl scale-105' : 'shadow-lg'} transition-all duration-300 hover:shadow-xl`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1">
                      En Popüler
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </CardTitle>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500 line-through">
                      ₺{plan.originalPrice}/{plan.period}
                    </div>
                    <div className="text-4xl font-bold text-blue-600">
                      ₺{plan.price}
                    </div>
                    <div className="text-sm text-gray-600">
                      /{plan.period} + KDV
                    </div>
                    <div className="text-xs text-green-600 font-medium">
                      Aylık sadece ₺{Math.round(parseInt(plan.price) / 12)}
                    </div>
                  </div>
                  <CardDescription className="mt-4">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : 'bg-gray-800 hover:bg-gray-900'} text-white py-3`}
                    onClick={() => navigate('/')}
                  >
                    {plan.popular ? 'Hemen Başla' : 'Seç'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              14 gün ücretsiz deneme ile başlayın. Kredi kartı gerekmez.
            </p>
            <div className="flex justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                İstediğiniz zaman iptal edin
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                7/24 destek
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Güvenli ödeme
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
                    <span className="text-gray-600">Gelişmiş raporlama</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Mobil erişim</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Premium destek</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600">API entegrasyonu</span>
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

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              İstasyonunuzun Potansiyelini Keşfedin
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Binlerce akaryakıt istasyonu PetroRev Premium ile operasyonlarını optimize etti. 
              Yıllık abonelik ile %33 tasarruf edin ve premium özelliklerin keyfini çıkarın.
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
              <div className="text-3xl font-bold text-white mb-2">
                Sadece ₺400/ay
              </div>
              <div className="text-blue-100">
                Yıllık ödemede 2 ay ücretsiz kullanım
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-4 shadow-lg"
                onClick={() => navigate('/')}
              >
                <Zap className="mr-2 h-5 w-5" />
                Hemen Dene
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-white border-white hover:bg-white/10 text-lg px-8 py-4"
              >
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
                Akaryakıt istasyonları için premium yönetim çözümleri.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Premium Özellikler</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Gelişmiş Personel Yönetimi</li>
                <li>Otomatik Vardiya Takibi</li>
                <li>AI Destekli Analiz</li>
                <li>Premium Raporlama</li>
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
                <li>premium@petrorev.com</li>
                <li>+90 536 454 7717</li>
                <li>İzmir, Türkiye</li>
                <li className="text-green-400">Premium Müşteri Hattı</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 PetroRev Premium. Tüm hakları saklıdır.</p>
            <p className="text-sm mt-2">Yıllık abonelik sistemi ile %33 tasarruf edin.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
