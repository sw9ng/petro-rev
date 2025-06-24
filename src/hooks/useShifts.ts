
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
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching shifts:', error);
    } else {
      setShifts(data || []);
    }
    setLoading(false);
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
          over_short: overShort
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
    }

    return { data, error };
  };

  const closeShift = async (shiftId: string) => {
    const { error } = await supabase
      .from('shifts')
      .update({ 
        status: 'closed',
        end_time: new Date().toISOString()
      })
      .eq('id', shiftId);

    if (!error) {
      setShifts(prev => prev.filter(shift => shift.id !== shiftId));
    }

    return { error };
  };

  const getWeeklyStats = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyShifts = shifts.filter(shift => 
      new Date(shift.start_time) >= oneWeekAgo
    );

    return {
      totalSales: weeklyShifts.reduce((sum, shift) => 
        sum + shift.cash_sales + shift.card_sales + shift.bank_transfers, 0),
      totalOverShort: weeklyShifts.reduce((sum, shift) => sum + shift.over_short, 0),
      shiftCount: weeklyShifts.length
    };
  };

  useEffect(() => {
    fetchShifts();
  }, [user]);

  return {
    shifts,
    loading,
    addShift,
    closeShift,
    getWeeklyStats,
    refreshShifts: fetchShifts
  };
};
