
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
    if (!user) {
      console.log('No user found, clearing fuel purchases');
      setFuelPurchases([]);
      setLoading(false);
      return;
    }
    
    console.log('Fetching fuel purchases for user:', user.id);
    setLoading(true);
    
    const { data, error } = await supabase
      .from('fuel_purchases')
      .select('*')
      .eq('station_id', user.id)
      .order('purchase_date', { ascending: false });

    console.log('Fuel purchases fetch result:', { data, error });

    if (error) {
      console.error('Error fetching fuel purchases:', error);
      setFuelPurchases([]);
    } else {
      console.log('Setting fuel purchases:', data || []);
      setFuelPurchases(data || []);
    }
    setLoading(false);
  };

  const addFuelPurchase = async (purchaseData: any) => {
    if (!user) return { error: 'Kullanıcı doğrulanmadı' };

    console.log('Adding fuel purchase:', { ...purchaseData, station_id: user.id });

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

    console.log('Add fuel purchase result:', { data, error });

    if (!error && data) {
      console.log('Successfully added fuel purchase, updating state');
      setFuelPurchases(prev => [data, ...prev]);
    } else {
      console.error('Failed to add fuel purchase:', error);
    }

    return { data, error };
  };

  const deleteFuelPurchase = async (purchaseId: string) => {
    if (!user) return { error: 'Kullanıcı doğrulanmadı' };

    console.log('Deleting fuel purchase:', purchaseId);

    const { error } = await supabase
      .from('fuel_purchases')
      .delete()
      .eq('id', purchaseId)
      .eq('station_id', user.id);

    console.log('Delete fuel purchase result:', { error });

    if (!error) {
      console.log('Successfully deleted fuel purchase, updating state');
      setFuelPurchases(prev => prev.filter(purchase => purchase.id !== purchaseId));
    } else {
      console.error('Failed to delete fuel purchase:', error);
    }

    return { error };
  };

  useEffect(() => {
    console.log('useEffect triggered for fetchFuelPurchases, user:', user?.id);
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
