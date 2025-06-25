
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Personnel {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  status: string;
  join_date: string;
}

export const usePersonnel = () => {
  const { user } = useAuth();
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPersonnel = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('personnel')
      .select('*')
      .eq('station_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching personnel:', error);
    } else {
      setPersonnel(data || []);
    }
    setLoading(false);
  };

  const addPersonnel = async (personnelData: Omit<Personnel, 'id' | 'join_date'>) => {
    if (!user) return { error: 'User not authenticated' };

    const { data, error } = await supabase
      .from('personnel')
      .insert([
        {
          ...personnelData,
          station_id: user.id
        }
      ])
      .select()
      .single();

    if (!error && data) {
      setPersonnel(prev => [data, ...prev]);
    }

    return { data, error };
  };

  const deletePersonnel = async (personnelId: string) => {
    if (!user) return { error: 'User not authenticated' };

    // Instead of deleting, we mark as inactive to preserve historical data
    const { error } = await supabase
      .from('personnel')
      .update({ status: 'inactive' })
      .eq('id', personnelId)
      .eq('station_id', user.id);

    if (!error) {
      setPersonnel(prev => prev.map(p => 
        p.id === personnelId ? { ...p, status: 'inactive' } : p
      ));
    }

    return { error };
  };

  useEffect(() => {
    fetchPersonnel();
  }, [user]);

  return {
    personnel,
    loading,
    addPersonnel,
    deletePersonnel,
    refreshPersonnel: fetchPersonnel
  };
};
