import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, Users, Clock, AlertTriangle } from 'lucide-react';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { usePersonnel } from '@/hooks/usePersonnel';
import { useShifts } from '@/hooks/useShifts';
import { useNavigate } from 'react-router-dom';

const FREE_LIMITS = {
  PERSONNEL: 5,
  SHIFTS: 30
};

export const FreemiumLimits = () => {
  const { isPremium } = usePremiumStatus();
  const { personnel } = usePersonnel();
  const { shifts } = useShifts();
  const navigate = useNavigate();

  const personnelCount = personnel.length;
  const shiftCount = shifts.length;

  if (isPremium) {
    return null; // Premium kullanıcılar için limit gösterme
  }

  const personnelProgress = (personnelCount / FREE_LIMITS.PERSONNEL) * 100;
  const shiftProgress = (shiftCount / FREE_LIMITS.SHIFTS) * 100;

  const isPersonnelLimitReached = personnelCount >= FREE_LIMITS.PERSONNEL;
  const isShiftLimitReached = shiftCount >= FREE_LIMITS.SHIFTS;

  return (
    <Card className="shadow-sm border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-600" />
          Ücretsiz Plan Limitleri
        </CardTitle>
        <CardDescription>
          Premium'a yükseltin ve sınırsız özelliklerden yararlanın
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Personel Limiti */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Personel</span>
            </div>
            <Badge variant={isPersonnelLimitReached ? "destructive" : "secondary"}>
              {personnelCount}/{FREE_LIMITS.PERSONNEL}
            </Badge>
          </div>
          <Progress value={personnelProgress} className="h-2" />
          {isPersonnelLimitReached && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertTriangle className="h-4 w-4" />
              Personel limiti doldu
            </div>
          )}
        </div>

        {/* Vardiya Limiti */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="font-medium">Vardiya</span>
            </div>
            <Badge variant={isShiftLimitReached ? "destructive" : "secondary"}>
              {shiftCount}/{FREE_LIMITS.SHIFTS}
            </Badge>
          </div>
          <Progress value={shiftProgress} className="h-2" />
          {isShiftLimitReached && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertTriangle className="h-4 w-4" />
              Vardiya limiti doldu
            </div>
          )}
        </div>

        <Button 
          onClick={() => navigate('/landing')}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
        >
          <Crown className="mr-2 h-4 w-4" />
          Premium'a Yükselt - Sınırsız Erişim
        </Button>
        
        <p className="text-xs text-center text-gray-500">
          Premium ile sınırsız personel ve vardiya, artı tüm gelişmiş özellikler
        </p>
      </CardContent>
    </Card>
  );
};