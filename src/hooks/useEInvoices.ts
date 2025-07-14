
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Oturum bulunamadı");

      const response = await fetch(`https://duebejkrrvuodwbforkd.supabase.co/functions/v1/send-invoice-to-gib`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          invoiceId,
          invoiceType: 'e-invoice'
        }),
      });

      if (!response.ok) {
        throw new Error('GİB\'e gönderim başarısız');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["e-invoices", companyId] });
      toast({
        title: "Başarılı",
        description: "E-Fatura GİB'e gönderildi",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `GİB'e gönderim hatası: ${error.message}`,
        variant: "destructive",
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
