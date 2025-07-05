import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface FuelSale {
  id: string;
  fuel_type: 'MOTORİN' | 'LPG' | 'BENZİN' | 'MOTORİN(DİĞER)';
  amount: number;
  price_per_liter: number;
  total_amount: number;
  liters: number;
  sale_time: string;
  start_hour?: string;
  end_hour?: string;
  personnel_id: string;
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
      .select('*')
      .eq('station_id', user.id)
      .order('sale_time', { ascending: false });

    if (error) {
      console.error('Error fetching fuel sales:', error);
    } else {
      // Type cast the data to match our interface
      const typedData = (data || []).map(sale => ({
        ...sale,
        fuel_type: sale.fuel_type as 'MOTORİN' | 'LPG' | 'BENZİN' | 'MOTORİN(DİĞER)'
      })) as FuelSale[];
      
      setFuelSales(typedData);
    }
    setLoading(false);
  };

  const fetchAllFuelSales = async () => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('fuel_sales')
      .select('*')
      .eq('station_id', user.id)
      .order('sale_time', { ascending: false });

    if (error) {
      console.error('Error fetching all fuel sales:', error);
      return [];
    }
    
    // Type cast the data to match our interface
    const typedData = (data || []).map(sale => ({
      ...sale,
      fuel_type: sale.fuel_type as 'MOTORİN' | 'LPG' | 'BENZİN' | 'MOTORİN(DİĞER)'
    })) as FuelSale[];
    
    return typedData;
  };

  const addFuelSale = async (fuelSaleData: any) => {
    if (!user) return { error: 'Kullanıcı doğrulanmadı' };

    const { data, error } = await supabase
      .from('fuel_sales')
      .insert([
        {
          fuel_type: fuelSaleData.fuel_type,
          amount: fuelSaleData.amount,
          price_per_liter: fuelSaleData.price_per_liter,
          total_amount: fuelSaleData.total_amount,
          liters: fuelSaleData.liters,
          sale_time: fuelSaleData.sale_time,
          station_id: user.id,
          personnel_id: user.id // Use station owner as default personnel
        }
      ])
      .select('*')
      .single();

    if (!error && data) {
      // Type cast the new sale data
      const typedSale = {
        ...data,
        fuel_type: data.fuel_type as 'MOTORİN' | 'LPG' | 'BENZİN' | 'MOTORİN(DİĞER)'
      } as FuelSale;
      
      setFuelSales(prev => [typedSale, ...prev]);
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

  const getFuelSalesByDateRange = (startDate: string, endDate: string) => {
    return fuelSales.filter(sale => {
      const saleDate = sale.sale_time.split('T')[0];
      return saleDate >= startDate && saleDate <= endDate;
    });
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
    getFuelSalesByDateRange,
    fetchAllFuelSales,
    refreshFuelSales: fetchFuelSales
  };
};
