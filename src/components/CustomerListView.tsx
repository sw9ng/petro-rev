import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Search, Eye, Phone, MapPin } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useCustomerTransactions } from '@/hooks/useCustomerTransactions';
import { formatCurrency } from '@/lib/numberUtils';

interface CustomerListViewProps {
  onCustomerSelect: (customerId: string) => void;
}

export const CustomerListView = ({ onCustomerSelect }: CustomerListViewProps) => {
  const { customers, loading: customersLoading } = useCustomers();
  const { getCustomerBalance, loading: transactionsLoading } = useCustomerTransactions();
  const [searchTerm, setSearchTerm] = useState('');

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
          <Search className="absolute left-3 top-1/2 transform -y-1/2 h-4 w-4 text-gray-400" />
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCustomerSelect(customer.id)}
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