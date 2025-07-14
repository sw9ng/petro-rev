
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, FileText, Archive, Loader2 } from "lucide-react";
import { useEInvoices } from "@/hooks/useEInvoices";
import { useEArchiveInvoices } from "@/hooks/useEArchiveInvoices";
import { useToast } from "@/hooks/use-toast";

interface InvoiceManagementProps {
  companyId: string;
}

export const InvoiceManagement = ({ companyId }: InvoiceManagementProps) => {
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [invoiceFilter, setInvoiceFilter] = useState<string>('all');
  const [isSending, setIsSending] = useState(false);

  const { eInvoices, isLoading: eInvoicesLoading, sendToUyumsoft: sendEInvoice } = useEInvoices(companyId);
  const { eArchiveInvoices, isLoading: eArchiveLoading, sendToUyumsoft: sendEArchive } = useEArchiveInvoices(companyId);
  const { toast } = useToast();

  // Combine all invoices
  const allInvoices = [
    ...eInvoices.map(inv => ({ ...inv, type: 'e-invoice' as const })),
    ...eArchiveInvoices.map(inv => ({ ...inv, type: 'e-archive' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Filter invoices
  const filteredInvoices = allInvoices.filter(invoice => {
    if (invoiceFilter === 'all') return true;
    if (invoiceFilter === 'draft') return invoice.gib_status === 'draft';
    if (invoiceFilter === 'sent') return invoice.gib_status === 'sent';
    if (invoiceFilter === 'error') return invoice.gib_status === 'error';
    if (invoiceFilter === 'e-invoice') return invoice.type === 'e-invoice';
    if (invoiceFilter === 'e-archive') return invoice.type === 'e-archive';
    return true;
  });

  const handleSelectAll = () => {
    if (selectedInvoices.length === filteredInvoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(filteredInvoices.map(inv => inv.id));
    }
  };

  const handleSelectInvoice = (invoiceId: string) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const handleBulkSend = async () => {
    if (selectedInvoices.length === 0) {
      toast({
        title: "Hata",
        description: "Gönderilecek fatura seçin",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    let successCount = 0;
    let errorCount = 0;

    for (const invoiceId of selectedInvoices) {
      try {
        const invoice = allInvoices.find(inv => inv.id === invoiceId);
        if (!invoice) continue;

        if (invoice.type === 'e-invoice') {
          await sendEInvoice.mutateAsync(invoiceId);
        } else {
          await sendEArchive.mutateAsync(invoiceId);
        }
        successCount++;
      } catch (error) {
        errorCount++;
        console.error(`Error sending invoice ${invoiceId}:`, error);
      }
    }

    setIsSending(false);
    setSelectedInvoices([]);

    if (successCount > 0) {
      toast({
        title: "Başarılı",
        description: `${successCount} fatura başarıyla gönderildi${errorCount > 0 ? `, ${errorCount} fatura gönderilemedi` : ''}`,
      });
    } else if (errorCount > 0) {
      toast({
        title: "Hata",
        description: `${errorCount} fatura gönderilemedi`,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      draft: { label: "Taslak", variant: "secondary" as const },
      sent: { label: "Gönderildi", variant: "default" as const },
      accepted: { label: "Kabul Edildi", variant: "outline" as const },
      rejected: { label: "Reddedildi", variant: "destructive" as const },
      error: { label: "Hata", variant: "destructive" as const },
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    return (
      <Badge variant="outline" className="flex items-center space-x-1">
        {type === 'e-invoice' ? <FileText className="h-3 w-3" /> : <Archive className="h-3 w-3" />}
        <span>{type === 'e-invoice' ? 'E-Fatura' : 'E-Arşiv'}</span>
      </Badge>
    );
  };

  if (eInvoicesLoading || eArchiveLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Fatura Yönetimi</span>
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Select value={invoiceFilter} onValueChange={setInvoiceFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrele" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="draft">Taslak</SelectItem>
              <SelectItem value="sent">Gönderildi</SelectItem>
              <SelectItem value="error">Hatalı</SelectItem>
              <SelectItem value="e-invoice">E-Fatura</SelectItem>
              <SelectItem value="e-archive">E-Arşiv</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={handleBulkSend}
            disabled={selectedInvoices.length === 0 || isSending}
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Seçilenleri Gönder ({selectedInvoices.length})
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Fatura No</TableHead>
              <TableHead>Tür</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead>Müşteri/Alıcı</TableHead>
              <TableHead>Tutar</TableHead>
              <TableHead>Durum</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map((invoice) => (
              <TableRow key={`${invoice.type}-${invoice.id}`}>
                <TableCell>
                  <Checkbox 
                    checked={selectedInvoices.includes(invoice.id)}
                    onCheckedChange={() => handleSelectInvoice(invoice.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                <TableCell>{getTypeBadge(invoice.type)}</TableCell>
                <TableCell>{new Date(invoice.invoice_date).toLocaleDateString("tr-TR")}</TableCell>
                <TableCell>
                  {'customer_name' in invoice ? invoice.customer_name : invoice.recipient_title}
                </TableCell>
                <TableCell>{invoice.grand_total.toLocaleString("tr-TR")} ₺</TableCell>
                <TableCell>{getStatusBadge(invoice.gib_status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredInvoices.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Hiç fatura bulunamadı
          </div>
        )}
      </CardContent>
    </Card>
  );
};
