import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, FileText } from "lucide-react";
import { useEInvoices } from "@/hooks/useEInvoices";
import { useTaxRegistry } from "@/hooks/useTaxRegistry";

interface EInvoiceManagementProps {
  companyId: string;
}

export const EInvoiceManagement = ({ companyId }: EInvoiceManagementProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    invoice_number: "",
    invoice_type: "satis",
    invoice_date: new Date().toISOString().split('T')[0],
    recipient_tax_number: "",
    recipient_title: "",
    recipient_address: "",
    total_amount: 0,
    tax_amount: 0,
    grand_total: 0,
    ettn: "",
    invoice_uuid: "",
  });

  const { createEInvoice } = useEInvoices(companyId);
  const { searchByTaxNumber } = useTaxRegistry();

  const handleTaxNumberChange = async (taxNumber: string) => {
    setFormData(prev => ({ ...prev, recipient_tax_number: taxNumber }));
    
    if (taxNumber.length === 10 || taxNumber.length === 11) {
      try {
        const company = await searchByTaxNumber(taxNumber);
        setFormData(prev => ({
          ...prev,
          recipient_title: company.company_title,
          recipient_address: company.address || "",
        }));
      } catch (error) {
        console.log("VKN bulunamadı");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const invoiceData = {
      invoice_number: formData.invoice_number,
      invoice_type: formData.invoice_type,
      invoice_date: formData.invoice_date,
      recipient_tax_number: formData.recipient_tax_number,
      recipient_title: formData.recipient_title,
      recipient_address: formData.recipient_address,
      total_amount: formData.total_amount,
      tax_amount: formData.tax_amount,
      grand_total: formData.grand_total,
      ettn: crypto.randomUUID(),
      invoice_uuid: crypto.randomUUID(),
    };
    
    createEInvoice.mutate(invoiceData);
    setIsDialogOpen(false);
    setFormData({
      invoice_number: "",
      invoice_type: "satis",
      invoice_date: new Date().toISOString().split('T')[0],
      recipient_tax_number: "",
      recipient_title: "",
      recipient_address: "",
      total_amount: 0,
      tax_amount: 0,
      grand_total: 0,
      ettn: "",
      invoice_uuid: "",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Yeni E-Fatura Oluştur</span>
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni E-Fatura
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yeni E-Fatura Oluştur</DialogTitle>
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
                  <Label htmlFor="invoice-type">Fatura Türü</Label>
                  <Select 
                    value={formData.invoice_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, invoice_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="satis">Satış</SelectItem>
                      <SelectItem value="iade">İade</SelectItem>
                      <SelectItem value="istisna">İstisna</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <Label htmlFor="tax-number">Alıcı VKN/TCKN</Label>
                  <Input
                    id="tax-number"
                    value={formData.recipient_tax_number}
                    onChange={(e) => handleTaxNumberChange(e.target.value)}
                    placeholder="VKN veya TCKN giriniz"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="recipient-title">Alıcı Ünvanı</Label>
                <Input
                  id="recipient-title"
                  value={formData.recipient_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, recipient_title: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="recipient-address">Alıcı Adresi</Label>
                <Input
                  id="recipient-address"
                  value={formData.recipient_address}
                  onChange={(e) => setFormData(prev => ({ ...prev, recipient_address: e.target.value }))}
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
        <p className="text-sm text-gray-600">
          E-Fatura oluşturduktan sonra "Fatura Yönetimi" bölümünden Uyumsoft'a gönderebilirsiniz.
        </p>
      </CardContent>
    </Card>
  );
};
