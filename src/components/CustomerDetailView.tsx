
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, User, Phone, MapPin, FileText, Calendar, DollarSign } from 'lucide-react';
import { useCustomerTransactions } from '@/hooks/useCustomerTransactions';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface CustomerDetailViewProps {
  customer: any;
  onBack: () => void;
}

export const CustomerDetailView = ({ customer, onBack }: CustomerDetailViewProps) => {
  const { transactions } = useCustomerTransactions(customer.id);
  const [dateFilter, setDateFilter] = useState('');

  const filteredTransactions = dateFilter
    ? transactions.filter(t => t.transaction_date.includes(dateFilter))
    : transactions;

  const totalDebt = filteredTransactions
    .filter(t => t.transaction_type === 'debt')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalPayment = filteredTransactions
    .filter(t => t.transaction_type === 'payment')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netDebt = totalDebt - totalPayment;

  const debtTransactions = filteredTransactions.filter(t => t.transaction_type === 'debt');
  const paymentTransactions = filteredTransactions.filter(t => t.transaction_type === 'payment');

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri Dön
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Müşteri Detayları</h2>
          <p className="text-gray-600">Müşteri bilgileri ve işlem geçmişi</p>
        </div>
      </div>

      {/* Müşteri Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            {customer.name}
          </CardTitle>
          <CardDescription>Müşteri bilgileri ve iletişim</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{customer.phone || 'Telefon belirtilmemiş'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{customer.address || 'Adres belirtilmemiş'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>Kayıt: {format(new Date(customer.created_at), 'dd MMM yyyy', { locale: tr })}</span>
            </div>
          </div>
          {customer.notes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Notlar:</h4>
              <p className="text-sm text-gray-700">{customer.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Finansal Özet */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-red-50 to-rose-50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Toplam Borç</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">₺{totalDebt.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Toplam Ödeme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">₺{totalPayment.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Net Borç</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netDebt > 0 ? 'text-red-800' : 'text-green-800'}`}>
              ₺{netDebt.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Toplam İşlem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{filteredTransactions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tarih Filtresi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Calendar className="h-5 w-5 mr-2" />
            Tarih Filtresi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <input
              type="month"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border rounded-md w-48"
            />
            <Button variant="outline" onClick={() => setDateFilter('')}>
              Filtreyi Temizle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* İşlem Geçmişi */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Tüm İşlemler</TabsTrigger>
          <TabsTrigger value="debt">Borç Kayıtları</TabsTrigger>
          <TabsTrigger value="payment">Ödemeler</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Tüm İşlemler</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Tür</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(new Date(transaction.transaction_date), 'dd MMM yyyy HH:mm', { locale: tr })}
                      </TableCell>
                      <TableCell>{transaction.description || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.transaction_type === 'debt' ? 'destructive' : 'default'}>
                          {transaction.transaction_type === 'debt' ? 'Borç' : 'Ödeme'}
                        </Badge>
                      </TableCell>
                      <TableCell className={`font-medium ${
                        transaction.transaction_type === 'debt' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.transaction_type === 'debt' ? '+' : '-'}₺{Number(transaction.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                          {transaction.status === 'completed' ? 'Tamamlandı' : 'Beklemede'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debt">
          <Card>
            <CardHeader>
              <CardTitle>Borç Kayıtları</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {debtTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(new Date(transaction.transaction_date), 'dd MMM yyyy HH:mm', { locale: tr })}
                      </TableCell>
                      <TableCell>{transaction.description || '-'}</TableCell>
                      <TableCell className="font-medium text-red-600">
                        +₺{Number(transaction.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                          {transaction.status === 'completed' ? 'Tamamlandı' : 'Beklemede'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Ödemeler</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Ödeme Yöntemi</TableHead>
                    <TableHead>Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(new Date(transaction.transaction_date), 'dd MMM yyyy HH:mm', { locale: tr })}
                      </TableCell>
                      <TableCell>{transaction.description || '-'}</TableCell>
                      <TableCell className="font-medium text-green-600">
                        -₺{Number(transaction.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>{transaction.payment_method || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                          {transaction.status === 'completed' ? 'Tamamlandı' : 'Beklemede'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
