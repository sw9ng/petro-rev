
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface FuelStock {
  id: string;
  station_id: string;
  fuel_type: string;
  current_stock: number;
  created_at: string;
  updated_at: string;
}

export const useFuelStock = () => {
  const { user } = useAuth();
  const [fuelStock, setFuelStock] = useState<FuelStock[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFuelStock = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('fuel_stock')
      .select('*')
      .eq('station_id', user.id)
      .order('fuel_type');

    if (error) {
      console.error('Error fetching fuel stock:', error);
    } else {
      setFuelStock(data || []);
    }
    setLoading(false);
  };

  const updateStock = async (fuelType: string, newStock: number) => {
    if (!user) return { error: 'Kullanıcı doğrulanmadı' };

    const { data, error } = await supabase
      .from('fuel_stock')
      .upsert({
        station_id: user.id,
        fuel_type: fuelType,
        current_stock: newStock,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'station_id,fuel_type'
      })
      .select('*')
      .single();

    if (!error && data) {
      setFuelStock(prev => {
        const existing = prev.find(stock => stock.fuel_type === fuelType);
        if (existing) {
          return prev.map(stock => stock.fuel_type === fuelType ? data : stock);
        } else {
          return [...prev, data];
        }
      });
    }

    return { data, error };
  };

  useEffect(() => {
    fetchFuelStock();
  }, [user]);

  return {
    fuelStock,
    loading,
    updateStock,
    refreshStock: fetchFuelStock
  };
};
