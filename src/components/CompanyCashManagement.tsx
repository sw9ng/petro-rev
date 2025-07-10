import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useInvoices, Invoice, CompanyAccount } from '@/hooks/useInvoices';
import { formatCurrency } from '@/lib/numberUtils';
import { Plus, FileText, ArrowDown, ArrowUp } from 'lucide-react';
import { toast } from 'sonner';

export const CompanyCashManagement = ({ companyId }: { companyId: string }) => {
  const { incomeInvoices, expenseInvoices, accounts, loading, addIncomeInvoice, addExpenseInvoice } = useInvoices(companyId);
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [unpaidExpensesDialogOpen, setUnpaidExpensesDialogOpen] = useState(false);
  const [incomeFormData, setIncomeFormData] = useState({
    invoice_number: '',
    description: '',
    amount: 0,
    invoice_date: new Date(),
    payment_status: 'unpaid' as 'paid' | 'unpaid',
    payment_date: undefined,
    account_id: 'none'
  });
  const [expenseFormData, setExpenseFormData] = useState({
    invoice_number: '',
    description: '',
    amount: 0,
    invoice_date: new Date(),
    payment_status: 'unpaid' as 'paid' | 'unpaid',
    payment_date: undefined,
    account_id: 'none'
  });

  const totalIncome = useMemo(() => {
    return incomeInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  }, [incomeInvoices]);

  const totalExpense = useMemo(() => {
    return expenseInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  }, [expenseInvoices]);

  const totalUnpaidExpenses = useMemo(() => {
    return expenseInvoices.filter(invoice => invoice.payment_status === 'unpaid').reduce((sum, invoice) => sum + invoice.amount, 0);
  }, [expenseInvoices]);

  const formatDateForInput = (date: Date) => {
    if (!date || isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
  };

  const parseDateFromInput = (dateString: string) => {
    if (!dateString) return new Date();
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date() : date;
  };

  const handleCreateIncomeInvoice = async () => {
    if (!incomeFormData.description.trim() || incomeFormData.amount <= 0) {
      toast.error("Lütfen fatura açıklamasını ve tutarını girin.");
      return;
    }

    const { error } = await addIncomeInvoice({
      invoice_number: incomeFormData.invoice_number || undefined,
      description: incomeFormData.description,
      amount: incomeFormData.amount,
      invoice_date: incomeFormData.invoice_date.toISOString(),
      payment_status: incomeFormData.payment_status,
      payment_date: incomeFormData.payment_status === 'paid' && incomeFormData.payment_date ? incomeFormData.payment_date.toISOString() : undefined,
      account_id: incomeFormData.account_id === 'none' ? undefined : incomeFormData.account_id
    });

    if (error) {
      toast.error("Gelir faturası oluşturulurken bir hata oluştu.");
      return;
    }

    toast.success("Gelir faturası başarıyla oluşturuldu.");
    setIncomeFormData({
      invoice_number: '',
      description: '',
      amount: 0,
      invoice_date: new Date(),
      payment_status: 'unpaid',
      payment_date: undefined,
      account_id: 'none'
    });
    setIncomeDialogOpen(false);
  };

  const handleCreateExpenseInvoice = async () => {
    if (!expenseFormData.description.trim() || expenseFormData.amount <= 0) {
      toast.error("Lütfen fatura açıklamasını ve tutarını girin.");
      return;
    }

    const { error } = await addExpenseInvoice({
      invoice_number: expenseFormData.invoice_number || undefined,
      description: expenseFormData.description,
      amount: expenseFormData.amount,
      invoice_date: expenseFormData.invoice_date.toISOString(),
      payment_status: expenseFormData.payment_status,
      payment_date: expenseFormData.payment_status === 'paid' && expenseFormData.payment_date ? expenseFormData.payment_date.toISOString() : undefined,
      account_id: expenseFormData.account_id === 'none' ? undefined : expenseFormData.account_id
    });

    if (error) {
      toast.error("Gider faturası oluşturulurken bir hata oluştu.");
      return;
    }

    toast.success("Gider faturası başarıyla oluşturuldu.");
    setExpenseFormData({
      invoice_number: '',
      description: '',
      amount: 0,
      invoice_date: new Date(),
      payment_status: 'unpaid',
      payment_date: undefined,
      account_id: 'none'
    });
    setExpenseDialogOpen(false);
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
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Toplam Gelir</CardTitle>
            <CardDescription>Şirketinize ait toplam gelir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Toplam Gider</CardTitle>
            <CardDescription>Şirketinize ait toplam gider</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Ödenmemiş Giderler</CardTitle>
            <CardDescription>Ödenmemiş faturaların toplamı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{formatCurrency(totalUnpaidExpenses)}</div>
            {totalUnpaidExpenses > 0 && (
              <Button variant="link" size="sm" className="mt-2" onClick={() => setUnpaidExpensesDialogOpen(true)}>
                Detayları Gör
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Income Invoice Dialog */}
      <Dialog open={incomeDialogOpen} onOpenChange={setIncomeDialogOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Gelir Faturası Oluştur
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Gelir Faturası Oluştur</DialogTitle>
            <DialogDescription>
              Yeni bir gelir faturası oluşturun
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="income-invoice-number">Fatura Numarası</Label>
              <Input 
                id="income-invoice-number" 
                value={incomeFormData.invoice_number}
                onChange={(e) => setIncomeFormData({...incomeFormData, invoice_number: e.target.value})}
                placeholder="Fatura numarası (opsiyonel)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="income-description">Açıklama *</Label>
              <Input 
                id="income-description" 
                value={incomeFormData.description}
                onChange={(e) => setIncomeFormData({...incomeFormData, description: e.target.value})}
                placeholder="Fatura açıklaması"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="income-amount">Tutar *</Label>
              <Input 
                id="income-amount" 
                type="number"
                step="0.01"
                value={incomeFormData.amount}
                onChange={(e) => setIncomeFormData({...incomeFormData, amount: parseFloat(e.target.value) || 0})}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="income-date">Fatura Tarihi *</Label>
              <Input 
                id="income-date" 
                type="date"
                value={formatDateForInput(incomeFormData.invoice_date)}
                onChange={(e) => setIncomeFormData({...incomeFormData, invoice_date: parseDateFromInput(e.target.value)})}
                placeholder="YYYY-MM-DD"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="income-account">Cari Hesap</Label>
              <Select value={incomeFormData.account_id} onValueChange={(value) => setIncomeFormData({...incomeFormData, account_id: value})}>
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
            <div className="space-y-2">
              <Label htmlFor="income-payment-status">Ödeme Durumu</Label>
              <Select value={incomeFormData.payment_status} onValueChange={(value: 'paid' | 'unpaid') => setIncomeFormData({...incomeFormData, payment_status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Ödenmemiş</SelectItem>
                  <SelectItem value="paid">Ödenmiş</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {incomeFormData.payment_status === 'paid' && (
              <div className="space-y-2">
                <Label htmlFor="income-payment-date">Ödeme Tarihi</Label>
                <Input 
                  id="income-payment-date" 
                  type="date"
                  value={incomeFormData.payment_date ? formatDateForInput(incomeFormData.payment_date) : ''}
                  onChange={(e) => setIncomeFormData({...incomeFormData, payment_date: e.target.value ? parseDateFromInput(e.target.value) : undefined})}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIncomeDialogOpen(false)}>İptal</Button>
            <Button onClick={handleCreateIncomeInvoice}>Oluştur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Expense Invoice Dialog */}
      <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Gider Faturası Oluştur
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Gider Faturası Oluştur</DialogTitle>
            <DialogDescription>
              Yeni bir gider faturası oluşturun
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="expense-invoice-number">Fatura Numarası</Label>
              <Input 
                id="expense-invoice-number" 
                value={expenseFormData.invoice_number}
                onChange={(e) => setExpenseFormData({...expenseFormData, invoice_number: e.target.value})}
                placeholder="Fatura numarası (opsiyonel)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense-description">Açıklama *</Label>
              <Input 
                id="expense-description" 
                value={expenseFormData.description}
                onChange={(e) => setExpenseFormData({...expenseFormData, description: e.target.value})}
                placeholder="Fatura açıklaması"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense-amount">Tutar *</Label>
              <Input 
                id="expense-amount" 
                type="number"
                step="0.01"
                value={expenseFormData.amount}
                onChange={(e) => setExpenseFormData({...expenseFormData, amount: parseFloat(e.target.value) || 0})}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense-date">Fatura Tarihi *</Label>
              <Input 
                id="expense-date" 
                type="date"
                value={formatDateForInput(expenseFormData.invoice_date)}
                onChange={(e) => setExpenseFormData({...expenseFormData, invoice_date: parseDateFromInput(e.target.value)})}
                placeholder="YYYY-MM-DD"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense-account">Cari Hesap</Label>
              <Select value={expenseFormData.account_id} onValueChange={(value) => setExpenseFormData({...expenseFormData, account_id: value})}>
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
            <div className="space-y-2">
              <Label htmlFor="expense-payment-status">Ödeme Durumu</Label>
              <Select value={expenseFormData.payment_status} onValueChange={(value: 'paid' | 'unpaid') => setExpenseFormData({...expenseFormData, payment_status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Ödenmemiş</SelectItem>
                  <SelectItem value="paid">Ödenmiş</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {expenseFormData.payment_status === 'paid' && (
              <div className="space-y-2">
                <Label htmlFor="expense-payment-date">Ödeme Tarihi</Label>
                <Input 
                  id="expense-payment-date" 
                  type="date"
                  value={expenseFormData.payment_date ? formatDateForInput(expenseFormData.payment_date) : ''}
                  onChange={(e) => setExpenseFormData({...expenseFormData, payment_date: e.target.value ? parseDateFromInput(e.target.value) : undefined})}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExpenseDialogOpen(false)}>İptal</Button>
            <Button onClick={handleCreateExpenseInvoice}>Oluştur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unpaid Expenses Dialog */}
      <Dialog open={unpaidExpensesDialogOpen} onOpenChange={setUnpaidExpensesDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Ödenmemiş Gider Faturaları</DialogTitle>
            <DialogDescription>
              Henüz ödenmemiş olan gider faturalarınızın listesi
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {expenseInvoices.filter(invoice => invoice.payment_status === 'unpaid').length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fatura No</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead className="text-right">Tutar</TableHead>
                    <TableHead>Fatura Tarihi</TableHead>
                    <TableHead>Cari Hesap</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseInvoices.filter(invoice => invoice.payment_status === 'unpaid').map(invoice => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.invoice_number || 'Yok'}</TableCell>
                      <TableCell>{invoice.description}</TableCell>
                      <TableCell className="text-right">{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell>{new Date(invoice.invoice_date).toLocaleDateString('tr-TR')}</TableCell>
                      <TableCell>{invoice.account?.name || 'Yok'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-500">Ödenmemiş gider faturası bulunmamaktadır.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnpaidExpensesDialogOpen(false)}>Kapat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Income Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ArrowDown className="h-5 w-5 text-green-500" />
            <span>Gelir Faturaları</span>
          </CardTitle>
          <CardDescription>Oluşturulan gelir faturalarının listesi</CardDescription>
        </CardHeader>
        <CardContent>
          {incomeInvoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fatura No</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead className="text-right">Tutar</TableHead>
                  <TableHead>Fatura Tarihi</TableHead>
                  <TableHead>Ödeme Durumu</TableHead>
                  <TableHead>Cari Hesap</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomeInvoices.map(invoice => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.invoice_number || 'Yok'}</TableCell>
                    <TableCell>{invoice.description}</TableCell>
                    <TableCell className="text-right">{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell>{new Date(invoice.invoice_date).toLocaleDateString('tr-TR')}</TableCell>
                    <TableCell>{invoice.payment_status === 'paid' ? 'Ödendi' : 'Ödenmedi'}</TableCell>
                    <TableCell>{invoice.account?.name || 'Yok'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-500">Henüz gelir faturası oluşturulmadı.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ArrowUp className="h-5 w-5 text-red-500" />
            <span>Gider Faturaları</span>
          </CardTitle>
          <CardDescription>Oluşturulan gider faturalarının listesi</CardDescription>
        </CardHeader>
        <CardContent>
          {expenseInvoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fatura No</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead className="text-right">Tutar</TableHead>
                  <TableHead>Fatura Tarihi</TableHead>
                  <TableHead>Ödeme Durumu</TableHead>
                  <TableHead>Cari Hesap</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenseInvoices.map(invoice => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.invoice_number || 'Yok'}</TableCell>
                    <TableCell>{invoice.description}</TableCell>
                    <TableCell className="text-right">{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell>{new Date(invoice.invoice_date).toLocaleDateString('tr-TR')}</TableCell>
                    <TableCell>{invoice.payment_status === 'paid' ? 'Ödendi' : 'Ödenmedi'}</TableCell>
                    <TableCell>{invoice.account?.name || 'Yok'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-500">Henüz gider faturası oluşturulmadı.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
