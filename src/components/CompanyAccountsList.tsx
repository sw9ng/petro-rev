
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, Eye, Phone, MapPin, FileText, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/numberUtils';
import { useInvoices } from '@/hooks/useInvoices';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface CompanyAccountsListProps {
  companyId: string;
}

export const CompanyAccountsList = ({ companyId }: CompanyAccountsListProps) => {
  const { accounts, loading, addAccount, deleteAccount, incomeInvoices, expenseInvoices } = useInvoices(companyId);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Hesap bazında borç/alacak hesaplama fonksiyonları
  const getAccountBalance = (accountId: string) => {
    const accountIncomeInvoices = incomeInvoices.filter(invoice => invoice.account_id === accountId);
    const accountExpenseInvoices = expenseInvoices.filter(invoice => invoice.account_id === accountId);
    
    const totalIncome = accountIncomeInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const totalExpense = accountExpenseInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    
    return totalIncome - totalExpense; // Pozitif = Alacak, Negatif = Borç
  };

  const getAccountInvoices = (accountId: string) => {
    const accountIncomeInvoices = incomeInvoices.filter(invoice => invoice.account_id === accountId);
    const accountExpenseInvoices = expenseInvoices.filter(invoice => invoice.account_id === accountId);
    
    return {
      income: accountIncomeInvoices,
      expense: accountExpenseInvoices,
      totalIncome: accountIncomeInvoices.reduce((sum, invoice) => sum + invoice.amount, 0),
      totalExpense: accountExpenseInvoices.reduce((sum, invoice) => sum + invoice.amount, 0)
    };
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getBalanceText = (balance: number) => {
    if (balance > 0) return `Alacak: ${formatCurrency(balance)}`;
    if (balance < 0) return `Borç: ${formatCurrency(Math.abs(balance))}`;
    return 'Bakiye: ₺0,00';
  };

  const handleAddAccount = async () => {
    if (!newAccount.name.trim()) {
      toast.error("Cari hesap adı zorunludur.");
      return;
    }

    const { error } = await addAccount(newAccount);
    
    if (error) {
      toast.error("Cari hesap eklenirken bir hata oluştu.");
    } else {
      toast.success("Cari hesap başarıyla eklendi.");
      setNewAccount({ name: '', phone: '', address: '', notes: '' });
      setIsAddDialogOpen(false);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    const { error } = await deleteAccount(accountId);
    
    if (error) {
      toast.error("Cari hesap silinirken bir hata oluştu.");
    } else {
      toast.success("Cari hesap başarıyla silindi.");
    }
  };

  const showAccountDetail = (account: any) => {
    setSelectedAccount(account);
    setIsDetailDialogOpen(true);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Cari Hesaplar</h3>
          <p className="text-gray-600">Şirketinizin cari hesaplarını yönetin</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Yeni Cari Hesap
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Yeni Cari Hesap</DialogTitle>
              <DialogDescription>
                Yeni bir cari hesap oluşturun.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="account-name">Hesap Adı *</Label>
                <Input
                  id="account-name"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                  placeholder="Şirket/Kişi adı"
                />
              </div>
              <div>
                <Label htmlFor="account-phone">Telefon</Label>
                <Input
                  id="account-phone"
                  value={newAccount.phone}
                  onChange={(e) => setNewAccount({...newAccount, phone: e.target.value})}
                  placeholder="0555 123 45 67"
                />
              </div>
              <div>
                <Label htmlFor="account-address">Adres</Label>
                <Textarea
                  id="account-address"
                  value={newAccount.address}
                  onChange={(e) => setNewAccount({...newAccount, address: e.target.value})}
                  placeholder="Adres bilgisi..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="account-notes">Notlar</Label>
                <Textarea
                  id="account-notes"
                  value={newAccount.notes}
                  onChange={(e) => setNewAccount({...newAccount, notes: e.target.value})}
                  placeholder="Ek notlar..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>İptal</Button>
              <Button onClick={handleAddAccount}>Hesap Ekle</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cari hesap ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Toplam: {filteredAccounts.length}
        </Badge>
      </div>

      {/* Accounts Grid */}
      <div className="grid gap-4">
        {filteredAccounts.length > 0 ? (
          filteredAccounts.map((account) => (
            <Card key={account.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">
                      {account.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      {account.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3" />
                          <span>{account.phone}</span>
                        </div>
                      )}
                      {account.address && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-48">{account.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className={`text-xl font-bold ${getBalanceColor(getAccountBalance(account.id))}`}>
                        {getBalanceText(getAccountBalance(account.id))}
                      </div>
                      <p className="text-sm text-gray-600">
                        Oluşturulma: {format(new Date(account.created_at), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => showAccountDetail(account)}
                        className="flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Detay</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAccount(account.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {account.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-start space-x-2 text-sm text-gray-600">
                      <FileText className="h-3 w-3 mt-0.5" />
                      <span className="truncate">{account.notes}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'Arama kriterinize uygun cari hesap bulunamadı.' : 'Henüz cari hesap bulunmuyor.'}
          </div>
        )}
      </div>

      {/* Account Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cari Hesap Detayı</DialogTitle>
            <DialogDescription>
              {selectedAccount?.name} hesabının detaylı bilgileri ve bakiye durumu
            </DialogDescription>
          </DialogHeader>
          {selectedAccount && (
            <div className="space-y-6">
              {/* Hesap Bilgileri */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Hesap Adı</Label>
                  <p className="text-sm mt-1">{selectedAccount.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Oluşturulma Tarihi</Label>
                  <p className="text-sm mt-1">{format(new Date(selectedAccount.created_at), 'dd/MM/yyyy HH:mm')}</p>
                </div>
              </div>
              
              {selectedAccount.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{selectedAccount.phone}</span>
                </div>
              )}
              
              {selectedAccount.address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                  <span className="text-sm">{selectedAccount.address}</span>
                </div>
              )}
              
              {selectedAccount.notes && (
                <div className="flex items-start space-x-3">
                  <FileText className="h-4 w-4 text-gray-400 mt-1" />
                  <span className="text-sm">{selectedAccount.notes}</span>
                </div>
              )}

              {/* Bakiye Bilgileri */}
              <div className="border-t pt-4">
                <h4 className="text-lg font-semibold mb-4">Finansal Durum</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-600">Toplam Gelir</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(getAccountInvoices(selectedAccount.id).totalIncome)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="text-sm text-gray-600">Toplam Gider</p>
                    <p className="text-lg font-bold text-red-600">
                      {formatCurrency(getAccountInvoices(selectedAccount.id).totalExpense)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <CreditCard className="h-5 w-5 text-gray-600" />
                    </div>
                    <p className="text-sm text-gray-600">Net Durum</p>
                    <p className={`text-lg font-bold ${getBalanceColor(getAccountBalance(selectedAccount.id))}`}>
                      {getBalanceText(getAccountBalance(selectedAccount.id))}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fatura Geçmişi */}
              <div className="border-t pt-4">
                <h4 className="text-lg font-semibold mb-4">Son Faturalar</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(() => {
                    const invoices = getAccountInvoices(selectedAccount.id);
                    const allInvoices = [
                      ...invoices.income.map(inv => ({ ...inv, type: 'income' })),
                      ...invoices.expense.map(inv => ({ ...inv, type: 'expense' }))
                    ].sort((a, b) => new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime());

                    if (allInvoices.length === 0) {
                      return (
                        <p className="text-center text-gray-500 py-4">Bu hesap için henüz fatura bulunmuyor.</p>
                      );
                    }

                    return allInvoices.slice(0, 10).map((invoice) => (
                      <div key={`${invoice.type}-${invoice.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{invoice.description}</p>
                          <p className="text-xs text-gray-600">
                            {format(new Date(invoice.invoice_date), 'dd/MM/yyyy')} • {invoice.payment_status === 'paid' ? 'Ödendi' : 'Ödenmedi'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${
                            invoice.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {invoice.type === 'income' ? '+' : '-'}{formatCurrency(invoice.amount)}
                          </p>
                          <Badge variant="outline" className={`text-xs ${
                            invoice.type === 'income' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-red-100 text-red-800 border-red-200'
                          }`}>
                            {invoice.type === 'income' ? 'Gelir' : 'Gider'}
                          </Badge>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
