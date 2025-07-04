
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const usePremiumStatus = () => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!user) {
        setIsPremium(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('is_user_premium', {
          user_id: user.id
        });

        if (error) {
          console.error('Premium status check error:', error);
          setIsPremium(false);
        } else {
          setIsPremium(data);
        }
      } catch (error) {
        console.error('Premium status check error:', error);
        setIsPremium(false);
      } finally {
        setLoading(false);
      }
    };

    checkPremiumStatus();
  }, [user]);

  return { isPremium, loading };
};
