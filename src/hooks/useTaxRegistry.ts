
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTaxRegistry = () => {
  const searchByTaxNumber = async (taxNumber: string) => {
    const { data, error } = await supabase
      .from("tax_registry")
      .select("*")
      .eq("tax_number", taxNumber)
      .single();

    if (error) throw error;
    return data;
  };

  return {
    searchByTaxNumber,
  };
};
