
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
  veresiye?: number;
  gercek_satis?: number;
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

    // Revert to original calculation: no sayaç satışı
    const totalSales = shiftData.cash_sales + shiftData.card_sales;
    const overShort = totalSales - (shiftData.actual_amount || 0);

    const { data, error } = await supabase
      .from('shifts')
      .insert([
        {
          ...shiftData,
          station_id: user.id,
          bank_transfers: 0,
          over_short: overShort,
          status: 'completed'
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

  const deleteShift = async (shiftId: string) => {
    if (!user) return { error: 'User not authenticated' };

    const { error } = await supabase
      .from('shifts')
      .delete()
      .eq('id', shiftId)
      .eq('station_id', user.id);

    if (!error) {
      setShifts(prev => prev.filter(shift => shift.id !== shiftId));
      setAllShifts(prev => prev.filter(shift => shift.id !== shiftId));
    }

    return { error };
  };

  const getWeeklyStats = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyShifts = allShifts.filter(shift => 
      new Date(shift.start_time) >= oneWeekAgo
    );

    return {
      totalSales: weeklyShifts.reduce((sum, shift) => 
        sum + shift.cash_sales + shift.card_sales, 0),
      totalOverShort: weeklyShifts.reduce((sum, shift) => sum + shift.over_short, 0),
      shiftCount: weeklyShifts.length
    };
  };

  const getLatestShift = () => {
    return allShifts.length > 0 ? allShifts[0] : null;
  };

  const findShiftsByDateAndPersonnel = async (date: string, personnelId: string) => {
    if (!user) return [];
    
    let query = supabase
      .from('shifts')
      .select(`
        *,
        personnel:personnel_id (
          name
        )
      `)
      .eq('station_id', user.id);

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      query = query
        .gte('start_time', startDate.toISOString())
        .lt('start_time', endDate.toISOString());
    }

    if (personnelId) {
      query = query.eq('personnel_id', personnelId);
    }

    const { data, error } = await query.order('start_time', { ascending: false });

    if (error) {
      console.error('Error searching shifts:', error);
      return [];
    }
    return data || [];
  };

  useEffect(() => {
    fetchShifts();
  }, [user]);

  return {
    shifts,
    allShifts,
    loading,
    addShift,
    deleteShift,
    getWeeklyStats,
    getLatestShift,
    fetchAllShifts,
    findShiftsByDateAndPersonnel,
    refreshShifts: fetchShifts
  };
};
