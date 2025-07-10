
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInvoices } from '@/hooks/useInvoices';
import { formatCurrency } from '@/lib/numberUtils';
import { Plus, CalendarIcon, FileText, DollarSign, TrendingUp, TrendingDown, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export const CompanyCashManagement = ({ companyId }: { companyId: string }) => {
  const { incomeInvoices, expenseInvoices, accounts, loading, addIncomeInvoice, addExpenseInvoice, updateIncomeInvoice, updateExpenseInvoice, deleteIncomeInvoice, deleteExpenseInvoice } = useInvoices(companyId);

  const [unpaidExpensesDialogOpen, setUnpaidExpensesDialogOpen] = useState(false);
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);

  // Income form state
  const [incomeFormData, setIncomeFormData] = useState({
    invoice_number: '',
    description: '',
    amount: '',
    invoice_date: new Date(),
    payment_status: 'unpaid' as 'paid' | 'unpaid',
    payment_date: undefined as Date | undefined,
    account_id: ''
  });

  // Expense form state
  const [expenseFormData, setExpenseFormData] = useState({
    invoice_number: '',
    description: '',
    amount: '',
    invoice_date: new Date(),
    payment_status: 'unpaid' as 'paid' | 'unpaid',
    payment_date: undefined as Date | undefined,
    account_id: ''
  });

  // Calculate metrics
  const totalIncomeInvoices = incomeInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalExpenseInvoices = expenseInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const unpaidIncomeInvoices = incomeInvoices.filter(inv => inv.payment_status === 'unpaid');
  const unpaidExpenseInvoices = expenseInvoices.filter(inv => inv.payment_status === 'unpaid');
  const totalUnpaidIncome = unpaidIncomeInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalUnpaidExpenses = unpaidExpenseInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const netProfit = totalIncomeInvoices - totalExpenseInvoices;

  const handleIncomeSubmit = async () => {
    if (!incomeFormData.description || !incomeFormData.amount) {
      toast.error("Açıklama ve tutar zorunludur.");
      return;
    }

    const { error } = await addIncomeInvoice({
      invoice_number: incomeFormData.invoice_number || undefined,
      description: incomeFormData.description,
      amount: parseFloat(incomeFormData.amount),
      invoice_date: format(incomeFormData.invoice_date, 'yyyy-MM-dd'),
      payment_status: incomeFormData.payment_status,
      payment_date: incomeFormData.payment_date ? format(incomeFormData.payment_date, 'yyyy-MM-dd') : undefined,
      account_id: incomeFormData.account_id || undefined
    });

    if (error) {
      toast.error("Gelir faturası oluşturulurken hata oluştu.");
      return;
    }

    toast.success("Gelir faturası başarıyla oluşturuldu.");
    setIncomeFormData({
      invoice_number: '',
      description: '',
      amount: '',
      invoice_date: new Date(),
      payment_status: 'unpaid',
      payment_date: undefined,
      account_id: ''
    });
    setIncomeDialogOpen(false);
  };

  const handleExpenseSubmit = async () => {
    if (!expenseFormData.description || !expenseFormData.amount) {
      toast.error("Açıklama ve tutar zorunludur.");
      return;
    }

    const { error } = await addExpenseInvoice({
      invoice_number: expenseFormData.invoice_number || undefined,
      description: expenseFormData.description,
      amount: parseFloat(expenseFormData.amount),
      invoice_date: format(expenseFormData.invoice_date, 'yyyy-MM-dd'),
      payment_status: expenseFormData.payment_status,
      payment_date: expenseFormData.payment_date ? format(expenseFormData.payment_date, 'yyyy-MM-dd') : undefined,
      account_id: expenseFormData.account_id || undefined
    });

    if (error) {
      toast.error("Gider faturası oluşturulurken hata oluştu.");
      return;
    }

    toast.success("Gider faturası başarıyla oluşturuldu.");
    setExpenseFormData({
      invoice_number: '',
      description: '',
      amount: '',
      invoice_date: new Date(),
      payment_status: 'unpaid',
      payment_date: undefined,
      account_id: ''
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
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-900">Toplam Gelir</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(totalIncomeInvoices)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-900">Toplam Gider</p>
                <p className="text-2xl font-bold text-red-700">{formatCurrency(totalExpenseInvoices)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Net Kar/Zarar</p>
                <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatCurrency(Math.abs(netProfit))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={unpaidExpensesDialogOpen} onOpenChange={setUnpaidExpensesDialogOpen}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <FileText className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-900">Ödenmemiş Gider</p>
                    <p className="text-2xl font-bold text-amber-700">{formatCurrency(totalUnpaidExpenses)}</p>
                    <p className="text-xs text-amber-600 mt-1">Detayları görmek için tıklayın</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ödenmemiş Gider Faturalar</DialogTitle>
              <DialogDescription>
                Henüz ödenmemiş olan gider faturaları
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fatura No</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Cari</TableHead>
                    <TableHead>Fatura Tarihi</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unpaidExpenseInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.invoice_number || '-'}</TableCell>
                      <TableCell>{invoice.description}</TableCell>
                      <TableCell>{invoice.account?.name || '-'}</TableCell>
                      <TableCell>
                        {format(new Date(invoice.invoice_date), 'dd/MM/yyyy', { locale: tr })}
                      </TableCell>
                      <TableCell className="font-medium text-red-600">
                        {formatCurrency(invoice.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">Ödenmedi</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {unpaidExpenseInvoices.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Ödenmemiş gider faturası bulunamadı
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Invoice Creation Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Invoice Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Gelir Faturası
            </CardTitle>
            <CardDescription>Yeni gelir faturası oluşturun</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog open={incomeDialogOpen} onOpenChange={setIncomeDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Gelir Faturası Oluştur
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Yeni Gelir Faturası</DialogTitle>
                  <DialogDescription>
                    Yeni bir gelir faturası oluşturun
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="income-invoice-number">Fatura No (Opsiyonel)</Label>
                    <Input
                      id="income-invoice-number"
                      value={incomeFormData.invoice_number}
                      onChange={(e) => setIncomeFormData({...incomeFormData, invoice_number: e.target.value})}
                      placeholder="FT-001"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="income-description">Açıklama *</Label>
                    <Textarea
                      id="income-description"
                      value={incomeFormData.description}
                      onChange={(e) => setIncomeFormData({...incomeFormData, description: e.target.value})}
                      placeholder="Fatura açıklaması"
                    />
                  </div>

                  <div>
                    <Label htmlFor="income-amount">Tutar *</Label>
                    <Input
                      id="income-amount"
                      type="number"
                      step="0.01"
                      value={incomeFormData.amount}
                      onChange={(e) => setIncomeFormData({...incomeFormData, amount: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label>Fatura Tarihi</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !incomeFormData.invoice_date && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {incomeFormData.invoice_date ? format(incomeFormData.invoice_date, "dd/MM/yyyy", { locale: tr }) : <span>Tarih seçin</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={incomeFormData.invoice_date}
                          onSelect={(date) => date && setIncomeFormData({...incomeFormData, invoice_date: date})}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label>Cari Hesap</Label>
                    <Select value={incomeFormData.account_id} onValueChange={(value) => setIncomeFormData({...incomeFormData, account_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Cari hesap seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Cari hesap yok</SelectItem>
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
                    <Select value={incomeFormData.payment_status} onValueChange={(value: 'paid' | 'unpaid') => setIncomeFormData({...incomeFormData, payment_status: value})}>
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
                      <Label>Ödeme Tarihi</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !incomeFormData.payment_date && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {incomeFormData.payment_date ? format(incomeFormData.payment_date, "dd/MM/yyyy", { locale: tr }) : <span>Ödeme tarihi seçin</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={incomeFormData.payment_date}
                            onSelect={(date) => setIncomeFormData({...incomeFormData, payment_date: date})}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIncomeDialogOpen(false)} className="flex-1">
                      İptal
                    </Button>
                    <Button onClick={handleIncomeSubmit} className="flex-1">
                      Oluştur
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Expense Invoice Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Gider Faturası
            </CardTitle>
            <CardDescription>Yeni gider faturası oluşturun</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" variant="destructive">
                  <Plus className="h-4 w-4 mr-2" />
                  Gider Faturası Oluştur
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Yeni Gider Faturası</DialogTitle>
                  <DialogDescription>
                    Yeni bir gider faturası oluşturun
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="expense-invoice-number">Fatura No (Opsiyonel)</Label>
                    <Input
                      id="expense-invoice-number"
                      value={expenseFormData.invoice_number}
                      onChange={(e) => setExpenseFormData({...expenseFormData, invoice_number: e.target.value})}
                      placeholder="FT-001"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="expense-description">Açıklama *</Label>
                    <Textarea
                      id="expense-description"
                      value={expenseFormData.description}
                      onChange={(e) => setExpenseFormData({...expenseFormData, description: e.target.value})}
                      placeholder="Fatura açıklaması"
                    />
                  </div>

                  <div>
                    <Label htmlFor="expense-amount">Tutar *</Label>
                    <Input
                      id="expense-amount"
                      type="number"
                      step="0.01"
                      value={expenseFormData.amount}
                      onChange={(e) => setExpenseFormData({...expenseFormData, amount: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label>Fatura Tarihi</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !expenseFormData.invoice_date && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {expenseFormData.invoice_date ? format(expenseFormData.invoice_date, "dd/MM/yyyy", { locale: tr }) : <span>Tarih seçin</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={expenseFormData.invoice_date}
                          onSelect={(date) => date && setExpenseFormData({...expenseFormData, invoice_date: date})}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label>Cari Hesap</Label>
                    <Select value={expenseFormData.account_id} onValueChange={(value) => setExpenseFormData({...expenseFormData, account_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Cari hesap seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Cari hesap yok</SelectItem>
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
                    <Select value={expenseFormData.payment_status} onValueChange={(value: 'paid' | 'unpaid') => setExpenseFormData({...expenseFormData, payment_status: value})}>
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
                      <Label>Ödeme Tarihi</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !expenseFormData.payment_date && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {expenseFormData.payment_date ? format(expenseFormData.payment_date, "dd/MM/yyyy", { locale: tr }) : <span>Ödeme tarihi seçin</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={expenseFormData.payment_date}
                            onSelect={(date) => setExpenseFormData({...expenseFormData, payment_date: date})}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setExpenseDialogOpen(false)} className="flex-1">
                      İptal
                    </Button>
                    <Button onClick={handleExpenseSubmit} className="flex-1">
                      Oluştur
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
