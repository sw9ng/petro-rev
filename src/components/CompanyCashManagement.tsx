import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useInvoices } from '@/hooks/useInvoices';
import { formatCurrency } from '@/lib/numberUtils';
import { Plus, TrendingUp, TrendingDown, Building2, Users, Eye, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { CompanyAccountDetail } from './CompanyAccountDetail';

interface CompanyCashManagementProps {
  companyId: string;
}

type PaymentStatus = 'paid' | 'unpaid' | 'partial';

export const CompanyCashManagement = ({ companyId }: CompanyCashManagementProps) => {
  const { 
    accounts,
    incomeInvoices, 
    expenseInvoices, 
    loading, 
    addIncomeInvoice, 
    addExpenseInvoice,
    addAccount,
    updateIncomeInvoice,
    updateExpenseInvoice,
    deleteIncomeInvoice,
    deleteExpenseInvoice,
    deleteAccount,
    refreshData
  } = useInvoices(companyId);

  // States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form states
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  
  // Income form
  const [incomeForm, setIncomeForm] = useState({
    account_id: '',
    amount: '',
    description: '',
    invoice_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    payment_status: 'unpaid' as PaymentStatus,
    payment_date: ''
  });

  // Expense form
  const [expenseForm, setExpenseForm] = useState({
    account_id: '',
    amount: '',
    description: '',
    invoice_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    payment_status: 'unpaid' as PaymentStatus,
    payment_date: ''
  });

  // Account form
  const [accountForm, setAccountForm] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

  // Handle account detail view
  if (selectedAccount) {
    return (
      <CompanyAccountDetail 
        accountId={selectedAccount}
        companyId={companyId}
        onBack={() => setSelectedAccount(null)}
      />
    );
  }

  const handleAddIncome = async () => {
    if (!incomeForm.amount || !incomeForm.description) {
      toast.error('Lütfen gerekli alanları doldurun');
      return;
    }

    const { error } = await addIncomeInvoice({
      ...incomeForm,
      amount: parseFloat(incomeForm.amount),
      account_id: incomeForm.account_id || null,
      payment_date: incomeForm.payment_date || null
    });

    if (error) {
      toast.error('Gelir faturası eklenirken hata oluştu');
    } else {
      toast.success('Gelir faturası başarıyla eklendi');
      setIncomeForm({
        account_id: '',
        amount: '',
        description: '',
        invoice_number: '',
        invoice_date: new Date().toISOString().split('T')[0],
        payment_status: 'unpaid',
        payment_date: ''
      });
      setIsIncomeDialogOpen(false);
    }
  };

  const handleAddExpense = async () => {
    if (!expenseForm.amount || !expenseForm.description) {
      toast.error('Lütfen gerekli alanları doldurun');
      return;
    }

    const { error } = await addExpenseInvoice({
      ...expenseForm,
      amount: parseFloat(expenseForm.amount),
      account_id: expenseForm.account_id || null,
      payment_date: expenseForm.payment_date || null
    });

    if (error) {
      toast.error('Gider faturası eklenirken hata oluştu');
    } else {
      toast.success('Gider faturası başarıyla eklendi');
      setExpenseForm({
        account_id: '',
        amount: '',
        description: '',
        invoice_number: '',
        invoice_date: new Date().toISOString().split('T')[0],
        payment_status: 'unpaid',
        payment_date: ''
      });
      setIsExpenseDialogOpen(false);
    }
  };

  const handleAddAccount = async () => {
    if (!accountForm.name) {
      toast.error('Cari hesap adı zorunludur');
      return;
    }

    const { error } = await addAccount({
      ...accountForm,
      phone: accountForm.phone || null,
      address: accountForm.address || null,
      notes: accountForm.notes || null
    });

    if (error) {
      toast.error('Cari hesap eklenirken hata oluştu');
    } else {
      toast.success('Cari hesap başarıyla eklendi');
      setAccountForm({ name: '', phone: '', address: '', notes: '' });
      setIsAccountDialogOpen(false);
    }
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

  // Calculations
  const totalIncome = incomeInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalExpense = expenseInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const netIncome = totalIncome - totalExpense;

  // Account calculations
  const accountsWithBalances = accounts.map(account => {
    const accountIncomes = incomeInvoices.filter(inv => inv.account_id === account.id);
    const accountExpenses = expenseInvoices.filter(inv => inv.account_id === account.id);
    const income = accountIncomes.reduce((sum, inv) => sum + inv.amount, 0);
    const expense = accountExpenses.reduce((sum, inv) => sum + inv.amount, 0);
    const balance = income - expense;
    
    return {
      ...account,
      income,
      expense,
      balance,
      transactionCount: accountIncomes.length + accountExpenses.length
    };
  });

  // Filtered accounts
  const filteredAccounts = accountsWithBalances.filter(account =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Panel</TabsTrigger>
          <TabsTrigger value="accounts">Cari Listesi</TabsTrigger>
          <TabsTrigger value="income">Gelir Faturaları</TabsTrigger>
          <TabsTrigger value="expense">Gider Faturaları</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Dashboard Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Toplam Gider</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Net Gelir</p>
                    <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(netIncome)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4">
            <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Gelir Faturası Ekle</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Yeni Gelir Faturası</DialogTitle>
                  <DialogDescription>Gelir faturası bilgilerini girin</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Cari Hesap (Opsiyonel)</Label>
                    <Select value={incomeForm.account_id} onValueChange={(value) => setIncomeForm({...incomeForm, account_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Cari hesap seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Genel Gelir</SelectItem>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tutar</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={incomeForm.amount}
                        onChange={(e) => setIncomeForm({...incomeForm, amount: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fatura Numarası</Label>
                      <Input
                        value={incomeForm.invoice_number}
                        onChange={(e) => setIncomeForm({...incomeForm, invoice_number: e.target.value})}
                        placeholder="Fatura no"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Açıklama</Label>
                    <Textarea
                      value={incomeForm.description}
                      onChange={(e) => setIncomeForm({...incomeForm, description: e.target.value})}
                      placeholder="Fatura açıklaması"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fatura Tarihi</Label>
                      <Input
                        type="date"
                        value={incomeForm.invoice_date}
                        onChange={(e) => setIncomeForm({...incomeForm, invoice_date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ödeme Durumu</Label>
                      <Select value={incomeForm.payment_status} onValueChange={(value: PaymentStatus) => setIncomeForm({...incomeForm, payment_status: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unpaid">Ödenmedi</SelectItem>
                          <SelectItem value="paid">Ödendi</SelectItem>
                          <SelectItem value="partial">Kısmi Ödendi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {incomeForm.payment_status === 'paid' && (
                    <div className="space-y-2">
                      <Label>Ödeme Tarihi</Label>
                      <Input
                        type="date"
                        value={incomeForm.payment_date}
                        onChange={(e) => setIncomeForm({...incomeForm, payment_date: e.target.value})}
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsIncomeDialogOpen(false)}>İptal</Button>
                  <Button onClick={handleAddIncome}>Ekle</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Gider Faturası Ekle</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Yeni Gider Faturası</DialogTitle>
                  <DialogDescription>Gider faturası bilgilerini girin</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Cari Hesap (Opsiyonel)</Label>
                    <Select value={expenseForm.account_id} onValueChange={(value) => setExpenseForm({...expenseForm, account_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Cari hesap seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Genel Gider</SelectItem>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tutar</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={expenseForm.amount}
                        onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fatura Numarası</Label>
                      <Input
                        value={expenseForm.invoice_number}
                        onChange={(e) => setExpenseForm({...expenseForm, invoice_number: e.target.value})}
                        placeholder="Fatura no"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Açıklama</Label>
                    <Textarea
                      value={expenseForm.description}
                      onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                      placeholder="Fatura açıklaması"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fatura Tarihi</Label>
                      <Input
                        type="date"
                        value={expenseForm.invoice_date}
                        onChange={(e) => setExpenseForm({...expenseForm, invoice_date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ödeme Durumu</Label>
                      <Select value={expenseForm.payment_status} onValueChange={(value: PaymentStatus) => setExpenseForm({...expenseForm, payment_status: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unpaid">Ödenmedi</SelectItem>
                          <SelectItem value="paid">Ödendi</SelectItem>
                          <SelectItem value="partial">Kısmi Ödendi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {expenseForm.payment_status === 'paid' && (
                    <div className="space-y-2">
                      <Label>Ödeme Tarihi</Label>
                      <Input
                        type="date"
                        value={expenseForm.payment_date}
                        onChange={(e) => setExpenseForm({...expenseForm, payment_date: e.target.value})}
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>İptal</Button>
                  <Button onClick={handleAddExpense}>Ekle</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Cari Hesaplar</h3>
            <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Cari Hesap Ekle</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Yeni Cari Hesap</DialogTitle>
                  <DialogDescription>Cari hesap bilgilerini girin</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="account-name">Cari Hesap Adı</Label>
                    <Input
                      id="account-name"
                      value={accountForm.name}
                      onChange={(e) => setAccountForm({...accountForm, name: e.target.value})}
                      placeholder="Müşteri / Tedarikçi Adı"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="account-phone">Telefon</Label>
                      <Input
                        id="account-phone"
                        value={accountForm.phone}
                        onChange={(e) => setAccountForm({...accountForm, phone: e.target.value})}
                        placeholder="Telefon Numarası"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account-address">Adres</Label>
                      <Input
                        id="account-address"
                        value={accountForm.address}
                        onChange={(e) => setAccountForm({...accountForm, address: e.target.value})}
                        placeholder="Adres Bilgisi"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-notes">Notlar</Label>
                    <Textarea
                      id="account-notes"
                      value={accountForm.notes}
                      onChange={(e) => setAccountForm({...accountForm, notes: e.target.value})}
                      placeholder="Ek Notlar"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAccountDialogOpen(false)}>İptal</Button>
                  <Button onClick={handleAddAccount}>Ekle</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari hesap ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid gap-4">
            {filteredAccounts.map((account) => (
              <Card 
                key={account.id} 
                className="hover:shadow-md transition-shadow cursor-pointer" 
                onClick={() => setSelectedAccount(account.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold hover:text-blue-600 transition-colors">
                        {account.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {account.transactionCount} işlem • Detay için tıklayın
                      </p>
                      {account.phone && (
                        <p className="text-sm text-gray-500 mt-1">{account.phone}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        account.balance > 0 ? 'text-green-600' : 
                        account.balance < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {account.balance > 0 ? '+' : ''}{formatCurrency(account.balance)}
                      </div>
                      <p className="text-sm text-gray-600">
                        {account.balance > 0 ? 'Alacak' : account.balance < 0 ? 'Borç' : 'Denge'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>
                        Gelir: {formatCurrency(account.income)} | Gider: {formatCurrency(account.expense)}
                      </span>
                      <Button variant="ghost" size="sm" className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        Detay
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAccounts.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Cari hesap bulunamadı' : 'Henüz cari hesap yok'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Arama kriterlerinize uygun cari hesap bulunamadı' 
                  : 'İlk cari hesabı ekleyin'}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="income" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gelir Faturaları</CardTitle>
              <CardDescription>Tüm gelir faturaları</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Fatura No</TableHead>
                    <TableHead>Cari Hesap</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Ödeme Tarihi</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomeInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{new Date(invoice.invoice_date).toLocaleDateString('tr-TR')}</TableCell>
                      <TableCell>{invoice.invoice_number || '-'}</TableCell>
                      <TableCell>
                        {invoice.account_id ? (
                          accounts.find(acc => acc.id === invoice.account_id)?.name || 'Bilinmeyen'
                        ) : (
                          'Genel Gelir'
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell>{getPaymentStatusBadge(invoice.payment_status)}</TableCell>
                      <TableCell>
                        {invoice.payment_date ? new Date(invoice.payment_date).toLocaleDateString('tr-TR') : '-'}
                      </TableCell>
                      <TableCell>{invoice.description || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Faturayı Sil</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bu gelir faturasını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>İptal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteIncomeInvoice(invoice.id)}>
                                  Sil
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {incomeInvoices.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Henüz gelir faturası yok
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expense" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gider Faturaları</CardTitle>
              <CardDescription>Tüm gider faturaları</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Fatura No</TableHead>
                    <TableHead>Cari Hesap</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Ödeme Tarihi</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{new Date(invoice.invoice_date).toLocaleDateString('tr-TR')}</TableCell>
                      <TableCell>{invoice.invoice_number || '-'}</TableCell>
                      <TableCell>
                        {invoice.account_id ? (
                          accounts.find(acc => acc.id === invoice.account_id)?.name || 'Bilinmeyen'
                        ) : (
                          'Genel Gider'
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell>{getPaymentStatusBadge(invoice.payment_status)}</TableCell>
                      <TableCell>
                        {invoice.payment_date ? new Date(invoice.payment_date).toLocaleDateString('tr-TR') : '-'}
                      </TableCell>
                      <TableCell>{invoice.description || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Faturayı Sil</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bu gider faturasını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>İptal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteExpenseInvoice(invoice.id)}>
                                  Sil
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {expenseInvoices.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Henüz gider faturası yok
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
