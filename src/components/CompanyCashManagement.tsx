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
  const { incomeInvoices, expenseInvoices, loading, addIncomeInvoice, addExpenseInvoice, updateIncomeInvoice, updateExpenseInvoice, deleteIncomeInvoice, deleteExpenseInvoice } = useInvoices(companyId);

  const [unpaidExpensesDialogOpen, setUnpaidExpensesDialogOpen] = useState(false);

  // Calculate metrics
  const totalIncomeInvoices = incomeInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalExpenseInvoices = expenseInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const unpaidIncomeInvoices = incomeInvoices.filter(inv => inv.payment_status === 'unpaid');
  const unpaidExpenseInvoices = expenseInvoices.filter(inv => inv.payment_status === 'unpaid');
  const totalUnpaidIncome = unpaidIncomeInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalUnpaidExpenses = unpaidExpenseInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const netProfit = totalIncomeInvoices - totalExpenseInvoices;

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

      {/* Additional content can be added here if needed */}
    </div>
  );
};
