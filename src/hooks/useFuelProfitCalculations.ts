
import { useState, useEffect, useMemo } from 'react';

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
  const [savedCalculations, setSavedCalculations] = useState<SavedProfitCalculation[]>([]);

  // Load saved calculations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedFuelProfitCalculations');
    if (saved) {
      try {
        setSavedCalculations(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved calculations:', error);
        setSavedCalculations([]);
      }
    }
  }, []);

  const saveCalculation = (calculation: Omit<SavedProfitCalculation, 'id' | 'date'>) => {
    const newCalculation: SavedProfitCalculation = {
      ...calculation,
      id: crypto.randomUUID(),
      date: new Date().toISOString()
    };

    const updatedCalculations = [newCalculation, ...savedCalculations].slice(0, 10); // Keep only last 10
    setSavedCalculations(updatedCalculations);
    localStorage.setItem('savedFuelProfitCalculations', JSON.stringify(updatedCalculations));
    
    return newCalculation;
  };

  const deleteCalculation = (id: string) => {
    const updatedCalculations = savedCalculations.filter(calc => calc.id !== id);
    setSavedCalculations(updatedCalculations);
    localStorage.setItem('savedFuelProfitCalculations', JSON.stringify(updatedCalculations));
  };

  const clearAllCalculations = () => {
    setSavedCalculations([]);
    localStorage.removeItem('savedFuelProfitCalculations');
  };

  return {
    savedCalculations,
    saveCalculation,
    deleteCalculation,
    clearAllCalculations
  };
};
