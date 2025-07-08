import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CalendarIcon, Plus, Download, Upload, ArrowUpDown, Search, User, X, PlusCircle, FileText, Receipt, Building, File } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/numberUtils';
import { useInvoices } from '@/hooks/useInvoices';
import { DateRange } from 'react-day-picker';

interface CompanyCashManagementProps {
  companyId: string;
}

export const CompanyCashManagement = ({ companyId }: CompanyCashManagementProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const {
    incomeInvoices,
    expenseInvoices,
    accounts,
    loading,
    addIncomeInvoice,
    addExpenseInvoice,
    addAccount,
    updateIncomeInvoice,
    updateExpenseInvoice
  } = useInvoices(companyId);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [sortBy, setSortBy] = useState('date-desc');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // New invoice state
  const [newIncomeInvoice, setNewIncomeInvoice] = useState({
    invoice_number: '',
    description: '',
    amount: '',
    invoice_date: new Date(),
    account_id: '',
    payment_status: 'unpaid' as 'paid' | 'unpaid',
    payment_date: undefined as Date | undefined,
  });

  const [newExpenseInvoice, setNewExpenseInvoice] = useState({
    invoice_number: '',
    description: '',
    amount: '',
    invoice_date: new Date(),
    account_id: '',
    payment_status: 'unpaid' as 'paid' | 'unpaid',
    payment_date: undefined as Date | undefined,
  });

  // New account state
  const [newAccount, setNewAccount] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  // Dialog states
  const [isNewIncomeDialogOpen, setIsNewIncomeDialogOpen] = useState(false);
  const [isNewExpenseDialogOpen, setIsNewExpenseDialogOpen] = useState(false);
  const [isNewAccountDialogOpen, setIsNewAccountDialogOpen] = useState(false);

  // Calculate totals
  const totalIncome = incomeInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalExpense = expenseInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const balance = totalIncome - totalExpense;

  // Reset forms after submission
  const resetIncomeForm = () => {
    setNewIncomeInvoice({
      invoice_number: '',
      description: '',
      amount: '',
      invoice_date: new Date(),
      account_id: '',
      payment_status: 'unpaid',
      payment_date: undefined,
    });
  };

  const resetExpenseForm = () => {
    setNewExpenseInvoice({
      invoice_number: '',
      description: '',
      amount: '',
      invoice_date: new Date(),
      account_id: '',
      payment_status: 'unpaid',
      payment_date: undefined,
    });
  };

  const resetAccountForm = () => {
    setNewAccount({
      name: '',
      phone: '',
      address: '',
      notes: '',
    });
  };

  // Handle form submissions
  const handleAddIncomeInvoice = async () => {
    if (!newIncomeInvoice.description || !newIncomeInvoice.amount) {
      toast.error('Lütfen zorunlu alanları doldurun');
      return;
    }

    try {
      const { error } = await addIncomeInvoice({
        invoice_number: newIncomeInvoice.invoice_number,
        description: newIncomeInvoice.description,
        amount: parseFloat(newIncomeInvoice.amount),
        invoice_date: format(newIncomeInvoice.invoice_date, 'yyyy-MM-dd'),
        account_id: newIncomeInvoice.account_id || undefined,
        payment_status: newIncomeInvoice.payment_status,
        payment_date: newIncomeInvoice.payment_date 
          ? format(newIncomeInvoice.payment_date, 'yyyy-MM-dd') 
          : undefined
      });

      if (error) {
        toast.error('Gelir faturası eklenirken bir hata oluştu');
        console.error('Error adding income invoice:', error);
        return;
      }

      toast.success('Gelir faturası başarıyla eklendi');
      resetIncomeForm();
      setIsNewIncomeDialogOpen(false);
    } catch (err) {
      toast.error('Gelir faturası eklenirken bir hata oluştu');
      console.error(err);
    }
  };

  const handleAddExpenseInvoice = async () => {
    if (!newExpenseInvoice.description || !newExpenseInvoice.amount) {
      toast.error('Lütfen zorunlu alanları doldurun');
      return;
    }

    try {
      const { error } = await addExpenseInvoice({
        invoice_number: newExpenseInvoice.invoice_number,
        description: newExpenseInvoice.description,
        amount: parseFloat(newExpenseInvoice.amount),
        invoice_date: format(newExpenseInvoice.invoice_date, 'yyyy-MM-dd'),
        account_id: newExpenseInvoice.account_id || undefined,
        payment_status: newExpenseInvoice.payment_status,
        payment_date: newExpenseInvoice.payment_date 
          ? format(newExpenseInvoice.payment_date, 'yyyy-MM-dd') 
          : undefined
      });

      if (error) {
        toast.error('Gider faturası eklenirken bir hata oluştu');
        console.error('Error adding expense invoice:', error);
        return;
      }

      toast.success('Gider faturası başarıyla eklendi');
      resetExpenseForm();
      setIsNewExpenseDialogOpen(false);
    } catch (err) {
      toast.error('Gider faturası eklenirken bir hata oluştu');
      console.error(err);
    }
  };

  const handleAddAccount = async () => {
    if (!newAccount.name) {
      toast.error('Lütfen cari hesap adını girin');
      return;
    }

    try {
      const { error } = await addAccount({
        name: newAccount.name,
        phone: newAccount.phone || undefined,
        address: newAccount.address || undefined,
        notes: newAccount.notes || undefined,
      });

      if (error) {
        toast.error('Cari hesap eklenirken bir hata oluştu');
        console.error('Error adding account:', error);
        return;
      }

      toast.success('Cari hesap başarıyla eklendi');
      resetAccountForm();
      setIsNewAccountDialogOpen(false);
    } catch (err) {
      toast.error('Cari hesap eklenirken bir hata oluştu');
      console.error(err);
    }
  };

  const handleUpdateInvoiceStatus = async (invoiceId: string, isIncome: boolean, newStatus: 'paid' | 'unpaid', paymentDate?: string) => {
    try {
      const data = {
        payment_status: newStatus,
        payment_date: newStatus === 'paid' ? (paymentDate || format(new Date(), 'yyyy-MM-dd')) : null
      };

      const { error } = isIncome 
        ? await updateIncomeInvoice(invoiceId, data)
        : await updateExpenseInvoice(invoiceId, data);

      if (error) {
        toast.error('Fatura durumu güncellenirken bir hata oluştu');
        console.error('Error updating invoice status:', error);
        return;
      }

      toast.success('Fatura durumu başarıyla güncellendi');
    } catch (err) {
      toast.error('Fatura durumu güncellenirken bir hata oluştu');
      console.error(err);
    }
  };

  // Filter and sort invoices
  const filterInvoices = (invoices: any[]) => {
    return invoices.filter(invoice => {
      // Search filter
      const matchesSearch = 
        invoice.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.invoice_number && invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()));

      // Date range filter
      const invoiceDate = new Date(invoice.invoice_date);
      const matchesDateRange = 
        (!dateRange?.from || invoiceDate >= dateRange.from) &&
        (!dateRange?.to || invoiceDate <= dateRange.to);

      // Account filter
      const matchesAccount = 
        accountFilter === 'all' || 
        invoice.account_id === accountFilter;

      // Status filter
      const matchesStatus = 
        statusFilter === 'all' || 
        invoice.payment_status === statusFilter;

      return matchesSearch && matchesDateRange && matchesAccount && matchesStatus;
    });
  };

  const sortInvoices = (invoices: any[]) => {
    return [...invoices].sort((a, b) => {
      switch(sortBy) {
        case 'date-asc':
          return new Date(a.invoice_date).getTime() - new Date(b.invoice_date).getTime();
        case 'date-desc':
          return new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime();
        case 'amount-asc':
          return a.amount - b.amount;
        case 'amount-desc':
          return b.amount - a.amount;
        default:
          return new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime();
      }
    });
  };

  const filteredIncomeInvoices = sortInvoices(filterInvoices(incomeInvoices));
  const filteredExpenseInvoices = sortInvoices(filterInvoices(expenseInvoices));

  // Date range helpers
  const isDateInRange = (date: Date) => {
    return (!dateRange?.from || date >= dateRange.from) &&
           (!dateRange?.to || date <= dateRange.to);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex flex-col">
              <div className="text-green-700 text-sm font-medium">Toplam Gelir</div>
              <div className="text-3xl font-bold text-green-800 mt-1">{formatCurrency(totalIncome)}</div>
              <div className="text-xs text-green-600 mt-2">{incomeInvoices.length} gelir faturası</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex flex-col">
              <div className="text-red-700 text-sm font-medium">Toplam Gider</div>
              <div className="text-3xl font-bold text-red-800 mt-1">{formatCurrency(totalExpense)}</div>
              <div className="text-xs text-red-600 mt-2">{expenseInvoices.length} gider faturası</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={cn(
          "bg-gradient-to-br border",
          balance >= 0 
            ? "from-blue-50 to-blue-100 border-blue-200" 
            : "from-orange-50 to-orange-100 border-orange-200"
        )}>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <div className={cn(
                "text-sm font-medium",
                balance >= 0 ? "text-blue-700" : "text-orange-700"
              )}>
                Bakiye
              </div>
              <div className={cn(
                "text-3xl font-bold mt-1",
                balance >= 0 ? "text-blue-800" : "text-orange-800"
              )}>
                {formatCurrency(Math.abs(balance))}
              </div>
              <div className={cn(
                "text-xs mt-2",
                balance >= 0 ? "text-blue-600" : "text-orange-600"
              )}>
                {balance >= 0 ? 'Pozitif Bakiye' : 'Negatif Bakiye'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-4">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="income">Gelir Faturaları</TabsTrigger>
          <TabsTrigger value="expense">Gider Faturaları</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>Finansal Durum</span>
              </CardTitle>
              <CardDescription>Şirketinizin genel finansal durumu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Son Gelirler</h3>
                  {incomeInvoices.length > 0 ? (
                    <ul className="space-y-2">
                      {incomeInvoices.slice(0, 5).map(invoice => (
                        <li key={invoice.id} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <p className="font-medium">{invoice.description}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(invoice.invoice_date).toLocaleDateString('tr-TR')}
                              {invoice.account?.name && ` • ${invoice.account.name}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">{formatCurrency(invoice.amount)}</p>
                            <Badge variant={invoice.payment_status === 'paid' ? 'default' : 'outline'} className="text-xs">
                              {invoice.payment_status === 'paid' ? 'Ödendi' : 'Ödenmedi'}
                            </Badge>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Henüz gelir faturası bulunmuyor</p>
                  )}
                  <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => setActiveTab('income')}>
                    Tüm Gelirleri Görüntüle
                  </Button>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Son Giderler</h3>
                  {expenseInvoices.length > 0 ? (
                    <ul className="space-y-2">
                      {expenseInvoices.slice(0, 5).map(invoice => (
                        <li key={invoice.id} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <p className="font-medium">{invoice.description}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(invoice.invoice_date).toLocaleDateString('tr-TR')}
                              {invoice.account?.name && ` • ${invoice.account.name}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-600">{formatCurrency(invoice.amount)}</p>
                            <Badge variant={invoice.payment_status === 'paid' ? 'default' : 'outline'} className="text-xs">
                              {invoice.payment_status === 'paid' ? 'Ödendi' : 'Ödenmedi'}
                            </Badge>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Henüz gider faturası bulunmuyor</p>
                  )}
                  <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => setActiveTab('expense')}>
                    Tüm Giderleri Görüntüle
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Cari Hesaplar</h3>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-500">Toplam {accounts.length} cari hesap</p>
                  <Dialog open={isNewAccountDialogOpen} onOpenChange={setIsNewAccountDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Yeni Cari Hesap
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Yeni Cari Hesap Ekle</DialogTitle>
                        <DialogDescription>
                          Faturalarınızda kullanmak için yeni bir cari hesap ekleyin.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="account-name">Cari Hesap Adı</Label>
                          <Input
                            id="account-name"
                            placeholder="ABC Şirketi"
                            value={newAccount.name}
                            onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="account-phone">Telefon (Opsiyonel)</Label>
                          <Input
                            id="account-phone"
                            placeholder="0212 123 4567"
                            value={newAccount.phone}
                            onChange={(e) => setNewAccount({...newAccount, phone: e.target.value})}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="account-address">Adres (Opsiyonel)</Label>
                          <Input
                            id="account-address"
                            placeholder="İstanbul, Türkiye"
                            value={newAccount.address}
                            onChange={(e) => setNewAccount({...newAccount, address: e.target.value})}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="account-notes">Notlar (Opsiyonel)</Label>
                          <Input
                            id="account-notes"
                            placeholder="Ek bilgiler..."
                            value={newAccount.notes}
                            onChange={(e) => setNewAccount({...newAccount, notes: e.target.value})}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsNewAccountDialogOpen(false)}>İptal</Button>
                        <Button onClick={handleAddAccount}>Ekle</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {accounts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cari Hesap Adı</TableHead>
                          <TableHead>İletişim</TableHead>
                          <TableHead>Adres</TableHead>
                          <TableHead>Notlar</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accounts.map(account => (
                          <TableRow key={account.id}>
                            <TableCell className="font-medium">{account.name}</TableCell>
                            <TableCell>{account.phone || '-'}</TableCell>
                            <TableCell>{account.address || '-'}</TableCell>
                            <TableCell>{account.notes || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-md">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">Henüz cari hesap yok</h3>
                    <p className="text-gray-500 mb-4">Faturaları daha iyi takip etmek için cari hesaplar oluşturun</p>
                    <Button onClick={() => setIsNewAccountDialogOpen(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Cari Hesap Ekle
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Income Invoices Tab */}
        <TabsContent value="income" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:items-center">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="h-5 w-5 text-green-600" />
                  <span>Gelir Faturaları</span>
                </CardTitle>
                <CardDescription>
                  Şirketinizin tüm gelir faturaları
                </CardDescription>
              </div>
              <Dialog open={isNewIncomeDialogOpen} onOpenChange={setIsNewIncomeDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Gelir Faturası
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Yeni Gelir Faturası Ekle</DialogTitle>
                    <DialogDescription>
                      Şirketinize ait yeni bir gelir faturası ekleyin.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="invoice-number">Fatura No (Opsiyonel)</Label>
                        <Input
                          id="invoice-number"
                          placeholder="A-12345"
                          value={newIncomeInvoice.invoice_number}
                          onChange={(e) => setNewIncomeInvoice({...newIncomeInvoice, invoice_number: e.target.value})}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="amount">Tutar</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          value={newIncomeInvoice.amount}
                          onChange={(e) => setNewIncomeInvoice({...newIncomeInvoice, amount: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Açıklama</Label>
                      <Input
                        id="description"
                        placeholder="Gelir açıklaması"
                        value={newIncomeInvoice.description}
                        onChange={(e) => setNewIncomeInvoice({...newIncomeInvoice, description: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="invoice-date">Fatura Tarihi</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !newIncomeInvoice.invoice_date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newIncomeInvoice.invoice_date ? format(newIncomeInvoice.invoice_date, "PPP", { locale: tr }) : <span>Tarih Seç</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={newIncomeInvoice.invoice_date}
                              onSelect={(date) => setNewIncomeInvoice({...newIncomeInvoice, invoice_date: date || new Date()})}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="account">Cari Hesap (Opsiyonel)</Label>
                        <Select value={newIncomeInvoice.account_id} onValueChange={(value) => setNewIncomeInvoice({...newIncomeInvoice, account_id: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Cari hesap seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Seçilmedi</SelectItem>
                            {accounts.map(account => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="payment-status">Ödeme Durumu</Label>
                        <Select 
                          value={newIncomeInvoice.payment_status} 
                          onValueChange={(value: 'paid' | 'unpaid') => setNewIncomeInvoice({
                            ...newIncomeInvoice, 
                            payment_status: value,
                            payment_date: value === 'paid' ? new Date() : undefined
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paid">Ödendi</SelectItem>
                            <SelectItem value="unpaid">Ödenmedi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {newIncomeInvoice.payment_status === 'paid' && (
                        <div className="grid gap-2">
                          <Label htmlFor="payment-date">Ödeme Tarihi</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !newIncomeInvoice.payment_date && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {newIncomeInvoice.payment_date ? format(newIncomeInvoice.payment_date, "PPP", { locale: tr }) : <span>Tarih Seç</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={newIncomeInvoice.payment_date}
                                onSelect={(date) => setNewIncomeInvoice({...newIncomeInvoice, payment_date: date || new Date()})}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      resetIncomeForm();
                      setIsNewIncomeDialogOpen(false);
                    }}>İptal</Button>
                    <Button onClick={handleAddIncomeInvoice}>Ekle</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      placeholder="Fatura ara..." 
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "justify-start text-left font-normal",
                          !dateRange?.from && !dateRange?.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from || dateRange?.to ? (
                          <>
                            {dateRange?.from ? format(dateRange.from, "PPP", { locale: tr }) : "..."}
                            {" - "}
                            {dateRange?.to ? format(dateRange.to, "PPP", { locale: tr }) : "..."}
                          </>
                        ) : (
                          <span>Tarih aralığı seç</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                        initialFocus
                        numberOfMonths={2}
                        className="p-3 pointer-events-auto"
                      />
                      <div className="border-t p-3 flex justify-between">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setDateRange({ from: undefined, to: undefined })}
                        >
                          Temizle
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  <Select value={accountFilter} onValueChange={setAccountFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Cari Hesaplar</SelectItem>
                      {accounts.map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center space-x-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date-desc">Tarih (Yeni-Eski)</SelectItem>
                        <SelectItem value="date-asc">Tarih (Eski-Yeni)</SelectItem>
                        <SelectItem value="amount-desc">Tutar (Yüksek-Düşük)</SelectItem>
                        <SelectItem value="amount-asc">Tutar (Düşük-Yüksek)</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Durumlar</SelectItem>
                        <SelectItem value="paid">Ödendi</SelectItem>
                        <SelectItem value="unpaid">Ödenmedi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Invoice Table */}
                {filteredIncomeInvoices.length > 0 ? (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[150px]">Tarih</TableHead>
                          <TableHead>Açıklama</TableHead>
                          <TableHead>Cari</TableHead>
                          <TableHead>Tutar</TableHead>
                          <TableHead>Durum</TableHead>
                          <TableHead>İşlemler</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredIncomeInvoices.map(invoice => (
                          <TableRow key={invoice.id}>
                            <TableCell>
                              {new Date(invoice.invoice_date).toLocaleDateString('tr-TR')}
                              <br />
                              <span className="text-xs text-gray-500">{invoice.invoice_number || '-'}</span>
                            </TableCell>
                            <TableCell>{invoice.description}</TableCell>
                            <TableCell>
                              {invoice.account?.name || '-'}
                            </TableCell>
                            <TableCell className="font-semibold text-green-600">
                              {formatCurrency(invoice.amount)}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <Badge variant={invoice.payment_status === 'paid' ? 'default' : 'outline'}>
                                  {invoice.payment_status === 'paid' ? 'Ödendi' : 'Ödenmedi'}
                                </Badge>
                                {invoice.payment_status === 'paid' && invoice.payment_date && (
                                  <span className="text-xs text-gray-500">
                                    {new Date(invoice.payment_date).toLocaleDateString('tr-TR')}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {invoice.payment_status === 'unpaid' ? (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleUpdateInvoiceStatus(invoice.id, true, 'paid')}
                                >
                                  Ödendi İşaretle
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleUpdateInvoiceStatus(invoice.id, true, 'unpaid')}
                                >
                                  Ödenmedi İşaretle
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-10 border rounded-md">
                    <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">Gelir faturası bulunamadı</h3>
                    <p className="text-gray-500 mb-4">Filtreleme kriterleriyle eşleşen fatura yok</p>
                    <Button onClick={() => {
                      setSearchTerm('');
                      setDateRange({ from: undefined, to: undefined });
                      setAccountFilter('all');
                      setStatusFilter('all');
                    }}>
                      Filtreleri Temizle
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Expense Invoices Tab */}
        <TabsContent value="expense" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:items-center">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 text-red-600" />
                  <span>Gider Faturaları</span>
                </CardTitle>
                <CardDescription>
                  Şirketinizin tüm gider faturaları
                </CardDescription>
              </div>
              <Dialog open={isNewExpenseDialogOpen} onOpenChange={setIsNewExpenseDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Gider Faturası
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Yeni Gider Faturası Ekle</DialogTitle>
                    <DialogDescription>
                      Şirketinize ait yeni bir gider faturası ekleyin.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="expense-invoice-number">Fatura No (Opsiyonel)</Label>
                        <Input
                          id="expense-invoice-number"
                          placeholder="B-12345"
                          value={newExpenseInvoice.invoice_number}
                          onChange={(e) => setNewExpenseInvoice({...newExpenseInvoice, invoice_number: e.target.value})}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="expense-amount">Tutar</Label>
                        <Input
                          id="expense-amount"
                          type="number"
                          placeholder="0.00"
                          value={newExpenseInvoice.amount}
                          onChange={(e) => setNewExpenseInvoice({...newExpenseInvoice, amount: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="expense-description">Açıklama</Label>
                      <Input
                        id="expense-description"
                        placeholder="Gider açıklaması"
                        value={newExpenseInvoice.description}
                        onChange={(e) => setNewExpenseInvoice({...newExpenseInvoice, description: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="expense-invoice-date">Fatura Tarihi</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !newExpenseInvoice.invoice_date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newExpenseInvoice.invoice_date ? format(newExpenseInvoice.invoice_date, "PPP", { locale: tr }) : <span>Tarih Seç</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={newExpenseInvoice.invoice_date}
                              onSelect={(date) => setNewExpenseInvoice({...newExpenseInvoice, invoice_date: date || new Date()})}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="expense-account">Cari Hesap (Opsiyonel)</Label>
                        <Select value={newExpenseInvoice.account_id} onValueChange={(value) => setNewExpenseInvoice({...newExpenseInvoice, account_id: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Cari hesap seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Seçilmedi</SelectItem>
                            {accounts.map(account => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="expense-payment-status">Ödeme Durumu</Label>
                        <Select 
                          value={newExpenseInvoice.payment_status} 
                          onValueChange={(value: 'paid' | 'unpaid') => setNewExpenseInvoice({
                            ...newExpenseInvoice, 
                            payment_status: value,
                            payment_date: value === 'paid' ? new Date() : undefined
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paid">Ödendi</SelectItem>
                            <SelectItem value="unpaid">Ödenmedi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {newExpenseInvoice.payment_status === 'paid' && (
                        <div className="grid gap-2">
                          <Label htmlFor="expense-payment-date">Ödeme Tarihi</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !newExpenseInvoice.payment_date && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {newExpenseInvoice.payment_date ? format(newExpenseInvoice.payment_date, "PPP", { locale: tr }) : <span>Tarih Seç</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={newExpenseInvoice.payment_date}
                                onSelect={(date) => setNewExpenseInvoice({...newExpenseInvoice, payment_date: date || new Date()})}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      resetExpenseForm();
                      setIsNewExpenseDialogOpen(false);
                    }}>İptal</Button>
                    <Button onClick={handleAddExpenseInvoice}>Ekle</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filters - same structure as income tab */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      placeholder="Fatura ara..." 
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "justify-start text-left font-normal",
                          !dateRange?.from && !dateRange?.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from || dateRange?.to ? (
                          <>
                            {dateRange?.from ? format(dateRange.from, "PPP", { locale: tr }) : "..."}
                            {" - "}
                            {dateRange?.to ? format(dateRange.to, "PPP", { locale: tr }) : "..."}
                          </>
                        ) : (
                          <span>Tarih aralığı seç</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                        initialFocus
                        numberOfMonths={2}
                        className="p-3 pointer-events-auto"
                      />
                      <div className="border-t p-3 flex justify-between">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setDateRange({ from: undefined, to: undefined })}
                        >
                          Temizle
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  <Select value={accountFilter} onValueChange={setAccountFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Cari Hesaplar</SelectItem>
                      {accounts.map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center space-x-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date-desc">Tarih (Yeni-Eski)</SelectItem>
                        <SelectItem value="date-asc">Tarih (Eski-Yeni)</SelectItem>
                        <SelectItem value="amount-desc">Tutar (Yüksek-Düşük)</SelectItem>
                        <SelectItem value="amount-asc">Tutar (Düşük-Yüksek)</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Durumlar</SelectItem>
                        <SelectItem value="paid">Ödendi</SelectItem>
                        <SelectItem value="unpaid">Ödenmedi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Expense Invoice Table */}
                {filteredExpenseInvoices.length > 0 ? (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[150px]">Tarih</TableHead>
                          <TableHead>Açıklama</TableHead>
                          <TableHead>Cari</TableHead>
                          <TableHead>Tutar</TableHead>
                          <TableHead>Durum</TableHead>
                          <TableHead>İşlemler</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredExpenseInvoices.map(invoice => (
                          <TableRow key={invoice.id}>
                            <TableCell>
                              {new Date(invoice.invoice_date).toLocaleDateString('tr-TR')}
                              <br />
                              <span className="text-xs text-gray-500">{invoice.invoice_number || '-'}</span>
                            </TableCell>
                            <TableCell>{invoice.description}</TableCell>
                            <TableCell>
                              {invoice.account?.name || '-'}
                            </TableCell>
                            <TableCell className="font-semibold text-red-600">
                              {formatCurrency(invoice.amount)}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <Badge variant={invoice.payment_status === 'paid' ? 'default' : 'outline'}>
                                  {invoice.payment_status === 'paid' ? 'Ödendi' : 'Ödenmedi'}
                                </Badge>
                                {invoice.payment_status === 'paid' && invoice.payment_date && (
                                  <span className="text-xs text-gray-500">
                                    {new Date(invoice.payment_date).toLocaleDateString('tr-TR')}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {invoice.payment_status === 'unpaid' ? (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleUpdateInvoiceStatus(invoice.id, false, 'paid')}
                                >
                                  Ödendi İşaretle
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleUpdateInvoiceStatus(invoice.id, false, 'unpaid')}
                                >
                                  Ödenmedi İşaretle
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-10 border rounded-md">
                    <File className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">Gider faturası bulunamadı</h3>
                    <p className="text-gray-500 mb-4">Filtreleme kriterleriyle eşleşen fatura yok</p>
                    <Button onClick={() => {
                      setSearchTerm('');
                      setDateRange({ from: undefined, to: undefined });
                      setAccountFilter('all');
                      setStatusFilter('all');
                    }}>
                      Filtreleri Temizle
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
