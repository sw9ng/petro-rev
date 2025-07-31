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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useCustomers } from '@/hooks/useCustomers';
import { useCustomerTransactions } from '@/hooks/useCustomerTransactions';
import { usePersonnel } from '@/hooks/usePersonnel';
import { formatCurrency } from '@/lib/numberUtils';
import { generateTahsilatMakbuzu, numberToWords } from '@/lib/pdfUtils';
import { Plus, Search, CreditCard, ArrowUpDown, Calendar, Users, TrendingUp, TrendingDown, Edit, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';

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

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [editPaymentMethod, setEditPaymentMethod] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');

  const navigate = useNavigate();

  const handleCustomerClick = (customerId: string) => {
    console.log('Navigating to customer:', customerId);
    if (customerId) {
      navigate(`/customer/${customerId}`);
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

  const handleAddPayment = async () => {
    if (!selectedCustomer || !selectedPersonnel || !amount) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

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
      
      // Force refresh the transactions immediately
      await refreshTransactions();
    }
  };

  const handleAddVeresiye = async () => {
    if (!selectedCustomer || !selectedPersonnel || !amount) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

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
      
      // Force refresh the transactions immediately
      await refreshTransactions();
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

  // Separate transactions by type for history
  const paymentTransactions = transactions.filter(t => t.transaction_type === 'payment');
  const debtTransactions = transactions.filter(t => t.transaction_type === 'debt');

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

          <TabsContent value="overview" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Müşteri ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
              {filteredAndSortedTransactions.map((group) => (
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
            </div>
          </TabsContent>

          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ödeme Al</CardTitle>
                <CardDescription>Müşteri ödemesi kaydet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Müşteri</Label>
                    <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                      <SelectTrigger>
                        <SelectValue placeholder="Müşteri seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Personel</Label>
                    <Select value={selectedPersonnel} onValueChange={setSelectedPersonnel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Personel seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {personnel.map((person) => (
                          <SelectItem key={person.id} value={person.id}>
                            {person.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

                <Button onClick={handleAddPayment} className="w-full">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Ödeme Kaydet
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="debt" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Borç Kaydet</CardTitle>
                <CardDescription>Müşteri borcu kaydet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Müşteri</Label>
                    <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                      <SelectTrigger>
                        <SelectValue placeholder="Müşteri seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Personel</Label>
                    <Select value={selectedPersonnel} onValueChange={setSelectedPersonnel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Personel seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {personnel.map((person) => (
                          <SelectItem key={person.id} value={person.id}>
                            {person.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

                <Button onClick={handleAddVeresiye} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Borç Kaydet
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment-history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <span>Ödeme Geçmişi</span>
                </CardTitle>
                <CardDescription>Tüm ödeme işlemleri</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
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
          </TabsContent>

          <TabsContent value="debt-history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-red-600" />
                  <span>Borç Geçmişi</span>
                </CardTitle>
                <CardDescription>Tüm borç kayıtları</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
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
          </TabsContent>
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
