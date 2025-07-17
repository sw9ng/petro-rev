
import { useState, useEffect } from 'react';
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

export const useCustomers = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('station_id', user.id)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching customers:', error);
    } else {
      setCustomers(data || []);
    }
    setLoading(false);
  };

  const addCustomer = async (customerData: {
    name: string;
    phone?: string;
    address?: string;
    notes?: string;
  }) => {
    if (!user) return { error: 'Kullanıcı doğrulanmadı' };

    const { data, error } = await supabase
      .from('customers')
      .insert([
        {
          ...customerData,
          station_id: user.id
        }
      ])
      .select()
      .single();

    if (!error && data) {
      setCustomers(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
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
      setCustomers(prev => prev.map(customer => 
        customer.id === customerId ? data : customer
      ).sort((a, b) => a.name.localeCompare(b.name)));
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
      setCustomers(prev => prev.filter(customer => customer.id !== customerId));
    }

    return { error };
  };

  useEffect(() => {
    fetchCustomers();
  }, [user]);

  return {
    customers,
    loading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    refreshCustomers: fetchCustomers
  };
};
