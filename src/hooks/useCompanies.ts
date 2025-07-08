
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useCompanies = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: companies, isLoading } = useQuery({
    queryKey: ['companies', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const createCompany = useMutation({
    mutationFn: async (companyData: { name: string; description?: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('companies')
        .insert({
          name: companyData.name,
          description: companyData.description,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) {
        if (error.message.includes('Maksimum 2 şirket')) {
          throw new Error('Maksimum 2 şirket oluşturabilirsiniz');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Şirket başarıyla oluşturuldu');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateCompany = useMutation({
    mutationFn: async ({ id, name, description }: { id: string; name: string; description?: string }) => {
      const { data, error } = await supabase
        .from('companies')
        .update({ name, description, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Şirket bilgileri güncellendi');
    },
    onError: (error: Error) => {
      toast.error('Şirket güncellenirken hata oluştu');
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
      toast.success('Şirket silindi');
    },
    onError: (error: Error) => {
      toast.error('Şirket silinirken hata oluştu');
    },
  });

  return {
    companies: companies || [],
    isLoading,
    createCompany,
    updateCompany,
    deleteCompany,
  };
};
