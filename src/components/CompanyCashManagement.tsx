import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCompanies } from '@/hooks/useCompanies';
import { useInvoices } from '@/hooks/useInvoices';
import { formatCurrency } from '@/lib/numberUtils';
import { Plus, Building2, Receipt, FileText, Calendar, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import { CompanyAccountDetail } from './CompanyAccountDetail';

type PaymentStatus = 'paid' | 'unpaid';

interface CompanyCashManagementProps {
  companyId: string;
}

export const CompanyCashManagement = ({ companyId }: CompanyCashManagementProps) => {
  const { companies, loading: companiesLoading } = useCompanies();
  const { 
    incomeInvoices, 
    expenseInvoices, 
    accounts,
    loading: invoicesLoading, 
    addIncomeInvoice, 
    addExpenseInvoice,
    updateIncomeInvoiceStatus,
    updateExpenseInvoiceStatus
  } = useInvoices(companyId);

  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('income');
  const [selectedAccountForDetail, setSelectedAccountForDetail] = useState<string | null>(null);

  const handleAddIncomeInvoice = async () => {
    if (!companyId || !amount || !description) {
      toast.error('Lütfen tüm gerekli alanları doldurun');
      return;
    }

    const invoiceData = {
      amount: parseFloat(amount),
      account_id: selectedAccount || undefined,
      payment_date: paymentDate || undefined,
      description,
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate,
      payment_status: paymentStatus
    };

    const { error } = await addIncomeInvoice(invoiceData);

    if (error) {
      toast.error('Gelir faturası eklenirken hata oluştu');
    } else {
      toast.success('Gelir faturası başarıyla eklendi');
      // Reset form
      setAmount('');
      setDescription('');
      setInvoiceNumber('');
      setPaymentDate('');
      setPaymentStatus('unpaid');
      setSelectedAccount('');
      setDialogOpen(false);
    }
  };

  const handleAddExpenseInvoice = async () => {
    if (!companyId || !amount || !description) {
      toast.error('Lütfen tüm gerekli alanları doldurun');
      return;
    }

    const invoiceData = {
      amount: parseFloat(amount),
      account_id: selectedAccount || undefined,
      payment_date: paymentDate || undefined,
      description,
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate,
      payment_status: paymentStatus
    };

    const { error } = await addExpenseInvoice(invoiceData);

    if (error) {
      toast.error('Gider faturası eklenirken hata oluştu');
    } else {
      toast.success('Gider faturası başarıyla eklendi');
      // Reset form
      setAmount('');
      setDescription('');
      setInvoiceNumber('');
      setPaymentDate('');
      setPaymentStatus('unpaid');
      setSelectedAccount('');
      setDialogOpen(false);
    }
  };

  const handleUpdateIncomeStatus = async (invoiceId: string, newStatus: PaymentStatus) => {
    const { error } = await updateIncomeInvoiceStatus(invoiceId, newStatus);
    
    if (error) {
      toast.error('Durum güncellenirken hata oluştu');
    } else {
      toast.success('Fatura durumu güncellendi');
    }
  };

  const handleUpdateExpenseStatus = async (invoiceId: string, newStatus: PaymentStatus) => {
    const { error } = await updateExpenseInvoiceStatus(invoiceId, newStatus);
    
    if (error) {
      toast.error('Durum güncellenirken hata oluştu');
    } else {
      toast.success('Fatura durumu güncellendi');
    }
  };

  const selectedCompanyData = companies.find(c => c.id === companyId);
  const companyIncomeInvoices = incomeInvoices.filter(invoice => invoice.company_id === companyId);
  const companyExpenseInvoices = expenseInvoices.filter(invoice => invoice.company_id === companyId);

  const totalIncome = companyIncomeInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalExpenses = companyExpenseInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  const paidIncome = companyIncomeInvoices.filter(invoice => invoice.payment_status === 'paid').reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidExpenses = companyExpenseInvoices.filter(invoice => invoice.payment_status === 'paid').reduce((sum, invoice) => sum + invoice.amount, 0);

  if (companiesLoading || invoicesLoading) {
    return <div className="flex justify-center items-center h-64">Yükleniyor...</div>;
  }

  if (selectedAccountForDetail) {
    return (
      <CompanyAccountDetail 
        accountId={selectedAccountForDetail}
        companyId={companyId}
        onBack={() => setSelectedAccountForDetail(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
            {selectedCompanyData?.name} - Kasa Yönetimi
          </h2>
          <p className="text-gray-600 mt-2">Şirket gelir/gider takibi ve kasa durumu</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Toplam Gelir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Toplam Gider</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Net Kar/Zarar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netProfit)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kasa Durumu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(paidIncome - paidExpenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(paidIncome - paidExpenses)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts List */}
      {accounts && accounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cari Hesaplar</CardTitle>
            <CardDescription>Şirket cari hesapları</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((account) => (
                <Card key={account.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedAccountForDetail(account.id)}>
                  <CardContent className="p-4">
                    <h3 className="font-medium">{account.name}</h3>
                    {account.phone && <p className="text-sm text-gray-600">{account.phone}</p>}
                    {account.address && <p className="text-sm text-gray-600 truncate">{account.address}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="income">Gelir Faturaları</TabsTrigger>
          <TabsTrigger value="expense">Gider Faturaları</TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Gelir Faturaları</h3>
            <Dialog open={dialogOpen && activeTab === 'income'} onOpenChange={(open) => setDialogOpen(open && activeTab === 'income')}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Gelir Faturası Ekle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Yeni Gelir Faturası</DialogTitle>
                  <DialogDescription>
                    Gelir faturası bilgilerini girin
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label>Cari Hesap (Opsiyonel)</Label>
                    <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                      <SelectTrigger>
                        <SelectValue placeholder="Cari hesap seçin (opsiyonel)" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts?.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Tutar (₺)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label>Açıklama</Label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Fatura açıklaması"
                    />
                  </div>

                  <div>
                    <Label>Fatura Numarası</Label>
                    <Input
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      placeholder="Fatura numarası"
                    />
                  </div>

                  <div>
                    <Label>Fatura Tarihi</Label>
                    <Input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Ödeme Durumu</Label>
                    <Select value={paymentStatus} onValueChange={(value: PaymentStatus) => setPaymentStatus(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unpaid">Ödenmedi</SelectItem>
                        <SelectItem value="paid">Ödendi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {paymentStatus === 'paid' && (
                    <div>
                      <Label>Ödeme Tarihi</Label>
                      <Input
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    İptal
                  </Button>
                  <Button onClick={handleAddIncomeInvoice}>
                    Kaydet
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
                    <TableHead>Fatura No</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Cari Hesap</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companyIncomeInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.invoice_number || '-'}</TableCell>
                      <TableCell>
                        {new Date(invoice.invoice_date).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell>
                        {invoice.account ? invoice.account.name : '-'}
                      </TableCell>
                      <TableCell>{invoice.description}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(invoice.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={invoice.payment_status === 'paid' ? 'default' : 'destructive'}>
                          {invoice.payment_status === 'paid' ? 'Ödendi' : 'Ödenmedi'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={invoice.payment_status}
                          onValueChange={(value: PaymentStatus) => handleUpdateIncomeStatus(invoice.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unpaid">Ödenmedi</SelectItem>
                            <SelectItem value="paid">Ödendi</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {companyIncomeInvoices.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Henüz gelir faturası yok
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expense" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Gider Faturaları</h3>
            <Dialog open={dialogOpen && activeTab === 'expense'} onOpenChange={(open) => setDialogOpen(open && activeTab === 'expense')}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Gider Faturası Ekle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Yeni Gider Faturası</DialogTitle>
                  <DialogDescription>
                    Gider faturası bilgilerini girin
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label>Cari Hesap (Opsiyonel)</Label>
                    <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                      <SelectTrigger>
                        <SelectValue placeholder="Cari hesap seçin (opsiyonel)" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts?.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Tutar (₺)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label>Açıklama</Label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Fatura açıklaması"
                    />
                  </div>

                  <div>
                    <Label>Fatura Numarası</Label>
                    <Input
                      value={invoiceNumber}
                      onChange={e=> setInvoiceNumber(e.target.value)}
                      placeholder="Fatura numarası"
                    />
                  </div>

                  <div>
                    <Label>Fatura Tarihi</Label>
                    <Input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Ödeme Durumu</Label>
                    <Select value={paymentStatus} onValueChange={(value: PaymentStatus) => setPaymentStatus(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unpaid">Ödenmedi</SelectItem>
                        <SelectItem value="paid">Ödendi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {paymentStatus === 'paid' && (
                    <div>
                      <Label>Ödeme Tarihi</Label>
                      <Input
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    İptal
                  </Button>
                  <Button onClick={handleAddExpenseInvoice}>
                    Kaydet
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
                    <TableHead>Fatura No</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Cari Hesap</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companyExpenseInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.invoice_number || '-'}</TableCell>
                      <TableCell>
                        {new Date(invoice.invoice_date).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell>
                        {invoice.account ? invoice.account.name : '-'}
                      </TableCell>
                      <TableCell>{invoice.description}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(invoice.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={invoice.payment_status === 'paid' ? 'default' : 'destructive'}>
                          {invoice.payment_status === 'paid' ? 'Ödendi' : 'Ödenmedi'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={invoice.payment_status}
                          onValueChange={(value: PaymentStatus) => handleUpdateExpenseStatus(invoice.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unpaid">Ödenmedi</SelectItem>
                            <SelectItem value="paid">Ödendi</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {companyExpenseInvoices.length === 0 && (
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
