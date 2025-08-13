
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SavedProfitCalculation {
  id: string;
  date: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  fuelData: Array<{
    fuel_type: string;
    total_amount: number;
    total_liters: number;
  }>;
  purchasePrices: Record<string, number>;
  totalProfit: number;
  totalRevenue: number;
  profitMargin: number;
  calculationDetails: Array<{
    fuel_type: string;
    purchase_price: number;
    average_sale_price: number;
    total_liters: number;
    total_revenue: number;
    profit_per_liter: number;
    total_profit: number;
  }>;
}

export const useFuelProfitCalculations = () => {
  const { user } = useAuth();
  const [savedCalculations, setSavedCalculations] = useState<SavedProfitCalculation[]>([]);
  const [currentPurchasePrices, setCurrentPurchasePrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  // Load saved calculations and purchase prices from database
  useEffect(() => {
    if (!user?.id) return;
    
    const loadData = async () => {
      setLoading(true);
      try {
        // Load profit calculations
        const { data: calculations, error: calcError } = await supabase
          .from('fuel_profit_calculations')
          .select('*')
          .eq('station_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (calcError) throw calcError;

        const formattedCalculations = calculations?.map(calc => ({
          id: calc.id,
          date: calc.created_at,
          dateRange: {
            startDate: calc.date_range_start,
            endDate: calc.date_range_end
          },
          fuelData: calc.fuel_data as Array<{
            fuel_type: string;
            total_amount: number;
            total_liters: number;
          }>,
          purchasePrices: calc.purchase_prices as Record<string, number>,
          totalProfit: calc.total_profit,
          totalRevenue: calc.total_revenue,
          profitMargin: calc.profit_margin,
          calculationDetails: calc.calculation_details as Array<{
            fuel_type: string;
            purchase_price: number;
            average_sale_price: number;
            total_liters: number;
            total_revenue: number;
            profit_per_liter: number;
            total_profit: number;
          }>
        })) || [];

        setSavedCalculations(formattedCalculations);

        // Load current purchase prices
        const { data: prices, error: pricesError } = await supabase
          .from('fuel_purchase_prices')
          .select('*')
          .eq('station_id', user.id);

        if (pricesError) throw pricesError;

        const pricesMap = prices?.reduce((acc, price) => {
          acc[price.fuel_type] = price.price;
          return acc;
        }, {} as Record<string, number>) || {};

        setCurrentPurchasePrices(pricesMap);
      } catch (error) {
        console.error('Error loading fuel profit data:', error);
        toast.error('Veriler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  const saveCalculation = async (calculation: Omit<SavedProfitCalculation, 'id' | 'date'>) => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('fuel_profit_calculations')
        .insert({
          station_id: user.id,
          date_range_start: calculation.dateRange.startDate,
          date_range_end: calculation.dateRange.endDate,
          fuel_data: calculation.fuelData,
          purchase_prices: calculation.purchasePrices,
          total_profit: calculation.totalProfit,
          total_revenue: calculation.totalRevenue,
          profit_margin: calculation.profitMargin,
          calculation_details: calculation.calculationDetails
        })
        .select()
        .single();

      if (error) throw error;

      const newCalculation: SavedProfitCalculation = {
        id: data.id,
        date: data.created_at,
        dateRange: calculation.dateRange,
        fuelData: calculation.fuelData,
        purchasePrices: calculation.purchasePrices,
        totalProfit: calculation.totalProfit,
        totalRevenue: calculation.totalRevenue,
        profitMargin: calculation.profitMargin,
        calculationDetails: calculation.calculationDetails
      };

      setSavedCalculations(prev => [newCalculation, ...prev].slice(0, 10));
      toast.success('Hesaplama kaydedildi');
      return newCalculation;
    } catch (error) {
      console.error('Error saving calculation:', error);
      toast.error('Hesaplama kaydedilirken hata oluştu');
      return null;
    }
  };

  const deleteCalculation = async (id: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('fuel_profit_calculations')
        .delete()
        .eq('id', id)
        .eq('station_id', user.id);

      if (error) throw error;

      setSavedCalculations(prev => prev.filter(calc => calc.id !== id));
      toast.success('Hesaplama silindi');
    } catch (error) {
      console.error('Error deleting calculation:', error);
      toast.error('Hesaplama silinirken hata oluştu');
    }
  };

  const clearAllCalculations = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('fuel_profit_calculations')
        .delete()
        .eq('station_id', user.id);

      if (error) throw error;

      setSavedCalculations([]);
      toast.success('Tüm hesaplamalar silindi');
    } catch (error) {
      console.error('Error clearing calculations:', error);
      toast.error('Hesaplamalar silinirken hata oluştu');
    }
  };

  const updatePurchasePrice = async (fuelType: string, price: number) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('fuel_purchase_prices')
        .upsert({
          station_id: user.id,
          fuel_type: fuelType,
          price: price
        }, {
          onConflict: 'station_id, fuel_type'
        });

      if (error) throw error;

      setCurrentPurchasePrices(prev => ({ ...prev, [fuelType]: price }));
    } catch (error) {
      console.error('Error updating purchase price:', error);
      toast.error('Alış fiyatı güncellenirken hata oluştu');
    }
  };

  const getPurchasePrice = (fuelType: string): number => {
    return currentPurchasePrices[fuelType] || 0;
  };

  const clearPurchasePrices = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('fuel_purchase_prices')
        .delete()
        .eq('station_id', user.id);

      if (error) throw error;

      setCurrentPurchasePrices({});
      toast.success('Alış fiyatları temizlendi');
    } catch (error) {
      console.error('Error clearing purchase prices:', error);
      toast.error('Alış fiyatları temizlenirken hata oluştu');
    }
  };

  return {
    savedCalculations,
    currentPurchasePrices,
    saveCalculation,
    deleteCalculation,
    clearAllCalculations,
    updatePurchasePrice,
    getPurchasePrice,
    clearPurchasePrices,
    loading
  };
};
