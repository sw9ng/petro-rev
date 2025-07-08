
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Search, 
  Filter, 
  CalendarIcon,
  Edit,
  Trash2,
  Building2,
  UserPlus,
  DollarSign,
  Receipt,
  Eye,
  X
} from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import { formatCurrency } from '@/lib/numberUtils';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { DateRange } from 'react-day-picker';

interface CompanyCashManagementProps {
  companyId: string;
}

export const CompanyCashManagement = ({ companyId }: CompanyCashManagementProps) => {
  const {
    incomeInvoices,
    expenseInvoices,
    accounts,
    loading,
    addIncomeInvoice,
    addExpenseInvoice,
    addAccount,
    updateIncomeInvoice,
    updateExpenseInvoice,
    deleteIncomeInvoice,
    deleteExpenseInvoice,
    deleteAccount
  } = useInvoices(companyId);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Dialog states
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);

  // Form states
  const [newIncomeInvoice, setNewIncomeInvoice] = useState({
    invoice_number: '',
    description: '',
    amount: 0,
    invoice_date: new Date().toISOString().split('T')[0],
    payment_status: 'unpaid' as 'paid' | 'unpaid',
    payment_date: undefined as Date | undefined,
    account_id: ''
  });

  const [newExpenseInvoice, setNewExpenseInvoice] = useState({
    invoice_number: '',
    description: '',
    amount: 0,
    invoice_date: new Date().toISOString().split('T')[0],
    payment_status: 'unpaid' as 'paid' | 'unpaid',
    payment_date: undefined as Date | undefined,
    account_id: ''
  });

  const [newAccount, setNewAccount] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

  // Reset forms when dialogs close
  useEffect(() => {
    if (!isIncomeDialogOpen) {
      setNewIncomeInvoice({
        invoice_number: '',
        description: '',
        amount: 0,
        invoice_date: new Date().toISOString().split('T')[0],
        payment_status: 'unpaid',
        payment_date: undefined,
        account_id: ''
      });
    }
  }, [isIncomeDialogOpen]);

  useEffect(() => {
    if (!isExpenseDialogOpen) {
      setNewExpenseInvoice({
        invoice_number: '',
        description: '',
        amount: 0,
        invoice_date: new Date().toISOString().split('T')[0],
        payment_status: 'unpaid',
        payment_date: undefined,
        account_id: ''
      });
    }
  }, [isExpenseDialogOpen]);

  useEffect(() => {
    if (!isAccountDialogOpen) {
      setNewAccount({
        name: '',
        phone: '',
        address: '',
        notes: ''
      });
    }
  }, [isAccountDialogOpen]);

  // Calculate totals
  const totalIncome = incomeInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalExpense = expenseInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const netProfit = totalIncome - totalExpense;

  const paidIncome = incomeInvoices
    .filter(invoice => invoice.payment_status === 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  
  const paidExpense = expenseInvoices
    .filter(invoice => invoice.payment_status === 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const unpaidIncome = incomeInvoices
    .filter(invoice => invoice.payment_status === 'unpaid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  
  const unpaidExpense = expenseInvoices
    .filter(invoice => invoice.payment_status === 'unpaid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  // Handle form submissions
  const handleIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newIncomeInvoice.description || newIncomeInvoice.amount <= 0) {
      toast.error("Lütfen gerekli alanları doldurun.");
      return;
    }

    const invoiceData = {
      ...newIncomeInvoice,
      account_id: newIncomeInvoice.account_id && newIncomeInvoice.account_id !== 'all' ? 
        newIncomeInvoice.account_id : undefined,
      payment_date: newIncomeInvoice.payment_status === 'paid' ? 
        (newIncomeInvoice.payment_date || new Date()).toISOString().split('T')[0] : 
        undefined
    };

    console.log('Submitting income invoice:', invoiceData);

    const { error } = await addIncomeInvoice(invoiceData);
    
    if (error) {
      console.error('Error adding income invoice:', error);
      toast.error("Gelir faturası eklenirken bir hata oluştu.");
    } else {
      toast.success("Gelir faturası başarıyla eklendi.");
      setIsIncomeDialogOpen(false);
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newExpenseInvoice.description || newExpenseInvoice.amount <= 0) {
      toast.error("Lütfen gerekli alanları doldurun.");
      return;
    }

    const invoiceData = {
      ...newExpenseInvoice,
      account_id: newExpenseInvoice.account_id && newExpenseInvoice.account_id !== 'all' ? 
        newExpenseInvoice.account_id : undefined,
      payment_date: newExpenseInvoice.payment_status === 'paid' ? 
        (newExpenseInvoice.payment_date || new Date()).toISOString().split('T')[0] : 
        undefined
    };

    console.log('Submitting expense invoice:', invoiceData);

    const { error } = await addExpenseInvoice(invoiceData);
    
    if (error) {
      console.error('Error adding expense invoice:', error);
      toast.error("Gider faturası eklenirken bir hata oluştu.");
    } else {
      toast.success("Gider faturası başarıyla eklendi.");
      setIsExpenseDialogOpen(false);
    }
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAccount.name.trim()) {
      toast.error("Cari hesap adı zorunludur.");
      return;
    }

    const { error } = await addAccount(newAccount);
    
    if (error) {
      console.error('Error adding account:', error);
      toast.error("Cari hesap eklenirken bir hata oluştu.");
    } else {
      toast.success("Cari hesap başarıyla eklendi.");
      setIsAccountDialogOpen(false);
    }
  };

  // Filter functions
  const filteredIncomeInvoices = incomeInvoices.filter(invoice => {
    // Search filter
    const matchesSearch = 
      invoice.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.account?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    // Date range filter
    const invoiceDate = new Date(invoice.invoice_date);
    const matchesDateRange = 
      (!dateRange?.from || invoiceDate >= dateRange.from) &&
      (!dateRange?.to || invoiceDate <= dateRange.to);

    // Account filter
    const matchesAccount = 
      !selectedAccount || selectedAccount === 'all' || invoice.account_id === selectedAccount;

    // Status filter
    const matchesStatus = 
      !selectedStatus || selectedStatus === 'all' || invoice.payment_status === selectedStatus;

    return matchesSearch && matchesDateRange && matchesAccount && matchesStatus;
  });

  const filteredExpenseInvoices = expenseInvoices.filter(invoice => {
    // Search filter
    const matchesSearch = 
      invoice.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.account?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    // Date range filter
    const invoiceDate = new Date(invoice.invoice_date);
    const matchesDateRange = 
      (!dateRange?.from || invoiceDate >= dateRange.from) &&
      (!dateRange?.to || invoiceDate <= dateRange.to);

    // Account filter
    const matchesAccount = 
      !selectedAccount || selectedAccount === 'all' || invoice.account_id === selectedAccount;

    // Status filter
    const matchesStatus = 
      !selectedStatus || selectedStatus === 'all' || invoice.payment_status === selectedStatus;

    return matchesSearch && matchesDateRange && matchesAccount && matchesStatus;
  });

  // Date range helpers
  const isDateInRange = (date: Date) => {
    return (!dateRange?.from || date >= dateRange.from) &&
           (!dateRange?.to || date <= dateRange.to);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gider</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpense)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Kar/Zarar</CardTitle>
            <DollarSign className={`h-4 w-4 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netProfit)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cari Hesaplar</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {accounts.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Gelir Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Yeni Gelir Faturası</DialogTitle>
              <DialogDescription>
                Yeni bir gelir faturası oluşturun.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleIncomeSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoice-number">Fatura Numarası</Label>
                  <Input
                    id="invoice-number"
                    value={newIncomeInvoice.invoice_number}
                    onChange={(e) => setNewIncomeInvoice({
                      ...newIncomeInvoice,
                      invoice_number: e.target.value
                    })}
                    placeholder="GF-2024-001"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Tutar</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={newIncomeInvoice.amount}
                    onChange={(e) => setNewIncomeInvoice({
                      ...newIncomeInvoice,
                      amount: parseFloat(e.target.value) || 0
                    })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={newIncomeInvoice.description}
                  onChange={(e) => setNewIncomeInvoice({
                    ...newIncomeInvoice,
                    description: e.target.value
                  })}
                  placeholder="Fatura açıklaması..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoice-date">Fatura Tarihi</Label>
                  <Input
                    id="invoice-date"
                    type="date"
                    value={newIncomeInvoice.invoice_date}
                    onChange={(e) => setNewIncomeInvoice({
                      ...newIncomeInvoice,
                      invoice_date: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="account">Cari Hesap</Label>
                  <Select 
                    value={newIncomeInvoice.account_id} 
                    onValueChange={(value) => setNewIncomeInvoice({
                      ...newIncomeInvoice,
                      account_id: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Cari hesap seç" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Cari hesap seçmeyin</SelectItem>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
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
                    <SelectValue placeholder="Ödeme durumu seç" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid">Ödenmedi</SelectItem>
                    <SelectItem value="paid">Ödendi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsIncomeDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit">
                  Gelir Ekle
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Gider Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Yeni Gider Faturası</DialogTitle>
              <DialogDescription>
                Yeni bir gider faturası oluşturun.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expense-invoice-number">Fatura Numarası</Label>
                  <Input
                    id="expense-invoice-number"
                    value={newExpenseInvoice.invoice_number}
                    onChange={(e) => setNewExpenseInvoice({
                      ...newExpenseInvoice,
                      invoice_number: e.target.value
                    })}
                    placeholder="GF-2024-001"
                  />
                </div>
                <div>
                  <Label htmlFor="expense-amount">Tutar</Label>
                  <Input
                    id="expense-amount"
                    type="number"
                    step="0.01"
                    value={newExpenseInvoice.amount}
                    onChange={(e) => setNewExpenseInvoice({
                      ...newExpenseInvoice,
                      amount: parseFloat(e.target.value) || 0
                    })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="expense-description">Açıklama</Label>
                <Textarea
                  id="expense-description"
                  value={newExpenseInvoice.description}
                  onChange={(e) => setNewExpenseInvoice({
                    ...newExpenseInvoice,
                    description: e.target.value
                  })}
                  placeholder="Fatura açıklaması..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expense-invoice-date">Fatura Tarihi</Label>
                  <Input
                    id="expense-invoice-date"
                    type="date"
                    value={newExpenseInvoice.invoice_date}
                    onChange={(e) => setNewExpenseInvoice({
                      ...newExpenseInvoice,
                      invoice_date: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="expense-account">Cari Hesap</Label>
                  <Select 
                    value={newExpenseInvoice.account_id} 
                    onValueChange={(value) => setNewExpenseInvoice({
                      ...newExpenseInvoice,
                      account_id: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Cari hesap seç" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Cari hesap seçmeyin</SelectItem>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
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
                    <SelectValue placeholder="Ödeme durumu seç" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid">Ödenmedi</SelectItem>
                    <SelectItem value="paid">Ödendi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit">
                  Gider Ekle
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Cari Hesap Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Yeni Cari Hesap</DialogTitle>
              <DialogDescription>
                Yeni bir cari hesap oluşturun.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAccountSubmit} className="space-y-4">
              <div>
                <Label htmlFor="account-name">Hesap Adı</Label>
                <Input
                  id="account-name"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({
                    ...newAccount,
                    name: e.target.value
                  })}
                  placeholder="Şirket/Kişi adı"
                />
              </div>

              <div>
                <Label htmlFor="account-phone">Telefon</Label>
                <Input
                  id="account-phone"
                  value={newAccount.phone}
                  onChange={(e) => setNewAccount({
                    ...newAccount,
                    phone: e.target.value
                  })}
                  placeholder="0555 123 45 67"
                />
              </div>

              <div>
                <Label htmlFor="account-address">Adres</Label>
                <Textarea
                  id="account-address"
                  value={newAccount.address}
                  onChange={(e) => setNewAccount({
                    ...newAccount,
                    address: e.target.value
                  })}
                  placeholder="Adres bilgisi..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="account-notes">Notlar</Label>
                <Textarea
                  id="account-notes"
                  value={newAccount.notes}
                  onChange={(e) => setNewAccount({
                    ...newAccount,
                    notes: e.target.value
                  })}
                  placeholder="Ek notlar..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAccountDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit">
                  Hesap Ekle
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtreler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Arama</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Fatura ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Cari Hesap</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Tüm hesaplar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm hesaplar</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Ödeme Durumu</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Tüm durumlar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm durumlar</SelectItem>
                  <SelectItem value="paid">Ödendi</SelectItem>
                  <SelectItem value="unpaid">Ödenmedi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tarih Aralığı</Label>
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
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Gelir Faturaları
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredIncomeInvoices.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fatura No</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Cari Hesap</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncomeInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.invoice_number || '-'}</TableCell>
                      <TableCell>{invoice.description}</TableCell>
                      <TableCell>{invoice.account?.name || '-'}</TableCell>
                      <TableCell className="font-medium text-green-600">
                        {formatCurrency(invoice.amount)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={invoice.payment_status === 'paid' ? 'default' : 'secondary'}>
                          {invoice.payment_status === 'paid' ? 'Ödendi' : 'Ödenmedi'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Gelir faturası bulunamadı.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            Gider Faturaları
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredExpenseInvoices.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fatura No</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Cari Hesap</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenseInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.invoice_number || '-'}</TableCell>
                      <TableCell>{invoice.description}</TableCell>
                      <TableCell>{invoice.account?.name || '-'}</TableCell>
                      <TableCell className="font-medium text-red-600">
                        {formatCurrency(invoice.amount)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={invoice.payment_status === 'paid' ? 'default' : 'secondary'}>
                          {invoice.payment_status === 'paid' ? 'Ödendi' : 'Ödenmedi'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Gider faturası bulunamadı.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Cari Hesaplar
          </CardTitle>
        </CardHeader>
        <CardContent>
          {accounts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hesap Adı</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Adres</TableHead>
                    <TableHead>Oluşturulma</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.name}</TableCell>
                      <TableCell>{account.phone || '-'}</TableCell>
                      <TableCell>{account.address || '-'}</TableCell>
                      <TableCell>
                        {format(new Date(account.created_at), 'dd/MM/yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Henüz cari hesap bulunmuyor.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
