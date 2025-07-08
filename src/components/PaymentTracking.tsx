import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CustomerDetailView } from './CustomerDetailView';
import { CustomerListView } from './CustomerListView';
import { useCustomers } from '@/hooks/useCustomers';
import { useCustomerTransactions } from '@/hooks/useCustomerTransactions';
import { usePersonnel } from '@/hooks/usePersonnel';
import { formatCurrency } from '@/lib/numberUtils';
import { Plus, Search, CreditCard, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';

export const PaymentTracking = () => {
  const { customers } = useCustomers();
  const { personnel } = usePersonnel();
  const { 
    transactions, 
    addPayment, 
    addVeresiye, 
    getAllTransactionsGroupedByCustomer,
    getTotalOutstandingDebt 
  } = useCustomerTransactions();

  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedPersonnel, setSelectedPersonnel] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const groupedTransactions = getAllTransactionsGroupedByCustomer();
  const totalOutstandingDebt = getTotalOutstandingDebt();

  // Filtered and sorted transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = groupedTransactions.filter(group => 
      group.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort based on selected criteria
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'balance-high':
          comparison = b.balance - a.balance;
          break;
        case 'balance-low':
          comparison = a.balance - b.balance;
          break;
        case 'date-newest':
          const aLatest = Math.max(...a.transactions.map(t => new Date(t.transaction_date).getTime()));
          const bLatest = Math.max(...b.transactions.map(t => new Date(t.transaction_date).getTime()));
          comparison = bLatest - aLatest;
          break;
        case 'date-oldest':
          const aOldest = Math.min(...a.transactions.map(t => new Date(t.transaction_date).getTime()));
          const bOldest = Math.min(...b.transactions.map(t => new Date(t.transaction_date).getTime()));
          comparison = aOldest - bOldest;
          break;
        case 'name':
        default:
          comparison = a.customer.name.localeCompare(b.customer.name, 'tr');
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [groupedTransactions, searchTerm, sortBy, sortOrder]);

  const handleAddPayment = async () => {
    if (!selectedCustomer || !selectedPersonnel || !amount) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    const result = await addPayment({
      customer_id: selectedCustomer,
      personnel_id: selectedPersonnel,
      amount: parseFloat(amount),
      payment_method: paymentMethod,
      description: description,
      transaction_date: new Date().toISOString()
    });

    if (result.error) {
      toast.error('Ödeme kaydedilirken hata oluştu');
    } else {
      toast.success('Ödeme başarıyla kaydedildi');
      setSelectedCustomer('');
      setSelectedPersonnel('');
      setAmount('');
      setPaymentMethod('');
      setDescription('');
    }
  };

  const handleAddVeresiye = async () => {
    if (!selectedCustomer || !selectedPersonnel || !amount) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    const result = await addVeresiye({
      customer_id: selectedCustomer,
      personnel_id: selectedPersonnel,
      amount: parseFloat(amount),
      description: description,
      transaction_date: new Date().toISOString()
    });

    if (result.error) {
      toast.error('Veresiye kaydedilirken hata oluştu');
    } else {
      toast.success('Veresiye başarıyla kaydedildi');
      setSelectedCustomer('');
      setSelectedPersonnel('');
      setAmount('');
      setDescription('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Cari Satış Takibi
          </h2>
          <p className="text-gray-600 mt-2">Müşteri borç ve ödeme takibi</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-lg px-4 py-2">
            Toplam Borç: {formatCurrency(totalOutstandingDebt)}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="payment">Ödeme Al</TabsTrigger>
          <TabsTrigger value="debt">Borç Kaydet</TabsTrigger>
          <TabsTrigger value="customers">Müşteriler</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Müşteri ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="h-4 w-4 text-gray-500" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sıralama" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">İsim (A-Z)</SelectItem>
                  <SelectItem value="balance-high">Borç (Yüksek-Düşük)</SelectItem>
                  <SelectItem value="balance-low">Borç (Düşük-Yüksek)</SelectItem>
                  <SelectItem value="date-newest">Tarih (Yeni-Eski)</SelectItem>
                  <SelectItem value="date-oldest">Tarih (Eski-Yeni)</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredAndSortedTransactions.map((group) => (
              <Card key={group.customer.name} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{group.customer.name}</h3>
                      <p className="text-sm text-gray-600">
                        {group.transactions.length} işlem
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        group.balance > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {group.balance > 0 ? '+' : ''}
                        {formatCurrency(Math.abs(group.balance))}
                      </div>
                      <p className="text-sm text-gray-600">
                        {group.balance > 0 ? 'Borç' : group.balance < 0 ? 'Avans' : 'Denge'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Son İşlem: {group.transactions.length > 0 ? 
                        new Date(Math.max(...group.transactions.map(t => new Date(t.transaction_date).getTime())))
                          .toLocaleDateString('tr-TR') : 'Yok'
                      }</span>
                      <span>
                        Borç: {formatCurrency(group.transactions.filter(t => t.transaction_type === 'debt').reduce((sum, t) => sum + t.amount, 0))} | 
                        Ödeme: {formatCurrency(group.transactions.filter(t => t.transaction_type === 'payment').reduce((sum, t) => sum + t.amount, 0))}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ödeme Al</CardTitle>
              <CardDescription>Müşteri ödemesi kaydet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Müşteri</Label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Müşteri seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Personel</Label>
                <Select value={selectedPersonnel} onValueChange={setSelectedPersonnel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Personel seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {personnel.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tutar</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Ödeme Yöntemi</Label>
                <Input
                  type="text"
                  placeholder="Nakit, Kredi Kartı, Havale..."
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Açıklama</Label>
                <Input
                  type="text"
                  placeholder="Ödeme açıklaması..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <Button onClick={handleAddPayment} className="w-full">
                <CreditCard className="h-4 w-4 mr-2" />
                Ödeme Kaydet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debt" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Borç Kaydet</CardTitle>
              <CardDescription>Müşteri borcu kaydet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Müşteri</Label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Müşteri seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Personel</Label>
                <Select value={selectedPersonnel} onValueChange={setSelectedPersonnel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Personel seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {personnel.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tutar</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Açıklama</Label>
                <Input
                  type="text"
                  placeholder="Borç açıklaması..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <Button onClick={handleAddVeresiye} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Borç Kaydet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <CustomerListView />
        </TabsContent>
      </Tabs>
    </div>
  );
};
