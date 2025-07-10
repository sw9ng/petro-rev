
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInvoices } from '@/hooks/useInvoices';
import { formatCurrency } from '@/lib/numberUtils';
import { Plus, CalendarIcon, Users, Edit, Trash2, Phone, MapPin, FileText, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export const CompanyAccountsList = ({ companyId }: { companyId: string }) => {
  const { accounts, incomeInvoices, expenseInvoices, loading, addAccount, deleteAccount } = useInvoices(companyId);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAccountData, setNewAccountData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const handleCreateAccount = async () => {
    if (!newAccountData.name.trim()) {
      toast.error("Cari adı zorunludur.");
      return;
    }

    const { error } = await addAccount({
      name: newAccountData.name,
      phone: newAccountData.phone || undefined,
      address: newAccountData.address || undefined,
      notes: newAccountData.notes || undefined
    });

    if (error) {
      toast.error("Cari oluşturulurken bir hata oluştu.");
      return;
    }

    toast.success("Cari başarıyla oluşturuldu.");
    setNewAccountData({ name: '', phone: '', address: '', notes: '' });
    setIsDialogOpen(false);
  };

  const handleDeleteAccount = async (accountId: string) => {
    const { error } = await deleteAccount(accountId);

    if (error) {
      toast.error("Cari silinirken bir hata oluştu.");
      return;
    }

    toast.success("Cari başarıyla silindi.");
  };

  // Calculate account balances and debts with date filtering
  const accountsWithBalance = useMemo(() => {
    return accounts.map(account => {
      // Filter invoices by date range if selected
      const filteredIncomeInvoices = incomeInvoices.filter(invoice => {
        const invoiceDate = new Date(invoice.invoice_date);
        const matchesAccount = invoice.account_id === account.id;
        
        if (!startDate || !endDate) return matchesAccount;
        
        const startOfDay = new Date(startDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        return matchesAccount && invoiceDate >= startOfDay && invoiceDate <= endOfDay;
      });

      const filteredExpenseInvoices = expenseInvoices.filter(invoice => {
        const invoiceDate = new Date(invoice.invoice_date);
        const matchesAccount = invoice.account_id === account.id;
        
        if (!startDate || !endDate) return matchesAccount;
        
        const startOfDay = new Date(startDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        return matchesAccount && invoiceDate >= startOfDay && invoiceDate <= endOfDay;
      });

      const totalIncome = filteredIncomeInvoices.reduce((sum, inv) => sum + inv.amount, 0);
      const totalExpense = filteredExpenseInvoices.reduce((sum, inv) => sum + inv.amount, 0);
      const balance = totalIncome - totalExpense;
      
      // Calculate unpaid debts (unpaid expense invoices)
      const unpaidDebts = filteredExpenseInvoices.filter(inv => inv.payment_status === 'unpaid');
      const totalUnpaidDebt = unpaidDebts.reduce((sum, inv) => sum + inv.amount, 0);

      return {
        ...account,
        totalIncome,
        totalExpense,
        balance,
        unpaidDebts,
        totalUnpaidDebt,
        invoiceCount: filteredIncomeInvoices.length + filteredExpenseInvoices.length
      };
    });
  }, [accounts, incomeInvoices, expenseInvoices, startDate, endDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold">Cari Listesi</h3>
          <p className="text-gray-600">Şirket cari hesaplarınızı yönetin</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Date Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd MMM yyyy", { locale: tr }) : "Başlangıç"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white border shadow-lg z-50" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  locale={tr}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd MMM yyyy", { locale: tr }) : "Bitiş"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white border shadow-lg z-50" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  locale={tr}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            
            {(startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStartDate(undefined);
                  setEndDate(undefined);
                }}
              >
                Temizle
              </Button>
            )}
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Yeni Cari
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Yeni Cari Hesap</DialogTitle>
                <DialogDescription>
                  Yeni bir cari hesap oluşturun
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Cari Adı *</Label>
                  <Input 
                    id="name" 
                    value={newAccountData.name}
                    onChange={(e) => setNewAccountData({...newAccountData, name: e.target.value})}
                    placeholder="ABC Şirketi"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input 
                    id="phone" 
                    value={newAccountData.phone}
                    onChange={(e) => setNewAccountData({...newAccountData, phone: e.target.value})}
                    placeholder="0555 123 45 67"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adres</Label>
                  <Input 
                    id="address" 
                    value={newAccountData.address}
                    onChange={(e) => setNewAccountData({...newAccountData, address: e.target.value})}
                    placeholder="İstanbul, Türkiye"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notlar</Label>
                  <Textarea 
                    id="notes" 
                    value={newAccountData.notes}
                    onChange={(e) => setNewAccountData({...newAccountData, notes: e.target.value})}
                    placeholder="Ek bilgiler..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>İptal</Button>
                <Button onClick={handleCreateAccount}>Oluştur</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Date Filter Info */}
      {(startDate || endDate) && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                Tarih Filtresi: {' '}
                {startDate ? format(startDate, 'dd/MM/yyyy', { locale: tr }) : 'Başlangıç yok'} - {' '}
                {endDate ? format(endDate, 'dd/MM/yyyy', { locale: tr }) : 'Bitiş yok'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accounts Grid */}
      <div className="grid gap-6">
        {accountsWithBalance.map(account => (
          <Card key={account.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span>{account.name}</span>
                  </CardTitle>
                  {account.phone && (
                    <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                      <Phone className="h-3 w-3" />
                      <span>{account.phone}</span>
                    </div>
                  )}
                  {account.address && (
                    <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                      <MapPin className="h-3 w-3" />
                      <span>{account.address}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cariyi Sil</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bu cari hesabı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteAccount(account.id)}>
                          Sil
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Toplam Gelir</p>
                  <p className="text-lg font-semibold text-green-600">{formatCurrency(account.totalIncome)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Toplam Gider</p>
                  <p className="text-lg font-semibold text-red-600">{formatCurrency(account.totalExpense)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Bakiye</p>
                  <p className={`text-lg font-semibold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(account.balance))}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Ödenmemiş Borç</p>
                  <p className="text-lg font-semibold text-amber-600">{formatCurrency(account.totalUnpaidDebt)}</p>
                </div>
              </div>
              
              {account.totalUnpaidDebt > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Ödenmemiş Borçlar:</h5>
                  <div className="space-y-2">
                    {account.unpaidDebts.map(debt => (
                      <div key={debt.id} className="flex justify-between items-center bg-amber-50 p-2 rounded">
                        <div>
                          <span className="text-sm font-medium">{debt.description}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({format(new Date(debt.invoice_date), 'dd/MM/yyyy', { locale: tr })})
                          </span>
                        </div>
                        <Badge variant="outline" className="text-amber-700 border-amber-300">
                          {formatCurrency(debt.amount)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {account.notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">{account.notes}</p>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t flex justify-between text-sm text-gray-500">
                <span>Toplam İşlem: {account.invoiceCount}</span>
                <span>Oluşturulma: {format(new Date(account.created_at), 'dd/MM/yyyy', { locale: tr })}</span>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {accountsWithBalance.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-500 mb-2">Henüz cari hesap yok</p>
              <p className="text-gray-400 text-center mb-4">
                İlk cari hesabınızı oluşturmak için yukarıdaki "Yeni Cari" butonunu kullanın.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
