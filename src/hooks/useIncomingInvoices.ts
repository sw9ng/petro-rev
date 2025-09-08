import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type IncomingInvoice = Tables<"incoming_invoices">;
type IncomingInvoiceInsert = TablesInsert<"incoming_invoices">;
type IncomingInvoiceUpdate = TablesUpdate<"incoming_invoices">;

export const useIncomingInvoices = (companyId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const incomingInvoicesQuery = useQuery({
    queryKey: ["incoming-invoices", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("incoming_invoices")
        .select("*")
        .eq("company_id", companyId)
        .order("received_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  const fetchFromUyumsoft = useMutation({
    mutationFn: async ({ dateFrom, dateTo }: { dateFrom?: string; dateTo?: string }) => {
      const { data, error } = await supabase.functions.invoke('fetch-uyumsoft-invoices', {
        body: {
          companyId,
          dateFrom,
          dateTo,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["incoming-invoices", companyId] });
      toast({
        title: "Başarılı",
        description: data.message || "Gelen faturalar başarıyla alındı",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Faturalar alınırken hata oluştu",
        variant: "destructive",
      });
    },
  });

  const updateInvoiceStatus = useMutation({
    mutationFn: async ({ 
      invoiceId, 
      status, 
      notes 
    }: { 
      invoiceId: string; 
      status: 'approved' | 'rejected'; 
      notes?: string;
    }) => {
      const updateData: IncomingInvoiceUpdate = {
        status,
        processed_at: new Date().toISOString(),
        processed_by: (await supabase.auth.getUser()).data.user?.id,
        notes,
      };

      const { data, error } = await supabase
        .from("incoming_invoices")
        .update(updateData)
        .eq("id", invoiceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["incoming-invoices", companyId] });
      toast({
        title: "Başarılı",
        description: `Fatura ${variables.status === 'approved' ? 'onaylandı' : 'reddedildi'}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Fatura durumu güncellenirken hata oluştu",
        variant: "destructive",
      });
    },
  });

  const bulkUpdateStatus = useMutation({
    mutationFn: async ({
      invoiceIds,
      status,
      notes
    }: {
      invoiceIds: string[];
      status: 'approved' | 'rejected';
      notes?: string;
    }) => {
      const updateData: IncomingInvoiceUpdate = {
        status,
        processed_at: new Date().toISOString(),
        processed_by: (await supabase.auth.getUser()).data.user?.id,
        notes,
      };

      const { data, error } = await supabase
        .from("incoming_invoices")
        .update(updateData)
        .in("id", invoiceIds)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["incoming-invoices", companyId] });
      toast({
        title: "Başarılı",
        description: `${data.length} fatura ${variables.status === 'approved' ? 'onaylandı' : 'reddedildi'}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Toplu işlem sırasında hata oluştu",
        variant: "destructive",
      });
    },
  });

  return {
    incomingInvoices: incomingInvoicesQuery.data || [],
    isLoading: incomingInvoicesQuery.isLoading,
    isError: incomingInvoicesQuery.isError,
    error: incomingInvoicesQuery.error,
    fetchFromUyumsoft,
    updateInvoiceStatus,
    bulkUpdateStatus,
    refetch: incomingInvoicesQuery.refetch,
  };
};