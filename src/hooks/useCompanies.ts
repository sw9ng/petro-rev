
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Company = Tables<"companies">;
type CompanyInsert = TablesInsert<"companies">;
type CompanyUpdate = TablesUpdate<"companies">;

export const useCompanies = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const companiesQuery = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Company[];
    },
  });

  const createCompany = useMutation({
    mutationFn: async (company: Omit<CompanyInsert, "owner_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("companies")
        .insert({ ...company, owner_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast({
        title: "Başarılı",
        description: "Şirket başarıyla oluşturuldu",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Şirket oluşturulurken hata oluştu",
        variant: "destructive",
      });
    },
  });

  const updateCompany = useMutation({
    mutationFn: async ({ id, ...updates }: CompanyUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("companies")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast({
        title: "Başarılı",
        description: "Şirket başarıyla güncellendi",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Şirket güncellenirken hata oluştu",
        variant: "destructive",
      });
    },
  });

  const deleteCompany = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("companies")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast({
        title: "Başarılı",
        description: "Şirket başarıyla silindi",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Şirket silinirken hata oluştu",
        variant: "destructive",
      });
    },
  });

  return {
    companies: companiesQuery.data || [],
    isLoading: companiesQuery.isLoading,
    error: companiesQuery.error,
    createCompany,
    updateCompany,
    deleteCompany,
  };
};
