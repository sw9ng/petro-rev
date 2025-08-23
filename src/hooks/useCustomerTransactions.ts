import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CustomerTransaction {
  id: string;
  customer_id: string;
  personnel_id: string;
  amount: number;
  transaction_date: string;
  transaction_type: 'debt' | 'payment';
  status: 'pending' | 'completed';
  payment_method?: string;
  description?: string;
  customer: {
    name: string;
  };
  personnel: {
    name: string;
  } | null;
}

export const useCustomerTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<CustomerTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch all transactions using pagination
      let allTransactions: any[] = [];
      let from = 0;
      const limit = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('customer_transactions')
          .select(`
            *,
            customer:customer_id (
              name
            )
          `)
          .eq('station_id', user.id)
          .order('created_at', { ascending: false })
          .range(from, from + limit - 1);

        if (error) {
          console.error('Error fetching customer transactions:', error);
          setTransactions([]);
          setLoading(false);
          return;
        }

        if (data && data.length > 0) {
          allTransactions = [...allTransactions, ...data];
          from += limit;
          hasMore = data.length === limit;
        } else {
          hasMore = false;
        }
      }
      // Fetch personnel data separately
      const personnelIds = [...new Set(allTransactions.map(item => item.personnel_id))];
      const { data: personnelData } = await supabase
        .from('personnel')
        .select('id, name')
        .in('id', personnelIds);

      const personnelMap = (personnelData || []).reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {} as Record<string, { id: string; name: string }>);

      const mappedData = allTransactions.map(item => ({
        id: item.id,
        customer_id: item.customer_id,
        personnel_id: item.personnel_id,
        amount: item.amount,
        transaction_date: item.transaction_date,
        transaction_type: item.transaction_type as 'debt' | 'payment',
        status: item.status as 'pending' | 'completed',
        payment_method: item.payment_method,
        description: item.description,
        customer: item.customer,
        personnel: personnelMap[item.personnel_id] ? { name: personnelMap[item.personnel_id].name } : { name: 'Bilinmeyen Personel' }
      }));
      setTransactions(mappedData);
      console.log(`[DEBUG] Fetched ${mappedData.length} transactions from database (unlimited)`);
    } catch (error) {
      console.error('Unexpected error fetching transactions:', error);
      setTransactions([]);
    }
    setLoading(false);
  };

  const addPayment = async (paymentData: {
    customer_id: string;
    personnel_id: string;
    amount: number;
    payment_method?: string;
    description?: string;
    transaction_date: string;
  }) => {
    if (!user) return { error: 'Kullanıcı doğrulanmadı' };

    const { data, error } = await supabase
      .from('customer_transactions')
      .insert([
        {
          customer_id: paymentData.customer_id,
          personnel_id: paymentData.personnel_id,
          amount: paymentData.amount,
          transaction_date: paymentData.transaction_date,
          station_id: user.id,
          transaction_type: 'payment',
          status: 'completed',
          payment_method: paymentData.payment_method,
          description: paymentData.description
        }
      ])
      .select(`
        *,
        customer:customer_id (
          name
        )
      `)
      .single();

    if (!error) {
      // Refresh all transactions to ensure data consistency
      await fetchTransactions();
      // Force a small delay to ensure UI updates
      setTimeout(() => {
        fetchTransactions();
      }, 100);
    }

    return { data, error };
  };

  const addVeresiye = async (veresiyeData: {
    customer_id: string;
    personnel_id: string;
    amount: number;
    description?: string;
    transaction_date: string;
  }) => {
    if (!user) return { error: 'Kullanıcı doğrulanmadı' };

    const { data, error } = await supabase
      .from('customer_transactions')
      .insert([
        {
          customer_id: veresiyeData.customer_id,
          personnel_id: veresiyeData.personnel_id,
          amount: veresiyeData.amount,
          transaction_date: veresiyeData.transaction_date,
          station_id: user.id,
          transaction_type: 'debt',
          status: 'pending',
          description: veresiyeData.description
        }
      ])
      .select(`
        *,
        customer:customer_id (
          name
        )
      `)
      .single();

    if (!error) {
      // Refresh all transactions to ensure data consistency
      await fetchTransactions();
      // Force a small delay to ensure UI updates
      setTimeout(() => {
        fetchTransactions();
      }, 100);
    }

    return { data, error };
  };

  const updateTransaction = async (transactionId: string, updateData: {
    amount?: number;
    payment_method?: string;
    description?: string;
    transaction_date?: string;
  }) => {
    if (!user) return { error: 'Kullanıcı doğrulanmadı' };

    const { data, error } = await supabase
      .from('customer_transactions')
      .update(updateData)
      .eq('id', transactionId)
      .eq('station_id', user.id)
      .select(`
        *,
        customer:customer_id (
          name
        )
      `)
      .single();

    if (!error) {
      // Refresh all transactions to ensure data consistency
      await fetchTransactions();
    }

    return { data, error };
  };

  const deleteTransaction = async (transactionId: string) => {
    if (!user) return { error: 'Kullanıcı doğrulanmadı' };

    const { error } = await supabase
      .from('customer_transactions')
      .delete()
      .eq('id', transactionId)
      .eq('station_id', user.id);

    if (!error) {
      // Refresh all transactions to ensure data consistency
      await fetchTransactions();
    }

    return { error };
  };

  const getCustomerBalance = (customerId: string) => {
    const customerTransactions = transactions.filter(t => t.customer_id === customerId);
    const totalDebt = customerTransactions
      .filter(t => t.transaction_type === 'debt')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalPayments = customerTransactions
      .filter(t => t.transaction_type === 'payment')
      .reduce((sum, t) => sum + t.amount, 0);
    return totalDebt - totalPayments;
  };

  const getCustomerTransactions = (customerId: string) => {
    return transactions.filter(t => t.customer_id === customerId);
  };

  const getCustomerDebts = () => {
    // Group by customer and calculate each customer's balance
    const customerBalances: { [key: string]: { customerId: string, customer: string, balance: number } } = {};
    
    transactions.forEach(transaction => {
      if (!customerBalances[transaction.customer_id]) {
        customerBalances[transaction.customer_id] = {
          customerId: transaction.customer_id,
          customer: transaction.customer.name,
          balance: 0
        };
      }
      
      if (transaction.transaction_type === 'debt') {
        customerBalances[transaction.customer_id].balance += transaction.amount;
      } else {
        customerBalances[transaction.customer_id].balance -= transaction.amount;
      }
    });
    
    // Return only customers with positive balances (debts)
    return Object.values(customerBalances).filter(customer => customer.balance > 0);
  };

  const getTransactionsByDateRange = async (startDate: string, endDate: string) => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('customer_transactions')
      .select(`
        *,
        customer:customer_id (
          name
        )
      `)
      .eq('station_id', user.id)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .order('transaction_date', { ascending: false });

    if (error) {
      console.error('Error searching transactions:', error);
      return [];
    }
    
    // Fetch personnel data separately
    const personnelIds = [...new Set((data || []).map(item => item.personnel_id))];
    const { data: personnelData } = await supabase
      .from('personnel')
      .select('id, name')
      .in('id', personnelIds);

    const personnelMap = (personnelData || []).reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {} as Record<string, { id: string; name: string }>);

    const mappedData = (data || []).map(item => ({
      id: item.id,
      customer_id: item.customer_id,
      personnel_id: item.personnel_id,
      amount: item.amount,
      transaction_date: item.transaction_date,
      transaction_type: item.transaction_type as 'debt' | 'payment',
      status: item.status as 'pending' | 'completed',
      payment_method: item.payment_method,
      description: item.description,
      customer: item.customer,
      personnel: personnelMap[item.personnel_id] ? { name: personnelMap[item.personnel_id].name } : { name: 'Bilinmeyen Personel' }
    }));
    
    return mappedData;
  };

  const getTotalOutstandingDebt = () => {
    // Group by customer and calculate each customer's balance
    const customerBalances: { [key: string]: number } = {};
    
    transactions.forEach(transaction => {
      if (!customerBalances[transaction.customer_id]) {
        customerBalances[transaction.customer_id] = 0;
      }
      
      if (transaction.transaction_type === 'debt') {
        customerBalances[transaction.customer_id] += transaction.amount;
      } else {
        customerBalances[transaction.customer_id] -= transaction.amount;
      }
    });
    
    // Sum only positive balances (outstanding debts)
    return Object.values(customerBalances)
      .filter(balance => balance > 0)
      .reduce((sum, balance) => sum + balance, 0);
  };

  const getAllTransactionsGroupedByCustomer = () => {
    const grouped: { [key: string]: { customer: any, transactions: CustomerTransaction[], balance: number } } = {};
    
    transactions.forEach(transaction => {
      if (!grouped[transaction.customer_id]) {
        grouped[transaction.customer_id] = {
          customer: { 
            id: transaction.customer_id,
            name: transaction.customer.name 
          },
          transactions: [],
          balance: 0
        };
      }
      
      grouped[transaction.customer_id].transactions.push(transaction);
      
      if (transaction.transaction_type === 'debt') {
        grouped[transaction.customer_id].balance += transaction.amount;
      } else {
        grouped[transaction.customer_id].balance -= transaction.amount;
      }
    });
    
    return Object.values(grouped);
  };

  const findTransactionsByDate = async (date: string) => {
    if (!user) return [];
    
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    
    const { data, error } = await supabase
      .from('customer_transactions')
      .select(`
        *,
        customer:customer_id (
          name
        )
      `)
      .eq('station_id', user.id)
      .gte('transaction_date', startDate.toISOString())
      .lt('transaction_date', endDate.toISOString())
      .order('transaction_date', { ascending: false });

    if (error) {
      console.error('Error searching transactions:', error);
      return [];
    }
    
    // Fetch personnel data separately
    const personnelIds = [...new Set((data || []).map(item => item.personnel_id))];
    const { data: personnelData } = await supabase
      .from('personnel')
      .select('id, name')
      .in('id', personnelIds);

    const personnelMap = (personnelData || []).reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {} as Record<string, { id: string; name: string }>);

    const mappedData = (data || []).map(item => ({
      id: item.id,
      customer_id: item.customer_id,
      personnel_id: item.personnel_id,
      amount: item.amount,
      transaction_date: item.transaction_date,
      transaction_type: item.transaction_type as 'debt' | 'payment',
      status: item.status as 'pending' | 'completed',
      payment_method: item.payment_method,
      description: item.description,
      customer: item.customer,
      personnel: personnelMap[item.personnel_id] ? { name: personnelMap[item.personnel_id].name } : { name: 'Bilinmeyen Personel' }
    }));
    
    return mappedData;
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  return {
    transactions,
    loading,
    addPayment,
    addVeresiye,
    updateTransaction,
    deleteTransaction,
    getCustomerBalance,
    getCustomerTransactions,
    getCustomerDebts,
    getTransactionsByDateRange,
    getTotalOutstandingDebt,
    getAllTransactionsGroupedByCustomer,
    findTransactionsByDate,
    refreshTransactions: fetchTransactions
  };
};
