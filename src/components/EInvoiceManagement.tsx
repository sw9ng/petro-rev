
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useInvoices } from '@/hooks/useInvoices';
import { EInvoiceCreateDialog } from '@/components/EInvoiceCreateDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Send, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface EInvoiceManagementProps {
  companyId: string;
}

export const EInvoiceManagement = ({ companyId }: EInvoiceManagementProps) => {
  const { incomeInvoices, expenseInvoices, loading, refreshData } = useInvoices(companyId);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const getStatusIcon = (status: string, gibStatus: string) => {
    if (gibStatus === 'success') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (gibStatus === 'failed') return <XCircle className="h-4 w-4 text-red-500" />;
    if (status === 'sent') return <Send className="h-4 w-4 text-blue-500" />;
    return <Clock className="h-4 w-4 text-gray-500" />;
  };

  const getStatusBadge = (status: string, gibStatus: string) => {
    if (gibStatus === 'success') return <Badge variant="default" className="bg-green-100 text-green-800">GİB'de Onaylandı</Badge>;
    if (gibStatus === 'failed') return <Badge variant="destructive">GİB Hatası</Badge>;
    if (status === 'sent') return <Badge variant="secondary">Gönderildi</Badge>;
    if (status === 'accepted') return <Badge variant="default">Kabul Edildi</Badge>;
    if (status === 'rejected') return <Badge variant="destructive">Reddedildi</Badge>;
    return <Badge variant="outline">Taslak</Badge>;
  };

  const handleSendToUyumsoft = async (invoiceId: string, invoiceType: 'income' | 'expense') => {
    try {
      const { data, error } = await supabase.functions.invoke('create-e-invoice', {
        body: {
          invoiceId,
          invoiceType,
          action: 'send'
        }
      });

      if (error) throw error;

      toast.success('E-fatura başarıyla Uyumsoft\'a gönderildi');
      refreshData();
    } catch (error) {
      console.error('E-fatura gönderim hatası:', error);
      toast.error('E-fatura gönderilemedi');
    }
  };

  const handleSendToGIB = async (invoiceId: string, invoiceType: 'income' | 'expense') => {
    try {
      const { data, error } = await supabase.functions.invoke('create-e-invoice', {
        body: {
          invoiceId,
          invoiceType,
          action: 'send-to-gib'
        }
      });

      if (error) throw error;

      toast.success('E-fatura GİB\'e gönderildi');
      refreshData();
    } catch (error) {
      console.error('GİB gönderim hatası:', error);
      toast.error('GİB\'e gönderilemedi');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">E-Fatura İşlemleri</h3>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Yeni E-Fatura
        </Button>
      </div>

      <Tabs defaultValue="income" className="space-y-4">
        <TabsList>
          <TabsTrigger value="income">Gelir E-Faturaları</TabsTrigger>
          <TabsTrigger value="expense">Gider E-Faturaları</TabsTrigger>
        </TabsList>
        
        <TabsContent value="income">
          <Card>
            <CardHeader>
              <CardTitle>Gelir E-Faturaları</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fatura No</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>E-Fatura No</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Gönderim Tarihi</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomeInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.invoice_number || '-'}</TableCell>
                      <TableCell>{invoice.description}</TableCell>
                      <TableCell>{invoice.amount.toLocaleString('tr-TR')} ₺</TableCell>
                      <TableCell>{invoice.e_invoice_number || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(invoice.e_invoice_status || 'draft', invoice.gib_status || 'pending')}
                          {getStatusBadge(invoice.e_invoice_status || 'draft', invoice.gib_status || 'pending')}
                        </div>
                      </TableCell>
                      <TableCell>
                        {invoice.send_date 
                          ? new Date(invoice.send_date).toLocaleDateString('tr-TR')
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {!invoice.e_invoice_status || invoice.e_invoice_status === 'draft' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendToUyumsoft(invoice.id, 'income')}
                            >
                              Uyumsoft'a Gönder
                            </Button>
                          ) : invoice.e_invoice_status === 'sent' && invoice.gib_status !== 'success' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendToGIB(invoice.id, 'income')}
                            >
                              GİB'e Gönder
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expense">
          <Card>
            <CardHeader>
              <CardTitle>Gider E-Faturaları</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fatura No</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>E-Fatura No</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Gönderim Tarihi</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.invoice_number || '-'}</TableCell>
                      <TableCell>{invoice.description}</TableCell>
                      <TableCell>{invoice.amount.toLocaleString('tr-TR')} ₺</TableCell>
                      <TableCell>{invoice.e_invoice_number || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(invoice.e_invoice_status || 'draft', invoice.gib_status || 'pending')}
                          {getStatusBadge(invoice.e_invoice_status || 'draft', invoice.gib_status || 'pending')}
                        </div>
                      </TableCell>
                      <TableCell>
                        {invoice.send_date 
                          ? new Date(invoice.send_date).toLocaleDateString('tr-TR')
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {!invoice.e_invoice_status || invoice.e_invoice_status === 'draft' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendToUyumsoft(invoice.id, 'expense')}
                            >
                              Uyumsoft'a Gönder
                            </Button>
                          ) : invoice.e_invoice_status === 'sent' && invoice.gib_status !== 'success' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendToGIB(invoice.id, 'expense')}
                            >
                              GİB'e Gönder
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EInvoiceCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        companyId={companyId}
        onSuccess={() => {
          refreshData();
          setIsCreateDialogOpen(false);
        }}
      />
    </div>
  );
};
