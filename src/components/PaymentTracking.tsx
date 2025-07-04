import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Plus, DollarSign, Filter, CalendarIcon, Edit, User, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useCustomers } from '@/hooks/useCustomers';
import { useCustomerTransactions } from '@/hooks/useCustomerTransactions';
import { usePersonnel } from '@/hooks/usePersonnel';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDateForInput } from '@/lib/numberUtils';
import { CustomerListView } from '@/components/CustomerListView';
import { CustomerDetailView } from '@/components/CustomerDetailView';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export const PaymentTracking = () => {
  const { toast } = useToast();
  const { customers } = useCustomers();
  const { personnel } = usePersonnel();
  const { transactions, loading, addPayment, addVeresiye, updateTransaction, getCustomerDebts, getTransactionsByDateRange } = useCustomerTransactions();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showDebtDialog, setShowDebtDialog] = useState(false);
  const [showEditTransactionDialog, setShowEditTransactionDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [filteredTransactions, setFilteredTransactions] = useState(transactions);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [expandedCustomers, setExpandedCustomers] = useState<Record<string, boolean>>({});
  
  const [paymentData, setPaymentData] = useState({
    customer_id: '',
    personnel_id: '',
    amount: 0,
    payment_method: '' as 'nakit' | 'kredi_karti' | 'havale' | '',
    description: '',
    transaction_date: formatDateForInput(new Date())
  });

  const [debtData, setDebtData] = useState({
    customer_id: '',
    personnel_id: '',
    amount: 0,
    description: '',
    transaction_date: formatDateForInput(new Date())
  });

  const [editTransactionData, setEditTransactionData] = useState({
    amount: 0,
    payment_method: '' as 'nakit' | 'kredi_karti' | 'havale' | '',
    description: '',
    transaction_date: ''
  });

  const resetPaymentForm = () => {
    setPaymentData({
      customer_id: '',
      personnel_id: '',
      amount: 0,
      payment_method: '' as any,
      description: '',
      transaction_date: formatDateForInput(new Date())
    });
  };

  const resetDebtForm = () => {
    setDebtData({
      customer_id: '',
      personnel_id: '',
      amount: 0,
      description: '',
      transaction_date: formatDateForInput(new Date())
    });
  };

  const openEditTransactionDialog = (transaction: any) => {
    setSelectedTransaction(transaction);
    setEditTransactionData({
      amount: transaction.amount,
      payment_method: transaction.payment_method || '',
      description: transaction.description || '',
      transaction_date: formatDateForInput(new Date(transaction.transaction_date))
    });
    setShowEditTransactionDialog(true);
  };

  const handleTransactionUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTransaction || editTransactionData.amount <= 0) {
      toast({
        title: "Hata",
        description: "Geçerli bir tutar girin.",
        variant: "destructive"
      });
      return;
    }

    // Create the transaction date in the correct format
    const transactionDate = new Date(editTransactionData.transaction_date);
    transactionDate.setHours(new Date().getHours(), new Date().getMinutes(), new Date().getSeconds());

    const updateData: any = {
      amount: editTransactionData.amount,
      description: editTransactionData.description,
      transaction_date: transactionDate.toISOString()
    };

    // Only add payment_method if transaction is a payment
    if (selectedTransaction.transaction_type === 'payment') {
      updateData.payment_method = editTransactionData.payment_method;
    }

    const { error } = await updateTransaction(selectedTransaction.id, updateData);

    if (error) {
      console.error('Transaction update error:', error);
      toast({
        title: "Hata",
        description: "İşlem güncellenirken bir hata oluştu.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Başarılı",
        description: "İşlem güncellendi.",
      });
      setShowEditTransactionDialog(false);
      setSelectedTransaction(null);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentData.customer_id || !paymentData.personnel_id || !paymentData.payment_method || paymentData.amount <= 0) {
      toast({
        title: "Hata",
        description: "Lütfen tüm zorunlu alanları doldurun.",
        variant: "destructive"
      });
      return;
    }

    // Create the transaction date in the correct format
    const transactionDate = new Date(paymentData.transaction_date);
    transactionDate.setHours(new Date().getHours(), new Date().getMinutes(), new Date().getSeconds());

    const { error } = await addPayment({
      ...paymentData,
      transaction_date: transactionDate.toISOString()
    } as any);

    if (error) {
      console.error('Payment error:', error);
      const errorMessage = typeof error === 'string' ? error : error.message || 'Bilinmeyen hata';
      toast({
        title: "Hata",
        description: "Ödeme kaydedilirken bir hata oluştu: " + errorMessage,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Ödeme Kaydedildi",
        description: "Müşteri ödemesi başarıyla kaydedildi.",
      });
      
      resetPaymentForm();
      setShowPaymentDialog(false);
    }
  };

  const handleDebtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!debtData.customer_id || !debtData.personnel_id || debtData.amount <= 0) {
      toast({
        title: "Hata",
        description: "Lütfen müşteri seçin, personel seçin ve geçerli bir tutar girin.",
        variant: "destructive"
      });
      return;
    }

    // Create the transaction date in the correct format
    const transactionDate = new Date(debtData.transaction_date);
    transactionDate.setHours(new Date().getHours(), new Date().getMinutes(), new Date().getSeconds());

    const { error } = await addVeresiye({
      ...debtData,
      transaction_date: transactionDate.toISOString()
    });

    if (error) {
      console.error('Debt error:', error);
      const errorMessage = typeof error === 'string' ? error : error.message || 'Bilinmeyen hata';
      toast({
        title: "Hata",
        description: "Borç kaydedilirken bir hata oluştu: " + errorMessage,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Borç Kaydedildi",
        description: "Müşteri borcu başarıyla kaydedildi.",
      });
      
      resetDebtForm();
      setShowDebtDialog(false);
    }
  };

  const handleDateFilter = async () => {
    if (!startDate || !endDate) {
      setFilteredTransactions(transactions);
      return;
    }

    const filtered = await getTransactionsByDateRange(
      startDate.toISOString(),
      endDate.toISOString()
    );
    setFilteredTransactions(filtered);
  };

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setFilteredTransactions(transactions);
  };

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setSelectedCustomerId(null);
    setViewMode('list');
  };

  const toggleCustomerExpansion = (customerId: string) => {
    setExpandedCustomers(prev => ({
      ...prev,
      [customerId]: !prev[customerId]
    }));
  };

  const displayTransactions = (startDate || endDate) ? filteredTransactions : transactions;
  const customerDebts = getCustomerDebts();

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'nakit': return 'Nakit';
      case 'kredi_karti': return 'Kredi Kartı';
      case 'havale': return 'Havale';
      default: return method;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Yükleniyor...</div>;
  }

  if (viewMode === 'detail' && selectedCustomerId) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Cari Satış</h2>
          <p className="text-sm lg:text-base text-gray-600">Müşteri ödemelerini ve borçlarını takip edin</p>
        </div>
        <CustomerDetailView customerId={selectedCustomerId} onBack={handleBackToList} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Cari Satış</h2>
        <p className="text-sm lg:text-base text-gray-600">Müşteri ödemelerini ve borçlarını takip edin</p>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP", { locale: tr }) : "Başlangıç tarihi"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  locale={tr}
                />
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP", { locale: tr }) : "Bitiş tarihi"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  locale={tr}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={handleDateFilter} variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtrele
            </Button>
            {(startDate || endDate) && (
              <Button onClick={clearFilters} variant="outline">
                Temizle
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={showDebtDialog} onOpenChange={(open) => {
            setShowDebtDialog(open);
            if (!open) resetDebtForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4 mr-2" />
                Borç Kaydet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Borç Kaydet</DialogTitle>
                <DialogDescription>
                  Müşteri borç bilgilerini girin.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleDebtSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Müşteri *</Label>
                  <Select value={debtData.customer_id} onValueChange={(value) => setDebtData(prev => ({ ...prev, customer_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Müşteri seçin" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg">
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Personel *</Label>
                  <Select value={debtData.personnel_id} onValueChange={(value) => setDebtData(prev => ({ ...prev, personnel_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Personel seçin" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg">
                      {personnel.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tarih *</Label>
                  <Input
                    type="date"
                    value={debtData.transaction_date}
                    onChange={(e) => setDebtData(prev => ({ ...prev, transaction_date: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tutar (₺) *</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={debtData.amount}
                    onChange={(e) => setDebtData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="Borç tutarı"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Açıklama</Label>
                  <Textarea
                    value={debtData.description}
                    onChange={(e) => setDebtData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Borç açıklaması..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowDebtDialog(false)}>
                    İptal
                  </Button>
                  <Button type="submit" className="bg-red-600 hover:bg-red-700">
                    Borç Kaydet
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showPaymentDialog} onOpenChange={(open) => {
            setShowPaymentDialog(open);
            if (!open) resetPaymentForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Ödeme Kaydet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Ödeme Kaydet</DialogTitle>
                <DialogDescription>
                  Müşteri ödemesi bilgilerini girin.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Müşteri *</Label>
                  <Select value={paymentData.customer_id} onValueChange={(value) => setPaymentData(prev => ({ ...prev, customer_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Müşteri seçin" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg">
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Personel *</Label>
                  <Select value={paymentData.personnel_id} onValueChange={(value) => setPaymentData(prev => ({ ...prev, personnel_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Personel seçin" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg">
                      {personnel.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tarih *</Label>
                  <Input
                    type="date"
                    value={paymentData.transaction_date}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, transaction_date: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tutar (₺) *</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="Ödeme tutarı"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ödeme Yöntemi *</Label>
                  <Select value={paymentData.payment_method} onValueChange={(value: any) => setPaymentData(prev => ({ ...prev, payment_method: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ödeme yöntemi seçin" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg">
                      <SelectItem value="nakit">Nakit</SelectItem>
                      <SelectItem value="kredi_karti">Kredi Kartı</SelectItem>
                      <SelectItem value="havale">Havale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Açıklama</Label>
                  <Textarea
                    value={paymentData.description}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="İşlem referansı veya açıklama..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowPaymentDialog(false)}>
                    İptal
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    Ödemeyi Kaydet
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Customer List with Debt Information */}
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-500" />
            <span>Müşteri Borç Durumu</span>
          </CardTitle>
          <CardDescription>Müşterilerin mevcut borç durumları</CardDescription>
        </CardHeader>
        <CardContent>
          {customerDebts.length > 0 ? (
            <div className="space-y-4">
              {customerDebts.map((debt) => (
                <Collapsible
                  key={debt.customerId}
                  open={expandedCustomers[debt.customerId]}
                  onOpenChange={() => toggleCustomerExpansion(debt.customerId)}
                >
                  <div className="border rounded-lg bg-white">
                    <CollapsibleTrigger className="w-full">
                      <div className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-red-600" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-900">{debt.customer}</p>
                            <p className="text-sm text-gray-600">Müşteri borcu</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="text-lg font-bold text-red-600">
                              {formatCurrency(debt.balance)}
                            </p>
                            <p className="text-sm text-gray-500">Toplam Borç</p>
                          </div>
                          {expandedCustomers[debt.customerId] ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="border-t bg-gray-50 p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Borç Detayları</h4>
                        <div className="text-sm text-gray-600">
                          <p>Müşteri: {debt.customer}</p>
                          <p>Toplam Borç: {formatCurrency(debt.balance)}</p>
                          <p>Detaylı işlem geçmişi için müşteri detay sayfasını ziyaret edin.</p>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Henüz borcu olan müşteri bulunmuyor</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions Table */}
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-green-500" />
            <span>İşlem Geçmişi</span>
            {(startDate || endDate) && (
              <span className="text-sm text-gray-500">
                ({startDate && format(startDate, 'dd/MM/yyyy', { locale: tr })} - {endDate && format(endDate, 'dd/MM/yyyy', { locale: tr })})
              </span>
            )}
          </CardTitle>
          <CardDescription>Müşteri işlem geçmişi (Son 50 işlem)</CardDescription>
        </CardHeader>
        <CardContent>
          {displayTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Müşteri</TableHead>
                    <TableHead>Personel</TableHead>
                    <TableHead>İşlem Türü</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Ödeme Yöntemi</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayTransactions.slice(0, 50).map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-sm">
                        {new Date(transaction.transaction_date).toLocaleDateString('tr-TR')}
                        <br />
                        <span className="text-xs text-gray-500">
                          {new Date(transaction.transaction_date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{transaction.customer.name}</TableCell>
                      <TableCell>{transaction.personnel?.name || 'Bilinmeyen'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.transaction_type === 'payment' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.transaction_type === 'payment' ? 'Ödeme' : 'Veresiye'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${
                          transaction.transaction_type === 'payment' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.transaction_type === 'payment' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {transaction.payment_method ? (
                          <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {getPaymentMethodText(transaction.payment_method)}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {transaction.description ? (
                          <span className="text-sm text-gray-600 truncate block" title={transaction.description}>
                            {transaction.description}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditTransactionDialog(transaction)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {(startDate || endDate) ? 'Bu tarih aralığında işlem yok' : 'Henüz işlem yok'}
              </h3>
              <p className="text-gray-600">
                {(startDate || endDate) ? 'Seçilen tarih aralığında herhangi bir işlem bulunamadı' : 'İlk işlem kaydını ekleyin'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Transaction Dialog */}
      <Dialog open={showEditTransactionDialog} onOpenChange={(open) => {
        setShowEditTransactionDialog(open);
        if (!open) {
          setSelectedTransaction(null);
          setEditTransactionData({ amount: 0, payment_method: '', description: '', transaction_date: '' });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="h-5 w-5" />
              <span>İşlem Düzenle</span>
            </DialogTitle>
            <DialogDescription>
              İşlem bilgilerini güncelleyin.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTransactionUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label>Tarih *</Label>
              <Input
                type="date"
                value={editTransactionData.transaction_date}
                onChange={(e) => setEditTransactionData(prev => ({ ...prev, transaction_date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Tutar (₺) *</Label>
              <Input
                type="number"
                step="0.001"
                value={editTransactionData.amount}
                onChange={(e) => setEditTransactionData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                placeholder="Tutar"
                required
              />
            </div>
            {selectedTransaction?.transaction_type === 'payment' && (
              <div className="space-y-2">
                <Label>Ödeme Yöntemi</Label>
                <Select value={editTransactionData.payment_method} onValueChange={(value: any) => setEditTransactionData(prev => ({ ...prev, payment_method: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ödeme yöntemi seçin" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg">
                    <SelectItem value="nakit">Nakit</SelectItem>
                    <SelectItem value="kredi_karti">Kredi Kartı</SelectItem>
                    <SelectItem value="havale">Havale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Açıklama</Label>
              <Textarea
                value={editTransactionData.description}
                onChange={(e) => setEditTransactionData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="İşlem açıklaması..."
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowEditTransactionDialog(false)}>
                İptal
              </Button>
              <Button type="submit">
                Güncelle
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
