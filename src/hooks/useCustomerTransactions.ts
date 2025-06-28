
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CustomerTransaction {
  id: string;
  customer_id: string;
  shift_id?: string;
  personnel_id: string;
  transaction_type: 'veresiye' | 'payment';
  amount: number;
  payment_method?: 'nakit' | 'kredi_karti' | 'havale';
  description?: string;
  transaction_date: string;
  status: 'pending' | 'collected';
  customer: {
    name: string;
  };
  personnel: {
    name: string;
  };
  shift?: {
    start_time: string;
    personnel: {
      name: string;
    };
  };
}

export const useCustomerTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<CustomerTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('customer_transactions')
      .select(`
        *,
        customer:customer_id (name),
        personnel:personnel_id (name),
        shift:shift_id (
          start_time,
          personnel:personnel_id (name)
        )
      `)
      .eq('station_id', user.id)
      .order('transaction_date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
    } else {
      // Type assertion to ensure proper typing
      const typedData = (data || []).map(item => ({
        ...item,
        transaction_type: item.transaction_type as 'veresiye' | 'payment',
        status: item.status as 'pending' | 'collected',
        payment_method: item.payment_method as 'nakit' | 'kredi_karti' | 'havale' | undefined
      })) as CustomerTransaction[];
      
      setTransactions(typedData);
    }
    setLoading(false);
  };

  const addVeresiye = async (transactionData: {
    customer_id: string;
    shift_id?: string;
    personnel_id: string;
    amount: number;
    description?: string;
  }) => {
    if (!user) return { error: 'Kullanıcı doğrulanmadı' };

    const { data, error } = await supabase
      .from('customer_transactions')
      .insert([
        {
          ...transactionData,
          transaction_type: 'veresiye',
          station_id: user.id
        }
      ])
      .select(`
        *,
        customer:customer_id (name),
        personnel:personnel_id (name),
        shift:shift_id (
          start_time,
          personnel:personnel_id (name)
        )
      `)
      .single();

    if (!error && data) {
      const typedData = {
        ...data,
        transaction_type: data.transaction_type as 'veresiye' | 'payment',
        status: data.status as 'pending' | 'collected',
        payment_method: data.payment_method as 'nakit' | 'kredi_karti' | 'havale' | undefined
      } as CustomerTransaction;
      
      setTransactions(prev => [typedData, ...prev]);
    }

    return { data, error };
  };

  const addPayment = async (transactionData: {
    customer_id: string;
    shift_id?: string;
    personnel_id: string;
    amount: number;
    payment_method: 'nakit' | 'kredi_karti' | 'havale';
    description?: string;
  }) => {
    if (!user) return { error: 'Kullanıcı doğrulanmadı' };

    const { data, error } = await supabase
      .from('customer_transactions')
      .insert([
        {
          ...transactionData,
          transaction_type: 'payment',
          status: 'collected',
          station_id: user.id
        }
      ])
      .select(`
        *,
        customer:customer_id (name),
        personnel:personnel_id (name),
        shift:shift_id (
          start_time,
          personnel:personnel_id (name)
        )
      `)
      .single();

    if (!error && data) {
      const typedData = {
        ...data,
        transaction_type: data.transaction_type as 'veresiye' | 'payment',
        status: data.status as 'pending' | 'collected',
        payment_method: data.payment_method as 'nakit' | 'kredi_karti' | 'havale' | undefined
      } as CustomerTransaction;
      
      setTransactions(prev => [typedData, ...prev]);
    }

    return { data, error };
  };

  const getCustomerBalance = (customerId: string) => {
    const customerTransactions = transactions.filter(t => t.customer_id === customerId);
    return customerTransactions.reduce((balance, transaction) => {
      if (transaction.transaction_type === 'veresiye') {
        return balance + transaction.amount;
      } else {
        return balance - transaction.amount;
      }
    }, 0);
  };

  const getCustomerDebts = () => {
    const debts = new Map<string, { customer: string; balance: number }>();
    
    transactions.forEach(transaction => {
      const customerId = transaction.customer_id;
      const customerName = transaction.customer.name;
      
      if (!debts.has(customerId)) {
        debts.set(customerId, { customer: customerName, balance: 0 });
      }
      
      const current = debts.get(customerId)!;
      if (transaction.transaction_type === 'veresiye') {
        current.balance += transaction.amount;
      } else {
        current.balance -= transaction.amount;
      }
    });
    
    return Array.from(debts.entries())
      .map(([id, data]) => ({ customerId: id, ...data }))
      .filter(debt => debt.balance > 0);
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  return {
    transactions,
    loading,
    addVeresiye,
    addPayment,
    getCustomerBalance,
    getCustomerDebts,
    refreshTransactions: fetchTransactions
  };
};
