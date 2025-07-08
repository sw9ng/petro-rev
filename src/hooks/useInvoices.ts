
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useInvoices = (companyId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: incomeInvoices, isLoading: incomeLoading } = useQuery({
    queryKey: ['income-invoices', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from('income_invoices')
        .select('*')
        .eq('company_id', companyId)
        .order('invoice_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId,
  });

  const { data: expenseInvoices, isLoading: expenseLoading } = useQuery({
    queryKey: ['expense-invoices', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from('expense_invoices')
        .select('*')
        .eq('company_id', companyId)
        .order('invoice_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId,
  });

  const createIncomeInvoice = useMutation({
    mutationFn: async (invoiceData: {
      invoice_number?: string;
      description: string;
      amount: number;
      invoice_date: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('income_invoices')
        .insert({
          ...invoiceData,
          company_id: companyId,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income-invoices', companyId] });
      toast.success('Gelir faturası eklendi');
    },
    onError: () => {
      toast.error('Gelir faturası eklenirken hata oluştu');
    },
  });

  const createExpenseInvoice = useMutation({
    mutationFn: async (invoiceData: {
      invoice_number?: string;
      description: string;
      amount: number;
      invoice_date: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('expense_invoices')
        .insert({
          ...invoiceData,
          company_id: companyId,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-invoices', companyId] });
      toast.success('Gider faturası eklendi');
    },
    onError: () => {
      toast.error('Gider faturası eklenirken hata oluştu');
    },
  });

  return {
    incomeInvoices: incomeInvoices || [],
    expenseInvoices: expenseInvoices || [],
    isLoading: incomeLoading || expenseLoading,
    createIncomeInvoice,
    createExpenseInvoice,
  };
};
