
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
}

export const useInvoices = (companyId?: string) => {
  const { user } = useAuth();
  const [incomeInvoices, setIncomeInvoices] = useState<Invoice[]>([]);
  const [expenseInvoices, setExpenseInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    if (!user || !companyId) return;
    
    setLoading(true);
    
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

    if (incomeError) console.error('Error fetching income invoices:', incomeError);
    if (expenseError) console.error('Error fetching expense invoices:', expenseError);

    setIncomeInvoices(incomeData || []);
    setExpenseInvoices(expenseData || []);
    setLoading(false);
  };

  const addIncomeInvoice = async (invoiceData: {
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
    loading,
    addIncomeInvoice,
    addExpenseInvoice,
    updateInvoicePaymentStatus,
    refreshInvoices: fetchInvoices
  };
};
