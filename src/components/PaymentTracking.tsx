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
import { CreditCard, Plus, DollarSign, Filter, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useCustomers } from '@/hooks/useCustomers';
import { useCustomerTransactions } from '@/hooks/useCustomerTransactions';
import { usePersonnel } from '@/hooks/usePersonnel';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDateForInput } from '@/lib/numberUtils';

export const PaymentTracking = () => {
  const { toast } = useToast();
  const { customers } = useCustomers();
  const { personnel } = usePersonnel();
  const { transactions, loading, addPayment, addVeresiye, getCustomerDebts, getTransactionsByDateRange } = useCustomerTransactions();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showDebtDialog, setShowDebtDialog] = useState(false);
  const [filteredTransactions, setFilteredTransactions] = useState(transactions);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  
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
      toast({
        title: "Hata",
        description: "Ödeme kaydedilirken bir hata oluştu: " + (error.message || error),
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
      toast({
        title: "Hata",
        description: "Borç kaydedilirken bir hata oluştu: " + (error.message || error),
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

  const displayTransactions = (startDate || endDate) ? filteredTransactions : transactions;
  const customerDebts = getCustomerDebts();

  if (loading) {
    return <div className="flex justify-center items-center h-64">Yükleniyor...</div>;
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

      {/* Customer Debts Summary */}
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-red-500" />
            <span>Müşteri Borçları</span>
          </CardTitle>
          <CardDescription>Bekleyen veresiye borçları</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customerDebts.map((debt) => (
              <Card key={debt.customerId} className="border border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{debt.customer}</p>
                      <p className="text-sm text-gray-600">Borç</p>
                    </div>
                    <p className="text-lg font-bold text-red-600">
                      {formatCurrency(debt.balance)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {customerDebts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">Bekleyen borç bulunmuyor.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
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
          <CardDescription>Müşteri işlem geçmişi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayTransactions.slice(0, 20).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${transaction.transaction_type === 'payment' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {transaction.transaction_type === 'payment' ? (
                      <CreditCard className="h-4 w-4 text-green-600" />
                    ) : (
                      <DollarSign className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.customer.name}</p>
                    <p className="text-sm text-gray-600">
                      {transaction.transaction_type === 'payment' ? 'Ödeme' : 'Veresiye'} - {transaction.personnel?.name || 'Bilinmeyen Personel'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.transaction_date).toLocaleDateString('tr-TR')} {new Date(transaction.transaction_date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${transaction.transaction_type === 'payment' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.transaction_type === 'payment' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  {transaction.payment_method && (
                    <p className="text-xs text-gray-500 capitalize">
                      {transaction.payment_method.replace('_', ' ')}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {displayTransactions.length === 0 && (
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
