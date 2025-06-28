
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreditCard, Plus, DollarSign, Calendar, Filter } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useCustomerTransactions } from '@/hooks/useCustomerTransactions';
import { useShifts } from '@/hooks/useShifts';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/numberUtils';

export const PaymentTracking = () => {
  const { toast } = useToast();
  const { customers } = useCustomers();
  const { allShifts, getShiftDisplayName } = useShifts();
  const { transactions, loading, addPayment, addVeresiye, getCustomerDebts, getTransactionsByDateRange } = useCustomerTransactions();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showDebtDialog, setShowDebtDialog] = useState(false);
  const [filteredTransactions, setFilteredTransactions] = useState(transactions);
  const [selectedDate, setSelectedDate] = useState('');
  
  const [paymentData, setPaymentData] = useState({
    customer_id: '',
    shift_id: '',
    amount: 0,
    payment_method: '' as 'nakit' | 'kredi_karti' | 'havale' | '',
    description: ''
  });

  const [debtData, setDebtData] = useState({
    customer_id: '',
    shift_id: '',
    amount: 0,
    description: ''
  });

  const resetPaymentForm = () => {
    setPaymentData({
      customer_id: '',
      shift_id: '',
      amount: 0,
      payment_method: '' as any,
      description: ''
    });
  };

  const resetDebtForm = () => {
    setDebtData({
      customer_id: '',
      shift_id: '',
      amount: 0,
      description: ''
    });
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentData.customer_id || !paymentData.payment_method || paymentData.amount <= 0) {
      toast({
        title: "Hata",
        description: "Lütfen tüm zorunlu alanları doldurun.",
        variant: "destructive"
      });
      return;
    }

    const selectedShift = allShifts.find(shift => shift.id === paymentData.shift_id);
    const personnelId = selectedShift?.personnel_id || '';

    if (!personnelId) {
      toast({
        title: "Hata",
        description: "Seçilen vardiya için personel bilgisi bulunamadı.",
        variant: "destructive"
      });
      return;
    }

    const { error } = await addPayment({
      ...paymentData,
      personnel_id: personnelId,
      shift_id: paymentData.shift_id || undefined
    } as any);

    if (error) {
      toast({
        title: "Hata",
        description: "Ödeme kaydedilirken bir hata oluştu.",
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
    
    if (!debtData.customer_id || debtData.amount <= 0) {
      toast({
        title: "Hata",
        description: "Lütfen müşteri seçin ve geçerli bir tutar girin.",
        variant: "destructive"
      });
      return;
    }

    const selectedShift = allShifts.find(shift => shift.id === debtData.shift_id);
    const personnelId = selectedShift?.personnel_id || '';

    if (!personnelId) {
      toast({
        title: "Hata",
        description: "Seçilen vardiya için personel bilgisi bulunamadı.",
        variant: "destructive"
      });
      return;
    }

    const { error } = await addVeresiye({
      ...debtData,
      personnel_id: personnelId,
      shift_id: debtData.shift_id || undefined
    });

    if (error) {
      toast({
        title: "Hata",
        description: "Borç kaydedilirken bir hata oluştu.",
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
    if (!selectedDate) {
      setFilteredTransactions(transactions);
      return;
    }

    const startDate = selectedDate;
    const endDate = selectedDate + 'T23:59:59';
    
    const filtered = await getTransactionsByDateRange(startDate, endDate);
    setFilteredTransactions(filtered);
  };

  const displayTransactions = selectedDate ? filteredTransactions : transactions;
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

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
          <Button onClick={handleDateFilter} variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtrele
          </Button>
          {selectedDate && (
            <Button onClick={() => {
              setSelectedDate('');
              setFilteredTransactions(transactions);
            }} variant="outline">
              Temizle
            </Button>
          )}
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
                  <Label>İlgili Vardiya</Label>
                  <Select value={debtData.shift_id} onValueChange={(value) => setDebtData(prev => ({ ...prev, shift_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vardiya seçin (opsiyonel)" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg">
                      {allShifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id}>
                          {getShiftDisplayName(shift)} - {shift.personnel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Label>İlgili Vardiya</Label>
                  <Select value={paymentData.shift_id} onValueChange={(value) => setPaymentData(prev => ({ ...prev, shift_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vardiya seçin (opsiyonel)" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg">
                      {allShifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id}>
                          {getShiftDisplayName(shift)} - {shift.personnel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
            {selectedDate && (
              <span className="text-sm text-gray-500">({new Date(selectedDate).toLocaleDateString('tr-TR')})</span>
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
                      {transaction.transaction_type === 'payment' ? 'Ödeme' : 'Veresiye'} - {transaction.personnel.name}
                    </p>
                    {transaction.shift && (
                      <p className="text-xs text-gray-500">
                        Vardiya: {getShiftDisplayName(transaction.shift as any)}
                      </p>
                    )}
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
                  {selectedDate ? 'Bu tarihte işlem yok' : 'Henüz işlem yok'}
                </h3>
                <p className="text-gray-600">
                  {selectedDate ? 'Seçilen tarihte herhangi bir işlem bulunamadı' : 'İlk işlem kaydını ekleyin'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
