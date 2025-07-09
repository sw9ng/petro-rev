
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useInvoices } from '@/hooks/useInvoices';
import { formatCurrency } from '@/lib/numberUtils';
import { Plus, FileText, Receipt, TrendingUp, TrendingDown, Edit, Trash2, Calendar, DollarSign, Users, Building } from 'lucide-react';
import { toast } from 'sonner';

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
    updateIncomeInvoice,
    updateExpenseInvoice,
    deleteIncomeInvoice,
    deleteExpenseInvoice,
    addAccount,
    refreshData
  } = useInvoices(companyId);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [accountBalances, setAccountBalances] = useState<Record<string, number>>({});
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedAccountTotal, setSelectedAccountTotal] = useState<number>(0);

  // Form states
  const [incomeForm, setIncomeForm] = useState({
    description: '',
    amount: '',
    invoice_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    payment_date: '',
    payment_status: 'unpaid' as 'paid' | 'unpaid',
    account_id: ''
  });

  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    invoice_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    payment_date: '',
    payment_status: 'unpaid' as 'paid' | 'unpaid',
    account_id: ''
  });

  const [accountForm, setAccountForm] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

  // Fetch account balances when accounts change
  useEffect(() => {
    const fetchAccountBalances = async () => {
      if (!accounts.length) return;

      const balances: Record<string, number> = {};
      
      for (const account of accounts) {
        // Get income invoices for this account
        const incomeTotal = incomeInvoices
          .filter(invoice => invoice.account_id === account.id)
          .reduce((sum, invoice) => sum + invoice.amount, 0);

        // Get expense invoices for this account
        const expenseTotal = expenseInvoices
          .filter(invoice => invoice.account_id === account.id)
          .reduce((sum, invoice) => sum + invoice.amount, 0);

        balances[account.id] = incomeTotal - expenseTotal;
      }

      setAccountBalances(balances);
    };

    fetchAccountBalances();
  }, [accounts, incomeInvoices, expenseInvoices]);

  // Update selected account total when selectedAccountId or invoices change
  useEffect(() => {
    if (!selectedAccountId) {
      setSelectedAccountTotal(0);
      return;
    }
    const incomeTotal = incomeInvoices
      .filter(invoice => invoice.account_id === selectedAccountId)
      .reduce((sum, invoice) => sum + invoice.amount, 0);
    const expenseTotal = expenseInvoices
      .filter(invoice => invoice.account_id === selectedAccountId)
      .reduce((sum, invoice) => sum + invoice.amount, 0);
    setSelectedAccountTotal(incomeTotal - expenseTotal);
  }, [selectedAccountId, incomeInvoices, expenseInvoices]);

  // Calculate totals
  const totalIncome = incomeInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalExpense = expenseInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const paidIncome = incomeInvoices.filter(inv => inv.payment_status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const paidExpense = expenseInvoices.filter(inv => inv.payment_status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const unpaidIncome = incomeInvoices.filter(inv => inv.payment_status === 'unpaid').reduce((sum, inv) => sum + inv.amount, 0);
  const unpaidExpense = expenseInvoices.filter(inv => inv.payment_status === 'unpaid').reduce((sum, inv) => sum + inv.amount, 0);

  const handleAddIncome = async () => {
    if (!incomeForm.description || !incomeForm.amount) {
      toast.error('Lütfen gerekli alanları doldurun');
      return;
    }

    const result = await addIncomeInvoice({
      ...incomeForm,
      amount: parseFloat(incomeForm.amount),
      payment_date: incomeForm.payment_date || undefined,
      account_id: incomeForm.account_id || undefined
    });

    if (result.error) {
      toast.error('Gelir faturası eklenirken hata oluştu');
    } else {
      toast.success('Gelir faturası başarıyla eklendi');
      setIncomeForm({
        description: '',
        amount: '',
        invoice_number: '',
        invoice_date: new Date().toISOString().split('T')[0],
        payment_date: '',
        payment_status: 'unpaid',
        account_id: ''
      });
      setIsIncomeDialogOpen(false);
    }
  };

  const handleAddExpense = async () => {
    if (!expenseForm.description || !expenseForm.amount) {
      toast.error('Lütfen gerekli alanları doldurun');
      return;
    }

    const result = await addExpenseInvoice({
      ...expenseForm,
      amount: parseFloat(expenseForm.amount),
      payment_date: expenseForm.payment_date || undefined,
      account_id: expenseForm.account_id || undefined
    });

    if (result.error) {
      toast.error('Gider faturası eklenirken hata oluştu');
    } else {
      toast.success('Gider faturası başarıyla eklendi');
      setExpenseForm({
        description: '',
        amount: '',
        invoice_number: '',
        invoice_date: new Date().toISOString().split('T')[0],
        payment_date: '',
        payment_status: 'unpaid',
        account_id: ''
      });
      setIsExpenseDialogOpen(false);
    }
  };

  const handleAddAccount = async () => {
    if (!accountForm.name) {
      toast.error('Cari hesap adı zorunludur');
      return;
    }

    const result = await addAccount(accountForm);

    if (result.error) {
      toast.error('Cari hesap eklenirken hata oluştu');
    } else {
      toast.success('Cari hesap başarıyla eklendi');
      setAccountForm({
        name: '',
        phone: '',
        address: '',
        notes: ''
      });
      setIsAccountDialogOpen(false);
    }
  };

  const handleEditIncome = (invoice: any) => {
    setEditingInvoice(invoice);
    setIncomeForm({
      description: invoice.description,
      amount: invoice.amount.toString(),
      invoice_number: invoice.invoice_number || '',
      invoice_date: invoice.invoice_date,
      payment_date: invoice.payment_date || '',
      payment_status: invoice.payment_status,
      account_id: invoice.account_id || ''
    });
    setIsIncomeDialogOpen(true);
  };

  const handleEditExpense = (invoice: any) => {
    setEditingInvoice(invoice);
    setExpenseForm({
      description: invoice.description,
      amount: invoice.amount.toString(),
      invoice_number: invoice.invoice_number || '',
      invoice_date: invoice.invoice_date,
      payment_date: invoice.payment_date || '',
      payment_status: invoice.payment_status,
      account_id: invoice.account_id || ''
    });
    setIsExpenseDialogOpen(true);
  };

  const handleUpdateIncome = async () => {
    if (!editingInvoice || !incomeForm.description || !incomeForm.amount) {
      toast.error('Lütfen gerekli alanları doldurun');
      return;
    }

    const result = await updateIncomeInvoice(editingInvoice.id, {
      ...incomeForm,
      amount: parseFloat(incomeForm.amount),
      payment_date: incomeForm.payment_date || undefined,
      account_id: incomeForm.account_id || undefined
    });

    if (result.error) {
      toast.error('Gelir faturası güncellenirken hata oluştu');
    } else {
      toast.success('Gelir faturası başarıyla güncellendi');
      setEditingInvoice(null);
      setIncomeForm({
        description: '',
        amount: '',
        invoice_number: '',
        invoice_date: new Date().toISOString().split('T')[0],
        payment_date: '',
        payment_status: 'unpaid',
        account_id: ''
      });
      setIsIncomeDialogOpen(false);
    }
  };

  const handleUpdateExpense = async () => {
    if (!editingInvoice || !expenseForm.description || !expenseForm.amount) {
      toast.error('Lütfen gerekli alanları doldurun');
      return;
    }

    const result = await updateExpenseInvoice(editingInvoice.id, {
      ...expenseForm,
      amount: parseFloat(expenseForm.amount),
      payment_date: expenseForm.payment_date || undefined,
      account_id: expenseForm.account_id || undefined
    });

    if (result.error) {
      toast.error('Gider faturası güncellenirken hata oluştu');
    } else {
      toast.success('Gider faturası başarıyla güncellendi');
      setEditingInvoice(null);
      setExpenseForm({
        description: '',
        amount: '',
        invoice_number: '',
        invoice_date: new Date().toISOString().split('T')[0],
        payment_date: '',
        payment_status: 'unpaid',
        account_id: ''
      });
      setIsExpenseDialogOpen(false);
    }
  };

  const handleDeleteIncome = async (invoiceId: string) => {
    const result = await deleteIncomeInvoice(invoiceId);

    if (result.error) {
      toast.error('Gelir faturası silinirken hata oluştu');
    } else {
      toast.success('Gelir faturası başarıyla silindi');
    }
  };

  const handleDeleteExpense = async (invoiceId: string) => {
    const result = await deleteExpenseInvoice(invoiceId);

    if (result.error) {
      toast.error('Gider faturası silinirken hata oluştu');
    } else {
      toast.success('Gider faturası başarıyla silindi');
    }
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Genel Bakış</TabsTrigger>
          <TabsTrigger value="income">Gelir Faturaları</TabsTrigger>
          <TabsTrigger value="expense">Gider Faturaları</TabsTrigger>
          <TabsTrigger value="accounts">Cari Hesaplar</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <DollarSign className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Net Bakiye</p>
                    <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(netBalance)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cari Hesaplar</p>
                    <p className="text-2xl font-bold">{accounts.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tahsil Edilen</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(paidIncome)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tahsil Edilmemiş</p>
                    <p className="text-lg font-bold text-orange-600">{formatCurrency(unpaidIncome)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ödenen Gider</p>
                    <p className="text-lg font-bold text-red-600">{formatCurrency(paidExpense)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ödenmemiş Gider</p>
                    <p className="text-lg font-bold text-yellow-600">{formatCurrency(unpaidExpense)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span>Son Gelir Faturaları</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {incomeInvoices.slice(0, 5).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{invoice.description}</p>
                        <p className="text-sm text-gray-500">
                          {invoice.account_id && accounts.find(a => a.id === invoice.account_id)?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(invoice.amount)}</p>
                        <Badge variant={invoice.payment_status === 'paid' ? 'default' : 'secondary'}>
                          {invoice.payment_status === 'paid' ? 'Tahsil Edildi' : 'Beklemede'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  <span>Son Gider Faturaları</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expenseInvoices.slice(0, 5).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{invoice.description}</p>
                        <p className="text-sm text-gray-500">
                          {invoice.account_id && accounts.find(a => a.id === invoice.account_id)?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">{formatCurrency(invoice.amount)}</p>
                        <Badge variant={invoice.payment_status === 'paid' ? 'default' : 'secondary'}>
                          {invoice.payment_status === 'paid' ? 'Ödendi' : 'Beklemede'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="income" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gelir Faturaları</h3>
            <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingInvoice(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Gelir Faturası
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{editingInvoice ? 'Gelir Faturası Düzenle' : 'Yeni Gelir Faturası'}</DialogTitle>
                  <DialogDescription>
                    {editingInvoice ? 'Mevcut gelir faturasını düzenleyin' : 'Yeni bir gelir faturası oluşturun'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Açıklama</Label>
                    <Input
                      placeholder="Fatura açıklaması"
                      value={incomeForm.description}
                      onChange={(e) => setIncomeForm({...incomeForm, description: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tutar</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={incomeForm.amount}
                        onChange={(e) => setIncomeForm({...incomeForm, amount: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fatura No</Label>
                      <Input
                        placeholder="Fatura numarası"
                        value={incomeForm.invoice_number}
                        onChange={(e) => setIncomeForm({...incomeForm, invoice_number: e.target.value})}
                      />
                    </div>
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
                      <Label>Ödeme Tarihi</Label>
                      <Input
                        type="date"
                        value={incomeForm.payment_date}
                        onChange={(e) => setIncomeForm({...incomeForm, payment_date: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ödeme Durumu</Label>
                      <Select 
                        value={incomeForm.payment_status} 
                        onValueChange={(value: 'paid' | 'unpaid') => setIncomeForm({...incomeForm, payment_status: value})}
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
                    <div className="space-y-2">
                      <Label>Cari Hesap</Label>
                      <Select 
                        value={incomeForm.account_id} 
                        onValueChange={(value) => setIncomeForm({...incomeForm, account_id: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Cari hesap seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Cari hesap yok</SelectItem>
                          {accounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsIncomeDialogOpen(false)}>
                    İptal
                  </Button>
                  <Button onClick={editingInvoice ? handleUpdateIncome : handleAddIncome}>
                    {editingInvoice ? 'Güncelle' : 'Kaydet'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Cari Hesap</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomeInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{new Date(invoice.invoice_date).toLocaleDateString('tr-TR')}</TableCell>
                      <TableCell>{invoice.description}</TableCell>
                      <TableCell>
                        {invoice.account_id ? accounts.find(a => a.id === invoice.account_id)?.name || 'Bilinmiyor' : '-'}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={invoice.payment_status === 'paid' ? 'default' : 'secondary'}>
                          {invoice.payment_status === 'paid' ? 'Tahsil Edildi' : 'Beklemede'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditIncome(invoice)}>
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
                                <AlertDialogAction onClick={() => handleDeleteIncome(invoice.id)}>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expense" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gider Faturaları</h3>
            <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingInvoice(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Gider Faturası
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{editingInvoice ? 'Gider Faturası Düzenle' : 'Yeni Gider Faturası'}</DialogTitle>
                  <DialogDescription>
                    {editingInvoice ? 'Mevcut gider faturasını düzenleyin' : 'Yeni bir gider faturası oluşturun'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Açıklama</Label>
                    <Input
                      placeholder="Fatura açıklaması"
                      value={expenseForm.description}
                      onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tutar</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={expenseForm.amount}
                        onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fatura No</Label>
                      <Input
                        placeholder="Fatura numarası"
                        value={expenseForm.invoice_number}
                        onChange={(e) => setExpenseForm({...expenseForm, invoice_number: e.target.value})}
                      />
                    </div>
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
                      <Label>Ödeme Tarihi</Label>
                      <Input
                        type="date"
                        value={expenseForm.payment_date}
                        onChange={(e) => setExpenseForm({...expenseForm, payment_date: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ödeme Durumu</Label>
                      <Select 
                        value={expenseForm.payment_status} 
                        onValueChange={(value: 'paid' | 'unpaid') => setExpenseForm({...expenseForm, payment_status: value})}
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
                    <div className="space-y-2">
                      <Label>Cari Hesap</Label>
                      <Select 
                        value={expenseForm.account_id} 
                        onValueChange={(value) => setExpenseForm({...expenseForm, account_id: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Cari hesap seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Cari hesap yok</SelectItem>
                          {accounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>
                    İptal
                  </Button>
                  <Button onClick={editingInvoice ? handleUpdateExpense : handleAddExpense}>
                    {editingInvoice ? 'Güncelle' : 'Kaydet'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Cari Hesap</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{new Date(invoice.invoice_date).toLocaleDateString('tr-TR')}</TableCell>
                      <TableCell>{invoice.description}</TableCell>
                      <TableCell>
                        {invoice.account_id ? accounts.find(a => a.id === invoice.account_id)?.name || 'Bilinmiyor' : '-'}
                      </TableCell>
                      <TableCell className="font-medium text-red-600">{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={invoice.payment_status === 'paid' ? 'default' : 'secondary'}>
                          {invoice.payment_status === 'paid' ? 'Ödendi' : 'Beklemede'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditExpense(invoice)}>
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
                                <AlertDialogAction onClick={() => handleDeleteExpense(invoice.id)}>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Cari Hesaplar</h3>
            <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Cari Hesap
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Yeni Cari Hesap</DialogTitle>
                  <DialogDescription>Yeni bir cari hesap oluşturun</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Ad</Label>
                    <Input
                      placeholder="Cari hesap adı"
                      value={accountForm.name}
                      onChange={(e) => setAccountForm({...accountForm, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefon</Label>
                    <Input
                      placeholder="Telefon numarası"
                      value={accountForm.phone}
                      onChange={(e) => setAccountForm({...accountForm, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Adres</Label>
                    <Textarea
                      placeholder="Adres"
                      value={accountForm.address}
                      onChange={(e) => setAccountForm({...accountForm, address: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notlar</Label>
                    <Textarea
                      placeholder="Notlar"
                      value={accountForm.notes}
                      onChange={(e) => setAccountForm({...accountForm, notes: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAccountDialogOpen(false)}>
                    İptal
                  </Button>
                  <Button onClick={handleAddAccount}>
                    Kaydet
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mb-4">
            <Label htmlFor="select-account">Cari Hesap Seç</Label>
            <Select
              value={selectedAccountId}
              onValueChange={setSelectedAccountId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Cari hesap seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Seçim yok</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedAccountId && selectedAccountId !== 'none' && (
              <div className="mt-2 text-right text-lg font-semibold">
                Seçilen Cari Hesap Bakiyesi: {formatCurrency(selectedAccountTotal)}
              </div>
            )}
          </div>

          <div className="grid gap-4">
            {accounts.map((account) => (
              <Card key={account.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{account.name}</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        {account.phone && <p>📞 {account.phone}</p>}
                        {account.address && <p>📍 {account.address}</p>}
                        {account.notes && <p>📝 {account.notes}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Bakiye</div>
                      <div className={`text-2xl font-bold ${
                        accountBalances[account.id] >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(accountBalances[account.id] || 0)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Gelir: {formatCurrency(incomeInvoices.filter(i => i.account_id === account.id).reduce((sum, i) => sum + i.amount, 0))} | 
                        Gider: {formatCurrency(expenseInvoices.filter(i => i.account_id === account.id).reduce((sum, i) => sum + i.amount, 0))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {accounts.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Henüz cari hesap bulunmuyor</p>
                <p className="text-sm text-gray-400 mt-2">Yeni cari hesap eklemek için yukarıdaki butonu kullanın</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
