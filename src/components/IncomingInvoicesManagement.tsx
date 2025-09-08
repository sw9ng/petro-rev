import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Search, Filter, Check, X, RefreshCw } from "lucide-react";
import { useIncomingInvoices } from "@/hooks/useIncomingInvoices";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface IncomingInvoicesManagementProps {
  companyId: string;
}

export const IncomingInvoicesManagement: React.FC<IncomingInvoicesManagementProps> = ({
  companyId,
}) => {
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const {
    incomingInvoices,
    isLoading,
    fetchFromUyumsoft,
    updateInvoiceStatus,
    bulkUpdateStatus,
    refetch,
  } = useIncomingInvoices(companyId);

  const handleSelectInvoice = (invoiceId: string) => {
    setSelectedInvoices(prev =>
      prev.includes(invoiceId)
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const handleSelectAll = () => {
    const filteredInvoices = getFilteredInvoices();
    const allSelected = filteredInvoices.every(invoice => 
      selectedInvoices.includes(invoice.id)
    );
    
    if (allSelected) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(filteredInvoices.map(invoice => invoice.id));
    }
  };

  const handleFetchFromUyumsoft = () => {
    fetchFromUyumsoft.mutate({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
  };

  const handleApproveInvoice = (invoiceId: string) => {
    updateInvoiceStatus.mutate({
      invoiceId,
      status: 'approved',
    });
  };

  const handleRejectInvoice = (invoiceId: string) => {
    updateInvoiceStatus.mutate({
      invoiceId,
      status: 'rejected',
    });
  };

  const handleBulkApprove = () => {
    if (selectedInvoices.length > 0) {
      bulkUpdateStatus.mutate({
        invoiceIds: selectedInvoices,
        status: 'approved',
      });
      setSelectedInvoices([]);
    }
  };

  const handleBulkReject = () => {
    if (selectedInvoices.length > 0) {
      bulkUpdateStatus.mutate({
        invoiceIds: selectedInvoices,
        status: 'rejected',
      });
      setSelectedInvoices([]);
    }
  };

  const getFilteredInvoices = () => {
    return incomingInvoices.filter(invoice => {
      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
      const matchesSearch = !searchTerm || 
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.sender_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.sender_tax_number?.includes(searchTerm);
      
      return matchesStatus && matchesSearch;
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Onaylandı</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Reddedildi</Badge>;
      default:
        return <Badge variant="secondary">Beklemede</Badge>;
    }
  };

  const filteredInvoices = getFilteredInvoices();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Gelen Faturalar</span>
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Fetch Controls */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dateFrom">Başlangıç Tarihi</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">Bitiş Tarihi</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleFetchFromUyumsoft}
                disabled={fetchFromUyumsoft.isPending}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                {fetchFromUyumsoft.isPending ? "Alınıyor..." : "Uyumsoft'tan Al"}
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Fatura no, firma adı veya vergi no ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="pending">Beklemede</SelectItem>
              <SelectItem value="approved">Onaylandı</SelectItem>
              <SelectItem value="rejected">Reddedildi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {selectedInvoices.length > 0 && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
            <span className="text-sm font-medium">
              {selectedInvoices.length} fatura seçildi
            </span>
            <Button
              size="sm"
              onClick={handleBulkApprove}
              disabled={bulkUpdateStatus.isPending}
            >
              <Check className="h-4 w-4 mr-1" />
              Toplu Onayla
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleBulkReject}
              disabled={bulkUpdateStatus.isPending}
            >
              <X className="h-4 w-4 mr-1" />
              Toplu Reddet
            </Button>
          </div>
        )}

        {/* Invoices List */}
        {isLoading ? (
          <div className="text-center py-8">Faturalar yükleniyor...</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {incomingInvoices.length === 0 
              ? "Henüz gelen fatura bulunmuyor. Uyumsoft'tan fatura almak için yukarıdaki butonu kullanın."
              : "Filtre kriterlerine uygun fatura bulunamadı."
            }
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                checked={filteredInvoices.every(invoice => 
                  selectedInvoices.includes(invoice.id)
                )}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">Tümünü Seç</span>
            </div>

            {filteredInvoices.map((invoice) => (
              <Card key={invoice.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedInvoices.includes(invoice.id)}
                      onCheckedChange={() => handleSelectInvoice(invoice.id)}
                    />
                    <div>
                      <div className="font-medium">{invoice.invoice_number}</div>
                      <div className="text-sm text-gray-600">
                        {invoice.sender_title} • {invoice.sender_tax_number}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(invoice.invoice_date), "dd MMMM yyyy", { locale: tr })} • 
                        {invoice.invoice_type === 'e-invoice' ? ' E-Fatura' : ' E-Arşiv'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-medium">
                        {new Intl.NumberFormat('tr-TR', {
                          style: 'currency',
                          currency: invoice.currency_code || 'TRY'
                        }).format(invoice.grand_total)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Vergi: {new Intl.NumberFormat('tr-TR', {
                          style: 'currency',
                          currency: invoice.currency_code || 'TRY'
                        }).format(invoice.tax_amount)}
                      </div>
                    </div>

                    <div className="flex flex-col items-center space-y-2">
                      {getStatusBadge(invoice.status)}
                      
                      {invoice.status === 'pending' && (
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            onClick={() => handleApproveInvoice(invoice.id)}
                            disabled={updateInvoiceStatus.isPending}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectInvoice(invoice.id)}
                            disabled={updateInvoiceStatus.isPending}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};