import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Lock } from 'lucide-react';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { useNavigate } from 'react-router-dom';

interface FreemiumGateProps {
  children: ReactNode;
  feature: string;
  description?: string;
  showUpgrade?: boolean;
}

export const FreemiumGate = ({ 
  children, 
  feature, 
  description, 
  showUpgrade = true 
}: FreemiumGateProps) => {
  const { isPremium, loading } = usePremiumStatus();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className="shadow-sm border">
        <CardContent className="text-center py-8">
          <p className="text-gray-600">Yükleniyor...</p>
        </CardContent>
      </Card>
    );
  }

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <Card className="shadow-sm border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
          <Crown className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2 text-xl">
          <Lock className="h-5 w-5 text-amber-600" />
          Premium Özellik
        </CardTitle>
        <CardDescription className="text-lg">
          {feature} premium üyelik gerektirir
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {description && (
          <p className="text-gray-600">{description}</p>
        )}
        
        <div className="bg-white rounded-lg p-4 border border-amber-200">
          <h4 className="font-semibold text-gray-900 mb-2">
            Premium ile erişebileceğiniz özellikler:
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Sınırsız personel yönetimi</li>
            <li>• Sınırsız vardiya girişi</li>
            <li>• Gelişmiş raporlama</li>
            <li>• API entegrasyonu</li>
            <li>• Cari hesap yönetimi</li>
            <li>• Fatura entegrasyonu</li>
          </ul>
        </div>

        {showUpgrade && (
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/landing')}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
              size="lg"
            >
              <Star className="mr-2 h-5 w-5" />
              Premium'a Yükselt
            </Button>
            <p className="text-xs text-gray-500">
              Ücretsiz hesabınızla sadece vardiya takibi yapabilirsiniz
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};