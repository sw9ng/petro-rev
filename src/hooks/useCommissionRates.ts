import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CommissionRate {
  id: string;
  bankName: string;
  rate: number;
}

export const useCommissionRates = () => {
  const { user } = useAuth();
  const [commissionRates, setCommissionRates] = useState<CommissionRate[]>([]);
  const [loading, setLoading] = useState(false);

  // Load commission rates from database
  useEffect(() => {
    if (!user?.id) return;
    
    const loadCommissionRates = async () => {
      setLoading(true);
      try {
        const { data: rates, error } = await supabase
          .from('commission_rates')
          .select('*')
          .eq('station_id', user.id)
          .order('bank_name');

        if (error) throw error;

        const formattedRates = rates?.map(rate => ({
          id: rate.id,
          bankName: rate.bank_name,
          rate: rate.commission_rate
        })) || [];

        setCommissionRates(formattedRates);
      } catch (error) {
        console.error('Error loading commission rates:', error);
        toast.error('Komisyon oranları yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    loadCommissionRates();
  }, [user?.id]);

  const updateCommissionRate = async (bankName: string, rate: number) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('commission_rates')
        .upsert({
          station_id: user.id,
          bank_name: bankName,
          commission_rate: rate
        }, {
          onConflict: 'station_id, bank_name'
        })
        .select()
        .single();

      if (error) throw error;

      setCommissionRates(prev => {
        const existing = prev.find(r => r.bankName === bankName);
        if (existing) {
          return prev.map(r => 
            r.bankName === bankName 
              ? { ...r, rate: rate }
              : r
          );
        } else {
          return [...prev, {
            id: data.id,
            bankName: bankName,
            rate: rate
          }];
        }
      });

      toast.success(`${bankName} komisyon oranı güncellendi`);
    } catch (error) {
      console.error('Error updating commission rate:', error);
      toast.error('Komisyon oranı güncellenirken hata oluştu');
    }
  };

  const getCommissionRate = (bankName: string): number => {
    const rate = commissionRates.find(r => r.bankName === bankName);
    return rate?.rate || 0;
  };

  const deleteCommissionRate = async (bankName: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('commission_rates')
        .delete()
        .eq('station_id', user.id)
        .eq('bank_name', bankName);

      if (error) throw error;

      setCommissionRates(prev => prev.filter(r => r.bankName !== bankName));
      toast.success(`${bankName} komisyon oranı silindi`);
    } catch (error) {
      console.error('Error deleting commission rate:', error);
      toast.error('Komisyon oranı silinirken hata oluştu');
    }
  };

  const clearAllCommissionRates = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('commission_rates')
        .delete()
        .eq('station_id', user.id);

      if (error) throw error;

      setCommissionRates([]);
      toast.success('Tüm komisyon oranları silindi');
    } catch (error) {
      console.error('Error clearing commission rates:', error);
      toast.error('Komisyon oranları silinirken hata oluştu');
    }
  };

  return {
    commissionRates,
    updateCommissionRate,
    getCommissionRate,
    deleteCommissionRate,
    clearAllCommissionRates,
    loading
  };
};