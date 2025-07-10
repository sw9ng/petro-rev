
import { useState, useEffect } from 'react';
import { useAttendantAuth } from '@/contexts/AttendantAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Filter, LogOut, User, Clock, TrendingUp, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface AttendantShift {
  id: string;
  start_time: string;
  end_time: string | null;
  cash_sales: number;
  card_sales: number;
  otomasyon_satis: number;
  over_short: number;
  status: string;
  veresiye: number;
  bank_transfers: number;
  loyalty_card: number;
  shift_number?: 'V1' | 'V2';
}

interface ShiftTransaction {
  id: string;
  description: string;
  amount: number;
  transaction_type: string;
  customer_name?: string;
}

export default function AttendantDashboard() {
  const { attendant, signOut, loading: authLoading } = useAttendantAuth();
  const navigate = useNavigate();
  const [shifts, setShifts] = useState<AttendantShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShift, setSelectedShift] = useState<AttendantShift | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [shiftTransactions, setShiftTransactions] = useState<ShiftTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  
  // Filters
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [shiftFilter, setShiftFilter] = useState('all');

  useEffect(() => {
    console.log('AttendantDashboard useEffect - attendant:', attendant, 'authLoading:', authLoading);
    
    if (authLoading) {
      console.log('Still loading auth state...');
      return;
    }
    
    if (!attendant) {
      console.log('No attendant found, redirecting to auth');
      navigate('/auth');
      return;
    }
    
    console.log('Attendant found, fetching shifts for:', attendant);
    fetchShifts();
  }, [attendant, navigate, authLoading]);

  const fetchShifts = async () => {
    if (!attendant) return;
    
    console.log('Fetching shifts for attendant:', attendant.id, 'at station:', attendant.station_id);
    setLoading(true);
    
    // Prepare date filters
    let dateStart = dateRange.start ? new Date(dateRange.start).toISOString() : null;
    let dateEnd = null;
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      dateEnd = endDate.toISOString();
    }

    console.log('Calling get_attendant_shifts RPC...');
    const { data, error } = await supabase.rpc('get_attendant_shifts', {
      attendant_id_param: attendant.id,
      station_id_param: attendant.station_id,
      date_start_param: dateStart,
      date_end_param: dateEnd,
      shift_filter_param: shiftFilter
    });

    if (error) {
      console.error('Error fetching shifts:', error);
    } else {
      console.log('Fetched shifts data:', data);
      const mappedData = (data || []).map(shift => ({
        id: shift.id,
        start_time: shift.start_time,
        end_time: shift.end_time,
        cash_sales: shift.cash_sales || 0,
        card_sales: shift.card_sales || 0,
        otomasyon_satis: shift.actual_amount || 0,
        over_short: shift.over_short || 0,
        status: shift.status,
        veresiye: shift.veresiye || 0,
        bank_transfers: shift.bank_transfers || 0,
        loyalty_card: shift.loyalty_card || 0,
        shift_number: (shift.shift_number as 'V1' | 'V2') || undefined,
      }));
      
      console.log('Mapped shifts:', mappedData);
      setShifts(mappedData);
    }
    setLoading(false);
  };

  const handleSignOut = () => {
    console.log('Signing out attendant');
    signOut();
    navigate('/auth');
  };

  const clearFilters = () => {
    setDateRange({ start: '', end: '' });
    setShiftFilter('all');
  };

  const applyFilters = () => {
    fetchShifts();
    setFilterOpen(false);
  };

  const fetchShiftTransactions = async (shiftId: string) => {
    setLoadingTransactions(true);
    const { data, error } = await supabase
      .from('customer_transactions')
      .select(`
        id,
        description,
        amount,
        transaction_type,
        customers(name)
      `)
      .eq('shift_id', shiftId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching shift transactions:', error);
    } else {
      const mappedData = (data || []).map(transaction => ({
        id: transaction.id,
        description: transaction.description || 'Açıklama yok',
        amount: transaction.amount,
        transaction_type: transaction.transaction_type,
        customer_name: (transaction.customers as any)?.name
      }));
      setShiftTransactions(mappedData);
    }
    setLoadingTransactions(false);
  };

  const viewShiftDetails = (shift: AttendantShift) => {
    setSelectedShift(shift);
    setDetailsOpen(true);
    fetchShiftTransactions(shift.id);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const getShiftDisplayName = (shift: AttendantShift) => {
    const startDate = new Date(shift.start_time);
    const formattedDate = format(startDate, 'dd.MM.yyyy', { locale: tr });
    const shiftNumber = shift.shift_number || 'V1';
    return `${formattedDate} – ${shiftNumber}`;
  };

  const totalSales = shifts.reduce((sum, shift) => sum + shift.cash_sales + shift.card_sales + shift.loyalty_card, 0);
  const totalOverShort = shifts.reduce((sum, shift) => sum + shift.over_short, 0);

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // If no attendant after loading, don't render anything (redirect will happen)
  if (!attendant) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Mobile-optimized header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 p-2 rounded-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Merhaba, {attendant.name}</h1>
                <p className="text-sm text-gray-500">Vardiya Görüntüleme</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center space-x-1"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Çıkış</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Toplam Vardiya</p>
                  <p className="text-2xl font-bold">{shifts.length}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Toplam Satış</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalSales)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-r ${totalOverShort >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-red-500 to-red-600'} text-white`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${totalOverShort >= 0 ? 'text-emerald-100' : 'text-red-100'} text-sm`}>Fazla/Eksik</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalOverShort)}</p>
                </div>
                <TrendingUp className={`h-8 w-8 ${totalOverShort >= 0 ? 'text-emerald-200' : 'text-red-200'}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Filtrele</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Vardiya Filtreleri</DialogTitle>
                <DialogDescription>
                  Tarih aralığı ve vardiya türü seçin
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Başlangıç</Label>
                    <Input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bitiş</Label>
                    <Input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Vardiya Türü</Label>
                  <Select value={shiftFilter} onValueChange={setShiftFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Vardiyalar</SelectItem>
                      <SelectItem value="V1">V1 Vardiyası</SelectItem>
                      <SelectItem value="V2">V2 Vardiyası</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={clearFilters} variant="outline" className="flex-1">
                  Temizle
                </Button>
                <Button onClick={applyFilters} className="flex-1">
                  Uygula
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Shifts List */}
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-muted-foreground">Vardiyalar yükleniyor...</p>
          </div>
        ) : shifts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-muted-foreground">Henüz vardiya kaydı bulunmuyor.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {shifts.map((shift) => (
              <Card key={shift.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">{getShiftDisplayName(shift)}</h3>
                        <Badge variant={shift.status === 'completed' ? 'default' : 'secondary'}>
                          {shift.status === 'completed' ? 'Tamamlandı' : 'Aktif'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Nakit</p>
                          <p className="font-medium">{formatCurrency(shift.cash_sales)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Kart</p>
                          <p className="font-medium">{formatCurrency(shift.card_sales)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Fazla/Eksik</p>
                          <p className={`font-medium ${shift.over_short >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(shift.over_short)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => viewShiftDetails(shift)}
                      className="ml-2"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Shift Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vardiya Detayları</DialogTitle>
            {selectedShift && (
              <DialogDescription>
                {getShiftDisplayName(selectedShift)}
              </DialogDescription>
            )}
          </DialogHeader>
          
          {selectedShift && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <div>
                    <p className="text-muted-foreground">Başlangıç</p>
                    <p className="font-medium">
                      {format(new Date(selectedShift.start_time), 'dd.MM.yyyy HH:mm', { locale: tr })}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Nakit Satış</p>
                    <p className="font-medium">{formatCurrency(selectedShift.cash_sales)}</p>
                  </div>
                  
                  <div className="col-span-2">
                    <p className="text-muted-foreground mb-2">Tüm İşlemler</p>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      {loadingTransactions ? (
                        <p className="text-sm text-muted-foreground">İşlemler yükleniyor...</p>
                      ) : shiftTransactions.length > 0 ? (
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {shiftTransactions.map((transaction) => (
                            <div key={transaction.id} className="text-xs bg-white p-2 rounded border">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    {transaction.customer_name && (
                                      <p className="font-medium text-blue-700">{transaction.customer_name}</p>
                                    )}
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      transaction.transaction_type === 'veresiye' 
                                        ? 'bg-amber-100 text-amber-800' 
                                        : transaction.transaction_type === 'payment'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {transaction.transaction_type === 'veresiye' ? 'Veresiye' : 
                                       transaction.transaction_type === 'payment' ? 'Ödeme' : 
                                       transaction.transaction_type}
                                    </span>
                                  </div>
                                  <p className="text-gray-600">{transaction.description}</p>
                                </div>
                                <span className="font-medium text-blue-800 ml-2">
                                  {formatCurrency(transaction.amount)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Bu vardiyada işlem yok</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Otomasyon</p>
                    <p className="font-medium">{formatCurrency(selectedShift.otomasyon_satis)}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-muted-foreground">Bitiş</p>
                    <p className="font-medium">
                      {selectedShift.end_time 
                        ? format(new Date(selectedShift.end_time), 'dd.MM.yyyy HH:mm', { locale: tr })
                        : 'Devam ediyor'
                      }
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Kart Satış</p>
                    <p className="font-medium">{formatCurrency(selectedShift.card_sales)}</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Banka Havalesi</p>
                    <p className="font-medium">{formatCurrency(selectedShift.bank_transfers)}</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Fazla/Eksik</p>
                    <p className={`font-medium ${selectedShift.over_short >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(selectedShift.over_short)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Toplam Tahsilat:</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(
                      selectedShift.cash_sales + 
                      selectedShift.card_sales + 
                      selectedShift.veresiye + 
                      selectedShift.bank_transfers + 
                      selectedShift.loyalty_card
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
