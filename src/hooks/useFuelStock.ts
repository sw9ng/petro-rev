
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
    if (!user) {
      console.log('No user found, clearing fuel stock');
      setFuelStock([]);
      setLoading(false);
      return;
    }
    
    console.log('Fetching fuel stock for user:', user.id);
    setLoading(true);
    
    const { data, error } = await supabase
      .from('fuel_stock')
      .select('*')
      .eq('station_id', user.id)
      .order('fuel_type');

    console.log('Fuel stock fetch result:', { data, error });

    if (error) {
      console.error('Error fetching fuel stock:', error);
      setFuelStock([]);
    } else {
      console.log('Setting fuel stock:', data || []);
      setFuelStock(data || []);
    }
    setLoading(false);
  };

  const updateStock = async (fuelType: string, newStock: number) => {
    if (!user) return { error: 'Kullanıcı doğrulanmadı' };

    console.log('Updating stock:', { fuelType, newStock, userId: user.id });

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

    console.log('Update stock result:', { data, error });

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

  const getStockForFuelType = (fuelType: string): number => {
    const stock = fuelStock.find(s => s.fuel_type === fuelType);
    const currentStock = stock?.current_stock || 0;
    console.log(`Stock for ${fuelType}:`, currentStock);
    return currentStock;
  };

  const checkStockAvailability = (fuelType: string, requestedLiters: number): boolean => {
    const currentStock = getStockForFuelType(fuelType);
    const isAvailable = currentStock >= requestedLiters;
    console.log(`Stock check for ${fuelType}: ${currentStock} >= ${requestedLiters} = ${isAvailable}`);
    return isAvailable;
  };

  useEffect(() => {
    console.log('useEffect triggered for fetchFuelStock, user:', user?.id);
    fetchFuelStock();
  }, [user]);

  // Realtime subscription for stock updates
  useEffect(() => {
    if (!user) return;

    console.log('Setting up realtime subscription for fuel stock');
    const channel = supabase
      .channel('fuel-stock-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fuel_stock',
          filter: `station_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time fuel stock change:', payload);
          fetchFuelStock(); // Refresh stock when changes occur
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    fuelStock,
    loading,
    updateStock,
    refreshStock: fetchFuelStock,
    getStockForFuelType,
    checkStockAvailability
  };
};
