import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDown, ArrowUp, Trash2, Fuel, Calendar, FileText } from 'lucide-react';
import { useTankers, useTankerTransactions, useCreateTankerTransaction, useDeleteTankerTransaction } from '@/hooks/useTankers';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface TankerDetailDialogProps {
  tankerId: string;
  onClose: () => void;
}

export const TankerDetailDialog = ({ tankerId, onClose }: TankerDetailDialogProps) => {
  const { data: tankers } = useTankers();
  const { data: transactions, isLoading: transactionsLoading } = useTankerTransactions(tankerId);
  const createTransactionMutation = useCreateTankerTransaction();
  const deleteTransactionMutation = useDeleteTankerTransaction();
  
  const [transactionType, setTransactionType] = useState<'incoming' | 'outgoing'>('incoming');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0, 16));

  const tanker = tankers?.find(t => t.id === tankerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }

    createTransactionMutation.mutate(
      {
        tanker_id: tankerId,
        transaction_type: transactionType,
        amount: parseFloat(amount),
        transaction_date: new Date(transactionDate).toISOString(),
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setAmount('');
          setNotes('');
          setTransactionDate(new Date().toISOString().slice(0, 16));
        },
      }
    );
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Bu işlemi silmek istediğinizden emin misiniz?')) {
      deleteTransactionMutation.mutate(id);
    }
  };

  const getFuelPercentage = () => {
    if (!tanker || tanker.capacity === 0) return 0;
    return Math.min((tanker.current_fuel_level / tanker.capacity) * 100, 100);
  };

  if (!tanker) {
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Fuel className="h-5 w-5 text-primary" />
            <span>{tanker.name}</span>
          </DialogTitle>
          <DialogDescription>
            Tanker detayları ve işlem geçmişi
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tanker Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Tanker Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Mevcut Yakıt</p>
                  <p className="text-2xl font-bold text-foreground">
                    {tanker.current_fuel_level.toLocaleString()} L
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Kapasite</p>
                  <p className="text-2xl font-bold text-foreground">
                    {tanker.capacity.toLocaleString()} L
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Doluluk Oranı</p>
                  <p className="text-2xl font-bold text-foreground">
                    {getFuelPercentage().toFixed(1)}%
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Yakıt Seviyesi</span>
                  <span>{getFuelPercentage().toFixed(1)}%</span>
                </div>
                <Progress value={getFuelPercentage()} className="h-4" />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="transactions" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="transactions">İşlem Geçmişi</TabsTrigger>
              <TabsTrigger value="add-transaction">Yeni İşlem</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>İşlem Geçmişi</CardTitle>
                  <CardDescription>
                    Tüm yakıt giriş ve çıkış işlemleri
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {transactionsLoading ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">İşlemler yükleniyor...</p>
                    </div>
                  ) : !transactions || transactions.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Henüz işlem kaydı bulunmuyor</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tarih</TableHead>
                            <TableHead>Tür</TableHead>
                            <TableHead>Miktar</TableHead>
                            <TableHead>Notlar</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    {format(new Date(transaction.transaction_date), 'dd MMM yyyy HH:mm', { locale: tr })}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={transaction.transaction_type === 'incoming' ? 'default' : 'destructive'}
                                  className="flex items-center space-x-1 w-fit"
                                >
                                  {transaction.transaction_type === 'incoming' ? (
                                    <ArrowUp className="h-3 w-3" />
                                  ) : (
                                    <ArrowDown className="h-3 w-3" />
                                  )}
                                  <span>
                                    {transaction.transaction_type === 'incoming' ? 'Giriş' : 'Çıkış'}
                                  </span>
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">
                                {transaction.amount.toLocaleString()} L
                              </TableCell>
                              <TableCell>
                                {transaction.notes || '-'}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteTransaction(transaction.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="add-transaction">
              <Card>
                <CardHeader>
                  <CardTitle>Yeni İşlem Ekle</CardTitle>
                  <CardDescription>
                    Yakıt giriş veya çıkış işlemi kaydedin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="transaction-type">İşlem Türü</Label>
                        <Select value={transactionType} onValueChange={(value: 'incoming' | 'outgoing') => setTransactionType(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="incoming" className="flex items-center">
                              <div className="flex items-center space-x-2">
                                <ArrowUp className="h-4 w-4 text-green-600" />
                                <span>Yakıt Girişi</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="outgoing">
                              <div className="flex items-center space-x-2">
                                <ArrowDown className="h-4 w-4 text-red-600" />
                                <span>Yakıt Çıkışı</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="amount">Miktar (Litre)</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          min="0"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="örn. 5000"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="transaction-date">Tarih ve Saat</Label>
                      <Input
                        id="transaction-date"
                        type="datetime-local"
                        value={transactionDate}
                        onChange={(e) => setTransactionDate(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notlar (İsteğe bağlı)</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="İşlemle ilgili notlarınızı buraya yazabilirsiniz..."
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="submit" 
                        disabled={createTransactionMutation.isPending}
                        className="flex items-center space-x-2"
                      >
                        {transactionType === 'incoming' ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )}
                        <span>
                          {createTransactionMutation.isPending 
                            ? 'Kaydediliyor...' 
                            : transactionType === 'incoming' 
                              ? 'Yakıt Girişi Kaydet' 
                              : 'Yakıt Çıkışı Kaydet'
                          }
                        </span>
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};