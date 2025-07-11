import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EInvoiceCreateDialog } from './EInvoiceCreateDialog';
import { 
  FileText, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface EInvoice {
  id: string;
  description: string;
  amount: number;
  invoice_date: string;
  payment_status: string;
  e_invoice_uuid?: string;
  e_invoice_status?: string;
  gib_status?: string;
  uyumsoft_id?: string;
  e_invoice_number?: string;
  send_date?: string;
  tax_number?: string;
  company_title?: string;
  created_at: string;
  updated_at: string;
}

interface EInvoiceManagementProps {
  companyId: string;
}

export const EInvoiceManagement = ({ companyId }: EInvoiceManagementProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch income invoices
  const { data: incomeInvoices = [], isLoading: incomeLoading } = useQuery({
    queryKey: ['income-invoices', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('income_invoices')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EInvoice[];
    }
  });

  // Fetch expense invoices
  const { data: expenseInvoices = [], isLoading: expenseLoading } = useQuery({
    queryKey: ['expense-invoices', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_invoices')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EInvoice[];
    }
  });

  // Send to Uyumsoft mutation
  const sendToUyumsoft = useMutation({
    mutationFn: async ({ invoiceId, type }: { invoiceId: string; type: 'income' | 'expense' }) => {
      console.log('Sending to Uyumsoft:', { invoiceId, type });
      
      const { data, error } = await supabase.functions.invoke('create-e-invoice', {
        body: { 
          invoiceId, 
          invoiceType: type,
          action: 'send'
        }
      });
      
      console.log('Uyumsoft response:', { data, error });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'E-Fatura gönderilirken hata oluştu');
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "E-Fatura Uyumsoft'a gönderildi",
      });
      queryClient.invalidateQueries({ queryKey: ['income-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['expense-invoices'] });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({
        title: "Hata",
        description: error.message || "E-Fatura gönderilirken hata oluştu",
        variant: "destructive",
      });
    }
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="outline" className="text-blue-600"><Send className="h-3 w-3 mr-1" />Gönderildi</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Kabul Edildi</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Reddedildi</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Taslak</Badge>;
    }
  };

  const getGibStatusBadge = (status?: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="h-3 w-3 mr-1" />GİB Başarılı</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />GİB Hatalı</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />GİB Bekliyor</Badge>;
    }
  };

  const renderInvoiceCard = (invoice: EInvoice, type: 'income' | 'expense') => (
    <Card key={invoice.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-500" />
              {invoice.e_invoice_number || `#${invoice.id.slice(0, 8)}`}
            </CardTitle>
            <CardDescription>{invoice.description}</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">₺{invoice.amount.toLocaleString('tr-TR')}</div>
            <div className="text-sm text-gray-500">
              {invoice.send_date ? (
                `Gönderim: ${new Date(invoice.send_date).toLocaleDateString('tr-TR')}`
              ) : (
                `Tarih: ${new Date(invoice.invoice_date).toLocaleDateString('tr-TR')}`
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {getStatusBadge(invoice.e_invoice_status)}
            {invoice.e_invoice_status === 'sent' && getGibStatusBadge(invoice.gib_status)}
          </div>
          
          {(!invoice.e_invoice_status || invoice.e_invoice_status === 'draft') && (
            <Button
              onClick={() => sendToUyumsoft.mutate({ invoiceId: invoice.id, type })}
              disabled={sendToUyumsoft.isPending}
              size="sm"
            >
              {sendToUyumsoft.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Uyumsoft'a Gönder
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (incomeLoading || expenseLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">E-Fatura Yönetimi</h2>
          <p className="text-gray-600">Gelir ve gider faturalarınızı e-fatura olarak gönderin</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <FileText className="h-4 w-4 mr-2" />
          Yeni E-Fatura
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Invoices */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-green-600">Gelir Faturaları</h3>
          {incomeInvoices.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                Henüz gelir faturası bulunmuyor
              </CardContent>
            </Card>
          ) : (
            incomeInvoices.map(invoice => renderInvoiceCard(invoice, 'income'))
          )}
        </div>

        {/* Expense Invoices */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-red-600">Gider Faturaları</h3>
          {expenseInvoices.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                Henüz gider faturası bulunmuyor
              </CardContent>
            </Card>
          ) : (
            expenseInvoices.map(invoice => renderInvoiceCard(invoice, 'expense'))
          )}
        </div>
      </div>

      <EInvoiceCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        companyId={companyId}
        onSuccess={() => {
          setIsCreateDialogOpen(false);
          queryClient.invalidateQueries({ queryKey: ['income-invoices'] });
          queryClient.invalidateQueries({ queryKey: ['expense-invoices'] });
        }}
      />
    </div>
  );
};
