
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Company {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const useCompanies = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setCompanies(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching companies:', err);
    } finally {
      setLoading(false);
    }
  };

  const addCompany = async (companyData: { name: string; description?: string }) => {
    if (!user) {
      return { error: new Error('Kullanıcı doğrulanmadı') };
    }

    try {
      const { data, error } = await supabase
        .from('companies')
        .insert([
          {
            ...companyData,
            owner_id: user.id
          }
        ])
        .select();

      if (error) {
        return { error };
      }

      setCompanies(prev => [data[0], ...prev]);
      return { data: data[0] };
    } catch (err: any) {
      return { error: err };
    }
  };

  const updateCompany = async (companyId: string, companyData: { name?: string; description?: string }) => {
    if (!user) {
      return { error: new Error('Kullanıcı doğrulanmadı') };
    }

    try {
      const { data, error } = await supabase
        .from('companies')
        .update(companyData)
        .eq('id', companyId)
        .eq('owner_id', user.id)
        .select();

      if (error) {
        return { error };
      }

      setCompanies(prev => prev.map(company => 
        company.id === companyId ? data[0] : company
      ));
      
      return { data: data[0] };
    } catch (err: any) {
      return { error: err };
    }
  };

  const deleteCompany = async (companyId: string) => {
    if (!user) {
      return { error: new Error('Kullanıcı doğrulanmadı') };
    }

    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId)
        .eq('owner_id', user.id);

      if (error) {
        return { error };
      }

      setCompanies(prev => prev.filter(company => company.id !== companyId));
      return { success: true };
    } catch (err: any) {
      return { error: err };
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [user]);

  return {
    companies,
    loading,
    error,
    addCompany,
    updateCompany,
    deleteCompany,
    refreshCompanies: fetchCompanies
  };
};
