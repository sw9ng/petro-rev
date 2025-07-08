import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Filter, DollarSign, TrendingUp, TrendingDown, Eye, Users, Calendar } from "lucide-react";
import { useCustomers } from "@/hooks/useCustomers";
import { useCustomerTransactions } from "@/hooks/useCustomerTransactions";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CustomerDetailView } from "@/components/CustomerDetailView";

export const PaymentTracking = () => {
  const { user } = useAuth();
  const { customers } = useCustomers();
  const { transactions } = useCustomerTransactions();
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('balance');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showDetailView, setShowDetailView] = useState(false);
  const [isDebtDialogOpen, setIsDebtDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedCustomerForTransaction, setSelectedCustomerForTransaction] = useState<string>('');
  const [debtAmount, setDebtAmount] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  // Müşteri detay görünümü
  if (showDetailView && selectedCustomer) {
    return (
      <CustomerDetailView 
        customer={selectedCustomer} 
        onBack={() => {
          setShowDetailView(false);
          setSelectedCustomer(null);
        }} 
      />
    );
  }

  // Müşteri bakiyelerini hesaplama
  const customersWithBalance = customers.map(customer => {
    const customerTransactions = transactions.filter(t => t.customer_id === customer.id);
    const totalDebt = customerTransactions
      .filter(t => t.transaction_type === 'debt')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalPayment = customerTransactions
      .filter(t => t.transaction_type === 'payment')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    return {
      ...customer,
      balance: totalDebt - totalPayment,
      totalDebt,
      totalPayment,
      transactionCount: customerTransactions.length
    };
  });

  const filteredCustomers = customersWithBalance
    .filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'balance':
          return (a.balance - b.balance) * order;
        case 'name':
          return a.name.localeCompare(b.name) * order;
        case 'date':
          return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * order;
        default:
          return 0;
      }
    });

  const totalDebt = customersWithBalance.reduce((sum, customer) => sum + customer.totalDebt, 0);
  const totalPayment = customersWithBalance.reduce((sum, customer) => sum + customer.totalPayment, 0);
  const netDebt = totalDebt - totalPayment;
  const customersWithDebt = customersWithBalance.filter(c => c.balance > 0).length;

  const handleDebtSubmit = async () => {
    if (!selectedCustomerForTransaction || !debtAmount || !description) {
      toast.error('Lütfen tüm alanları doldurunuz');
      return;
    }

    try {
      const { error } = await supabase
        .from('customer_transactions')
        .insert({
          customer_id: selectedCustomerForTransaction,
          amount: parseFloat(debtAmount),
          description,
          transaction_type: 'debt',
          status: 'completed',
          personnel_id: user?.id,
          station_id: user?.id,
        });

      if (error) throw error;

      toast.success('Borç kaydı başarıyla eklendi');
      setIsDebtDialogOpen(false);
      setSelectedCustomerForTransaction('');
      setDebtAmount('');
      setDescription('');
    } catch (error) {
      console.error('Error adding debt:', error);
      toast.error('Borç kaydı eklenirken hata oluştu');
    }
  };

  const handlePaymentSubmit = async () => {
    if (!selectedCustomerForTransaction || !paymentAmount || !description) {
      toast.error('Lütfen tüm alanları doldurunuz');
      return;
    }

    try {
      const { error } = await supabase
        .from('customer_transactions')
        .insert({
          customer_id: selectedCustomerForTransaction,
          amount: parseFloat(paymentAmount),
          description,
          transaction_type: 'payment',
          payment_method: paymentMethod,
          status: 'completed',
          personnel_id: user?.id,
          station_id: user?.id,
        });

      if (error) throw error;

      toast.success('Ödeme kaydı başarıyla eklendi');
      setIsPaymentDialogOpen(false);
      setSelectedCustomerForTransaction('');
      setPaymentAmount('');
      setDescription('');
      setPaymentMethod('');
    } catch (error) {
      console.error('Error adding payment:', error);
      toast.error('Ödeme kaydı eklenirken hata oluştu');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cari Satış Yönetimi</h2>
          <p className="text-gray-600">Müşteri borç ve ödemelerini yönetin</p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isDebtDialogOpen} onOpenChange={setIsDebtDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4 mr-2" />
                Borç Kaydet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Borç Kaydı</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="debt-customer">Müşteri</Label>
                  <Select value={selectedCustomerForTransaction} onValueChange={setSelectedCustomerForTransaction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Müşteri seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="debt-amount">Borç Miktarı</Label>
                  <Input
                    id="debt-amount"
                    type="number"
                    value={debtAmount}
                    onChange={(e) => setDebtAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="debt-description">Açıklama</Label>
                  <Textarea
                    id="debt-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Borç açıklaması"
                  />
                </div>
                <Button onClick={handleDebtSubmit} className="w-full">
                  Borç Kaydını Ekle
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Ödeme Kaydet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Ödeme Kaydı</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="payment-customer">Müşteri</Label>
                  <Select value={selectedCustomerForTransaction} onValueChange={setSelectedCustomerForTransaction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Müşteri seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="payment-amount">Ödeme Miktarı</Label>
                  <Input
                    id="payment-amount"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="payment-method">Ödeme Yöntemi</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ödeme yöntemi seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nakit">Nakit</SelectItem>
                      <SelectItem value="kart">Kart</SelectItem>
                      <SelectItem value="havale">Havale</SelectItem>
                      <SelectItem value="cek">Çek</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="payment-description">Açıklama</Label>
                  <Textarea
                    id="payment-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ödeme açıklaması"
                  />
                </div>
                <Button onClick={handlePaymentSubmit} className="w-full">
                  Ödeme Kaydını Ekle
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-red-50 to-rose-50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Toplam Borç
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">₺{totalDebt.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center">
              <TrendingDown className="h-4 w-4 mr-2" />
              Toplam Ödeme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">₺{totalPayment.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Net Borç
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netDebt > 0 ? 'text-red-800' : 'text-green-800'}`}>
              ₺{netDebt.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Borçlu Müşteri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{customersWithDebt}</div>
          </CardContent>
        </Card>
      </div>

      {/* Arama ve Filtreleme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="h-5 w-5 mr-2" />
            Arama ve Filtreleme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Müşteri adı veya telefon ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balance">Bakiye</SelectItem>
                  <SelectItem value="name">Müşteri Adı</SelectItem>
                  <SelectItem value="date">Kayıt Tarihi</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Azalan</SelectItem>
                  <SelectItem value="asc">Artan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Müşteri Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>Müşteri Listesi</CardTitle>
          <CardDescription>
            {filteredCustomers.length} müşteri listeleniyor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Müşteri</TableHead>
                <TableHead>İletişim</TableHead>
                <TableHead>Toplam Borç</TableHead>
                <TableHead>Toplam Ödeme</TableHead>
                <TableHead>Bakiye</TableHead>
                <TableHead>İşlem Sayısı</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.address || 'Adres yok'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {customer.phone || 'Telefon yok'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-red-600">
                      ₺{customer.totalDebt.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-green-600">
                      ₺{customer.totalPayment.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={customer.balance > 0 ? "destructive" : "default"}>
                      ₺{customer.balance.toLocaleString()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{customer.transactionCount}</span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setShowDetailView(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Detay
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
