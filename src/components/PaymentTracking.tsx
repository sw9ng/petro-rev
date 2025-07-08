import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Search,
  Filter,
  Eye,
  Crown
} from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useCustomerTransactions } from '@/hooks/useCustomerTransactions';
import { usePersonnel } from '@/hooks/usePersonnel';
import { formatCurrency } from '@/lib/numberUtils';
import { useToast } from '@/hooks/use-toast';
import { CustomerDetailView } from './CustomerDetailView';

export const PaymentTracking = () => {
  const { customers, loading: customersLoading } = useCustomers();
  const { 
    transactions, 
    getCustomerTransactions, 
    getCustomerBalance, 
    addPayment, 
    loading: transactionsLoading 
  } = useCustomerTransactions();
  const { personnel } = usePersonnel();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const [formData, setFormData] = useState({
    customer_id: '',
    personnel_id: '',
    amount: '',
    transaction_type: 'payment' as 'payment' | 'debt',
    payment_method: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_id || !formData.personnel_id || !formData.amount) {
      toast({
        title: "Hata",
        description: "Müşteri, personel ve tutar alanları gereklidir.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await addPayment({
      customer_id: formData.customer_id,
      personnel_id: formData.personnel_id,
      amount: parseFloat(formData.amount),
      payment_method: formData.payment_method || undefined,
      description: formData.description,
      transaction_date: new Date().toISOString().split('T')[0]
    });
    
    if (error) {
      toast({
        title: "Hata",
        description: "İşlem eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Başarılı",
        description: "İşlem başarıyla eklendi.",
      });
      setFormData({
        customer_id: '',
        personnel_id: '',
        amount: '',
        transaction_type: 'payment',
        payment_method: '',
        description: ''
      });
      setIsDialogOpen(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredTransactions = transactions.filter(transaction => {
    const matchesDate = !dateFilter || transaction.transaction_date.includes(dateFilter);
    const matchesType = typeFilter === 'all' || transaction.transaction_type === typeFilter;
    return matchesDate && matchesType;
  });

  const totalDebt = customers.reduce((sum, customer) => {
    const balance = getCustomerBalance(customer.id);
    return sum + (balance > 0 ? balance : 0);
  }, 0);

  const totalCredit = customers.reduce((sum, customer) => {
    const balance = getCustomerBalance(customer.id);
    return sum + (balance < 0 ? Math.abs(balance) : 0);
  }, 0);

  const totalPayments = filteredTransactions
    .filter(t => t.transaction_type === 'payment')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebts = filteredTransactions
    .filter(t => t.transaction_type === 'debt')
    .reduce((sum, t) => sum + t.amount, 0);

  if (selectedCustomerId) {
    return (
      <CustomerDetailView 
        customerId={selectedCustomerId}
        onBack={() => setSelectedCustomerId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <span>Cari Satış Takibi</span>
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            </h2>
            <p className="text-sm text-gray-600">Müşteri ödemeleri ve veresiye satışları</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Yeni İşlem
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Yeni Cari İşlem</DialogTitle>
              <DialogDescription>
                Müşteri ödemesi veya veresiye satışı ekleyin
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Müşteri *
                </label>
                <Select
                  value={formData.customer_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, customer_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Müşteri seçiniz" />
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personel *
                </label>
                <Select
                  value={formData.personnel_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, personnel_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Personel seçiniz" />
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tutar *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İşlem Türü *
                  </label>
                  <Select
                    value={formData.transaction_type}
                    onValueChange={(value: 'payment' | 'debt') => setFormData(prev => ({ ...prev, transaction_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payment">Ödeme</SelectItem>
                      <SelectItem value="debt">Veresiye</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {formData.transaction_type === 'payment' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ödeme Yöntemi
                  </label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ödeme yöntemi seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nakit">Nakit</SelectItem>
                      <SelectItem value="kredi_karti">Kredi Kartı</SelectItem>
                      <SelectItem value="havale">Havale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="İşlem açıklaması (opsiyonel)"
                />
              </div>
              <div className="flex space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Ekle
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Borç</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(totalDebt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Alacak</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(totalCredit)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Müşteri</p>
                <p className="text-lg font-bold text-blue-600">{customers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Bu Ay İşlem</p>
                <p className="text-lg font-bold text-purple-600">
                  {transactions.filter(t => 
                    new Date(t.transaction_date).getMonth() === new Date().getMonth()
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ana İçerik */}
      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="customers" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Müşteri Listesi</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>İşlem Geçmişi</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Müşteri ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Card className="shadow-sm border">
            <CardHeader>
              <CardTitle>Müşteri Bakiye Durumu</CardTitle>
              <CardDescription>
                Müşterilerinizin borç/alacak durumunu görüntüleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              {customersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Müşteriler yükleniyor...</p>
                </div>
              ) : filteredCustomers.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Müşteri</TableHead>
                        <TableHead>Telefon</TableHead>
                        <TableHead>Bakiye Durumu</TableHead>
                        <TableHead>Son İşlem</TableHead>
                        <TableHead>İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map((customer) => {
                        const balance = getCustomerBalance(customer.id);
                        const customerTransactions = getCustomerTransactions(customer.id);
                        const lastTransaction = customerTransactions[0];
                        
                        return (
                          <TableRow key={customer.id}>
                            <TableCell className="font-medium">{customer.name}</TableCell>
                            <TableCell>{customer.phone || '-'}</TableCell>
                            <TableCell>
                              {balance === 0 ? (
                                <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                                  Bakiye: ₺0,00
                                </Badge>
                              ) : balance > 0 ? (
                                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                                  Borç: {formatCurrency(balance)}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                  Alacak: {formatCurrency(Math.abs(balance))}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {lastTransaction ? (
                                <div className="text-sm">
                                  <div className="font-medium">
                                    {lastTransaction.transaction_type === 'payment' ? 'Ödeme' : 'Veresiye'}
                                  </div>
                                  <div className="text-gray-500">
                                    {new Date(lastTransaction.transaction_date).toLocaleDateString('tr-TR')}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedCustomerId(customer.id)}
                                className="flex items-center space-x-1"
                              >
                                <Eye className="h-3 w-3" />
                                <span>Detay</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Müşteri bulunamadı</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'Arama kriterlerinize uygun müşteri bulunamadı.' : 'Henüz müşteri eklenmemiş.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <Input
                type="month"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-auto"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm İşlemler</SelectItem>
                  <SelectItem value="payment">Ödemeler</SelectItem>
                  <SelectItem value="debt">Veresiyeler</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(dateFilter || typeFilter !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDateFilter('');
                  setTypeFilter('all');
                }}
              >
                Filtreleri Temizle
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Card className="shadow-sm border">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Toplam Ödeme</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(totalPayments)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Toplam Veresiye</p>
                    <p className="text-lg font-bold text-red-600">{formatCurrency(totalDebts)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm border">
            <CardHeader>
              <CardTitle>İşlem Geçmişi</CardTitle>
              <CardDescription>
                Tüm müşteri işlemlerini görüntüleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">İşlemler yükleniyor...</p>
                </div>
              ) : filteredTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tarih</TableHead>
                        <TableHead>Müşteri</TableHead>
                        <TableHead>Personel</TableHead>
                        <TableHead>İşlem Türü</TableHead>
                        <TableHead>Tutar</TableHead>
                        <TableHead>Ödeme Yöntemi</TableHead>
                        <TableHead>Açıklama</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="text-sm">
                            {new Date(transaction.transaction_date).toLocaleDateString('tr-TR')}
                            <br />
                            <span className="text-xs text-gray-500">
                              {new Date(transaction.transaction_date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium">
                            {transaction.customer?.name || 'Bilinmeyen'}
                          </TableCell>
                          <TableCell>{transaction.personnel?.name || 'Bilinmeyen'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`${
                              transaction.transaction_type === 'payment' 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : 'bg-red-100 text-red-800 border-red-200'
                            }`}>
                              {transaction.transaction_type === 'payment' ? 'Ödeme' : 'Veresiye'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={`font-bold ${
                              transaction.transaction_type === 'payment' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.transaction_type === 'payment' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {transaction.payment_method ? (
                              <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                                {transaction.payment_method === 'nakit' ? 'Nakit' : 
                                 transaction.payment_method === 'kredi_karti' ? 'Kredi Kartı' : 
                                 transaction.payment_method === 'havale' ? 'Havale' : 
                                 transaction.payment_method}
                              </Badge>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            {transaction.description ? (
                              <span className="text-sm text-gray-600 truncate block" title={transaction.description}>
                                {transaction.description}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">İşlem bulunamadı</h3>
                  <p className="text-gray-600">
                    {dateFilter || typeFilter !== 'all' 
                      ? 'Seçili filtreler için işlem bulunamadı.' 
                      : 'Henüz işlem kaydı bulunmuyor.'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
