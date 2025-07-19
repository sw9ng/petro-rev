
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface FuelStock {
  id: string;
  station_id: string;
  fuel_type: string; // Changed from union type to string
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

  const getStockByFuelType = (fuelType: string): number => {
    const stock = fuelStock.find(s => s.fuel_type === fuelType);
    return stock ? stock.current_stock : 0;
  };

  useEffect(() => {
    fetchFuelStock();
  }, [user]);

  return {
    fuelStock,
    loading,
    getStockByFuelType,
    refreshFuelStock: fetchFuelStock
  };
};
