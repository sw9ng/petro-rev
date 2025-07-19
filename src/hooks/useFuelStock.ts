
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
      setFuelStock([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    console.log('Fetching fuel stock for user:', user.id);
    
    const { data, error } = await supabase
      .from('fuel_stock')
      .select('*')
      .eq('station_id', user.id)
      .order('fuel_type');

    if (error) {
      console.error('Error fetching fuel stock:', error);
      setFuelStock([]);
    } else {
      console.log('Fuel stock data received:', data);
      setFuelStock(data || []);
    }
    setLoading(false);
  };

  const updateStock = async (fuelType: string, newStock: number) => {
    if (!user) return { error: 'Kullanıcı doğrulanmadı' };

    console.log('Manually updating stock:', { fuelType, newStock, userId: user.id });

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
      console.log('Stock updated manually:', data);
      setFuelStock(prev => {
        const existing = prev.find(stock => stock.fuel_type === fuelType);
        if (existing) {
          return prev.map(stock => stock.fuel_type === fuelType ? data : stock);
        } else {
          return [...prev, data];
        }
      });
    } else {
      console.error('Error updating stock manually:', error);
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
    console.log(`Stock check for ${fuelType}: current=${currentStock}, requested=${requestedLiters}, available=${isAvailable}`);
    return isAvailable;
  };

  const recalculateStock = async () => {
    if (!user) return;

    console.log('Recalculating stock for user:', user.id);

    try {
      // Get all purchases
      const { data: purchases, error: purchasesError } = await supabase
        .from('fuel_purchases')
        .select('fuel_type, liters')
        .eq('station_id', user.id);

      if (purchasesError) {
        console.error('Error fetching purchases:', purchasesError);
        return;
      }

      // Get all sales
      const { data: sales, error: salesError } = await supabase
        .from('fuel_sales')
        .select('fuel_type, liters')
        .eq('station_id', user.id);

      if (salesError) {
        console.error('Error fetching sales:', salesError);
        return;
      }

      console.log('Purchases data:', purchases);
      console.log('Sales data:', sales);

      // Calculate stock for each fuel type
      const stockByType: Record<string, number> = {};

      // Add purchases
      purchases?.forEach(purchase => {
        if (!stockByType[purchase.fuel_type]) {
          stockByType[purchase.fuel_type] = 0;
        }
        stockByType[purchase.fuel_type] += purchase.liters;
      });

      // Subtract sales
      sales?.forEach(sale => {
        if (!stockByType[sale.fuel_type]) {
          stockByType[sale.fuel_type] = 0;
        }
        stockByType[sale.fuel_type] -= sale.liters;
      });

      console.log('Calculated stock by type:', stockByType);

      // Update stock in database
      for (const [fuelType, calculatedStock] of Object.entries(stockByType)) {
        const finalStock = Math.max(0, calculatedStock); // Prevent negative stock
        
        await supabase
          .from('fuel_stock')
          .upsert({
            station_id: user.id,
            fuel_type: fuelType,
            current_stock: finalStock,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'station_id,fuel_type'
          });

        console.log(`Updated ${fuelType} stock to: ${finalStock}`);
      }

      // Refresh the local stock data
      await fetchFuelStock();

    } catch (error) {
      console.error('Error recalculating stock:', error);
    }
  };

  useEffect(() => {
    fetchFuelStock();
  }, [user]);

  // Realtime subscription for stock updates
  useEffect(() => {
    if (!user) return;

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
          console.log('Realtime stock change:', payload);
          fetchFuelStock(); // Refresh stock when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    fuelStock,
    loading,
    updateStock,
    refreshStock: fetchFuelStock,
    getStockForFuelType,
    checkStockAvailability,
    recalculateStock
  };
};
