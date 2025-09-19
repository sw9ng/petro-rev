
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CreditCard, User, Phone, MapPin, Calendar as CalendarIcon, FileText, Trash2, Download, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/numberUtils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { generateIslemGecmisiRaporu } from '@/lib/pdfUtils';
import * as XLSX from 'xlsx';
import { EditTransactionDialog } from './EditTransactionDialog';

interface CompanyAccountDetailViewProps {
  accountId: string;
  companyId: string;
  onBack: () => void;
}

export const CompanyAccountDetailView = ({ accountId, companyId, onBack }: CompanyAccountDetailViewProps) => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [amountFilter, setAmountFilter] = useState<string>('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>('all');

  // Cari bilgilerini getir
  const { data: account } = useQuery({
    queryKey: ['company-account', accountId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_accounts')
        .select('*')
        .eq('id', accountId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Gelir faturalarını getir
  const { data: incomeInvoices = [], refetch: refetchIncomeInvoices } = useQuery({
    queryKey: ['income-invoices', companyId, accountId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('income_invoices')
        .select('*')
        .eq('company_id', companyId)
        .eq('account_id', accountId)
        .order('invoice_date', { ascending: false });
      
      if (error) throw error;
      return data.map(invoice => ({
        ...invoice,
        transaction_type: 'income' as const,
        transaction_date: invoice.invoice_date
      }));
    },
  });

  // Gider faturalarını getir
  const { data: expenseInvoices = [], refetch: refetchExpenseInvoices } = useQuery({
    queryKey: ['expense-invoices', companyId, accountId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_invoices')
        .select('*')
        .eq('company_id', companyId)
        .eq('account_id', accountId)
        .order('invoice_date', { ascending: false });
      
      if (error) throw error;
      return data.map(invoice => ({
        ...invoice,
        transaction_type: 'expense' as const,
        transaction_date: invoice.invoice_date
      }));
    },
  });

  // Tüm işlemleri birleştir
  const allTransactions = [...incomeInvoices, ...expenseInvoices].sort((a, b) => 
    new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
  );

  // Filtrelenmiş işlemler
  const filteredTransactions = allTransactions.filter(transaction => {
    const transactionDate = new Date(transaction.transaction_date);
    
    // Tarih aralığı filtresi
    if (startDate && transactionDate < startDate) return false;
    if (endDate && transactionDate > endDate) return false;
    
    // Tutar filtresi
    if (amountFilter && !transaction.amount.toString().includes(amountFilter)) return false;
    
    // İşlem türü filtresi
    if (transactionTypeFilter !== 'all' && transaction.transaction_type !== transactionTypeFilter) return false;
    
    return true;
  });

  // Bakiye hesaplama
  const totalIncome = filteredTransactions
    .filter(t => t.transaction_type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = filteredTransactions
    .filter(t => t.transaction_type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpense;

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getBalanceText = (balance: number) => {
    if (balance > 0) return `Alacak: ${formatCurrency(balance)}`;
    if (balance < 0) return `Borç: ${formatCurrency(Math.abs(balance))}`;
    return 'Bakiye: ₺0,00';
  };

  const clearAllFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setAmountFilter('');
    setTransactionTypeFilter('all');
  };

  const exportToPDF = () => {
    if (!account) return;
    
    const transactionsToExport = filteredTransactions;
    
    // İşlemleri düzenle
    const islemler = transactionsToExport.map(transaction => ({
      tarih: format(new Date(transaction.transaction_date), 'dd/MM/yyyy'),
      saat: format(new Date(transaction.transaction_date), 'HH:mm'),
      personel: transaction.transaction_type === 'income' ? 'Gelir' : 'Gider',
      islemTuru: transaction.transaction_type === 'income' ? 'Gelir Faturası' : 'Gider Faturası',
      tutar: transaction.amount,
      odemeYontemi: transaction.payment_status === 'paid' ? 'Ödendi' : 'Ödenmedi',
      aciklama: transaction.description || ''
    }));

    // Toplam hesaplamalar
    const toplamGelir = transactionsToExport
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const toplamGider = transactionsToExport
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const data = {
      musteriAdi: account.name,
      baslangicTarihi: startDate ? format(startDate, 'dd/MM/yyyy') : undefined,
      bitisTarihi: endDate ? format(endDate, 'dd/MM/yyyy') : undefined,
      islemler,
      toplamBorc: toplamGider,
      toplamOdeme: toplamGelir,
      bakiye: balance
    };

    const pdf = generateIslemGecmisiRaporu(data);
    pdf.save(`${account.name}_${startDate ? format(startDate, 'ddMMyyyy') : 'baslangic'}_${endDate ? format(endDate, 'ddMMyyyy') : 'bitis'}.pdf`);
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'Nakit';
      case 'card': return 'Kart';
      case 'transfer': return 'Havale';
      case 'check': return 'Çek';
      default: return 'Belirtilmemiş';
    }
  };

  const exportToExcel = () => {
    if (!account) return;
    
    if (filteredTransactions.length === 0) {
      toast("Dışa aktarılacak işlem bulunmuyor.");
      return;
    }
    
    // Excel için veri hazırla
    const data = filteredTransactions.map(transaction => ({
      'Tarih': format(new Date(transaction.transaction_date), 'dd/MM/yyyy'),
      'İşlem Türü': transaction.transaction_type === 'income' ? 'Gelir Faturası' : 'Gider Faturası',
      'Fatura No': transaction.invoice_number || '-',
      'Tutar (TL)': Number(transaction.amount).toFixed(2),
      'İşlem Yönü': transaction.transaction_type === 'income' ? 'Alacak (+)' : 'Borç (-)',
      'Ödeme Durumu': transaction.payment_status === 'paid' ? 'Ödendi' : 'Beklemede',
      'Açıklama': transaction.description || 'Açıklama yok'
    }));

    // Özet bilgiler hesapla
    const toplamGelir = filteredTransactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const toplamGider = filteredTransactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const netBakiye = toplamGelir - toplamGider;

    // Özet satırları ekle
    data.push({
      'Tarih': '',
      'İşlem Türü': '',
      'Fatura No': '',
      'Tutar (TL)': '',
      'İşlem Yönü': '',
      'Ödeme Durumu': '',
      'Açıklama': ''
    });
    data.push({
      'Tarih': '=== ÖZET ===',
      'İşlem Türü': '',
      'Fatura No': '',
      'Tutar (TL)': '',
      'İşlem Yönü': '',
      'Ödeme Durumu': '',
      'Açıklama': ''
    });
    data.push({
      'Tarih': 'Toplam Gelir',
      'İşlem Türü': '',
      'Fatura No': '',
      'Tutar (TL)': toplamGelir.toFixed(2),
      'İşlem Yönü': 'Alacak (+)',
      'Ödeme Durumu': '',
      'Açıklama': ''
    });
    data.push({
      'Tarih': 'Toplam Gider',
      'İşlem Türü': '',
      'Fatura No': '',
      'Tutar (TL)': toplamGider.toFixed(2),
      'İşlem Yönü': 'Borç (-)',
      'Ödeme Durumu': '',
      'Açıklama': ''
    });
    data.push({
      'Tarih': 'Net Bakiye',
      'İşlem Türü': '',
      'Fatura No': '',
      'Tutar (TL)': Math.abs(netBakiye).toFixed(2),
      'İşlem Yönü': netBakiye >= 0 ? 'Alacak (+)' : 'Borç (-)',
      'Ödeme Durumu': '',
      'Açıklama': netBakiye >= 0 ? 'Müşteri borçlu' : 'Biz borçluyuz'
    });
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Sütun genişliklerini ayarla
    const colWidths = [
      { wch: 15 }, // Tarih
      { wch: 18 }, // İşlem Türü
      { wch: 15 }, // Fatura No
      { wch: 15 }, // Tutar
      { wch: 15 }, // İşlem Yönü
      { wch: 15 }, // Ödeme Durumu
      { wch: 30 }  // Açıklama
    ];
    worksheet['!cols'] = colWidths;
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'İşlem Geçmişi');
    
    const fileName = `${account.name.replace(/[^\w\s]/gi, '')}_İşlem_Geçmişi_${format(new Date(), 'ddMMyyyy_HHmm')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast("Excel dosyası başarıyla indirildi.");
  };

  if (!account) {
    return (
      <Card className="shadow-sm border">
        <CardContent className="text-center py-8">
          <p className="text-gray-600">Cari bulunamadı.</p>
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
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Cari Detayı</h2>
      </div>

      {/* Account Info */}
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-500" />
            <span>{account.name}</span>
          </CardTitle>
          <CardDescription>Cari bilgileri ve bakiye durumu</CardDescription>
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
                <CalendarIcon className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">
                  Kayıt: {format(new Date(account.created_at), 'dd MMMM yyyy')}
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
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Filtrelenmiş Bakiye
              </h3>
              <p className={`text-3xl font-bold ${getBalanceColor(balance)}`}>
                {getBalanceText(balance)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-blue-500" />
            <span>Filtreler</span>
          </CardTitle>
          <CardDescription>
            İşlemleri filtreleyin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Date Range */}
            <div className="space-y-2">
              <Label>Tarih Aralığı</Label>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd/MM/yyyy") : "Başlangıç"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd/MM/yyyy") : "Bitiş"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Amount Filter */}
            <div className="space-y-2">
              <Label>Tutar Filtresi</Label>
              <Input
                placeholder="Tutar ara..."
                value={amountFilter}
                onChange={(e) => setAmountFilter(e.target.value)}
              />
            </div>

            {/* Transaction Type Filter */}
            <div className="space-y-2">
              <Label>İşlem Türü</Label>
              <Select value={transactionTypeFilter} onValueChange={setTransactionTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="income">Gelir</SelectItem>
                  <SelectItem value="expense">Gider</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button onClick={clearAllFilters} variant="outline" size="sm">
              Tüm Filtreleri Temizle
            </Button>
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
            <div className="ml-auto flex gap-2">
              {allTransactions.length !== filteredTransactions.length && (
                <Badge variant="secondary">
                  Toplam: {allTransactions.length} İşlem
                </Badge>
              )}
              <Badge variant="outline">
                {filteredTransactions.length} İşlem
              </Badge>
            </div>
          </CardTitle>
          <CardDescription>
            {allTransactions.length !== filteredTransactions.length 
              ? `Filtrelenmiş işlemler (${allTransactions.length} toplam işlemden ${filteredTransactions.length} tanesi gösteriliyor)`
              : 'Tüm işlemler'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>İşlem Türü</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Ödeme Durumu</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-sm">
                        {format(new Date(transaction.transaction_date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${
                          transaction.transaction_type === 'income' 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'bg-red-100 text-red-800 border-red-200'
                        }`}>
                          {transaction.transaction_type === 'income' ? 'Gelir' : 'Gider'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${
                          transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.transaction_type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${
                          transaction.payment_status === 'paid' 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        }`}>
                          {transaction.payment_status === 'paid' ? 'Ödendi' : 'Ödenmedi'}
                        </Badge>
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
                        <EditTransactionDialog 
                          transaction={transaction}
                          onTransactionUpdated={() => {
                            refetchIncomeInvoices();
                            refetchExpenseInvoices();
                          }}
                        />
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
                Filtrelere uygun işlem bulunamadı
              </h3>
              <p className="text-gray-600">
                Farklı filtreler deneyebilir veya filtreleri temizleyebilirsiniz.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
