import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UyumsoftTaxpayer {
  tax_number: string;
  company_title: string;
  address?: string;
  email?: string;
  phone?: string;
  is_einvoice_enabled: boolean;
  profile_id: string;
}

export const useUyumsoftTaxpayers = (companyId: string) => {
  const { toast } = useToast();

  const taxpayersQuery = useQuery({
    queryKey: ["uyumsoft-taxpayers", companyId],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Oturum bulunamadı");

      const response = await fetch(`https://duebejkrrvuodwbforkd.supabase.co/functions/v1/fetch-uyumsoft-taxpayers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          companyId
        }),
      });

      if (!response.ok) {
        throw new Error('Uyumsoft mükellef listesi alınamadı');
      }

      const result = await response.json();
      return result.data as UyumsoftTaxpayer[];
    },
  });

  // Handle errors separately if needed
  if (taxpayersQuery.error) {
    toast({
      title: "Hata",
      description: `Mükellef listesi alınamadı: ${taxpayersQuery.error.message}`,
      variant: "destructive",
    });
  }

  return {
    taxpayers: taxpayersQuery.data || [],
    isLoading: taxpayersQuery.isLoading,
    error: taxpayersQuery.error,
    refetch: taxpayersQuery.refetch,
  };
};