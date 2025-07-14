
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface Company {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export const useCompanies = () => {
  const queryClient = useQueryClient();

  const { data: companies = [], isLoading, error } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Company[];
    },
  });

  const createCompany = useMutation({
    mutationFn: async (companyData: Omit<Company, 'id' | 'owner_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı bulunamadı');

      const { data, error } = await supabase
        .from('companies')
        .insert({
          name: companyData.name,
          description: companyData.description,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });

  const updateCompany = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Company> & { id: string }) => {
      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });

  const deleteCompany = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });

  // Legacy interface compatibility
  const addCompany = async (companyData: Omit<Company, 'id' | 'owner_id' | 'created_at' | 'updated_at'>) => {
    try {
      await createCompany.mutateAsync(companyData);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return {
    companies,
    loading: isLoading, // Legacy compatibility
    isLoading,
    error: error?.message || null,
    createCompany,
    updateCompany,
    deleteCompany,
    addCompany, // Legacy compatibility
  };
};
