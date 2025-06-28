
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus, Edit, Trash2, Phone, MapPin } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useToast } from '@/hooks/use-toast';

export const CustomerManagement = () => {
  const { toast } = useToast();
  const { customers, loading, addCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<string | null>(null);
  
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

  const resetForm = () => {
    setCustomerData({ name: '', phone: '', address: '', notes: '' });
    setEditingCustomer(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerData.name.trim()) {
      toast({
        title: "Hata",
        description: "Müşteri adı zorunludur.",
        variant: "destructive"
      });
      return;
    }

    const result = editingCustomer 
      ? await updateCustomer(editingCustomer, customerData)
      : await addCustomer(customerData);

    if (result.error) {
      toast({
        title: "Hata",
        description: "Müşteri kaydedilirken bir hata oluştu.",
        variant: "destructive"
      });
    } else {
      toast({
        title: editingCustomer ? "Müşteri Güncellendi" : "Müşteri Eklendi",
        description: editingCustomer ? "Müşteri başarıyla güncellendi." : "Yeni müşteri başarıyla eklendi.",
      });
      
      resetForm();
      setShowAddDialog(false);
    }
  };

  const handleEdit = (customer: any) => {
    setCustomerData({
      name: customer.name,
      phone: customer.phone || '',
      address: customer.address || '',
      notes: customer.notes || ''
    });
    setEditingCustomer(customer.id);
    setShowAddDialog(true);
  };

  const handleDelete = async (customerId: string) => {
    if (confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) {
      const { error } = await deleteCustomer(customerId);
      
      if (error) {
        toast({
          title: "Hata",
          description: "Müşteri silinirken bir hata oluştu.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Müşteri Silindi",
          description: "Müşteri başarıyla silindi.",
        });
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Müşteri Yönetimi</h2>
        <p className="text-sm lg:text-base text-gray-600">Müşterilerinizi ekleyin ve yönetin</p>
      </div>

      <div className="flex justify-end">
        <Dialog open={showAddDialog} onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Müşteri
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCustomer ? 'Müşteri Düzenle' : 'Yeni Müşteri Ekle'}</DialogTitle>
              <DialogDescription>
                Müşteri bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Müşteri Adı *</Label>
                <Input
                  value={customerData.name}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Müşteri adını girin"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input
                  value={customerData.phone}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Telefon numarası"
                />
              </div>
              <div className="space-y-2">
                <Label>Adres</Label>
                <Input
                  value={customerData.address}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Müşteri adresi"
                />
              </div>
              <div className="space-y-2">
                <Label>Notlar</Label>
                <Textarea
                  value={customerData.notes}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ek notlar..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  İptal
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingCustomer ? 'Güncelle' : 'Ekle'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map((customer) => (
          <Card key={customer.id} className="shadow-sm border">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-600" />
                  <CardTitle className="text-lg">{customer.name}</CardTitle>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(customer)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(customer.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {customer.phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{customer.address}</span>
                  </div>
                )}
                {customer.notes && (
                  <div className="text-sm text-gray-600 mt-2">
                    <p className="font-medium">Notlar:</p>
                    <p className="text-xs">{customer.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {customers.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz müşteri yok</h3>
            <p className="text-gray-600 mb-4">İlk müşterinizi ekleyin</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
