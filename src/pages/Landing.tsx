import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Fuel, Users, BarChart3, Shield, Clock, DollarSign, Zap, CheckCircle } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src="/lovable-uploads/6b443a64-706a-401f-bdc5-fd18b2bcb790.png" 
                  alt="PetroRev Logo" 
                  className="w-14 h-14 object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">PetroRev</h1>
            </div>
            <Button 
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Giriş Yap
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Akaryakıt İstasyonunuz İçin 
              <span className="text-blue-600 block">Modern Yönetim Sistemi</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              PetroRev ile akaryakıt istasyonunuzun tüm operasyonlarını dijitalleştirin. 
              Personel yönetimi, vardiya takibi, satış analizi ve raporlama artık tek platformda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4"
                onClick={() => navigate('/')}
              >
                <Zap className="mr-2 h-5 w-5" />
                Hemen Başla
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-4 border-gray-300"
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
              Neden PetroRev?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Akaryakıt istasyonu işletmeciliğinde ihtiyaç duyduğunuz tüm araçları tek platformda sunuyoruz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-gray-50 rounded-full w-fit">
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

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                İstasyonunuzu Dijital Çağa Taşıyın
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                PetroRev ile akaryakıt istasyonu yönetiminizi modernleştirin. 
                Kağıt işlemlerden kurtulun, hataları minimize edin ve 
                operasyonel verimliliğinizi artırın.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Ücretsiz Deneyin
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
                    <span className="text-gray-600">Detaylı raporlama</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Mobil erişim</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600">7/24 destek</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                  onClick={() => navigate('/')}
                >
                  Ücretsiz Başla
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              İstasyonunuzun Potansiyelini Keşfedin
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Binlerce akaryakıt istasyonu PetroRev ile operasyonlarını optimize etti. 
              Siz de bugün başlayın ve farkı yaşayın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4"
                onClick={() => navigate('/')}
              >
                Hemen Dene
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-white border-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4"
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
                <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src="/lovable-uploads/6b443a64-706a-401f-bdc5-fd18b2bcb790.png" 
                    alt="PetroRev Logo" 
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold">PetroRev</h3>
              </div>
              <p className="text-gray-400">
                Akaryakıt istasyonları için modern yönetim çözümleri.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Özellikler</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Personel Yönetimi</li>
                <li>Vardiya Takibi</li>
                <li>Satış Analizi</li>
                <li>Raporlama</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Destek</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Yardım Merkezi</li>
                <li>Teknik Destek</li>
                <li>Eğitim Videoları</li>
                <li>SSS</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">İletişim</h4>
              <ul className="space-y-2 text-gray-400">
                <li>info@petrorev.com</li>
                <li>+90 555 123 4567</li>
                <li>İstanbul, Türkiye</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 PetroRev. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
