
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type UyumsoftAccount = Tables<"uyumsoft_accounts">;
type UyumsoftAccountInsert = TablesInsert<"uyumsoft_accounts">;

export const useUyumsoftAccounts = (companyId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uyumsoftAccountQuery = useQuery({
    queryKey: ["uyumsoft-account", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("uyumsoft_accounts")
        .select("*")
        .eq("company_id", companyId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const createOrUpdateAccount = useMutation({
    mutationFn: async (accountData: Omit<UyumsoftAccountInsert, "company_id">) => {
      const existingAccount = uyumsoftAccountQuery.data;
      
      if (existingAccount) {
        const { data, error } = await supabase
          .from("uyumsoft_accounts")
          .update({
            ...accountData,
            updated_at: new Date().toISOString(),
          })
          .eq("company_id", companyId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("uyumsoft_accounts")
          .insert({ 
            ...accountData, 
            company_id: companyId,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uyumsoft-account", companyId] });
      toast({
        title: "Başarılı",
        description: "Uyumsoft hesap bilgileri kaydedildi",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Hesap bilgileri kaydedilemedi: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    uyumsoftAccount: uyumsoftAccountQuery.data,
    isLoading: uyumsoftAccountQuery.isLoading,
    createOrUpdateAccount,
  };
};
