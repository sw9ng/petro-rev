
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, CreditCard, User, Phone, MapPin, Calendar as CalendarIcon, FileText, Trash2, Download, CalendarCheck } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useCustomerTransactions } from '@/hooks/useCustomerTransactions';
import { formatCurrency } from '@/lib/numberUtils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

import { cn } from '@/lib/utils';
import { generateTahsilatMakbuzu, numberToWords } from '@/lib/pdfUtils';
import * as XLSX from 'xlsx';

interface CustomerDetailViewProps {
  customerId: string;
  onBack: () => void;
}

export const CustomerDetailView = ({ customerId, onBack }: CustomerDetailViewProps) => {
  const { customers, loading: customersLoading } = useCustomers();
  const { getCustomerTransactions, getCustomerBalance, deleteTransaction, loading: transactionsLoading } = useCustomerTransactions();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  console.log('CustomerDetailView - customerId:', customerId);
  console.log('CustomerDetailView - customers:', customers);
  console.log('CustomerDetailView - customersLoading:', customersLoading);
  
  const customer = customers.find(c => c.id === customerId);
  console.log('CustomerDetailView - found customer:', customer);
  
  const customerTransactions = getCustomerTransactions(customerId);
  const balance = getCustomerBalance(customerId);

  // Filter transactions based on selected date range
  const filteredTransactions = customerTransactions.filter(transaction => {
    const transactionDate = new Date(transaction.transaction_date);
    
    if (startDate && transactionDate < startDate) {
      return false;
    }
    
    if (endDate && transactionDate > endDate) {
      return false;
    }
    
    return true;
  });

  // Calculate filtered balance
  const filteredBalance = filteredTransactions.reduce((acc, transaction) => {
    if (transaction.transaction_type === 'debt') {
      return acc + transaction.amount;
    } else {
      return acc - transaction.amount;
    }
  }, 0);

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

  const exportToPDF = () => {
    if (!customer) return;
    
    const balanceToExport = startDate || endDate ? filteredBalance : balance;
    const transactionsToExport = startDate || endDate ? filteredTransactions : customerTransactions;
    
    const pdf = generateTahsilatMakbuzu({
      makbuzNo: `MKB-${Date.now()}`,
      tarih: format(new Date(), 'dd/MM/yyyy'),
      musteriAdi: customer.name,
      odemeShekli: 'Genel Rapor',
      aciklama: `${startDate ? format(startDate, 'dd/MM/yyyy') : 'Başlangıç'} - ${endDate ? format(endDate, 'dd/MM/yyyy') : 'Bitiş'} tarih aralığı`,
      tutar: Math.abs(balanceToExport),
      tutarYazisi: numberToWords(Math.abs(balanceToExport)),
      tahsilEden: 'Sistem'
    });
    
    pdf.save(`${customer.name}_${startDate ? format(startDate, 'ddMMyyyy') : 'baslangic'}_${endDate ? format(endDate, 'ddMMyyyy') : 'bitis'}.pdf`);
  };

  const exportToExcel = () => {
    if (!customer) return;
    
    const transactionsToExport = startDate || endDate ? filteredTransactions : customerTransactions;
    
    const data = transactionsToExport.map(transaction => ({
      'Tarih': format(new Date(transaction.transaction_date), 'dd/MM/yyyy HH:mm'),
      'Personel': transaction.personnel?.name || 'Bilinmeyen',
      'İşlem Türü': transaction.transaction_type === 'payment' ? 'Ödeme' : 'Veresiye',
      'Tutar': `${transaction.transaction_type === 'payment' ? '+' : '-'}${formatCurrency(transaction.amount)}`,
      'Ödeme Yöntemi': transaction.payment_method ? getPaymentMethodText(transaction.payment_method) : '-',
      'Açıklama': transaction.description || '-'
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'İşlemler');
    
    const fileName = `${customer.name}_${startDate ? format(startDate, 'ddMMyyyy') : 'baslangic'}_${endDate ? format(endDate, 'ddMMyyyy') : 'bitis'}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const clearDateFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  if (customersLoading || transactionsLoading) {
    return (
      <Card className="shadow-sm border">
        <CardContent className="text-center py-8">
          <p className="text-gray-600">Yükleniyor...</p>
        </CardContent>
      </Card>
    );
  }

  if (!customer) {
    console.error('CustomerDetailView - Customer not found for ID:', customerId);
    console.log('CustomerDetailView - Available customers:', customers.map(c => ({ id: c.id, name: c.name })));
    
    return (
      <Card className="shadow-sm border">
        <CardContent className="text-center py-8">
          <p className="text-gray-600">Müşteri bulunamadı.</p>
          <p className="text-sm text-gray-500 mt-2">
            Aranan ID: {customerId}
          </p>
          <p className="text-sm text-gray-500">
            Toplam müşteri sayısı: {customers.length}
          </p>
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
                <CalendarIcon className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">
                  Kayıt: {format(new Date(customer.created_at), 'dd MMMM yyyy')}
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
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                {startDate || endDate ? 'Seçilen Dönem Bakiyesi' : 'Güncel Bakiye'}
              </h3>
              <p className={`text-3xl font-bold ${getBalanceColor(startDate || endDate ? filteredBalance : balance)}`}>
                {getBalanceText(startDate || endDate ? filteredBalance : balance)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date Filter and Export */}
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarCheck className="h-5 w-5 text-blue-500" />
            <span>Tarih Filtresi ve İndir</span>
          </CardTitle>
          <CardDescription>
            Belirli bir tarih aralığındaki işlemleri filtreleyin ve raporları indirin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Başlangıç:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd/MM/yyyy") : "Seç"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    locale={undefined}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Bitiş:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd/MM/yyyy") : "Seç"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    locale={undefined}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <Button variant="outline" onClick={clearDateFilter} size="sm">
              Filtreyi Temizle
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={exportToPDF} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              PDF İndir
            </Button>
            <Button onClick={exportToExcel} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Excel İndir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-xl">
            <CreditCard className="h-6 w-6 text-green-500" />
            <span>İşlem Geçmişi</span>
            <Badge variant="outline" className="ml-auto">
              {filteredTransactions.length} İşlem
            </Badge>
          </CardTitle>
          <CardDescription>
            {startDate || endDate 
              ? `Filtrelenmiş işlemler (${startDate ? format(startDate, 'dd/MM/yyyy') : 'Başlangıç'} - ${endDate ? format(endDate, 'dd/MM/yyyy') : 'Bitiş'})`
              : 'Tüm işlem geçmişi'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length > 0 ? (
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
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-sm">
                        {format(new Date(transaction.transaction_date), 'dd/MM/yyyy')}
                        <br />
                        <span className="text-xs text-gray-500">
                          {format(new Date(transaction.transaction_date), 'HH:mm')}
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {startDate || endDate ? 'Seçilen tarih aralığında işlem yok' : 'Henüz işlem yok'}
              </h3>
              <p className="text-gray-600">
                {startDate || endDate 
                  ? 'Farklı bir tarih aralığı seçmeyi deneyin.'
                  : 'Bu müşterinin henüz hiçbir işlemi bulunmuyor.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
