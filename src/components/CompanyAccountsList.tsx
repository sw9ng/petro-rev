
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CustomerListView } from '@/components/CustomerListView';
import { supabase } from '@/integrations/supabase/client';

interface CompanyAccountsListProps {
  companyId: string;
  onCustomerSelect?: (customerId: string) => void;
}

export const CompanyAccountsList = ({ companyId, onCustomerSelect }: CompanyAccountsListProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

  // Fetch company accounts (different from station customers)
  const fetchCompanyAccounts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('company_accounts')
      .select('*')
      .eq('company_id', companyId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching company accounts:', error);
    } else {
      setCustomers(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setCustomerData({ name: '', phone: '', address: '', notes: '' });
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

    setLoading(true);
    const { error } = await supabase
      .from('company_accounts')
      .insert([
        {
          ...customerData,
          company_id: companyId
        }
      ]);

    if (error) {
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
      fetchCompanyAccounts();
    }
    setLoading(false);
  };

  const handleCustomerSelect = (customerId: string) => {
    if (onCustomerSelect) {
      onCustomerSelect(customerId);
    }
  };

  // Use effect to fetch company accounts when component mounts
  React.useEffect(() => {
    fetchCompanyAccounts();
  }, [companyId]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Şirket Cari Listesi</h2>
        <p className="text-sm lg:text-base text-gray-600">Bu şirkete ait müşterileri ekleyin, yönetin ve detaylarını görüntüleyin</p>
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
              <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
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
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  Ekle
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Company Accounts List */}
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-500" />
            <span>Şirket Cari Listesi</span>
          </CardTitle>
          <CardDescription>Bu şirkete ait müşterileri görüntüleyin</CardDescription>
        </CardHeader>
        <CardContent>
          {customers.length > 0 ? (
            <div className="space-y-2">
              {customers.map((customer) => (
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
                              <span>{customer.phone}</span>
                            </div>
                          )}
                          {customer.address && (
                            <div className="flex items-center space-x-1">
                              <span className="truncate max-w-48">{customer.address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCustomerSelect(customer.id)}
                          className="flex items-center space-x-1"
                        >
                          <span>Detay</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Henüz müşteri yok
              </h3>
              <p className="text-gray-600">
                İlk müşteriyi ekleyin
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
