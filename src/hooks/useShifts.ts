
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Shift {
  id: string;
  personnel_id: string;
  start_time: string;
  end_time: string | null;
  cash_sales: number;
  card_sales: number;
  bank_transfers: number;
  actual_amount: number;
  over_short: number;
  status: string;
  personnel: {
    name: string;
  };
}

export const useShifts = () => {
  const { user } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [allShifts, setAllShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShifts = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('shifts')
      .select(`
        *,
        personnel:personnel_id (
          name
        )
      `)
      .eq('station_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching shifts:', error);
    } else {
      setAllShifts(data || []);
      // Only active shifts for the main shifts view
      setShifts((data || []).filter(shift => shift.status === 'active'));
    }
    setLoading(false);
  };

  const fetchAllShifts = async () => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('shifts')
      .select(`
        *,
        personnel:personnel_id (
          name
        )
      `)
      .eq('station_id', user.id)
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Error fetching all shifts:', error);
      return [];
    }
    return data || [];
  };

  const addShift = async (shiftData: any) => {
    if (!user) return { error: 'User not authenticated' };

    const totalSales = shiftData.cash_sales + shiftData.card_sales + shiftData.bank_transfers;
    const overShort = shiftData.actual_amount - totalSales;

    const { data, error } = await supabase
      .from('shifts')
      .insert([
        {
          ...shiftData,
          station_id: user.id,
          over_short: overShort,
          status: 'completed' // Changed from 'active' to 'completed' since shifts are permanent
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
      setShifts(prev => [data, ...prev]);
      setAllShifts(prev => [data, ...prev]);
    }

    return { data, error };
  };

  const getWeeklyStats = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyShifts = allShifts.filter(shift => 
      new Date(shift.start_time) >= oneWeekAgo
    );

    return {
      totalSales: weeklyShifts.reduce((sum, shift) => 
        sum + shift.cash_sales + shift.card_sales + shift.bank_transfers, 0),
      totalOverShort: weeklyShifts.reduce((sum, shift) => sum + shift.over_short, 0),
      shiftCount: weeklyShifts.length
    };
  };

  const getLatestShift = () => {
    return allShifts.length > 0 ? allShifts[0] : null;
  };

  useEffect(() => {
    fetchShifts();
  }, [user]);

  return {
    shifts,
    allShifts,
    loading,
    addShift,
    getWeeklyStats,
    getLatestShift,
    fetchAllShifts,
    refreshShifts: fetchShifts
  };
};
