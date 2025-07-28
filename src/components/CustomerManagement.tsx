import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useToast } from '@/hooks/use-toast';
import { CustomerListView } from '@/components/CustomerListView';
import { CustomerDetailView } from '@/components/CustomerDetailView';
import { CustomerExcelUpload } from '@/components/CustomerExcelUpload';

export const CustomerManagement = () => {
  const { toast } = useToast();
  const { addCustomer, loading } = useCustomers();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
    customer_type: 'müşteri',
    debt_amount: 0,
    payable_amount: 0,
    receivable_amount: 0
  });

  const resetForm = () => {
    setCustomerData({ 
      name: '', 
      phone: '', 
      address: '', 
      notes: '',
      customer_type: 'müşteri',
      debt_amount: 0,
      payable_amount: 0,
      receivable_amount: 0
    });
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

    const result = await addCustomer(customerData);

    if (result.error) {
      toast({
        title: "Hata",
        description: "Müşteri kaydedilirken bir hata oluştu.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Müşteri Eklendi",
        description: "Yeni müşteri başarıyla eklendi.",
      });
      
      resetForm();
      setShowAddDialog(false);
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
  };

  const handleBackToList = () => {
    setSelectedCustomerId(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Yükleniyor...</div>;
  }

  // If a customer is selected, show detail view
  if (selectedCustomerId) {
    return <CustomerDetailView customerId={selectedCustomerId} onBack={handleBackToList} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Müşteri Yönetimi</h2>
        <p className="text-sm lg:text-base text-gray-600">Müşterilerinizi ekleyin, yönetin ve detaylarını görüntüleyin</p>
      </div>

      <div className="flex justify-end space-x-2">
        <CustomerExcelUpload />
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
              <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
              <DialogDescription>
                Müşteri bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Cari Tipi *</Label>
                <Select
                  value={customerData.customer_type}
                  onValueChange={(value) => setCustomerData(prev => ({ ...prev, customer_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Cari tipi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="çalışan">Çalışan</SelectItem>
                    <SelectItem value="şirket">Şirket</SelectItem>
                    <SelectItem value="müşteri">Müşteri</SelectItem>
                    <SelectItem value="ev müşterisi">Ev Müşterisi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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

              {/* Ev Müşterisi için özel alanlar */}
              {customerData.customer_type === 'ev müşterisi' && (
                <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border">
                  <h4 className="font-medium text-gray-900">Ev Müşterisi Borç Takibi</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Borç Miktarı (TL)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={customerData.debt_amount}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, debt_amount: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ödenecek Miktar (TL)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={customerData.payable_amount}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, payable_amount: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tahsil Edilecek (TL)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={customerData.receivable_amount}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, receivable_amount: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  İptal
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Ekle
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Customer List with Detail and Edit Functionality */}
      <CustomerListView onCustomerSelect={handleCustomerSelect} />
    </div>
  );
};
