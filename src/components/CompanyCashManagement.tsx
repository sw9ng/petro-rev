
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, TrendingUp, TrendingDown, FileText, Calendar, DollarSign } from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import { useCompanies } from '@/hooks/useCompanies';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface CompanyCashManagementProps {
  companyId: string;
  onBack: () => void;
}

export const CompanyCashManagement = ({ companyId, onBack }: CompanyCashManagementProps) => {
  const { companies } = useCompanies();
  const { incomeInvoices, expenseInvoices, createIncomeInvoice, createExpenseInvoice } = useInvoices(companyId);
  const [incomeDialog, setIncomeDialog] = useState(false);
  const [expenseDialog, setExpenseDialog] = useState(false);
  const [dateFilter, setDateFilter] = useState('');

  const company = companies.find(c => c.id === companyId);
  
  const [newIncome, setNewIncome] = useState({
    invoice_number: '',
    description: '',
    amount: '',
    invoice_date: new Date().toISOString().split('T')[0]
  });

  const [newExpense, setNewExpense] = useState({
    invoice_number: '',
    description: '',
    amount: '',
    invoice_date: new Date().toISOString().split('T')[0]
  });

  const handleCreateIncome = async () => {
    if (!newIncome.description || !newIncome.amount) return;
    
    await createIncomeInvoice.mutateAsync({
      ...newIncome,
      amount: parseFloat(newIncome.amount)
    });
    
    setNewIncome({
      invoice_number: '',
      description: '',
      amount: '',
      invoice_date: new Date().toISOString().split('T')[0]
    });
    setIncomeDialog(false);
  };

  const handleCreateExpense = async () => {
    if (!newExpense.description || !newExpense.amount) return;
    
    await createExpenseInvoice.mutateAsync({
      ...newExpense,
      amount: parseFloat(newExpense.amount)
    });
    
    setNewExpense({
      invoice_number: '',
      description: '',
      amount: '',
      invoice_date: new Date().toISOString().split('T')[0]
    });
    setExpenseDialog(false);
  };

  const filteredIncomeInvoices = dateFilter
    ? incomeInvoices.filter(inv => inv.invoice_date.includes(dateFilter))
    : incomeInvoices;

  const filteredExpenseInvoices = dateFilter
    ? expenseInvoices.filter(inv => inv.invoice_date.includes(dateFilter))
    : expenseInvoices;

  const totalIncome = filteredIncomeInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const totalExpense = filteredExpenseInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const netProfit = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri Dön
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{company?.name} - Kasa Yönetimi</h2>
          <p className="text-gray-600">Gelir ve giderleri yönetin</p>
        </div>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Toplam Gelir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">₺{totalIncome.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-rose-50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700 flex items-center">
              <TrendingDown className="h-4 w-4 mr-2" />
              Toplam Gider
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">₺{totalExpense.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Net Kar/Zarar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-800' : 'text-red-800'}`}>
              ₺{netProfit.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Toplam Fatura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">
              {filteredIncomeInvoices.length + filteredExpenseInvoices.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tarih Filtresi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Calendar className="h-5 w-5 mr-2" />
            Tarih Filtresi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Input
              type="month"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-48"
            />
            <Button variant="outline" onClick={() => setDateFilter('')}>
              Filtreyi Temizle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Faturalar */}
      <Tabs defaultValue="income" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="income" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Gelir Faturaları</span>
          </TabsTrigger>
          <TabsTrigger value="expense" className="flex items-center space-x-2">
            <TrendingDown className="h-4 w-4" />
            <span>Gider Faturaları</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gelir Faturaları</h3>
            <Dialog open={incomeDialog} onOpenChange={setIncomeDialog}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Gelir Faturası
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yeni Gelir Faturası</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="income-number">Fatura Numarası</Label>
                    <Input
                      id="income-number"
                      value={newIncome.invoice_number}
                      onChange={(e) => setNewIncome({ ...newIncome, invoice_number: e.target.value })}
                      placeholder="Fatura numarası (opsiyonel)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="income-description">Açıklama</Label>
                    <Textarea
                      id="income-description"
                      value={newIncome.description}
                      onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })}
                      placeholder="Fatura açıklaması"
                    />
                  </div>
                  <div>
                    <Label htmlFor="income-amount">Tutar</Label>
                    <Input
                      id="income-amount"
                      type="number"
                      value={newIncome.amount}
                      onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="income-date">Fatura Tarihi</Label>
                    <Input
                      id="income-date"
                      type="date"
                      value={newIncome.invoice_date}
                      onChange={(e) => setNewIncome({ ...newIncome, invoice_date: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleCreateIncome} className="w-full">
                    Faturayı Ekle
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fatura No</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead>Tarih</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncomeInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.invoice_number || '-'}</TableCell>
                    <TableCell>{invoice.description}</TableCell>
                    <TableCell className="font-medium text-green-600">
                      ₺{Number(invoice.amount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.invoice_date), 'dd MMMM yyyy', { locale: tr })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="expense" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gider Faturaları</h3>
            <Dialog open={expenseDialog} onOpenChange={setExpenseDialog}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Gider Faturası
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yeni Gider Faturası</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="expense-number">Fatura Numarası</Label>
                    <Input
                      id="expense-number"
                      value={newExpense.invoice_number}
                      onChange={(e) => setNewExpense({ ...newExpense, invoice_number: e.target.value })}
                      placeholder="Fatura numarası (opsiyonel)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expense-description">Açıklama</Label>
                    <Textarea
                      id="expense-description"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                      placeholder="Fatura açıklaması"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expense-amount">Tutar</Label>
                    <Input
                      id="expense-amount"
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expense-date">Fatura Tarihi</Label>
                    <Input
                      id="expense-date"
                      type="date"
                      value={newExpense.invoice_date}
                      onChange={(e) => setNewExpense({ ...newExpense, invoice_date: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleCreateExpense} className="w-full">
                    Faturayı Ekle
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fatura No</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead>Tarih</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenseInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.invoice_number || '-'}</TableCell>
                    <TableCell>{invoice.description}</TableCell>
                    <TableCell className="font-medium text-red-600">
                      ₺{Number(invoice.amount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.invoice_date), 'dd MMMM yyyy', { locale: tr })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
