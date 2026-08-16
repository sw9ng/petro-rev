
import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  station_id?: string;
}

const fetchCustomersFromDb = async (stationId: string): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('id, name, phone, address, notes, created_at, updated_at, station_id')
    .eq('station_id', stationId)
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const useCustomers = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['customers', user?.id];

  const { data: customers = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchCustomersFromDb(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const loading = !!user?.id && isLoading;

  const setCache = useCallback(
    (updater: (prev: Customer[]) => Customer[]) => {
      queryClient.setQueryData<Customer[]>(['customers', user?.id], (prev) => updater(prev || []));
    },
    [queryClient, user?.id]
  );

  const fetchCustomers = useCallback(async () => {
    if (!user?.id) return;
    await queryClient.invalidateQueries({ queryKey: ['customers', user.id] });
  }, [queryClient, user?.id]);

  const addCustomer = async (customerData: {
    name: string;
    phone?: string;
    address?: string;
    notes?: string;
  }) => {
    if (!user) return { error: 'Kullanıcı doğrulanmadı' };

    const { data, error } = await supabase
      .from('customers')
      .insert([{ ...customerData, station_id: user.id }])
      .select()
      .single();

    if (!error && data) {
      setCache(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    }

    return { data, error };
  };

  const updateCustomer = async (customerId: string, customerData: {
    name?: string;
    phone?: string;
    address?: string;
    notes?: string;
  }) => {
    if (!user) return { error: 'Kullanıcı doğrulanmadı' };

    const { data, error } = await supabase
      .from('customers')
      .update({ ...customerData, updated_at: new Date().toISOString() })
      .eq('id', customerId)
      .eq('station_id', user.id)
      .select()
      .single();

    if (!error && data) {
      setCache(prev =>
        prev
          .map(customer => (customer.id === customerId ? data : customer))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
    }

    return { data, error };
  };

  const deleteCustomer = async (customerId: string) => {
    if (!user) return { error: 'Kullanıcı doğrulanmadı' };

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId)
      .eq('station_id', user.id);

    if (!error) {
      setCache(prev => prev.filter(customer => customer.id !== customerId));
    }

    return { error };
  };

  return {
    customers,
    loading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    refreshCustomers: fetchCustomers
  };
};
