
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type ChartOfAccount = Tables<"chart_of_accounts">;
type ChartOfAccountInsert = TablesInsert<"chart_of_accounts">;

export const useChartOfAccounts = (companyId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const chartOfAccountsQuery = useQuery({
    queryKey: ["chart-of-accounts", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chart_of_accounts")
        .select("*")
        .eq("company_id", companyId)
        .order("account_code", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const createAccount = useMutation({
    mutationFn: async (account: Omit<ChartOfAccountInsert, "company_id">) => {
      const { data, error } = await supabase
        .from("chart_of_accounts")
        .insert({ ...account, company_id: companyId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chart-of-accounts", companyId] });
      toast({
        title: "Başarılı",
        description: "Hesap başarıyla oluşturuldu",
      });
    },
  });

  return {
    accounts: chartOfAccountsQuery.data || [],
    isLoading: chartOfAccountsQuery.isLoading,
    createAccount,
  };
};
