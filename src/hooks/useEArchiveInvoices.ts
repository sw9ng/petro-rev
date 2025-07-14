
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type EArchiveInvoice = Tables<"e_archive_invoices">;
type EArchiveInvoiceInsert = TablesInsert<"e_archive_invoices">;

export const useEArchiveInvoices = (companyId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const eArchiveInvoicesQuery = useQuery({
    queryKey: ["e-archive-invoices", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("e_archive_invoices")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createEArchiveInvoice = useMutation({
    mutationFn: async (invoice: Omit<EArchiveInvoiceInsert, "created_by" | "company_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Kullanıcı bulunamadı");

      const { data, error } = await supabase
        .from("e_archive_invoices")
        .insert({ 
          ...invoice, 
          created_by: user.id, 
          company_id: companyId,
          archive_id: `EA${Date.now()}`
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["e-archive-invoices", companyId] });
      toast({
        title: "Başarılı",
        description: "E-Arşiv faturası başarıyla oluşturuldu",
      });
    },
  });

  return {
    eArchiveInvoices: eArchiveInvoicesQuery.data || [],
    isLoading: eArchiveInvoicesQuery.isLoading,
    createEArchiveInvoice,
  };
};
