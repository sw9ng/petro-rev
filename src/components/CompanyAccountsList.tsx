
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, Eye, Phone, MapPin, FileText } from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface CompanyAccountsListProps {
  companyId: string;
}

export const CompanyAccountsList = ({ companyId }: CompanyAccountsListProps) => {
  const { accounts, loading, addAccount, deleteAccount } = useInvoices(companyId);
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

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cari Hesap Listesi</CardTitle>
          <CardDescription>
            Tüm cari hesaplarınızı buradan görüntüleyebilir ve yönetebilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAccounts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hesap Adı</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Adres</TableHead>
                    <TableHead>Oluşturulma</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.name}</TableCell>
                      <TableCell>{account.phone || '-'}</TableCell>
                      <TableCell className="max-w-xs truncate">{account.address || '-'}</TableCell>
                      <TableCell>
                        {format(new Date(account.created_at), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => showAccountDetail(account)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAccount(account.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Arama kriterinize uygun cari hesap bulunamadı.' : 'Henüz cari hesap bulunmuyor.'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cari Hesap Detayı</DialogTitle>
            <DialogDescription>
              {selectedAccount?.name} hesabının detaylı bilgileri
            </DialogDescription>
          </DialogHeader>
          {selectedAccount && (
            <div className="space-y-4">
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
