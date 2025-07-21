
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Check {
  id: string;
  company_id: string;
  check_type: 'payable' | 'receivable';
  amount: number;
  due_date: string;
  description?: string;
  image_url?: string;
  status: 'pending' | 'paid' | 'cancelled';
  bank_name?: string;
  check_number?: string;
  drawer_name?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  issue_date?: string;
  given_company?: string;
}

export interface CreateCheckData {
  company_id: string;
  check_type: 'payable' | 'receivable';
  amount: number;
  due_date: string;
  description?: string;
  image_url?: string;
  bank_name?: string;
  check_number?: string;
  drawer_name?: string;
  issue_date?: string;
  given_company?: string;
}

export const useChecks = (companyId?: string) => {
  const [checks, setChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChecks = async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('checks')
        .select('*')
        .eq('company_id', companyId)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching checks:', error);
        setError(error.message);
        toast.error('Çekler yüklenirken hata oluştu.');
        return;
      }

      // Type assertion ile doğru tipleri garanti ediyoruz
      const typedChecks = (data || []).map(check => ({
        ...check,
        check_type: check.check_type as 'payable' | 'receivable',
        status: check.status as 'pending' | 'paid' | 'cancelled'
      }));

      setChecks(typedChecks);
      setError(null);
    } catch (err) {
      console.error('Error fetching checks:', err);
      setError('Beklenmeyen bir hata oluştu.');
      toast.error('Çekler yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const addCheck = async (checkData: CreateCheckData) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        toast.error('Giriş yapmanız gerekiyor.');
        return { error: 'Not authenticated' };
      }

      const { data, error } = await supabase
        .from('checks')
        .insert([{
          ...checkData,
          created_by: userData.user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding check:', error);
        toast.error('Çek eklenirken hata oluştu.');
        return { error: error.message };
      }

      // Type assertion ile doğru tipleri garanti ediyoruz
      const typedCheck = {
        ...data,
        check_type: data.check_type as 'payable' | 'receivable',
        status: data.status as 'pending' | 'paid' | 'cancelled'
      };

      setChecks(prev => [...prev, typedCheck]);
      toast.success('Çek başarıyla eklendi.');
      return { error: null };
    } catch (err) {
      console.error('Error adding check:', err);
      toast.error('Çek eklenirken beklenmeyen hata oluştu.');
      return { error: 'Unexpected error' };
    }
  };

  const updateCheckStatus = async (checkId: string, status: 'pending' | 'paid' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('checks')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', checkId);

      if (error) {
        console.error('Error updating check:', error);
        toast.error('Çek durumu güncellenirken hata oluştu.');
        return { error: error.message };
      }

      setChecks(prev => prev.map(check => 
        check.id === checkId ? { ...check, status } : check
      ));
      
      const statusText = status === 'paid' ? 'ödendi' : status === 'cancelled' ? 'iptal edildi' : 'bekliyor';
      toast.success(`Çek ${statusText} olarak işaretlendi.`);
      return { error: null };
    } catch (err) {
      console.error('Error updating check:', err);
      toast.error('Çek durumu güncellenirken beklenmeyen hata oluştu.');
      return { error: 'Unexpected error' };
    }
  };

  const deleteCheck = async (checkId: string) => {
    try {
      const { error } = await supabase
        .from('checks')
        .delete()
        .eq('id', checkId);

      if (error) {
        console.error('Error deleting check:', error);
        toast.error('Çek silinirken hata oluştu.');
        return { error: error.message };
      }

      setChecks(prev => prev.filter(check => check.id !== checkId));
      toast.success('Çek silindi.');
      return { error: null };
    } catch (err) {
      console.error('Error deleting check:', err);
      toast.error('Çek silinirken beklenmeyen hata oluştu.');
      return { error: 'Unexpected error' };
    }
  };

  const getPayableChecks = () => checks.filter(check => check.check_type === 'payable');
  const getReceivableChecks = () => checks.filter(check => check.check_type === 'receivable');
  
  const getTotalPayableAmount = () => getPayableChecks()
    .filter(check => check.status === 'pending')
    .reduce((sum, check) => sum + check.amount, 0);
  
  const getTotalReceivableAmount = () => getReceivableChecks()
    .filter(check => check.status === 'pending')
    .reduce((sum, check) => sum + check.amount, 0);

  useEffect(() => {
    fetchChecks();
  }, [companyId]);

  return {
    checks,
    payableChecks: getPayableChecks(),
    receivableChecks: getReceivableChecks(),
    totalPayableAmount: getTotalPayableAmount(),
    totalReceivableAmount: getTotalReceivableAmount(),
    loading,
    error,
    addCheck,
    updateCheckStatus,
    deleteCheck,
    refetch: fetchChecks
  };
};
