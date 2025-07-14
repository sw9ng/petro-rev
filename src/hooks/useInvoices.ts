
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type IncomeInvoice = Tables<"income_invoices">;
type ExpenseInvoice = Tables<"expense_invoices">;
type IncomeInvoiceInsert = TablesInsert<"income_invoices">;
type ExpenseInvoiceInsert = TablesInsert<"expense_invoices">;

export const useInvoices = (type: "income" | "expense" = "income") => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const tableName = type === "income" ? "income_invoices" : "expense_invoices";

  const invoicesQuery = useQuery({
    queryKey: [tableName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(tableName)
        .select(`
          *,
          companies(name),
          company_accounts(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createInvoice = useMutation({
    mutationFn: async (invoice: Omit<IncomeInvoiceInsert | ExpenseInvoiceInsert, "created_by">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from(tableName)
        .insert({ ...invoice, created_by: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
      toast({
        title: "Başarılı",
        description: "Fatura başarıyla oluşturuldu",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Fatura oluşturulurken hata oluştu",
        variant: "destructive",
      });
    },
  });

  const updateInvoice = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
      toast({
        title: "Başarılı",
        description: "Fatura başarıyla güncellendi",
      });
    },
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
      toast({
        title: "Başarılı",
        description: "Fatura başarıyla silindi",
      });
    },
  });

  return {
    invoices: invoicesQuery.data || [],
    isLoading: invoicesQuery.isLoading,
    error: invoicesQuery.error,
    createInvoice,
    updateInvoice,
    deleteInvoice,
  };
};
