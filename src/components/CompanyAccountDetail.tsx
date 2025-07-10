
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, User, Phone, MapPin, Calendar, FileText, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import { formatCurrency } from '@/lib/numberUtils';

interface CompanyAccountDetailProps {
  accountId: string;
  companyId: string;
  onBack: () => void;
}

export const CompanyAccountDetail = ({ accountId, companyId, onBack }: CompanyAccountDetailProps) => {
  const { accounts, incomeInvoices, expenseInvoices, loading } = useInvoices(companyId);
  
  const account = accounts.find(a => a.id === accountId);
  const accountIncomes = incomeInvoices.filter(inv => inv.account_id === accountId);
  const accountExpenses = expenseInvoices.filter(inv => inv.account_id === accountId);
  
  // Bakiye hesaplama
  const totalIncome = accountIncomes.reduce((sum, inv) => sum + inv.amount, 0);
  const totalExpense = accountExpenses.reduce((sum, inv) => sum + inv.amount, 0);
  const balance = totalIncome - totalExpense;
  
  // Son işlemler (gelir ve gider karışık)
  const allTransactions = [
    ...accountIncomes.map(inv => ({ ...inv, type: 'income' })),
    ...accountExpenses.map(inv => ({ ...inv, type: 'expense' }))
  ].sort((a, b) => new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime());

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getBalanceText = (balance: number) => {
    if (balance > 0) return `Bakiye: +${formatCurrency(balance)}`;
    if (balance < 0) return `Bakiye: ${formatCurrency(balance)}`;
    return 'Bakiye: ₺0,00';
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Ödendi</Badge>;
      case 'unpaid':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Ödenmedi</Badge>;
      case 'partial':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Kısmi</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="shadow-sm border">
        <CardContent className="text-center py-8">
          <p className="text-gray-600">Yükleniyor...</p>
        </CardContent>
      </Card>
    );
  }

  if (!account) {
    return (
      <Card className="shadow-sm border">
        <CardContent className="text-center py-8">
          <p className="text-gray-600">Cari hesap bulunamadı.</p>
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
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Cari Hesap Detayı</h2>
      </div>

      {/* Account Info */}
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-500" />
            <span>{account.name}</span>
          </CardTitle>
          <CardDescription>Cari hesap bilgileri ve bakiye durumu</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">{account.phone || 'Telefon bilgisi yok'}</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                <span className="text-gray-900">{account.address || 'Adres bilgisi yok'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">
                  Kayıt: {new Date(account.created_at).toLocaleDateString('tr-TR')}
                </span>
              </div>
              {account.notes && (
                <div className="flex items-start space-x-3">
                  <FileText className="h-4 w-4 text-gray-400 mt-1" />
                  <span className="text-gray-900">{account.notes}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-600 mb-2">Güncel Bakiye</h3>
              <p className={`text-3xl font-bold ${getBalanceColor(balance)}`}>
                {getBalanceText(balance)}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-500">Toplam Gelir</p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Toplam Gider</p>
                  <p className="text-lg font-semibold text-red-600">
                    {formatCurrency(totalExpense)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Gelir Faturası</p>
                <p className="text-2xl font-bold">{accountIncomes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Gider Faturası</p>
                <p className="text-2xl font-bold">{accountExpenses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam İşlem</p>
                <p className="text-2xl font-bold">{allTransactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-green-500" />
            <span>İşlem Geçmişi</span>
          </CardTitle>
          <CardDescription>Cari hesabın tüm işlem geçmişi</CardDescription>
        </CardHeader>
        <CardContent>
          {allTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Fatura No</TableHead>
                    <TableHead>İşlem Türü</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Ödeme Tarihi</TableHead>
                    <TableHead>Açıklama</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allTransactions.map((transaction) => (
                    <TableRow key={`${transaction.type}-${transaction.id}`}>
                      <TableCell className="text-sm">
                        {new Date(transaction.invoice_date).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell>{transaction.invoice_number || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${
                          transaction.type === 'income' 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'bg-red-100 text-red-800 border-red-200'
                        }`}>
                          {transaction.type === 'income' ? 'Gelir' : 'Gider'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(transaction.payment_status)}
                      </TableCell>
                      <TableCell>
                        {transaction.payment_date ? 
                          new Date(transaction.payment_date).toLocaleDateString('tr-TR') : '-'
                        }
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz işlem yok</h3>
              <p className="text-gray-600">Bu cari hesabın henüz hiçbir işlemi bulunmuyor.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
