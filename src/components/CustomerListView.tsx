
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, Search, Eye, Phone, MapPin, Edit } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useCustomerTransactions } from '@/hooks/useCustomerTransactions';
import { formatCurrency } from '@/lib/numberUtils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface CustomerListViewProps {
  onCustomerSelect: (customerId: string) => void;
}

export const CustomerListView = ({ onCustomerSelect }: CustomerListViewProps) => {
  const { customers, loading: customersLoading, updateCustomer } = useCustomers();
  const { getCustomerBalance, loading: transactionsLoading } = useCustomerTransactions();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'bg-red-100 text-red-800 border-red-200';
    if (balance < 0) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getBalanceText = (balance: number) => {
    if (balance > 0) return `Borç: ${formatCurrency(balance)}`;
    if (balance < 0) return `Alacak: ${formatCurrency(Math.abs(balance))}`;
    return 'Bakiye: ₺0,00';
  };

  const handleEditCustomer = (customer: any) => {
    setEditingCustomer(customer.id);
    setEditFormData({
      name: customer.name,
      phone: customer.phone || '',
      address: customer.address || '',
      notes: customer.notes || ''
    });
  };

  const handleUpdateCustomer = async () => {
    if (!editingCustomer) return;

    const { error } = await updateCustomer(editingCustomer, {
      name: editFormData.name,
      phone: editFormData.phone || undefined,
      address: editFormData.address || undefined,
      notes: editFormData.notes || undefined
    });

    if (error) {
      toast.error("Müşteri güncellenirken bir hata oluştu.");
      return;
    }

    toast.success("Müşteri başarıyla güncellendi.");
    setEditingCustomer(null);
    setEditFormData({ name: '', phone: '', address: '', notes: '' });
  };

  const handleCustomerDetail = (customerId: string) => {
    // Check if we're in the main customer management page or cash register page
    if (window.location.pathname === '/') {
      // Main customer management page - navigate to separate detail page
      navigate(`/customer/${customerId}`);
    } else {
      // Cash register page - use the callback to show detail inline
      onCustomerSelect(customerId);
    }
  };

  if (customersLoading || transactionsLoading) {
    return <div className="flex justify-center items-center h-64">Yükleniyor...</div>;
  }

  return (
    <Card className="shadow-sm border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-blue-500" />
          <span>Müşteri Listesi</span>
        </CardTitle>
        <CardDescription>Müşterileri ve bakiyelerini görüntüleyin</CardDescription>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Müşteri adı veya telefon ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredCustomers.length > 0 ? (
          <div className="space-y-2">
            {filteredCustomers.map((customer) => {
              const balance = getCustomerBalance(customer.id);
              return (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{customer.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          {customer.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                          {customer.address && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate max-w-48">{customer.address}</span>
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
                              onClick={() => handleEditCustomer(customer)}
                              className="flex items-center space-x-1"
                            >
                              <Edit className="h-4 w-4" />
                              <span>Düzenle</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Müşteri Düzenle</DialogTitle>
                              <DialogDescription>
                                Müşteri bilgilerini güncelleyin
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-name">Müşteri Adı *</Label>
                                <Input 
                                  id="edit-name" 
                                  value={editFormData.name}
                                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                                  placeholder="Müşteri adı"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-phone">Telefon</Label>
                                <Input 
                                  id="edit-phone" 
                                  value={editFormData.phone}
                                  onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                                  placeholder="0555 123 45 67"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-address">Adres</Label>
                                <Input 
                                  id="edit-address" 
                                  value={editFormData.address}
                                  onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                                  placeholder="Adres bilgisi"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-notes">Notlar</Label>
                                <Textarea 
                                  id="edit-notes" 
                                  value={editFormData.notes}
                                  onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                                  placeholder="Ek notlar..."
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setEditingCustomer(null)}>İptal</Button>
                              <Button onClick={handleUpdateCustomer}>Güncelle</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCustomerDetail(customer.id)}
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Müşteri bulunamadı' : 'Henüz müşteri yok'}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Arama kriterlerinize uygun müşteri bulunamadı' 
                : 'İlk müşteriyi ekleyin'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
