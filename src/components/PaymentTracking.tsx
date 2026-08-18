import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useCustomers } from '@/hooks/useCustomers';
import { useCustomerTransactions } from '@/hooks/useCustomerTransactions';
import { usePersonnel } from '@/hooks/usePersonnel';
import { formatCurrency } from '@/lib/numberUtils';
import { generateTahsilatMakbuzu, numberToWords } from '@/lib/pdfUtils';
import { Plus, Search, CreditCard, ArrowUpDown, Calendar, Users, TrendingUp, TrendingDown, Edit, Trash2, FileText, Check } from 'lucide-react';
import { toast } from 'sonner';
import { SearchableLimitedSelect } from '@/components/SearchableLimitedSelect';
import { CustomerDetailView } from '@/components/CustomerDetailView';

export const PaymentTracking = () => {
  const { customers } = useCustomers();
  const { personnel } = usePersonnel();
  const { 
    transactions, 
    addPayment, 
    addVeresiye, 
    updateTransaction,
    deleteTransaction,
    getAllTransactionsGroupedByCustomer,
    getTotalOutstandingDebt,
    refreshTransactions
  } = useCustomerTransactions();

  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedPersonnel, setSelectedPersonnel] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [transactionDate, setTransactionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [transactionTime, setTransactionTime] = useState<string>(new Date().toTimeString().split(' ')[0].slice(0, 5));
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [visibleCustomerCount, setVisibleCustomerCount] = useState(20);

  // History filter/sort state
  const emptyFilters = { search: '', startDate: '', endDate: '', method: 'all', minAmount: '', maxAmount: '', sortBy: 'date-newest' };
  const [paymentFilters, setPaymentFilters] = useState({ ...emptyFilters });
  const [debtFilters, setDebtFilters] = useState({ ...emptyFilters });

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [editPaymentMethod, setEditPaymentMethod] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');

  // Bulk selection state for debt transactions
  const [selectedDebtTransactions, setSelectedDebtTransactions] = useState<Set<string>>(new Set());
  const [debtSelectMode, setDebtSelectMode] = useState(false);

  // Bulk selection state for payment transactions
  const [selectedPaymentTransactions, setSelectedPaymentTransactions] = useState<Set<string>>(new Set());
  const [paymentSelectMode, setPaymentSelectMode] = useState(false);

  // Loading states
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [isAddingDebt, setIsAddingDebt] = useState(false);

  const navigate = useNavigate();
  const [detailCustomerId, setDetailCustomerId] = useState<string | null>(null);

  const handleCustomerClick = (customerId: string) => {
    if (customerId) {
      setDetailCustomerId(customerId);
    }
  };

  const groupedTransactions = getAllTransactionsGroupedByCustomer();
  const totalOutstandingDebt = getTotalOutstandingDebt();

  // Filtered and sorted transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = groupedTransactions.filter(group => 
      group.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort based on selected criteria
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'balance-high':
          comparison = b.balance - a.balance;
          break;
        case 'balance-low':
          comparison = a.balance - b.balance;
          break;
        case 'date-newest':
          const aLatest = Math.max(...a.transactions.map(t => new Date(t.transaction_date).getTime()));
          const bLatest = Math.max(...b.transactions.map(t => new Date(t.transaction_date).getTime()));
          comparison = bLatest - aLatest;
          break;
        case 'date-oldest':
          const aOldest = Math.min(...a.transactions.map(t => new Date(t.transaction_date).getTime()));
          const bOldest = Math.min(...b.transactions.map(t => new Date(t.transaction_date).getTime()));
          comparison = aOldest - bOldest;
          break;
        case 'name':
        default:
          comparison = a.customer.name.localeCompare(b.customer.name, 'tr');
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [groupedTransactions, searchTerm, sortBy, sortOrder]);

  const visibleCustomerTransactions = useMemo(
    () => filteredAndSortedTransactions.slice(0, visibleCustomerCount),
    [filteredAndSortedTransactions, visibleCustomerCount]
  );
  const customerOptions = useMemo(
    () => customers.map(customer => ({ value: customer.id, label: customer.name })),
    [customers]
  );
  const personnelOptions = useMemo(
    () => personnel.map(person => ({ value: person.id, label: person.name })),
    [personnel]
  );

  const handleAddPayment = async () => {
    if (!selectedCustomer || !selectedPersonnel || !amount) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    if (isAddingPayment) {
      toast.error('İşlem devam ediyor, lütfen bekleyin');
      return;
    }

    setIsAddingPayment(true);
    try {
      const result = await addPayment({
      customer_id: selectedCustomer,
      personnel_id: selectedPersonnel,
      amount: parseFloat(amount),
      payment_method: paymentMethod,
      description: description,
      transaction_date: new Date(`${transactionDate}T${transactionTime}:00`).toISOString()
    });

    if (result.error) {
      const errorMessage = typeof result.error === 'string' ? result.error : result.error.message || 'Bilinmeyen hata';
      toast.error('Ödeme kaydedilirken hata oluştu: ' + errorMessage);
      console.error('Payment transaction error:', result.error);
    } else {
      toast.success('Ödeme başarıyla kaydedildi');
      setSelectedCustomer('');
      setSelectedPersonnel('');
      setAmount('');
      setPaymentMethod('');
      setDescription('');
      setTransactionDate(new Date().toISOString().split('T')[0]);
      setTransactionTime(new Date().toTimeString().split(' ')[0].slice(0, 5));
    }
    } catch (error) {
      console.error('Unexpected error adding payment:', error);
      toast.error('Beklenmeyen bir hata oluştu');
    } finally {
      setIsAddingPayment(false);
    }
  };

  const handleAddVeresiye = async () => {
    if (!selectedCustomer || !selectedPersonnel || !amount) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    if (isAddingDebt) {
      toast.error('İşlem devam ediyor, lütfen bekleyin');
      return;
    }

    setIsAddingDebt(true);
    try {
      const result = await addVeresiye({
      customer_id: selectedCustomer,
      personnel_id: selectedPersonnel,
      amount: parseFloat(amount),
      description: description,
      transaction_date: new Date(`${transactionDate}T${transactionTime}:00`).toISOString()
    });

    if (result.error) {
      const errorMessage = typeof result.error === 'string' ? result.error : result.error.message || 'Bilinmeyen hata';
      toast.error('Veresiye kaydedilirken hata oluştu: ' + errorMessage);
      console.error('Debt transaction error:', result.error);
    } else {
      toast.success('Veresiye başarıyla kaydedildi');
      setSelectedCustomer('');
      setSelectedPersonnel('');
      setAmount('');
      setDescription('');
      setTransactionDate(new Date().toISOString().split('T')[0]);
      setTransactionTime(new Date().toTimeString().split(' ')[0].slice(0, 5));
    }
    } catch (error) {
      console.error('Unexpected error adding debt:', error);
      toast.error('Beklenmeyen bir hata oluştu');
    } finally {
      setIsAddingDebt(false);
    }
  };

  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction);
    setEditAmount(transaction.amount.toString());
    setEditPaymentMethod(transaction.payment_method || '');
    setEditDescription(transaction.description || '');
    setEditDialogOpen(true);
  };

  const handleUpdateTransaction = async () => {
    if (!editingTransaction || !editAmount) {
      toast.error('Lütfen gerekli alanları doldurun');
      return;
    }

    const result = await updateTransaction(editingTransaction.id, {
      amount: parseFloat(editAmount),
      payment_method: editPaymentMethod,
      description: editDescription
    });

    if (result.error) {
      toast.error('İşlem güncellenirken hata oluştu');
    } else {
      toast.success('İşlem başarıyla güncellendi');
      setEditDialogOpen(false);
      setEditingTransaction(null);
      setEditAmount('');
      setEditPaymentMethod('');
      setEditDescription('');
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    const result = await deleteTransaction(transactionId);

    if (result.error) {
      toast.error('İşlem silinirken hata oluştu');
    } else {
      toast.success('İşlem başarıyla silindi');
    }
  };

  const handlePrintReceipt = (transaction: any) => {
    const customer = customers.find(c => c.id === transaction.customer_id);
    const personnelMember = personnel.find(p => p.id === transaction.personnel_id);
    
    const makbuzData = {
      makbuzNo: `MKB-${transaction.id.substring(0, 8).toUpperCase()}`,
      tarih: new Date(transaction.transaction_date).toLocaleDateString('tr-TR'),
      musteriAdi: customer?.name || 'Bilinmeyen Müşteri',
      odemeShekli: transaction.payment_method || 'Nakit',
      aciklama: transaction.description || 'Ödeme tahsilatı',
      tutar: transaction.amount,
      tutarYazisi: numberToWords(transaction.amount),
      tahsilEden: personnelMember?.name || 'Bilinmeyen Personel'
    };

    const pdf = generateTahsilatMakbuzu(makbuzData);
    pdf.save(`tahsilat-makbuzu-${makbuzData.makbuzNo}.pdf`);
    
    toast.success('Tahsilat makbuzu PDF olarak indirildi');
  };

  // Debt bulk operations
  const handleSelectDebtTransaction = (transactionId: string, checked: boolean) => {
    const newSelected = new Set(selectedDebtTransactions);
    if (checked) {
      newSelected.add(transactionId);
    } else {
      newSelected.delete(transactionId);
    }
    setSelectedDebtTransactions(newSelected);
  };

  const handleSelectAllDebtTransactions = (checked: boolean) => {
    if (checked) {
      setSelectedDebtTransactions(new Set(debtTransactions.map(t => t.id)));
    } else {
      setSelectedDebtTransactions(new Set());
    }
  };

  const toggleDebtSelectMode = () => {
    setDebtSelectMode(!debtSelectMode);
    if (debtSelectMode) {
      setSelectedDebtTransactions(new Set());
    }
  };

  const handleBulkDeleteDebt = async () => {
    if (selectedDebtTransactions.size === 0) {
      toast.error('Lütfen silinecek işlemleri seçin');
      return;
    }

    for (const transactionId of selectedDebtTransactions) {
      await deleteTransaction(transactionId);
    }

    toast.success(`${selectedDebtTransactions.size} borç işlemi silindi`);
    setSelectedDebtTransactions(new Set());
    setDebtSelectMode(false);
  };

  // Payment bulk operations
  const handleSelectPaymentTransaction = (transactionId: string, checked: boolean) => {
    const newSelected = new Set(selectedPaymentTransactions);
    if (checked) {
      newSelected.add(transactionId);
    } else {
      newSelected.delete(transactionId);
    }
    setSelectedPaymentTransactions(newSelected);
  };

  const handleSelectAllPaymentTransactions = (checked: boolean) => {
    if (checked) {
      setSelectedPaymentTransactions(new Set(paymentTransactions.map(t => t.id)));
    } else {
      setSelectedPaymentTransactions(new Set());
    }
  };

  const togglePaymentSelectMode = () => {
    setPaymentSelectMode(!paymentSelectMode);
    if (paymentSelectMode) {
      setSelectedPaymentTransactions(new Set());
    }
  };

  const handleBulkDeletePayment = async () => {
    if (selectedPaymentTransactions.size === 0) {
      toast.error('Lütfen silinecek işlemleri seçin');
      return;
    }

    for (const transactionId of selectedPaymentTransactions) {
      await deleteTransaction(transactionId);
    }

    toast.success(`${selectedPaymentTransactions.size} ödeme işlemi silindi`);
    setSelectedPaymentTransactions(new Set());
    setPaymentSelectMode(false);
  };

  // Separate transactions by type for history (with search, filter and sort)
  const applyHistoryFilters = (list: any[], f: typeof paymentFilters) => {
    const term = f.search.trim().toLowerCase();
    let result = list.filter((t) => {
      if (term) {
        const hay = `${t.customer?.name || ''} ${t.personnel?.name || ''} ${t.description || ''}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      if (f.startDate && new Date(t.transaction_date) < new Date(`${f.startDate}T00:00:00`)) return false;
      if (f.endDate && new Date(t.transaction_date) > new Date(`${f.endDate}T23:59:59`)) return false;
      if (f.method && f.method !== 'all' && t.payment_method !== f.method) return false;
      if (f.minAmount && Number(t.amount) < Number(f.minAmount)) return false;
      if (f.maxAmount && Number(t.amount) > Number(f.maxAmount)) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      switch (f.sortBy) {
        case 'date-oldest':
          return new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime();
        case 'amount-high':
          return Number(b.amount) - Number(a.amount);
        case 'amount-low':
          return Number(a.amount) - Number(b.amount);
        case 'customer':
          return (a.customer?.name || '').localeCompare(b.customer?.name || '', 'tr');
        default:
          return new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime();
      }
    });

    return result;
  };

  const paymentTransactions = useMemo(
    () => applyHistoryFilters(transactions.filter(t => t.transaction_type === 'payment'), paymentFilters),
    [transactions, paymentFilters]
  );
  const debtTransactions = useMemo(
    () => applyHistoryFilters(transactions.filter(t => t.transaction_type === 'debt'), debtFilters),
    [transactions, debtFilters]
  );

  if (detailCustomerId) {
    return (
      <CustomerDetailView
        customerId={detailCustomerId}
        onBack={() => setDetailCustomerId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Cari Satış Takibi
          </h2>
          <p className="text-gray-600 mt-2">Müşteri borç ve ödeme takibi</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-lg px-4 py-2">
            Toplam Borç: {formatCurrency(totalOutstandingDebt)}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Müşteri</p>
                  <p className="text-2xl font-bold">{customers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Borçlu Müşteri</p>
                  <p className="text-2xl font-bold">{groupedTransactions.filter(g => g.balance > 0).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam İşlem</p>
                  <p className="text-2xl font-bold">{transactions.length}</p>
                  <p className="text-xs text-gray-400">Debug: {transactions.length} işlem yüklendi</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="payment">Ödeme Al</TabsTrigger>
            <TabsTrigger value="debt">Borç Kaydet</TabsTrigger>
            <TabsTrigger value="payment-history">Ödeme Geçmişi</TabsTrigger>
            <TabsTrigger value="debt-history">Borç Geçmişi</TabsTrigger>
          </TabsList>

          {activeTab === 'overview' && <TabsContent value="overview" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Müşteri ara..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setVisibleCustomerCount(20);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <ArrowUpDown className="h-4 w-4 text-gray-500" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sıralama" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">İsim (A-Z)</SelectItem>
                    <SelectItem value="balance-high">Borç (Yüksek-Düşük)</SelectItem>
                    <SelectItem value="balance-low">Borç (Düşük-Yüksek)</SelectItem>
                    <SelectItem value="date-newest">Tarih (Yeni-Eski)</SelectItem>
                    <SelectItem value="date-oldest">Tarih (Eski-Yeni)</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {visibleCustomerTransactions.map((group) => (
                <Card 
                  key={group.customer.id} 
                  className="hover:shadow-md transition-shadow" 
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">
                          {group.customer.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {group.transactions.length} işlem
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${
                            group.balance > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {formatCurrency(Math.abs(group.balance))}
                          </div>
                          <p className="text-sm text-gray-600">
                            {group.balance > 0 ? 'Borç' : 'Denge'}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCustomerClick(group.customer.id)}
                          className="flex items-center space-x-1"
                        >
                          <span>Detay</span>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Son İşlem: {group.transactions.length > 0 ? 
                          new Date(Math.max(...group.transactions.map(t => new Date(t.transaction_date).getTime())))
                            .toLocaleDateString('tr-TR') : 'Yok'
                        }</span>
                        <span>
                          Borç: {formatCurrency(group.transactions.filter(t => t.transaction_type === 'debt').reduce((sum, t) => sum + t.amount, 0))} | 
                          Ödeme: {formatCurrency(group.transactions.filter(t => t.transaction_type === 'payment').reduce((sum, t) => sum + t.amount, 0))}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {visibleCustomerCount < filteredAndSortedTransactions.length && (
                <Button
                  variant="outline"
                  onClick={() => setVisibleCustomerCount(count => count + 20)}
                  className="w-full"
                >
                  Daha Fazla Göster
                </Button>
              )}
            </div>
          </TabsContent>}

          {activeTab === 'payment' && <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ödeme Al</CardTitle>
                <CardDescription>Müşteri ödemesi kaydet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Müşteri</Label>
                    <SearchableLimitedSelect
                      options={customerOptions}
                      value={selectedCustomer}
                      onValueChange={setSelectedCustomer}
                      placeholder="Müşteri seçin"
                      searchPlaceholder="Müşteri ara..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Personel</Label>
                    <SearchableLimitedSelect
                      options={personnelOptions}
                      value={selectedPersonnel}
                      onValueChange={setSelectedPersonnel}
                      placeholder="Personel seçin"
                      searchPlaceholder="Personel ara..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tutar</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Ödeme Yöntemi</Label>
                    <Input
                      type="text"
                      placeholder="Nakit, Kredi Kartı, Havale..."
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tarih</Label>
                    <Input
                      type="date"
                      value={transactionDate}
                      onChange={(e) => setTransactionDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Saat</Label>
                    <Input
                      type="time"
                      value={transactionTime}
                      onChange={(e) => setTransactionTime(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Açıklama</Label>
                    <Input
                      type="text"
                      placeholder="Ödeme açıklaması..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>

                <Button onClick={handleAddPayment} className="w-full" disabled={isAddingPayment}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isAddingPayment ? 'Kaydediliyor...' : 'Ödeme Kaydet'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>}

          {activeTab === 'debt' && <TabsContent value="debt" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Borç Kaydet</CardTitle>
                <CardDescription>Müşteri borcu kaydet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Müşteri</Label>
                    <SearchableLimitedSelect
                      options={customerOptions}
                      value={selectedCustomer}
                      onValueChange={setSelectedCustomer}
                      placeholder="Müşteri seçin"
                      searchPlaceholder="Müşteri ara..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Personel</Label>
                    <SearchableLimitedSelect
                      options={personnelOptions}
                      value={selectedPersonnel}
                      onValueChange={setSelectedPersonnel}
                      placeholder="Personel seçin"
                      searchPlaceholder="Personel ara..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tutar</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tarih</Label>
                    <Input
                      type="date"
                      value={transactionDate}
                      onChange={(e) => setTransactionDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Saat</Label>
                    <Input
                      type="time"
                      value={transactionTime}
                      onChange={(e) => setTransactionTime(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Açıklama</Label>
                    <Input
                      type="text"
                      placeholder="Borç açıklaması..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>

                <Button onClick={handleAddVeresiye} className="w-full" disabled={isAddingDebt}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isAddingDebt ? 'Kaydediliyor...' : 'Borç Kaydet'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>}

          {activeTab === 'payment-history' && <TabsContent value="payment-history" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5 text-green-600" />
                      <span>Ödeme Geçmişi</span>
                    </CardTitle>
                    <CardDescription>Tüm ödeme işlemleri</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {paymentSelectMode && selectedPaymentTransactions.size > 0 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Seçilileri Sil ({selectedPaymentTransactions.size})
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Seçili İşlemleri Sil</AlertDialogTitle>
                            <AlertDialogDescription>
                              {selectedPaymentTransactions.size} adet ödeme işlemini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>İptal</AlertDialogCancel>
                            <AlertDialogAction onClick={handleBulkDeletePayment}>
                              Sil
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={togglePaymentSelectMode}
                    >
                      {paymentSelectMode ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Seçimi Bitir
                        </>
                      ) : (
                        'Toplu Seç'
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                  <div className="lg:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      className="pl-10"
                      placeholder="Müşteri, personel veya açıklama ara..."
                      value={paymentFilters.search}
                      onChange={(e) => setPaymentFilters(f => ({ ...f, search: e.target.value }))}
                    />
                  </div>
                  <Input type="date" value={paymentFilters.startDate} onChange={(e) => setPaymentFilters(f => ({ ...f, startDate: e.target.value }))} />
                  <Input type="date" value={paymentFilters.endDate} onChange={(e) => setPaymentFilters(f => ({ ...f, endDate: e.target.value }))} />
                  <Input type="number" placeholder="En az tutar" value={paymentFilters.minAmount} onChange={(e) => setPaymentFilters(f => ({ ...f, minAmount: e.target.value }))} />
                  <Input type="number" placeholder="En çok tutar" value={paymentFilters.maxAmount} onChange={(e) => setPaymentFilters(f => ({ ...f, maxAmount: e.target.value }))} />
                  <Select value={paymentFilters.method} onValueChange={(v) => setPaymentFilters(f => ({ ...f, method: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ödeme yöntemi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Yöntemler</SelectItem>
                      <SelectItem value="nakit">Nakit</SelectItem>
                      <SelectItem value="kredi_karti">Kredi Kartı</SelectItem>
                      <SelectItem value="havale">Havale</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2 lg:col-span-2">
                    <ArrowUpDown className="h-4 w-4 text-gray-500" />
                    <Select value={paymentFilters.sortBy} onValueChange={(v) => setPaymentFilters(f => ({ ...f, sortBy: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sırala" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date-newest">Tarih (Yeni → Eski)</SelectItem>
                        <SelectItem value="date-oldest">Tarih (Eski → Yeni)</SelectItem>
                        <SelectItem value="amount-high">Tutar (Yüksek → Düşük)</SelectItem>
                        <SelectItem value="amount-low">Tutar (Düşük → Yüksek)</SelectItem>
                        <SelectItem value="customer">Müşteri Adı (A → Z)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" onClick={() => setPaymentFilters({ ...emptyFilters })}>Filtreyi Temizle</Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {paymentSelectMode && (
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedPaymentTransactions.size === paymentTransactions.length && paymentTransactions.length > 0}
                            onCheckedChange={handleSelectAllPaymentTransactions}
                          />
                        </TableHead>
                      )}
                      <TableHead>Tarih</TableHead>
                      <TableHead>Müşteri</TableHead>
                      <TableHead>Personel</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>Ödeme Yöntemi</TableHead>
                      <TableHead>Açıklama</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        {paymentSelectMode && (
                          <TableCell>
                            <Checkbox
                              checked={selectedPaymentTransactions.has(transaction.id)}
                              onCheckedChange={(checked) => handleSelectPaymentTransaction(transaction.id, checked as boolean)}
                            />
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{new Date(transaction.transaction_date).toLocaleDateString('tr-TR')}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(transaction.transaction_date).toLocaleTimeString('tr-TR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {transaction.customer.name}
                        </TableCell>
                        <TableCell>
                          {transaction.personnel?.name || 'Bilinmiyor'}
                        </TableCell>
                        <TableCell className="text-green-600 font-medium">
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell>
                          {transaction.payment_method || '-'}
                        </TableCell>
                        <TableCell>
                          {transaction.description || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePrintReceipt(transaction)}
                              className="flex items-center gap-1"
                            >
                              <FileText className="h-4 w-4" />
                              Yazdır
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTransaction(transaction)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>İşlemi Sil</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Bu ödeme işlemini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>İptal</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteTransaction(transaction.id)}>
                                    Sil
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {paymentTransactions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Henüz ödeme kaydı yok
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>}

          {activeTab === 'debt-history' && <TabsContent value="debt-history" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-red-600" />
                      <span>Borç Geçmişi</span>
                    </CardTitle>
                    <CardDescription>Tüm borç kayıtları</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {debtSelectMode && selectedDebtTransactions.size > 0 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Seçilileri Sil ({selectedDebtTransactions.size})
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Seçili İşlemleri Sil</AlertDialogTitle>
                            <AlertDialogDescription>
                              {selectedDebtTransactions.size} adet borç işlemini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>İptal</AlertDialogCancel>
                            <AlertDialogAction onClick={handleBulkDeleteDebt}>
                              Sil
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleDebtSelectMode}
                    >
                      {debtSelectMode ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Seçimi Bitir
                        </>
                      ) : (
                        'Toplu Seç'
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                  <div className="lg:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      className="pl-10"
                      placeholder="Müşteri, personel veya açıklama ara..."
                      value={debtFilters.search}
                      onChange={(e) => setDebtFilters(f => ({ ...f, search: e.target.value }))}
                    />
                  </div>
                  <Input type="date" value={debtFilters.startDate} onChange={(e) => setDebtFilters(f => ({ ...f, startDate: e.target.value }))} />
                  <Input type="date" value={debtFilters.endDate} onChange={(e) => setDebtFilters(f => ({ ...f, endDate: e.target.value }))} />
                  <Input type="number" placeholder="En az tutar" value={debtFilters.minAmount} onChange={(e) => setDebtFilters(f => ({ ...f, minAmount: e.target.value }))} />
                  <Input type="number" placeholder="En çok tutar" value={debtFilters.maxAmount} onChange={(e) => setDebtFilters(f => ({ ...f, maxAmount: e.target.value }))} />
                  <div className="flex items-center gap-2 lg:col-span-2">
                    <ArrowUpDown className="h-4 w-4 text-gray-500" />
                    <Select value={debtFilters.sortBy} onValueChange={(v) => setDebtFilters(f => ({ ...f, sortBy: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sırala" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date-newest">Tarih (Yeni → Eski)</SelectItem>
                        <SelectItem value="date-oldest">Tarih (Eski → Yeni)</SelectItem>
                        <SelectItem value="amount-high">Tutar (Yüksek → Düşük)</SelectItem>
                        <SelectItem value="amount-low">Tutar (Düşük → Yüksek)</SelectItem>
                        <SelectItem value="customer">Müşteri Adı (A → Z)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" onClick={() => setDebtFilters({ ...emptyFilters })}>Filtreyi Temizle</Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {debtSelectMode && (
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedDebtTransactions.size === debtTransactions.length && debtTransactions.length > 0}
                            onCheckedChange={handleSelectAllDebtTransactions}
                          />
                        </TableHead>
                      )}
                      <TableHead>Tarih</TableHead>
                      <TableHead>Müşteri</TableHead>
                      <TableHead>Personel</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>Açıklama</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {debtTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        {debtSelectMode && (
                          <TableCell>
                            <Checkbox
                              checked={selectedDebtTransactions.has(transaction.id)}
                              onCheckedChange={(checked) => handleSelectDebtTransaction(transaction.id, checked as boolean)}
                            />
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{new Date(transaction.transaction_date).toLocaleDateString('tr-TR')}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(transaction.transaction_date).toLocaleTimeString('tr-TR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {transaction.customer.name}
                        </TableCell>
                        <TableCell>
                          {transaction.personnel?.name || 'Bilinmiyor'}
                        </TableCell>
                        <TableCell className="text-red-600 font-medium">
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell>
                          {transaction.description || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                            {transaction.status === 'completed' ? 'Tamamlandı' : 'Beklemede'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTransaction(transaction)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>İşlemi Sil</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Bu borç işlemini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>İptal</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteTransaction(transaction.id)}>
                                    Sil
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {debtTransactions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Henüz borç kaydı yok
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>}
        </Tabs>
      </div>

      {/* Edit Transaction Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>İşlemi Düzenle</DialogTitle>
            <DialogDescription>
              {editingTransaction?.transaction_type === 'payment' ? 'Ödeme' : 'Borç'} işlemini düzenleyin
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Tutar</Label>
              <Input
                id="edit-amount"
                type="number"
                placeholder="0.00"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
              />
            </div>
            {editingTransaction?.transaction_type === 'payment' && (
              <div className="space-y-2">
                <Label htmlFor="edit-payment-method">Ödeme Yöntemi</Label>
                <Input
                  id="edit-payment-method"
                  type="text"
                  placeholder="Nakit, Kredi Kartı, Havale..."
                  value={editPaymentMethod}
                  onChange={(e) => setEditPaymentMethod(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-description">Açıklama</Label>
              <Input
                id="edit-description"
                type="text"
                placeholder="Açıklama..."
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleUpdateTransaction}>
              Güncelle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
