import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Tanker {
  id: string;
  station_id: string;
  name: string;
  capacity: number;
  current_fuel_level: number;
  created_at: string;
  updated_at: string;
}

export interface TankerTransaction {
  id: string;
  tanker_id: string;
  transaction_type: 'incoming' | 'outgoing';
  amount: number;
  transaction_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useTankers = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['tankers', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('tankers')
        .select('*')
        .eq('station_id', user.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Tanker[];
    },
    enabled: !!user?.id,
  });
};

export const useTankerTransactions = (tankerId: string) => {
  return useQuery({
    queryKey: ['tanker-transactions', tankerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tanker_transactions')
        .select('*')
        .eq('tanker_id', tankerId)
        .order('transaction_date', { ascending: false });
      
      if (error) throw error;
      return data as TankerTransaction[];
    },
    enabled: !!tankerId,
  });
};

export const useCreateTanker = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (tanker: Omit<Tanker, 'id' | 'station_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('tankers')
        .insert({
          ...tanker,
          station_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tankers'] });
      toast.success('Tanker başarıyla eklendi');
    },
    onError: (error) => {
      toast.error('Tanker eklenirken bir hata oluştu: ' + error.message);
    },
  });
};

export const useUpdateTanker = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Tanker> & { id: string }) => {
      const { data, error } = await supabase
        .from('tankers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tankers'] });
      toast.success('Tanker başarıyla güncellendi');
    },
    onError: (error) => {
      toast.error('Tanker güncellenirken bir hata oluştu: ' + error.message);
    },
  });
};

export const useDeleteTanker = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tankers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tankers'] });
      toast.success('Tanker başarıyla silindi');
    },
    onError: (error) => {
      toast.error('Tanker silinirken bir hata oluştu: ' + error.message);
    },
  });
};

export const useCreateTankerTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (transaction: Omit<TankerTransaction, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('tanker_transactions')
        .insert(transaction)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tanker-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['tankers'] });
      toast.success('İşlem başarıyla kaydedildi');
    },
    onError: (error) => {
      toast.error('İşlem kaydedilirken bir hata oluştu: ' + error.message);
    },
  });
};

export const useDeleteTankerTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tanker_transactions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tanker-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['tankers'] });
      toast.success('İşlem başarıyla silindi');
    },
    onError: (error) => {
      toast.error('İşlem silinirken bir hata oluştu: ' + error.message);
    },
  });
};