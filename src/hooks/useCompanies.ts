
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Company {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export const useCompanies = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching companies:', error);
    } else {
      setCompanies(data || []);
    }
    setLoading(false);
  };

  const addCompany = async (companyData: {
    name: string;
    description?: string;
  }) => {
    if (!user) return { error: 'Kullanıcı doğrulanmadı' };

    const { data, error } = await supabase
      .from('companies')
      .insert([
        {
          ...companyData,
          owner_id: user.id
        }
      ])
      .select()
      .single();

    if (!error && data) {
      setCompanies(prev => [data, ...prev]);
    }

    return { data, error };
  };

  const updateCompany = async (companyId: string, companyData: {
    name?: string;
    description?: string;
  }) => {
    if (!user) return { error: 'Kullanıcı doğrulanmadı' };

    const { data, error } = await supabase
      .from('companies')
      .update({ ...companyData, updated_at: new Date().toISOString() })
      .eq('id', companyId)
      .eq('owner_id', user.id)
      .select()
      .single();

    if (!error && data) {
      setCompanies(prev => prev.map(company => 
        company.id === companyId ? data : company
      ));
    }

    return { data, error };
  };

  const deleteCompany = async (companyId: string) => {
    if (!user) return { error: 'Kullanıcı doğrulanmadı' };

    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyId)
      .eq('owner_id', user.id);

    if (!error) {
      setCompanies(prev => prev.filter(company => company.id !== companyId));
    }

    return { error };
  };

  useEffect(() => {
    fetchCompanies();
  }, [user]);

  return {
    companies,
    loading,
    addCompany,
    updateCompany,
    deleteCompany,
    refreshCompanies: fetchCompanies
  };
};
