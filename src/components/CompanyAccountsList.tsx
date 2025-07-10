
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useInvoices } from '@/hooks/useInvoices';
import { formatCurrency } from '@/lib/numberUtils';
import { Plus, Users, Edit, Eye, ArrowLeft, Phone, MapPin, Calendar, FileText } from 'lucide-react';
import { toast } from 'sonner';

export const CompanyAccountsList = ({ companyId }: { companyId: string }) => {
  const { accounts, incomeInvoices, expenseInvoices, loading, addAccount, updateAccount } = useInvoices(companyId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [newAccountData, setNewAccountData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [editAccountData, setEditAccountData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

  const handleCreateAccount = async () => {
    if (!newAccountData.name.trim()) {
      toast.error("Cari hesap adı zorunludur.");
      return;
    }

    const { error } = await addAccount({
      name: newAccountData.name,
      phone: newAccountData.phone || undefined,
      address: newAccountData.address || undefined,
      notes: newAccountData.notes || undefined
    });

    if (error) {
      toast.error("Cari hesap oluşturulurken bir hata oluştu.");
      return;
    }

    toast.success("Cari hesap başarıyla oluşturuldu.");
    setNewAccountData({ name: '', phone: '', address: '', notes: '' });
    setIsDialogOpen(false);
  };

  const handleEditAccount = (account: any) => {
    setEditingAccountId(account.id);
    setEditAccountData({
      name: account.name,
      phone: account.phone || '',
      address: account.address || '',
      notes: account.notes || ''
    });
  };

  const handleUpdateAccount = async () => {
    if (!editingAccountId) return;

    const { error } = await updateAccount(editingAccountId, {
      name: editAccountData.name,
      phone: editAccountData.phone || undefined,
      address: editAccountData.address || undefined,
      notes: editAccountData.notes || undefined
    });

    if (error) {
      toast.error("Cari hesap güncellenirken bir hata oluştu.");
      return;
    }

    toast.success("Cari hesap başarıyla güncellendi.");
    setEditingAccountId(null);
    setEditAccountData({ name: '', phone: '', address: '', notes: '' });
  };

  const getAccountBalance = (accountId: string) => {
    const accountIncomes = incomeInvoices.filter(invoice => invoice.account_id === accountId);
    const accountExpenses = expenseInvoices.filter(invoice => invoice.account_id === accountId);
    
    const totalIncome = accountIncomes.reduce((sum, invoice) => sum + invoice.amount, 0);
    const totalExpense = accountExpenses.reduce((sum, invoice) => sum + invoice.amount, 0);
    
    return totalIncome - totalExpense;
  };

  const getAccountTransactions = (accountId: string) => {
    const accountIncomes = incomeInvoices
      .filter(invoice => invoice.account_id === accountId)
      .map(invoice => ({ 
        ...invoice, 
        type: 'income' as const,
        date: invoice.invoice_date 
      }));
    
    const accountExpenses = expenseInvoices
      .filter(invoice => invoice.account_id === accountId)
      .map(invoice => ({ 
        ...invoice, 
        type: 'expense' as const,
        date: invoice.invoice_date 
      }));
    
    return [...accountIncomes, ...accountExpenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  // Account Detail View
  if (selectedAccountId) {
    const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);
    const accountTransactions = getAccountTransactions(selectedAccountId);
    const balance = getAccountBalance(selectedAccountId);

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => setSelectedAccountId(null)} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Geri</span>
          </Button>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Cari Hesap Detayı</h2>
        </div>

        {/* Account Info */}
        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span>{selectedAccount?.name}</span>
            </CardTitle>
            <CardDescription>Cari hesap bilgileri ve bakiye durumu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{selectedAccount?.phone || 'Telefon bilgisi yok'}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                  <span className="text-gray-900">{selectedAccount?.address || 'Adres bilgisi yok'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">
                    Kayıt: {new Date(selectedAccount?.created_at || '').toLocaleDateString('tr-TR')}
                  </span>
                </div>
                {selectedAccount?.notes && (
                  <div className="flex items-start space-x-3">
                    <FileText className="h-4 w-4 text-gray-400 mt-1" />
                    <span className="text-gray-900">{selectedAccount.notes}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-600 mb-2">Güncel Bakiye</h3>
                <p className={`text-3xl font-bold ${getBalanceColor(balance)}`}>
                  {getBalanceText(balance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Transactions */}
        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-xl">
              <FileText className="h-6 w-6 text-green-500" />
              <span>Cari Hesap Hareketleri</span>
              <Badge variant="outline" className="ml-auto">
                {accountTransactions.length} Hareket
              </Badge>
            </CardTitle>
            <CardDescription>Cari hesaba ait tüm gelir ve gider faturalarının listesi</CardDescription>
          </CardHeader>
          <CardContent>
            {accountTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Fatura No</TableHead>
                      <TableHead>Açıklama</TableHead>
                      <TableHead>Tür</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>Ödeme Durumu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accountTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="text-sm">
                          {new Date(transaction.date).toLocaleDateString('tr-TR')}
                        </TableCell>
                        <TableCell>{transaction.invoice_number || 'Yok'}</TableCell>
                        <TableCell className="max-w-xs">
                          <span className="text-sm text-gray-600 truncate block" title={transaction.description}>
                            {transaction.description}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${
                            transaction.type === 'income' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-red-100 text-red-800 border-red-200'
                          }`}>
                            {transaction.type === 'income' ? 'Gelir' : 'Gider'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`font-bold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${
                            transaction.payment_status === 'paid' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          }`}>
                            {transaction.payment_status === 'paid' ? 'Ödendi' : 'Ödenmedi'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz hareket yok</h3>
                <p className="text-gray-600">Bu cari hesabın henüz hiçbir hareketi bulunmuyor.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Cari Hesaplar</h2>
        <p className="text-sm lg:text-base text-gray-600">Şirketinize ait cari hesapları görüntüleyin ve yönetin</p>
      </div>

      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Cari Hesap
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Cari Hesap Ekle</DialogTitle>
              <DialogDescription>
                Cari hesap bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Cari Hesap Adı *</Label>
                <Input
                  value={newAccountData.name}
                  onChange={(e) => setNewAccountData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Cari hesap adını girin"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input
                  value={newAccountData.phone}
                  onChange={(e) => setNewAccountData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Telefon numarası"
                />
              </div>
              <div className="space-y-2">
                <Label>Adres</Label>
                <Input
                  value={newAccountData.address}
                  onChange={(e) => setNewAccountData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Adres bilgisi"
                />
              </div>
              <div className="space-y-2">
                <Label>Notlar</Label>
                <Textarea
                  value={newAccountData.notes}
                  onChange={(e) => setNewAccountData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ek notlar..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleCreateAccount} className="bg-blue-600 hover:bg-blue-700">
                Ekle
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Accounts List */}
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-500" />
            <span>Cari Hesap Listesi</span>
          </CardTitle>
          <CardDescription>Cari hesapları ve bakiyelerini görüntüleyin</CardDescription>
        </CardHeader>
        <CardContent>
          {accounts.length > 0 ? (
            <div className="space-y-2">
              {accounts.map((account) => {
                const balance = getAccountBalance(account.id);
                return (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{account.name}</h3>
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
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant="outline" 
                            className={`${getBalanceColor(balance)} font-medium`}
                          >
                            {getBalanceText(balance)}
                          </Badge>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditAccount(account)}
                                className="flex items-center space-x-1"
                              >
                                <Edit className="h-4 w-4" />
                                <span>Düzenle</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Cari Hesap Düzenle</DialogTitle>
                                <DialogDescription>
                                  Cari hesap bilgilerini güncelleyin
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-name">Cari Hesap Adı *</Label>
                                  <Input 
                                    id="edit-name" 
                                    value={editAccountData.name}
                                    onChange={(e) => setEditAccountData({...editAccountData, name: e.target.value})}
                                    placeholder="Cari hesap adı"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-phone">Telefon</Label>
                                  <Input 
                                    id="edit-phone" 
                                    value={editAccountData.phone}
                                    onChange={(e) => setEditAccountData({...editAccountData, phone: e.target.value})}
                                    placeholder="0555 123 45 67"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-address">Adres</Label>
                                  <Input 
                                    id="edit-address" 
                                    value={editAccountData.address}
                                    onChange={(e) => setEditAccountData({...editAccountData, address: e.target.value})}
                                    placeholder="Adres bilgisi"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-notes">Notlar</Label>
                                  <Textarea 
                                    id="edit-notes" 
                                    value={editAccountData.notes}
                                    onChange={(e) => setEditAccountData({...editAccountData, notes: e.target.value})}
                                    placeholder="Ek notlar..."
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setEditingAccountId(null)}>İptal</Button>
                                <Button onClick={handleUpdateAccount}>Güncelle</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedAccountId(account.id)}
                            className="flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Detay</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz cari hesap yok</h3>
              <p className="text-gray-600">İlk cari hesabı ekleyin</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
