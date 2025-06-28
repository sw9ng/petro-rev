
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
    shift_number?: string;
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
          shift_number,
          personnel:personnel_id (name)
        )
      `)
      .eq('station_id', user.id)
      .order('transaction_date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
    } else {
      // Safe type assertion with proper data validation
      const typedData = (data || []).map(item => {
        // Ensure customer and personnel data exists
        const customer = item.customer && typeof item.customer === 'object' && 'name' in item.customer 
          ? { name: item.customer.name }
          : { name: 'Unknown Customer' };
        
        const personnel = item.personnel && typeof item.personnel === 'object' && 'name' in item.personnel
          ? { name: item.personnel.name }
          : { name: 'Unknown Personnel' };

        // Handle shift data safely
        const shift = item.shift && typeof item.shift === 'object' 
          ? {
              start_time: item.shift.start_time || '',
              shift_number: item.shift.shift_number || undefined,
              personnel: item.shift.personnel && typeof item.shift.personnel === 'object' && 'name' in item.shift.personnel
                ? { name: item.shift.personnel.name }
                : { name: 'Unknown Personnel' }
            }
          : undefined;

        return {
          ...item,
          transaction_type: item.transaction_type as 'veresiye' | 'payment',
          status: item.status as 'pending' | 'collected',
          payment_method: item.payment_method as 'nakit' | 'kredi_karti' | 'havale' | undefined,
          customer,
          personnel,
          shift
        };
      }) as CustomerTransaction[];
      
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
          shift_number,
          personnel:personnel_id (name)
        )
      `)
      .single();

    if (!error && data) {
      const customer = data.customer && typeof data.customer === 'object' && 'name' in data.customer 
        ? { name: data.customer.name }
        : { name: 'Unknown Customer' };
      
      const personnel = data.personnel && typeof data.personnel === 'object' && 'name' in data.personnel
        ? { name: data.personnel.name }
        : { name: 'Unknown Personnel' };

      const shift = data.shift && typeof data.shift === 'object' 
        ? {
            start_time: data.shift.start_time || '',
            shift_number: data.shift.shift_number || undefined,
            personnel: data.shift.personnel && typeof data.shift.personnel === 'object' && 'name' in data.shift.personnel
              ? { name: data.shift.personnel.name }
              : { name: 'Unknown Personnel' }
          }
        : undefined;

      const typedData = {
        ...data,
        transaction_type: data.transaction_type as 'veresiye' | 'payment',
        status: data.status as 'pending' | 'collected',
        payment_method: data.payment_method as 'nakit' | 'kredi_karti' | 'havale' | undefined,
        customer,
        personnel,
        shift
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
          shift_number,
          personnel:personnel_id (name)
        )
      `)
      .single();

    if (!error && data) {
      const customer = data.customer && typeof data.customer === 'object' && 'name' in data.customer 
        ? { name: data.customer.name }
        : { name: 'Unknown Customer' };
      
      const personnel = data.personnel && typeof data.personnel === 'object' && 'name' in data.personnel
        ? { name: data.personnel.name }
        : { name: 'Unknown Personnel' };

      const shift = data.shift && typeof data.shift === 'object' 
        ? {
            start_time: data.shift.start_time || '',
            shift_number: data.shift.shift_number || undefined,
            personnel: data.shift.personnel && typeof data.shift.personnel === 'object' && 'name' in data.shift.personnel
              ? { name: data.shift.personnel.name }
              : { name: 'Unknown Personnel' }
          }
        : undefined;

      const typedData = {
        ...data,
        transaction_type: data.transaction_type as 'veresiye' | 'payment',
        status: data.status as 'pending' | 'collected',
        payment_method: data.payment_method as 'nakit' | 'kredi_karti' | 'havale' | undefined,
        customer,
        personnel,
        shift
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

  const getTransactionsByDateRange = async (startDate: string, endDate: string) => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('customer_transactions')
      .select(`
        *,
        customer:customer_id (name),
        personnel:personnel_id (name),
        shift:shift_id (
          start_time,
          shift_number,
          personnel:personnel_id (name)
        )
      `)
      .eq('station_id', user.id)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .order('transaction_date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions by date:', error);
      return [];
    }

    return (data || []).map(item => {
      const customer = item.customer && typeof item.customer === 'object' && 'name' in item.customer 
        ? { name: item.customer.name }
        : { name: 'Unknown Customer' };
      
      const personnel = item.personnel && typeof item.personnel === 'object' && 'name' in item.personnel
        ? { name: item.personnel.name }
        : { name: 'Unknown Personnel' };

      const shift = item.shift && typeof item.shift === 'object' 
        ? {
            start_time: item.shift.start_time || '',
            shift_number: item.shift.shift_number || undefined,
            personnel: item.shift.personnel && typeof item.shift.personnel === 'object' && 'name' in item.shift.personnel
              ? { name: item.shift.personnel.name }
              : { name: 'Unknown Personnel' }
          }
        : undefined;

      return {
        ...item,
        transaction_type: item.transaction_type as 'veresiye' | 'payment',
        status: item.status as 'pending' | 'collected',
        payment_method: item.payment_method as 'nakit' | 'kredi_karti' | 'havale' | undefined,
        customer,
        personnel,
        shift
      };
    }) as CustomerTransaction[];
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
    getTransactionsByDateRange,
    refreshTransactions: fetchTransactions
  };
};
