import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, FileText, Send, Filter, Search } from "lucide-react";
import { useInvoices } from "@/hooks/useInvoices";
import { useEInvoices } from "@/hooks/useEInvoices";
import { useEArchiveInvoices } from "@/hooks/useEArchiveInvoices";
import { useToast } from "@/hooks/use-toast";
import { IncomingInvoicesManagement } from "./IncomingInvoicesManagement";
import { EInvoiceCreationForm } from "./EInvoiceCreationForm";

interface InvoiceManagementProps {
  companyId: string;
}

export const InvoiceManagement = ({ companyId }: InvoiceManagementProps) => {
  const { toast } = useToast();
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("income");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { invoices: incomeInvoices, isLoading: incomeLoading } = useInvoices(companyId, "income");
  const { invoices: expenseInvoices, isLoading: expenseLoading } = useInvoices(companyId, "expense");
  const { eInvoices, isLoading: eInvoicesLoading } = useEInvoices(companyId);
  const { eArchiveInvoices, isLoading: eArchiveLoading } = useEArchiveInvoices(companyId);

  const handleBulkSendToUyumsoft = async () => {
    if (selectedInvoices.length === 0) {
      toast({
        title: "Uyarı",
        description: "Gönderilecek fatura seçilmedi",
        variant: "destructive",
      });
      return;
    }

    try {
      // Bulk send logic here
      toast({
        title: "Başarılı",
        description: `${selectedInvoices.length} fatura Uyumsoft'a gönderildi`,
      });
      setSelectedInvoices([]);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Faturalar gönderilirken hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleSelectInvoice = (invoiceId: string) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const renderInvoiceList = (invoices: any[], type: string) => {
    const filteredInvoices = invoices.filter(invoice => {
      const matchesSearch = invoice.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || invoice.payment_status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Fatura ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Durum filtrele" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="paid">Ödenmiş</SelectItem>
              <SelectItem value="unpaid">Ödenmemiş</SelectItem>
              <SelectItem value="partial">Kısmi Ödenmiş</SelectItem>
            </SelectContent>
          </Select>
          {selectedInvoices.length > 0 && (
            <Button onClick={handleBulkSendToUyumsoft} className="w-full sm:w-auto">
              <Send className="h-4 w-4 mr-2" />
              Seçilenleri Gönder ({selectedInvoices.length})
            </Button>
          )}
        </div>

        <div className="grid gap-4">
          {filteredInvoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedInvoices.includes(invoice.id)}
                      onCheckedChange={() => handleSelectInvoice(invoice.id)}
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{invoice.invoice_number || "No Number"}</span>
                        <Badge variant={invoice.payment_status === "paid" ? "default" : "secondary"}>
                          {invoice.payment_status === "paid" ? "Ödenmiş" : "Ödenmemiş"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{invoice.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {new Date(invoice.invoice_date).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      {invoice.amount?.toLocaleString('tr-TR', { 
                        style: 'currency', 
                        currency: 'TRY' 
                      })}
                    </p>
                    {invoice.gib_status && (
                      <Badge variant="outline" className="mt-1">
                        GİB: {invoice.gib_status}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Fatura Yönetimi</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="income">Gelir Faturaları</TabsTrigger>
              <TabsTrigger value="expense">Gider Faturaları</TabsTrigger>
              <TabsTrigger value="e-invoice">E-Faturalar</TabsTrigger>
              <TabsTrigger value="e-archive">E-Arşiv</TabsTrigger>
              <TabsTrigger value="incoming">Gelen Faturalar</TabsTrigger>
            </TabsList>

            <TabsContent value="income" className="space-y-4">
              {incomeLoading ? (
                <div className="text-center py-8">Yükleniyor...</div>
              ) : (
                renderInvoiceList(incomeInvoices, "income")
              )}
            </TabsContent>

            <TabsContent value="expense" className="space-y-4">
              {expenseLoading ? (
                <div className="text-center py-8">Yükleniyor...</div>
              ) : (
                renderInvoiceList(expenseInvoices, "expense")
              )}
            </TabsContent>

            <TabsContent value="e-invoice" className="space-y-4">
              <EInvoiceCreationForm companyId={companyId} />
              {eInvoicesLoading ? (
                <div className="text-center py-8">Yükleniyor...</div>
              ) : (
                renderInvoiceList(eInvoices, "e-invoice")
              )}
            </TabsContent>

            <TabsContent value="e-archive" className="space-y-4">
              {eArchiveLoading ? (
                <div className="text-center py-8">Yükleniyor...</div>
              ) : (
                renderInvoiceList(eArchiveInvoices, "e-archive")
              )}
            </TabsContent>

            <TabsContent value="incoming" className="space-y-4">
              <IncomingInvoicesManagement companyId={companyId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
