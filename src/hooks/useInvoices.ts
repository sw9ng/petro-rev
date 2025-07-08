
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Invoice {
  id: string;
  company_id: string;
  invoice_number?: string;
  description: string;
  amount: number;
  invoice_date: string;
  payment_status: 'paid' | 'unpaid';
  payment_date?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  account_id?: string;
}

export interface CompanyAccount {
  id: string;
  company_id: string;
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useInvoices = (companyId?: string) => {
  const { user } = useAuth();
  const [incomeInvoices, setIncomeInvoices] = useState<Invoice[]>([]);
  const [expenseInvoices, setExpenseInvoices] = useState<Invoice[]>([]);
  const [accounts, setAccounts] = useState<CompanyAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    if (!user || !companyId) return;
    
    setLoading(true);
    
    try {
      // Gelir faturaları
      const { data: incomeData, error: incomeError } = await supabase
        .from('income_invoices')
        .select('*')
        .eq('company_id', companyId)
        .order('invoice_date', { ascending: false });

      // Gider faturaları
      const { data: expenseData, error: expenseError } = await supabase
        .from('expense_invoices')
        .select('*')
        .eq('company_id', companyId)
        .order('invoice_date', { ascending: false });

      // Cari hesaplar
      const { data: accountsData, error: accountsError } = await supabase
        .from('company_accounts')
        .select('*')
        .eq('company_id', companyId)
        .order('name', { ascending: true });

      if (incomeError) {
        console.error('Error fetching income invoices:', incomeError);
      } else {
        setIncomeInvoices(incomeData || []);
      }

      if (expenseError) {
        console.error('Error fetching expense invoices:', expenseError);
      } else {
        setExpenseInvoices(expenseData || []);
      }

      if (accountsError) {
        console.error('Error fetching accounts:', accountsError);
      } else {
        setAccounts(accountsData || []);
      }
    } catch (error) {
      console.error('Error in fetchInvoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const addIncomeInvoice = async (invoiceData: {
    account_id?: string;
    invoice_number?: string;
    description: string;
    amount: number;
    invoice_date: string;
    payment_status?: 'paid' | 'unpaid';
    payment_date?: string;
  }) => {
    if (!user || !companyId) return { error: 'Kullanıcı doğrulanmadı' };

    const { data, error } = await supabase
      .from('income_invoices')
      .insert([
        {
          ...invoiceData,
          company_id: companyId,
          created_by: user.id
        }
      ])
      .select()
      .single();

    if (!error && data) {
      setIncomeInvoices(prev => [data, ...prev]);
    }

    return { data, error };
  };

  const addExpenseInvoice = async (invoiceData: {
    account_id?: string;
    invoice_number?: string;
    description: string;
    amount: number;
    invoice_date: string;
    payment_status?: 'paid' | 'unpaid';
    payment_date?: string;
  }) => {
    if (!user || !companyId) return { error: 'Kullanıcı doğrulanmadı' };

    const { data, error } = await supabase
      .from('expense_invoices')
      .insert([
        {
          ...invoiceData,
          company_id: companyId,
          created_by: user.id
        }
      ])
      .select()
      .single();

    if (!error && data) {
      setExpenseInvoices(prev => [data, ...prev]);
    }

    return { data, error };
  };

  const addAccount = async (accountData: {
    name: string;
    phone?: string;
    address?: string;
    notes?: string;
  }) => {
    if (!user || !companyId) return { error: 'Kullanıcı doğrulanmadı' };

    const { data, error } = await supabase
      .from('company_accounts')
      .insert([
        {
          ...accountData,
          company_id: companyId
        }
      ])
      .select()
      .single();

    if (!error && data) {
      setAccounts(prev => [data, ...prev]);
    }

    return { data, error };
  };

  const updateInvoicePaymentStatus = async (
    invoiceId: string,
    type: 'income' | 'expense',
    status: 'paid' | 'unpaid',
    paymentDate?: string
  ) => {
    if (!user) return { error: 'Kullanıcı doğrulanmadı' };

    const table = type === 'income' ? 'income_invoices' : 'expense_invoices';
    
    const { data, error } = await supabase
      .from(table)
      .update({
        payment_status: status,
        payment_date: status === 'paid' ? paymentDate || new Date().toISOString().split('T')[0] : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', invoiceId)
      .select()
      .single();

    if (!error && data) {
      if (type === 'income') {
        setIncomeInvoices(prev => prev.map(invoice => 
          invoice.id === invoiceId ? data : invoice
        ));
      } else {
        setExpenseInvoices(prev => prev.map(invoice => 
          invoice.id === invoiceId ? data : invoice
        ));
      }
    }

    return { data, error };
  };

  useEffect(() => {
    fetchInvoices();
  }, [user, companyId]);

  return {
    incomeInvoices,
    expenseInvoices,
    accounts,
    loading,
    addIncomeInvoice,
    addExpenseInvoice,
    addAccount,
    updateInvoicePaymentStatus,
    refreshInvoices: fetchInvoices
  };
};
