
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, CreditCard, User, Phone, MapPin, Calendar, FileText, Trash2 } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useCustomerTransactions } from '@/hooks/useCustomerTransactions';
import { formatCurrency } from '@/lib/numberUtils';
import { useToast } from '@/hooks/use-toast';

interface CustomerDetailViewProps {
  customerId: string;
  onBack: () => void;
}

export const CustomerDetailView = ({ customerId, onBack }: CustomerDetailViewProps) => {
  const { customers } = useCustomers();
  const { transactions, getCustomerTransactions, getCustomerBalance, deleteTransaction } = useCustomerTransactions();
  const { toast } = useToast();
  
  const customer = customers.find(c => c.id === customerId);
  const customerTransactions = getCustomerTransactions(customerId);
  const balance = getCustomerBalance(customerId);

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-red-600';
    if (balance < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  const getBalanceText = (balance: number) => {
    if (balance > 0) return `Borç: ${formatCurrency(balance)}`;
    if (balance < 0) return `Alacak: ${formatCurrency(Math.abs(balance))}`;
    return 'Bakiye: ₺0,00';
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'nakit': return 'Nakit';
      case 'kredi_karti': return 'Kredi Kartı';
      case 'havale': return 'Havale';
      default: return method;
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    const { error } = await deleteTransaction(transactionId);
    
    if (error) {
      toast({
        title: "Hata",
        description: "İşlem silinirken bir hata oluştu.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Başarılı",
        description: "İşlem başarıyla silindi.",
      });
    }
  };

  if (!customer) {
    return (
      <Card className="shadow-sm border">
        <CardContent className="text-center py-8">
          <p className="text-gray-600">Müşteri bulunamadı.</p>
          <Button onClick={onBack} className="mt-4">
            Geri Dön
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Geri</span>
        </Button>
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Müşteri Detayı</h2>
      </div>

      {/* Customer Info */}
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-500" />
            <span>{customer.name}</span>
          </CardTitle>
          <CardDescription>Müşteri bilgileri ve bakiye durumu</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">{customer.phone || 'Telefon bilgisi yok'}</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                <span className="text-gray-900">{customer.address || 'Adres bilgisi yok'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">
                  Kayıt: {new Date(customer.created_at).toLocaleDateString('tr-TR')}
                </span>
              </div>
              {customer.notes && (
                <div className="flex items-start space-x-3">
                  <FileText className="h-4 w-4 text-gray-400 mt-1" />
                  <span className="text-gray-900">{customer.notes}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-600 mb-2">Güncel Bakiye</h3>
              <p className={`text-3xl font-bold ${getBalanceColor(balance)}`}>
                {getBalanceText(balance)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-green-500" />
            <span>İşlem Geçmişi</span>
          </CardTitle>
          <CardDescription>Müşterinin tüm işlem geçmişi</CardDescription>
        </CardHeader>
        <CardContent>
          {customerTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Personel</TableHead>
                    <TableHead>İşlem Türü</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Ödeme Yöntemi</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-sm">
                        {new Date(transaction.transaction_date).toLocaleDateString('tr-TR')}
                        <br />
                        <span className="text-xs text-gray-500">
                          {new Date(transaction.transaction_date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </TableCell>
                      <TableCell>{transaction.personnel?.name || 'Bilinmeyen'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${
                          transaction.transaction_type === 'payment' 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'bg-red-100 text-red-800 border-red-200'
                        }`}>
                          {transaction.transaction_type === 'payment' ? 'Ödeme' : 'Veresiye'}
                        </Badge>
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
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                            {getPaymentMethodText(transaction.payment_method)}
                          </Badge>
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
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz işlem yok</h3>
              <p className="text-gray-600">Bu müşterinin henüz hiçbir işlemi bulunmuyor.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
