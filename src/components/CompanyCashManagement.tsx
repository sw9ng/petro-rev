import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Download, Send, Eye } from "lucide-react";
import { useInvoices } from "@/hooks/useInvoices";
import { useCompanies } from "@/hooks/useCompanies";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/numberUtils";

interface CompanyCashManagementProps {
  companyId: string;
  type: "income" | "expense";
}

export const CompanyCashManagement = ({ companyId, type }: CompanyCashManagementProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    account_id: "",
    description: "",
    amount: "",
    tax_number: "",
    company_title: "",
    e_invoice_status: "draft"
  });

  const { invoices, createInvoice, isLoading } = useInvoices(type);
  const { companies } = useCompanies();

  const { data: companyAccounts } = useQuery({
    queryKey: ["company-accounts", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_accounts")
        .select("*")
        .eq("company_id", companyId);

      if (error) throw error;
      return data;
    },
  });

  const filteredInvoices = invoices.filter((invoice: any) => invoice.company_id === companyId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInvoice.mutate({
      company_id: companyId,
      account_id: formData.account_id || null,
      description: formData.description,
      amount: parseFloat(formData.amount),
      tax_number: formData.tax_number || null,
      company_title: formData.company_title || null,
      e_invoice_status: formData.e_invoice_status
    });
    setIsDialogOpen(false);
    setFormData({
      account_id: "",
      description: "",
      amount: "",
      tax_number: "",
      company_title: "",
      e_invoice_status: "draft"
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "outline",
      sent: "default",
      paid: "secondary",
      unpaid: "destructive"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const exportToPDF = (invoice: any) => {
    // PDF export functionality - placeholder
    console.log("Exporting to PDF:", invoice);
  };

  const exportToExcel = (invoice: any) => {
    // Excel export functionality - placeholder
    console.log("Exporting to Excel:", invoice);
  };

  const sendToUyumsoft = (invoice: any) => {
    // Uyumsoft API integration - placeholder
    console.log("Sending to Uyumsoft:", invoice);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>{type === "income" ? "Satış Faturaları" : "Alış Faturaları"}</span>
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Fatura
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Yeni {type === "income" ? "Satış" : "Alış"} Faturası
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="account_id">Cari Hesap</Label>
                  <Select
                    value={formData.account_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, account_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Cari hesap seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {companyAccounts?.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Tutar *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Açıklama *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tax_number">Vergi Numarası</Label>
                  <Input
                    id="tax_number"
                    value={formData.tax_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, tax_number: e.target.value }))}
                    placeholder="VKN giriniz"
                  />
                </div>
                <div>
                  <Label htmlFor="company_title">Şirket Ünvanı</Label>
                  <Input
                    id="company_title"
                    value={formData.company_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_title: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="e_invoice_status">E-Fatura Durumu</Label>
                <Select
                  value={formData.e_invoice_status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, e_invoice_status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Taslak</SelectItem>
                    <SelectItem value="ready">Gönderilmeye Hazır</SelectItem>
                    <SelectItem value="sent">Gönderildi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit">Kaydet</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Yükleniyor...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fatura No</TableHead>
                <TableHead>Cari Hesap</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead>Tutar</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice: any) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.invoice_number || "Otomatik"}</TableCell>
                  <TableCell>{invoice.company_accounts?.name || "Genel"}</TableCell>
                  <TableCell>{invoice.description}</TableCell>
                  <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                  <TableCell>{getStatusBadge(invoice.e_invoice_status)}</TableCell>
                  <TableCell>{new Date(invoice.invoice_date).toLocaleDateString("tr-TR")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button variant="outline" size="sm" onClick={() => exportToPDF(invoice)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => exportToExcel(invoice)}>
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => sendToUyumsoft(invoice)}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
