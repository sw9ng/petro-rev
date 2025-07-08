import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  Users, 
  Calendar,
  Crown,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useInvoices, type Invoice, type CompanyAccount } from '@/hooks/useInvoices';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/numberUtils';

interface CompanyCashManagementProps {
  company: {
    id: string;
    name: string;
    description?: string;
  };
  onBack: () => void;
}

export const CompanyCashManagement = ({ company, onBack }: CompanyCashManagementProps) => {
  const { 
    incomeInvoices, 
    expenseInvoices, 
    accounts, 
    loading, 
    addIncomeInvoice, 
    addExpenseInvoice, 
    addAccount,
    updateInvoicePaymentStatus
  } = useInvoices(company.id);
  const { toast } = useToast();

  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('');

  const [incomeFormData, setIncomeFormData] = useState({
    account_id: '',
    invoice_number: '',
    description: '',
    amount: '',
    invoice_date: new Date().toISOString().split('T')[0],
    payment_status: 'unpaid' as 'paid' | 'unpaid',
    payment_date: ''
  });

  const [expenseFormData, setExpenseFormData] = useState({
    account_id: '',
    invoice_number: '',
    description: '',
    amount: '',
    invoice_date: new Date().toISOString().split('T')[0],
    payment_status: 'unpaid' as 'paid' | 'unpaid',
    payment_date: ''
  });

  const [accountFormData, setAccountFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

  const handleIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!incomeFormData.description.trim() || !incomeFormData.amount) {
      toast({
        title: "Hata",
        description: "Açıklama ve tutar gereklidir.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await addIncomeInvoice({
      account_id: incomeFormData.account_id || undefined,
      invoice_number: incomeFormData.invoice_number,
      description: incomeFormData.description,
      amount: parseFloat(incomeFormData.amount),
      invoice_date: incomeFormData.invoice_date,
      payment_status: incomeFormData.payment_status,
      payment_date: incomeFormData.payment_status === 'paid' ? incomeFormData.payment_date : undefined
    });
    
    if (error) {
      toast({
        title: "Hata",
        description: "Gelir faturası eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Başarılı",
        description: "Gelir faturası başarıyla eklendi.",
      });
      setIncomeFormData({
        account_id: '',
        invoice_number: '',
        description: '',
        amount: '',
        invoice_date: new Date().toISOString().split('T')[0],
        payment_status: 'unpaid',
        payment_date: ''
      });
      setIsIncomeDialogOpen(false);
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!expenseFormData.description.trim() || !expenseFormData.amount) {
      toast({
        title: "Hata",
        description: "Açıklama ve tutar gereklidir.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await addExpenseInvoice({
      account_id: expenseFormData.account_id || undefined,
      invoice_number: expenseFormData.invoice_number,
      description: expenseFormData.description,
      amount: parseFloat(expenseFormData.amount),
      invoice_date: expenseFormData.invoice_date,
      payment_status: expenseFormData.payment_status,
      payment_date: expenseFormData.payment_status === 'paid' ? expenseFormData.payment_date : undefined
    });
    
    if (error) {
      toast({
        title: "Hata",
        description: "Gider faturası eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Başarılı",
        description: "Gider faturası başarıyla eklendi.",
      });
      setExpenseFormData({
        account_id: '',
        invoice_number: '',
        description: '',
        amount: '',
        invoice_date: new Date().toISOString().split('T')[0],
        payment_status: 'unpaid',
        payment_date: ''
      });
      setIsExpenseDialogOpen(false);
    }
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountFormData.name.trim()) {
      toast({
        title: "Hata",
        description: "Cari adı gereklidir.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await addAccount(accountFormData);
    
    if (error) {
      toast({
        title: "Hata",
        description: "Cari hesap eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Başarılı",
        description: "Cari hesap başarıyla eklendi.",
      });
      setAccountFormData({ name: '', phone: '', address: '', notes: '' });
      setIsAccountDialogOpen(false);
    }
  };

  const handlePaymentStatusChange = async (
    invoiceId: string, 
    type: 'income' | 'expense', 
    currentStatus: 'paid' | 'unpaid'
  ) => {
    const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
    const paymentDate = newStatus === 'paid' ? new Date().toISOString().split('T')[0] : undefined;
    
    const { error } = await updateInvoicePaymentStatus(invoiceId, type, newStatus, paymentDate);
    
    if (error) {
      toast({
        title: "Hata",
        description: "Ödeme durumu güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Başarılı",
        description: `Fatura ${newStatus === 'paid' ? 'ödendi' : 'ödenmedi'} olarak işaretlendi.`,
      });
    }
  };

  const filterInvoicesByDate = (invoices: Invoice[]) => {
    if (!dateFilter) return invoices;
    return invoices.filter(invoice => 
      invoice.invoice_date.includes(dateFilter)
    );
  };

  const getAccountName = (accountId?: string) => {
    if (!accountId) return '-';
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.name : '-';
  };

  const totalIncome = incomeInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalExpense = expenseInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const paidIncome = incomeInvoices.filter(i => i.payment_status === 'paid').reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidExpense = expenseInvoices.filter(i => i.payment_status === 'paid').reduce((sum, invoice) => sum + invoice.amount, 0);
  const unpaidIncome = incomeInvoices.filter(i => i.payment_status === 'unpaid').reduce((sum, invoice) => sum + invoice.amount, 0);
  const unpaidExpense = expenseInvoices.filter(i => i.payment_status === 'unpaid').reduce((sum, invoice) => sum + invoice.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Geri</span>
        </Button>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <span>{company.name} - Kasa Yönetimi</span>
              <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            </h2>
            <p className="text-sm text-gray-600">Gelir ve gider faturalarınızı takip edin</p>
          </div>
        </div>
      </div>

      {/* Finansal Özet */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Gelir</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(totalIncome)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Gider</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(totalExpense)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                netBalance >= 0 ? 'bg-blue-100' : 'bg-orange-100'
              }`}>
                <Building2 className={`h-5 w-5 ${
                  netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Net Bakiye</p>
                <p className={`text-lg font-bold ${
                  netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`}>
                  {formatCurrency(netBalance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Cari Hesap</p>
                <p className="text-lg font-bold text-purple-600">{accounts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ödeme Durumu Özeti */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-sm border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Ödeme Durumu - Gelir</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Ödendi
              </span>
              <span className="font-medium text-green-600">{formatCurrency(paidIncome)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-orange-600 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Ödenmedi
              </span>
              <span className="font-medium text-orange-600">{formatCurrency(unpaidIncome)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Ödeme Durumu - Gider</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Ödendi
              </span>
              <span className="font-medium text-green-600">{formatCurrency(paidExpense)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-orange-600 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Ödenmedi
              </span>
              <span className="font-medium text-orange-600">{formatCurrency(unpaidExpense)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtre ve Aksiyonlar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <Input
            type="month"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-auto"
            placeholder="Tarih filtresi"
          />
          {dateFilter && (
            <Button variant="outline" size="sm" onClick={() => setDateFilter('')}>
              Temizle
            </Button>
          )}
        </div>

        <div className="flex space-x-2">
          <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Cari Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Yeni Cari Hesap</DialogTitle>
                <DialogDescription>
                  Faturalarınızda kullanmak üzere yeni bir cari hesap ekleyin.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAccountSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cari Adı *
                  </label>
                  <Input
                    value={accountFormData.name}
                    onChange={(e) => setAccountFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Cari hesap adı"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon
                  </label>
                  <Input
                    value={accountFormData.phone}
                    onChange={(e) => setAccountFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Telefon numarası"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adres
                  </label>
                  <Textarea
                    value={accountFormData.address}
                    onChange={(e) => setAccountFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Adres bilgisi"
                    rows={2}
                  />
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAccountDialogOpen(false)}
                    className="flex-1"
                  >
                    İptal
                  </Button>
                  <Button type="submit" className="flex-1">
                    Ekle
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Gelir Faturası
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-green-600">Yeni Gelir Faturası</DialogTitle>
                <DialogDescription>
                  Şirketinizin gelir faturası bilgilerini giriniz.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleIncomeSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama *</label>
                  <Input
                    value={incomeFormData.description}
                    onChange={(e) => setIncomeFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Fatura açıklaması"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cari</label>
                  <Select
                    value={incomeFormData.account_id}
                    onValueChange={(value) => setIncomeFormData(prev => ({ ...prev, account_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Cari seçiniz (opsiyonel)" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tutar *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={incomeFormData.amount}
                      onChange={(e) => setIncomeFormData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fatura Tarihi</label>
                    <Input
                      type="date"
                      value={incomeFormData.invoice_date}
                      onChange={(e) => setIncomeFormData(prev => ({ ...prev, invoice_date: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ödeme Durumu</label>
                  <Select
                    value={incomeFormData.payment_status}
                    onValueChange={(value: 'paid' | 'unpaid') => setIncomeFormData(prev => ({ ...prev, payment_status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid">Ödenmedi</SelectItem>
                      <SelectItem value="paid">Ödendi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {incomeFormData.payment_status === 'paid' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ödeme Tarihi</label>
                    <Input
                      type="date"
                      value={incomeFormData.payment_date}
                      onChange={(e) => setIncomeFormData(prev => ({ ...prev, payment_date: e.target.value }))}
                    />
                  </div>
                )}
                <div className="flex space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsIncomeDialogOpen(false)}
                    className="flex-1"
                  >
                    İptal
                  </Button>
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                    Ekle
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4 mr-2" />
                Gider Faturası
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-red-600">Yeni Gider Faturası</DialogTitle>
                <DialogDescription>
                  Şirketinizin gider faturası bilgilerini giriniz.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleExpenseSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama *</label>
                  <Input
                    value={expenseFormData.description}
                    onChange={(e) => setExpenseFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Fatura açıklaması"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cari</label>
                  <Select
                    value={expenseFormData.account_id}
                    onValueChange={(value) => setExpenseFormData(prev => ({ ...prev, account_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Cari seçiniz (opsiyonel)" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tutar *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={expenseFormData.amount}
                      onChange={(e) => setExpenseFormData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fatura Tarihi</label>
                    <Input
                      type="date"
                      value={expenseFormData.invoice_date}
                      onChange={(e) => setExpenseFormData(prev => ({ ...prev, invoice_date: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ödeme Durumu</label>
                  <Select
                    value={expenseFormData.payment_status}
                    onValueChange={(value: 'paid' | 'unpaid') => setExpenseFormData(prev => ({ ...prev, payment_status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid">Ödenmedi</SelectItem>
                      <SelectItem value="paid">Ödendi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {expenseFormData.payment_status === 'paid' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ödeme Tarihi</label>
                    <Input
                      type="date"
                      value={expenseFormData.payment_date}
                      onChange={(e) => setExpenseFormData(prev => ({ ...prev, payment_date: e.target.value }))}
                    />
                  </div>
                )}
                <div className="flex space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsExpenseDialogOpen(false)}
                    className="flex-1"
                  >
                    İptal
                  </Button>
                  <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700">
                    Ekle
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Fatura Listeleri */}
      <Tabs defaultValue="income" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="income" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Gelir Faturaları ({filterInvoicesByDate(incomeInvoices).length})</span>
          </TabsTrigger>
          <TabsTrigger value="expense" className="flex items-center space-x-2">
            <TrendingDown className="h-4 w-4" />
            <span>Gider Faturaları ({filterInvoicesByDate(expenseInvoices).length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="income">
          <Card className="shadow-sm border">
            <CardHeader>
              <CardTitle className="text-green-600">Gelir Faturaları</CardTitle>
              <CardDescription>
                Şirketinizin gelir faturalarını görüntüleyin ve yönetin
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filterInvoicesByDate(incomeInvoices).length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Açıklama</TableHead>
                        <TableHead>Cari</TableHead>
                        <TableHead>Fatura Tarihi</TableHead>
                        <TableHead>Tutar</TableHead>
                        <TableHead>Ödeme Durumu</TableHead>
                        <TableHead>Ödeme Tarihi</TableHead>
                        <TableHead>İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterInvoicesByDate(incomeInvoices).map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.description}</TableCell>
                          <TableCell>
                            {getAccountName((invoice as any).account_id)}
                          </TableCell>
                          <TableCell>
                            {new Date(invoice.invoice_date).toLocaleDateString('tr-TR')}
                          </TableCell>
                          <TableCell className="font-bold text-green-600">
                            {formatCurrency(invoice.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={invoice.payment_status === 'paid' ? 'default' : 'secondary'}
                              className={invoice.payment_status === 'paid' 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : 'bg-orange-100 text-orange-800 border-orange-200'
                              }
                            >
                              {invoice.payment_status === 'paid' 
                                ? <><CheckCircle className="h-3 w-3 mr-1" />Ödendi</> 
                                : <><Clock className="h-3 w-3 mr-1" />Ödenmedi</>
                              }
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {invoice.payment_date 
                              ? new Date(invoice.payment_date).toLocaleDateString('tr-TR') 
                              : '-'
                            }
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePaymentStatusChange(invoice.id, 'income', invoice.payment_status)}
                            >
                              {invoice.payment_status === 'paid' ? 'Ödenmedi İşaretle' : 'Ödendi İşaretle'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz gelir faturası yok</h3>
                  <p className="text-gray-600">İlk gelir faturanızı eklemek için "Gelir Faturası" butonuna tıklayın.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expense">
          <Card className="shadow-sm border">
            <CardHeader>
              <CardTitle className="text-red-600">Gider Faturaları</CardTitle>
              <CardDescription>
                Şirketinizin gider faturalarını görüntüleyin ve yönetin
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filterInvoicesByDate(expenseInvoices).length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Açıklama</TableHead>
                        <TableHead>Cari</TableHead>
                        <TableHead>Fatura Tarihi</TableHead>
                        <TableHead>Tutar</TableHead>
                        <TableHead>Ödeme Durumu</TableHead>
                        <TableHead>Ödeme Tarihi</TableHead>
                        <TableHead>İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterInvoicesByDate(expenseInvoices).map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.description}</TableCell>
                          <TableCell>
                            {getAccountName((invoice as any).account_id)}
                          </TableCell>
                          <TableCell>
                            {new Date(invoice.invoice_date).toLocaleDateString('tr-TR')}
                          </TableCell>
                          <TableCell className="font-bold text-red-600">
                            {formatCurrency(invoice.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={invoice.payment_status === 'paid' ? 'default' : 'secondary'}
                              className={invoice.payment_status === 'paid' 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : 'bg-orange-100 text-orange-800 border-orange-200'
                              }
                            >
                              {invoice.payment_status === 'paid' 
                                ? <><CheckCircle className="h-3 w-3 mr-1" />Ödendi</> 
                                : <><Clock className="h-3 w-3 mr-1" />Ödenmedi</>
                              }
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {invoice.payment_date 
                              ? new Date(invoice.payment_date).toLocaleDateString('tr-TR') 
                              : '-'
                            }
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePaymentStatusChange(invoice.id, 'expense', invoice.payment_status)}
                            >
                              {invoice.payment_status === 'paid' ? 'Ödenmedi İşaretle' : 'Ödendi İşaretle'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz gider faturası yok</h3>
                  <p className="text-gray-600">İlk gider faturanızı eklemek için "Gider Faturası" butonuna tıklayın.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
