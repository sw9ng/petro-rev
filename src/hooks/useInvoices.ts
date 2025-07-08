
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

export interface Invoice {
  id: string;
  company_id: string;
  invoice_number?: string;
  description: string;
  amount: number;
  invoice_date: string;
  payment_status: 'paid' | 'unpaid';
  payment_date?: string;
  account_id?: string;
  account?: CompanyAccount;
  created_at: string;
  updated_at: string;
}

export const useInvoices = (companyId: string) => {
  const { user } = useAuth();
  const [incomeInvoices, setIncomeInvoices] = useState<Invoice[]>([]);
  const [expenseInvoices, setExpenseInvoices] = useState<Invoice[]>([]);
  const [accounts, setAccounts] = useState<CompanyAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user || !companyId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Fetch accounts
      const { data: accountsData, error: accountsError } = await supabase
        .from('company_accounts')
        .select('*')
        .eq('company_id', companyId);

      if (accountsError) throw accountsError;
      setAccounts(accountsData || []);

      // Fetch income invoices
      const { data: incomeData, error: incomeError } = await supabase
        .from('income_invoices')
        .select(`
          *,
          account:account_id(id, name)
        `)
        .eq('company_id', companyId)
        .order('invoice_date', { ascending: false });

      if (incomeError) throw incomeError;
      setIncomeInvoices(incomeData || []);

      // Fetch expense invoices
      const { data: expenseData, error: expenseError } = await supabase
        .from('expense_invoices')
        .select(`
          *,
          account:account_id(id, name)
        `)
        .eq('company_id', companyId)
        .order('invoice_date', { ascending: false });

      if (expenseError) throw expenseError;
      setExpenseInvoices(expenseData || []);

    } catch (err) {
      console.error('Error fetching company data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add a new account
  const addAccount = async (accountData: {
    name: string;
    phone?: string;
    address?: string;
    notes?: string;
  }) => {
    if (!user || !companyId) {
      return { error: new Error('Kullanıcı doğrulanmadı veya şirket ID eksik') };
    }

    try {
      const { data, error } = await supabase
        .from('company_accounts')
        .insert([{
          ...accountData,
          company_id: companyId
        }])
        .select();

      if (error) {
        return { error };
      }

      // Update local accounts state
      setAccounts(prev => [...prev, data[0]]);
      return { data: data[0] };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Add a new income invoice
  const addIncomeInvoice = async (invoiceData: {
    invoice_number?: string;
    description: string;
    amount: number;
    invoice_date: string;
    payment_status?: 'paid' | 'unpaid';
    payment_date?: string;
    account_id?: string;
  }) => {
    if (!user || !companyId) {
      return { error: new Error('Kullanıcı doğrulanmadı veya şirket ID eksik') };
    }

    try {
      const { data, error } = await supabase
        .from('income_invoices')
        .insert([{
          ...invoiceData,
          company_id: companyId,
          created_by: user.id
        }])
        .select(`
          *,
          account:account_id(id, name)
        `);

      if (error) {
        return { error };
      }

      // Update local income invoices state
      setIncomeInvoices(prev => [data[0], ...prev]);
      return { data: data[0] };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Add a new expense invoice
  const addExpenseInvoice = async (invoiceData: {
    invoice_number?: string;
    description: string;
    amount: number;
    invoice_date: string;
    payment_status?: 'paid' | 'unpaid';
    payment_date?: string;
    account_id?: string;
  }) => {
    if (!user || !companyId) {
      return { error: new Error('Kullanıcı doğrulanmadı veya şirket ID eksik') };
    }

    try {
      const { data, error } = await supabase
        .from('expense_invoices')
        .insert([{
          ...invoiceData,
          company_id: companyId,
          created_by: user.id
        }])
        .select(`
          *,
          account:account_id(id, name)
        `);

      if (error) {
        return { error };
      }

      // Update local expense invoices state
      setExpenseInvoices(prev => [data[0], ...prev]);
      return { data: data[0] };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Update an income invoice
  const updateIncomeInvoice = async (
    invoiceId: string,
    invoiceData: Partial<Invoice>
  ) => {
    if (!user || !companyId) {
      return { error: new Error('Kullanıcı doğrulanmadı veya şirket ID eksik') };
    }

    try {
      const { data, error } = await supabase
        .from('income_invoices')
        .update(invoiceData)
        .eq('id', invoiceId)
        .eq('company_id', companyId)
        .select(`
          *,
          account:account_id(id, name)
        `);

      if (error) {
        return { error };
      }

      // Update local income invoices state
      setIncomeInvoices(prev => 
        prev.map(invoice => invoice.id === invoiceId ? data[0] : invoice)
      );
      return { data: data[0] };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Update an expense invoice
  const updateExpenseInvoice = async (
    invoiceId: string,
    invoiceData: Partial<Invoice>
  ) => {
    if (!user || !companyId) {
      return { error: new Error('Kullanıcı doğrulanmadı veya şirket ID eksik') };
    }

    try {
      const { data, error } = await supabase
        .from('expense_invoices')
        .update(invoiceData)
        .eq('id', invoiceId)
        .eq('company_id', companyId)
        .select(`
          *,
          account:account_id(id, name)
        `);

      if (error) {
        return { error };
      }

      // Update local expense invoices state
      setExpenseInvoices(prev => 
        prev.map(invoice => invoice.id === invoiceId ? data[0] : invoice)
      );
      return { data: data[0] };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Delete an income invoice
  const deleteIncomeInvoice = async (invoiceId: string) => {
    if (!user || !companyId) {
      return { error: new Error('Kullanıcı doğrulanmadı veya şirket ID eksik') };
    }

    try {
      const { error } = await supabase
        .from('income_invoices')
        .delete()
        .eq('id', invoiceId)
        .eq('company_id', companyId);

      if (error) {
        return { error };
      }

      // Update local income invoices state
      setIncomeInvoices(prev => prev.filter(invoice => invoice.id !== invoiceId));
      return { success: true };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Delete an expense invoice
  const deleteExpenseInvoice = async (invoiceId: string) => {
    if (!user || !companyId) {
      return { error: new Error('Kullanıcı doğrulanmadı veya şirket ID eksik') };
    }

    try {
      const { error } = await supabase
        .from('expense_invoices')
        .delete()
        .eq('id', invoiceId)
        .eq('company_id', companyId);

      if (error) {
        return { error };
      }

      // Update local expense invoices state
      setExpenseInvoices(prev => prev.filter(invoice => invoice.id !== invoiceId));
      return { success: true };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Delete an account
  const deleteAccount = async (accountId: string) => {
    if (!user || !companyId) {
      return { error: new Error('Kullanıcı doğrulanmadı veya şirket ID eksik') };
    }

    try {
      const { error } = await supabase
        .from('company_accounts')
        .delete()
        .eq('id', accountId)
        .eq('company_id', companyId);

      if (error) {
        return { error };
      }

      // Update local accounts state
      setAccounts(prev => prev.filter(account => account.id !== accountId));
      return { success: true };
    } catch (err: any) {
      return { error: err };
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyId, user]);

  return {
    incomeInvoices,
    expenseInvoices,
    accounts,
    loading,
    addIncomeInvoice,
    addExpenseInvoice,
    addAccount,
    updateIncomeInvoice,
    updateExpenseInvoice,
    deleteIncomeInvoice,
    deleteExpenseInvoice,
    deleteAccount,
    refreshData: fetchData
  };
};
