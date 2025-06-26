
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface FuelSale {
  id: string;
  personnel_id: string;
  fuel_type: 'MOTORİN' | 'LPG' | 'BENZİN' | 'MOTORİN(DİĞER)';
  amount: number;
  price_per_liter: number;
  total_amount: number;
  liters: number;
  sale_time: string;
  shift_id?: string;
  personnel: {
    name: string;
  };
}

export const useFuelSales = () => {
  const { user } = useAuth();
  const [fuelSales, setFuelSales] = useState<FuelSale[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFuelSales = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('fuel_sales')
      .select(`
        *,
        personnel:personnel_id (
          name
        )
      `)
      .eq('station_id', user.id)
      .order('sale_time', { ascending: false });

    if (error) {
      console.error('Error fetching fuel sales:', error);
    } else {
      setFuelSales(data || []);
    }
    setLoading(false);
  };

  const addFuelSale = async (fuelSaleData: any) => {
    if (!user) return { error: 'Kullanıcı doğrulanmadı' };

    const { data, error } = await supabase
      .from('fuel_sales')
      .insert([
        {
          personnel_id: fuelSaleData.personnel_id,
          fuel_type: fuelSaleData.fuel_type,
          amount: fuelSaleData.amount,
          price_per_liter: fuelSaleData.price_per_liter,
          total_amount: fuelSaleData.total_amount,
          liters: fuelSaleData.liters,
          sale_time: fuelSaleData.sale_time,
          station_id: user.id,
          shift_id: fuelSaleData.shift_id
        }
      ])
      .select(`
        *,
        personnel:personnel_id (
          name
        )
      `)
      .single();

    if (!error && data) {
      setFuelSales(prev => [data, ...prev]);
    }

    return { data, error };
  };

  const deleteFuelSale = async (fuelSaleId: string) => {
    if (!user) return { error: 'Kullanıcı doğrulanmadı' };

    const { error } = await supabase
      .from('fuel_sales')
      .delete()
      .eq('id', fuelSaleId)
      .eq('station_id', user.id);

    if (!error) {
      setFuelSales(prev => prev.filter(sale => sale.id !== fuelSaleId));
    }

    return { error };
  };

  const getTotalFuelSales = () => {
    return fuelSales.reduce((sum, sale) => sum + sale.total_amount, 0);
  };

  const getFuelSalesByType = () => {
    const salesByType = {
      'MOTORİN': 0,
      'LPG': 0,
      'BENZİN': 0,
      'MOTORİN(DİĞER)': 0
    };

    fuelSales.forEach(sale => {
      salesByType[sale.fuel_type] += sale.total_amount;
    });

    return salesByType;
  };

  useEffect(() => {
    fetchFuelSales();
  }, [user]);

  return {
    fuelSales,
    loading,
    addFuelSale,
    deleteFuelSale,
    getTotalFuelSales,
    getFuelSalesByType,
    refreshFuelSales: fetchFuelSales
  };
};
