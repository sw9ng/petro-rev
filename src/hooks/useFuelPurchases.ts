
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface FuelPurchase {
  id: string;
  station_id: string;
  fuel_type: string;
  liters: number;
  purchase_price_per_liter: number;
  total_amount: number;
  purchase_date: string;
  supplier?: string;
  invoice_number?: string;
  notes?: string;
  created_at: string;
}

export const useFuelPurchases = () => {
  const { user } = useAuth();
  const [fuelPurchases, setFuelPurchases] = useState<FuelPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFuelPurchases = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('fuel_purchases')
      .select('*')
      .eq('station_id', user.id)
      .order('purchase_date', { ascending: false });

    if (error) {
      console.error('Error fetching fuel purchases:', error);
    } else {
      setFuelPurchases(data || []);
    }
    setLoading(false);
  };

  const addFuelPurchase = async (purchaseData: any) => {
    if (!user) return { error: 'Kullanıcı doğrulanmadı' };

    const { data, error } = await supabase
      .from('fuel_purchases')
      .insert([
        {
          ...purchaseData,
          station_id: user.id
        }
      ])
      .select('*')
      .single();

    if (!error && data) {
      setFuelPurchases(prev => [data, ...prev]);
    }

    return { data, error };
  };

  const deleteFuelPurchase = async (purchaseId: string) => {
    if (!user) return { error: 'Kullanıcı doğrulanmadı' };

    const { error } = await supabase
      .from('fuel_purchases')
      .delete()
      .eq('id', purchaseId)
      .eq('station_id', user.id);

    if (!error) {
      setFuelPurchases(prev => prev.filter(purchase => purchase.id !== purchaseId));
    }

    return { error };
  };

  useEffect(() => {
    fetchFuelPurchases();
  }, [user]);

  return {
    fuelPurchases,
    loading,
    addFuelPurchase,
    deleteFuelPurchase,
    refreshPurchases: fetchFuelPurchases
  };
};
