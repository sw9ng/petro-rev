import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Archive, Send, Eye } from "lucide-react";
import { useEArchiveInvoices } from "@/hooks/useEArchiveInvoices";

interface EArchiveInvoiceManagementProps {
  companyId: string;
}

export const EArchiveInvoiceManagement = ({ companyId }: EArchiveInvoiceManagementProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    invoice_number: "",
    invoice_date: new Date().toISOString().split('T')[0],
    customer_name: "",
    customer_tax_number: "",
    customer_tc_number: "",
    customer_address: "",
    total_amount: 0,
    tax_amount: 0,
    grand_total: 0,
  });

  const { eArchiveInvoices, isLoading, createEArchiveInvoice, sendToUyumsoft } = useEArchiveInvoices(companyId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const invoiceData = {
      ...formData,
      archive_id: `ARS${Date.now()}`,
    };
    createEArchiveInvoice.mutate(invoiceData);
    setIsDialogOpen(false);
    setFormData({
      invoice_number: "",
      invoice_date: new Date().toISOString().split('T')[0],
      customer_name: "",
      customer_tax_number: "",
      customer_tc_number: "",
      customer_address: "",
      total_amount: 0,
      tax_amount: 0,
      grand_total: 0,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      draft: { label: "Taslak", variant: "secondary" as const },
      sent: { label: "Gönderildi", variant: "default" as const },
      accepted: { label: "Kabul Edildi", variant: "outline" as const },
      rejected: { label: "Reddedildi", variant: "destructive" as const },
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Archive className="h-5 w-5" />
          <span>E-Arşiv Fatura Yönetimi</span>
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni E-Arşiv Fatura
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yeni E-Arşiv Fatura Oluştur</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoice-number">Fatura No</Label>
                  <Input
                    id="invoice-number"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="invoice-date">Fatura Tarihi</Label>
                  <Input
                    id="invoice-date"
                    type="date"
                    value={formData.invoice_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoice_date: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="customer-name">Müşteri Adı</Label>
                <Input
                  id="customer-name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer-tax-number">VKN</Label>
                  <Input
                    id="customer-tax-number"
                    value={formData.customer_tax_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_tax_number: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="customer-tc-number">TCKN</Label>
                  <Input
                    id="customer-tc-number"
                    value={formData.customer_tc_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_tc_number: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="customer-address">Müşteri Adresi</Label>
                <Input
                  id="customer-address"
                  value={formData.customer_address}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_address: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="total-amount">Toplam Tutar</Label>
                  <Input
                    id="total-amount"
                    type="number"
                    step="0.01"
                    value={formData.total_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, total_amount: parseFloat(e.target.value) }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tax-amount">KDV Tutarı</Label>
                  <Input
                    id="tax-amount"
                    type="number"
                    step="0.01"
                    value={formData.tax_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, tax_amount: parseFloat(e.target.value) }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="grand-total">Genel Toplam</Label>
                  <Input
                    id="grand-total"
                    type="number"
                    step="0.01"
                    value={formData.grand_total}
                    onChange={(e) => setFormData(prev => ({ ...prev, grand_total: parseFloat(e.target.value) }))}
                    required
                  />
                </div>
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
                <TableHead>Tarih</TableHead>
                <TableHead>Müşteri</TableHead>
                <TableHead>Tutar</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eArchiveInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>{new Date(invoice.invoice_date).toLocaleDateString("tr-TR")}</TableCell>
                  <TableCell>{invoice.customer_name}</TableCell>
                  <TableCell>{invoice.grand_total.toLocaleString("tr-TR")} ₺</TableCell>
                  <TableCell>{getStatusBadge(invoice.gib_status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {invoice.gib_status === 'draft' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => sendToUyumsoft.mutate(invoice.id)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
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
