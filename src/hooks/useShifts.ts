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
  otomasyon_satis: number;
  over_short: number;
  status: string;
  veresiye: number;
  bank_transfers: number;
  loyalty_card: number;
  bank_transfer_description?: string;
  shift_number?: 'V1' | 'V2';
  personnel: {
    name: string;
  };
}

// Function to determine effective shift date based on shift type and times
const getEffectiveShiftDate = (startTime: string, endTime: string | null, shiftNumber?: 'V1' | 'V2') => {
  // For V1 shifts, use the end date
  if (shiftNumber === 'V1' && endTime) {
    const endDate = new Date(endTime);
    return endDate;
  }
  
  // For shifts without shift_number, check if it looks like a V1 shift (late night start)
  if (!shiftNumber && endTime) {
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    const startHour = startDate.getHours();
    
    // If starts after 22:00 and ends on next day, treat as V1
    if (startHour >= 22 && endDate.toDateString() !== startDate.toDateString()) {
      return endDate;
    }
  }
  
  // For V2 shifts or default, use the start date
  const startDate = new Date(startTime);
  return startDate;
};

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
      // Map the data to ensure we have all required fields
      const mappedData = (data || []).map(shift => ({
        id: shift.id,
        personnel_id: shift.personnel_id,
        start_time: shift.start_time,
        end_time: shift.end_time,
        cash_sales: shift.cash_sales || 0,
        card_sales: shift.card_sales || 0,
        otomasyon_satis: shift.actual_amount || 0,
        over_short: shift.over_short || 0,
        status: shift.status,
        veresiye: shift.veresiye || 0,
        bank_transfers: shift.bank_transfers || 0,
        loyalty_card: shift.loyalty_card || 0,
        bank_transfer_description: shift.bank_transfer_description || '',
        shift_number: (shift.shift_number as 'V1' | 'V2') || undefined,
        personnel: shift.personnel
      }));
      
      setAllShifts(mappedData);
      setShifts(mappedData.filter(shift => shift.status === 'active'));
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
    
    const mappedData = (data || []).map(shift => ({
      id: shift.id,
      personnel_id: shift.personnel_id,
      start_time: shift.start_time,
      end_time: shift.end_time,
      cash_sales: shift.cash_sales || 0,
      card_sales: shift.card_sales || 0,
      otomasyon_satis: shift.actual_amount || 0,
      over_short: shift.over_short || 0,
      status: shift.status,
      veresiye: shift.veresiye || 0,
      bank_transfers: shift.bank_transfers || 0,
      loyalty_card: shift.loyalty_card || 0,
      bank_transfer_description: shift.bank_transfer_description || '',
      shift_number: (shift.shift_number as 'V1' | 'V2') || undefined,
      personnel: shift.personnel
    }));
    
    return mappedData;
  };

  const addShift = async (shiftData: any) => {
    if (!user) return { error: 'Kullanıcı doğrulanmadı' };

    const totalCollected = shiftData.cash_sales + shiftData.card_sales + shiftData.veresiye + shiftData.bank_transfers + shiftData.loyalty_card;
    const overShort = totalCollected - shiftData.otomasyon_satis;

    const { data, error } = await supabase
      .from('shifts')
      .insert([
        {
          personnel_id: shiftData.personnel_id,
          start_time: shiftData.start_time,
          end_time: shiftData.end_time,
          cash_sales: shiftData.cash_sales,
          card_sales: shiftData.card_sales,
          actual_amount: shiftData.otomasyon_satis,
          over_short: overShort,
          station_id: user.id,
          status: 'completed',
          veresiye: shiftData.veresiye || 0,
          bank_transfers: shiftData.bank_transfers || 0,
          loyalty_card: shiftData.loyalty_card || 0,
          bank_transfer_description: shiftData.bank_transfer_description || '',
          shift_number: shiftData.shift_number || null
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
      const mappedShift = {
        id: data.id,
        personnel_id: data.personnel_id,
        start_time: data.start_time,
        end_time: data.end_time,
        cash_sales: data.cash_sales || 0,
        card_sales: data.card_sales || 0,
        otomasyon_satis: data.actual_amount || 0,
        over_short: data.over_short || 0,
        status: data.status,
        veresiye: data.veresiye || 0,
        bank_transfers: data.bank_transfers || 0,
        loyalty_card: data.loyalty_card || 0,
        bank_transfer_description: data.bank_transfer_description || '',
        shift_number: (data.shift_number as 'V1' | 'V2') || undefined,
        personnel: data.personnel
      };
      
      setShifts(prev => [mappedShift, ...prev]);
      setAllShifts(prev => [mappedShift, ...prev]);

      if (shiftData.bank_details && shiftData.bank_details.length > 0) {
        const bankDetailsPayload = shiftData.bank_details.map((detail: any) => ({
          shift_id: data.id,
          bank_name: detail.bank_name,
          amount: detail.amount
        }));

        await supabase
          .from('shift_bank_details')
          .insert(bankDetailsPayload);
      }
    }

    return { data, error };
  };

  const updateShift = async (shiftId: string, updateData: any) => {
    if (!user) return { error: 'Kullanıcı doğrulanmadı' };

    const { data, error } = await supabase
      .from('shifts')
      .update(updateData)
      .eq('id', shiftId)
      .eq('station_id', user.id)
      .select(`
        *,
        personnel:personnel_id (
          name
        )
      `)
      .single();

    if (!error && data) {
      const mappedShift = {
        id: data.id,
        personnel_id: data.personnel_id,
        start_time: data.start_time,
        end_time: data.end_time,
        cash_sales: data.cash_sales || 0,
        card_sales: data.card_sales || 0,
        otomasyon_satis: data.actual_amount || 0,
        over_short: data.over_short || 0,
        status: data.status,
        veresiye: data.veresiye || 0,
        bank_transfers: data.bank_transfers || 0,
        loyalty_card: data.loyalty_card || 0,
        bank_transfer_description: data.bank_transfer_description || '',
        shift_number: (data.shift_number as 'V1' | 'V2') || undefined,
        personnel: data.personnel
      };
      
      setShifts(prev => prev.map(shift => shift.id === shiftId ? mappedShift : shift));
      setAllShifts(prev => prev.map(shift => shift.id === shiftId ? mappedShift : shift));
    }

    return { data, error };
  };

  const deleteShift = async (shiftId: string) => {
    if (!user) return { error: 'Kullanıcı doğrulanmadı' };

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
        sum + shift.cash_sales + shift.card_sales + shift.loyalty_card, 0),
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
    
    const mappedData = (data || []).map(shift => ({
      id: shift.id,
      personnel_id: shift.personnel_id,
      start_time: shift.start_time,
      end_time: shift.end_time,
      cash_sales: shift.cash_sales || 0,
      card_sales: shift.card_sales || 0,
      otomasyon_satis: shift.actual_amount || 0,
      over_short: shift.over_short || 0,
      status: shift.status,
      veresiye: shift.veresiye || 0,
      bank_transfers: shift.bank_transfers || 0,
      loyalty_card: shift.loyalty_card || 0,
      bank_transfer_description: shift.bank_transfer_description || '',
      shift_number: (shift.shift_number as 'V1' | 'V2') || undefined,
      personnel: shift.personnel
    }));
    
    return mappedData;
  };

  const getShiftDisplayName = (shift: Shift) => {
    const effectiveDate = getEffectiveShiftDate(shift.start_time, shift.end_time, shift.shift_number);
    const formattedDate = effectiveDate.toLocaleDateString('tr-TR');
    const shiftNumber = shift.shift_number || 'V1';
    return `${formattedDate} – ${shiftNumber}`;
  };

  useEffect(() => {
    fetchShifts();
  }, [user]);

  return {
    shifts,
    allShifts,
    loading,
    addShift,
    updateShift,
    deleteShift,
    getWeeklyStats,
    getLatestShift,
    fetchAllShifts,
    findShiftsByDateAndPersonnel,
    getShiftDisplayName,
    refreshShifts: fetchShifts,
    getEffectiveShiftDate
  };
};
