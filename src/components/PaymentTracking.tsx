
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreditCard, Plus, Calendar, User, DollarSign } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useCustomerTransactions } from '@/hooks/useCustomerTransactions';
import { usePersonnel } from '@/hooks/usePersonnel';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/numberUtils';

export const PaymentTracking = () => {
  const { toast } = useToast();
  const { customers } = useCustomers();
  const { personnel } = usePersonnel();
  const { transactions, loading, addPayment, getCustomerDebts } = useCustomerTransactions();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  const [paymentData, setPaymentData] = useState({
    customer_id: '',
    personnel_id: '',
    amount: 0,
    payment_method: '' as 'nakit' | 'kredi_karti' | 'havale' | '',
    description: ''
  });

  const resetForm = () => {
    setPaymentData({
      customer_id: '',
      personnel_id: '',
      amount: 0,
      payment_method: '' as any,
      description: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentData.customer_id || !paymentData.personnel_id || !paymentData.payment_method || paymentData.amount <= 0) {
      toast({
        title: "Hata",
        description: "Lütfen tüm zorunlu alanları doldurun.",
        variant: "destructive"
      });
      return;
    }

    const { error } = await addPayment(paymentData as any);

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
      
      resetForm();
      setShowPaymentDialog(false);
    }
  };

  const customerDebts = getCustomerDebts();

  if (loading) {
    return <div className="flex justify-center items-center h-64">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Tahsilat Modülü</h2>
        <p className="text-sm lg:text-base text-gray-600">Müşteri ödemelerini takip edin</p>
      </div>

      <div className="flex justify-end">
        <Dialog open={showPaymentDialog} onOpenChange={(open) => {
          setShowPaymentDialog(open);
          if (!open) resetForm();
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
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label>Tahsil Eden Personel *</Label>
                <Select value={paymentData.personnel_id} onValueChange={(value) => setPaymentData(prev => ({ ...prev, personnel_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Personel seçin" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg">
                    {personnel.map((person) => (
                      <SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>
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
            <span>Son İşlemler</span>
          </CardTitle>
          <CardDescription>Müşteri işlem geçmişi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${transaction.transaction_type === 'payment' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {transaction.transaction_type === 'payment' ? (
                      <CreditCard className={`h-4 w-4 ${transaction.transaction_type === 'payment' ? 'text-green-600' : 'text-red-600'}`} />
                    ) : (
                      <DollarSign className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.customer.name}</p>
                    <p className="text-sm text-gray-600">
                      {transaction.transaction_type === 'payment' ? 'Ödeme' : 'Veresiye'} - {transaction.personnel.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.transaction_date).toLocaleDateString('tr-TR')} {new Date(transaction.transaction_date).toLocaleTimeString('tr-TR')}
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
            {transactions.length === 0 && (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz işlem yok</h3>
                <p className="text-gray-600">İlk ödeme kaydını ekleyin</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
