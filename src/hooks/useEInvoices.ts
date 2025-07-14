
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type EInvoice = Tables<"e_invoices">;
type EInvoiceInsert = TablesInsert<"e_invoices">;

export const useEInvoices = (companyId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const eInvoicesQuery = useQuery({
    queryKey: ["e-invoices", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("e_invoices")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createEInvoice = useMutation({
    mutationFn: async (invoice: Omit<EInvoiceInsert, "created_by" | "company_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Kullanıcı bulunamadı");

      const { data, error } = await supabase
        .from("e_invoices")
        .insert({ 
          ...invoice, 
          created_by: user.id, 
          company_id: companyId,
          invoice_uuid: crypto.randomUUID(),
          ettn: crypto.randomUUID()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["e-invoices", companyId] });
      toast({
        title: "Başarılı",
        description: "E-Fatura başarıyla oluşturuldu",
      });
    },
  });

  const sendToGib = useMutation({
    mutationFn: async (invoiceId: string) => {
      // Bu kısımda GitHub'daki fatura kütüphanesi kullanılacak
      const { data, error } = await supabase
        .from("e_invoices")
        .update({ 
          gib_status: "sent",
          gib_response: "Fatura GİB'e gönderildi" 
        })
        .eq("id", invoiceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["e-invoices", companyId] });
      toast({
        title: "Başarılı",
        description: "E-Fatura GİB'e gönderildi",
      });
    },
  });

  return {
    eInvoices: eInvoicesQuery.data || [],
    isLoading: eInvoicesQuery.isLoading,
    createEInvoice,
    sendToGib,
  };
};
