import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, FileText, Users, RefreshCw } from "lucide-react";
import { useEInvoices } from "@/hooks/useEInvoices";
import { useUyumsoftTaxpayers } from "@/hooks/useUyumsoftTaxpayers";
import { useTaxRegistry } from "@/hooks/useTaxRegistry";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

interface EInvoiceCreationFormProps {
  companyId: string;
}

export const EInvoiceCreationForm = ({ companyId }: EInvoiceCreationFormProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTaxpayersOpen, setIsTaxpayersOpen] = useState(false);
  const [formData, setFormData] = useState({
    invoice_number: "",
    invoice_type: "satis",
    invoice_date: new Date().toISOString().split('T')[0],
    recipient_tax_number: "",
    recipient_title: "",
    recipient_address: "",
    currency_code: "TRY",
    exchange_rate: 1,
    total_amount: 0,
    tax_amount: 0,
    grand_total: 0,
    profile_id: "TICARIFATURA",
    notes: "",
    line_items: [
      {
        description: "",
        quantity: 1,
        unit_price: 0,
        tax_rate: 18,
        line_total: 0
      }
    ]
  });

  const { createEInvoice } = useEInvoices(companyId);
  const { taxpayers, isLoading: taxpayersLoading, refetch: refetchTaxpayers } = useUyumsoftTaxpayers(companyId);
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

  const selectTaxpayer = (taxpayer: any) => {
    setFormData(prev => ({
      ...prev,
      recipient_tax_number: taxpayer.tax_number,
      recipient_title: taxpayer.company_title,
      recipient_address: taxpayer.address || "",
      profile_id: taxpayer.profile_id
    }));
    setIsTaxpayersOpen(false);
  };

  const updateLineItem = (index: number, field: string, value: any) => {
    const newLineItems = [...formData.line_items];
    newLineItems[index] = { ...newLineItems[index], [field]: value };
    
    // Calculate line total
    if (field === 'quantity' || field === 'unit_price') {
      newLineItems[index].line_total = newLineItems[index].quantity * newLineItems[index].unit_price;
    }
    
    setFormData(prev => ({ ...prev, line_items: newLineItems }));
    
    // Recalculate totals
    calculateTotals(newLineItems);
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      line_items: [...prev.line_items, {
        description: "",
        quantity: 1,
        unit_price: 0,
        tax_rate: 18,
        line_total: 0
      }]
    }));
  };

  const removeLineItem = (index: number) => {
    const newLineItems = formData.line_items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, line_items: newLineItems }));
    calculateTotals(newLineItems);
  };

  const calculateTotals = (lineItems: any[]) => {
    const totalAmount = lineItems.reduce((sum, item) => sum + item.line_total, 0);
    const taxAmount = lineItems.reduce((sum, item) => sum + (item.line_total * item.tax_rate / 100), 0);
    const grandTotal = totalAmount + taxAmount;
    
    setFormData(prev => ({
      ...prev,
      total_amount: totalAmount,
      tax_amount: taxAmount,
      grand_total: grandTotal
    }));
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
      currency_code: formData.currency_code,
      exchange_rate: formData.exchange_rate,
      total_amount: formData.total_amount,
      tax_amount: formData.tax_amount,
      grand_total: formData.grand_total,
      ettn: crypto.randomUUID(),
      invoice_uuid: crypto.randomUUID(),
    };
    
    createEInvoice.mutate(invoiceData);
    setIsDialogOpen(false);
    // Reset form
    setFormData({
      invoice_number: "",
      invoice_type: "satis",
      invoice_date: new Date().toISOString().split('T')[0],
      recipient_tax_number: "",
      recipient_title: "",
      recipient_address: "",
      currency_code: "TRY",
      exchange_rate: 1,
      total_amount: 0,
      tax_amount: 0,
      grand_total: 0,
      profile_id: "TICARIFATURA",
      notes: "",
      line_items: [{
        description: "",
        quantity: 1,
        unit_price: 0,
        tax_rate: 18,
        line_total: 0
      }]
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>E-Fatura Oluştur</span>
          </CardTitle>
          <div className="flex space-x-2">
            <Dialog open={isTaxpayersOpen} onOpenChange={setIsTaxpayersOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  E-Fatura Mükellefleri
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle>E-Fatura Mükellefleri (Uyumsoft)</DialogTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => refetchTaxpayers()}
                      disabled={taxpayersLoading}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${taxpayersLoading ? 'animate-spin' : ''}`} />
                      Yenile
                    </Button>
                  </div>
                </DialogHeader>
                <div className="max-h-96 overflow-y-auto">
                  {taxpayersLoading ? (
                    <div className="text-center py-4">Yükleniyor...</div>
                  ) : (
                    <div className="space-y-2">
                      {taxpayers.map((taxpayer, index) => (
                        <div 
                          key={index}
                          className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => selectTaxpayer(taxpayer)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{taxpayer.company_title}</h4>
                              <p className="text-sm text-gray-600">VKN: {taxpayer.tax_number}</p>
                              {taxpayer.address && (
                                <p className="text-sm text-gray-500">{taxpayer.address}</p>
                              )}
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                              <Badge variant={taxpayer.is_einvoice_enabled ? "default" : "secondary"}>
                                {taxpayer.is_einvoice_enabled ? "E-Fatura Aktif" : "E-Fatura Pasif"}
                              </Badge>
                              <Badge variant="outline">{taxpayer.profile_id}</Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni E-Fatura
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Yeni E-Fatura Oluştur</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Fatura Bilgileri */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-4">Fatura Bilgileri</h3>
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
                            <SelectItem value="ihrakat">İhracat</SelectItem>
                          </SelectContent>
                        </Select>
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
                      <div>
                        <Label htmlFor="currency">Para Birimi</Label>
                        <Select 
                          value={formData.currency_code} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, currency_code: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TRY">TRY - Türk Lirası</SelectItem>
                            <SelectItem value="USD">USD - Amerikan Doları</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">GBP - İngiliz Sterlini</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Alıcı Bilgileri */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-4">Alıcı Bilgileri</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
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
                        <div>
                          <Label htmlFor="profile-id">Profil ID</Label>
                          <Select 
                            value={formData.profile_id} 
                            onValueChange={(value) => setFormData(prev => ({ ...prev, profile_id: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TICARIFATURA">TICARIFATURA</SelectItem>
                              <SelectItem value="TEMEL">TEMEL</SelectItem>
                              <SelectItem value="TEMELFATURA">TEMELFATURA</SelectItem>
                            </SelectContent>
                          </Select>
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
                        <Textarea
                          id="recipient-address"
                          value={formData.recipient_address}
                          onChange={(e) => setFormData(prev => ({ ...prev, recipient_address: e.target.value }))}
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Kalem Bilgileri */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">Fatura Kalemleri</h3>
                      <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                        <Plus className="h-4 w-4 mr-2" />
                        Kalem Ekle
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {formData.line_items.map((item, index) => (
                        <div key={index} className="border rounded p-3">
                          <div className="grid grid-cols-5 gap-4">
                            <div className="col-span-2">
                              <Label>Açıklama</Label>
                              <Input
                                value={item.description}
                                onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                                placeholder="Ürün/Hizmet açıklaması"
                              />
                            </div>
                            <div>
                              <Label>Miktar</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={item.quantity}
                                onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            <div>
                              <Label>Birim Fiyat</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={item.unit_price}
                                onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            <div>
                              <Label>KDV %</Label>
                              <Select
                                value={item.tax_rate.toString()}
                                onValueChange={(value) => updateLineItem(index, 'tax_rate', parseInt(value))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">%0</SelectItem>
                                  <SelectItem value="1">%1</SelectItem>
                                  <SelectItem value="8">%8</SelectItem>
                                  <SelectItem value="18">%18</SelectItem>
                                  <SelectItem value="20">%20</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-medium">
                              Toplam: {item.line_total.toFixed(2)} {formData.currency_code}
                            </span>
                            {formData.line_items.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeLineItem(index)}
                              >
                                Kaldır
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Toplam Bilgileri */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="font-medium mb-4">Toplam Bilgileri</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Ara Toplam</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.total_amount}
                          readOnly
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label>KDV Tutarı</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.tax_amount}
                          readOnly
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label>Genel Toplam</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.grand_total}
                          readOnly
                          className="bg-white font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notlar */}
                  <div>
                    <Label htmlFor="notes">Notlar</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Fatura ile ilgili ek bilgiler..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      İptal
                    </Button>
                    <Button type="submit">E-Fatura Oluştur</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            E-Fatura oluşturduktan sonra "Fatura Yönetimi" bölümünden Uyumsoft'a gönderebilirsiniz.
            E-Fatura mükellefleri listesi Uyumsoft'tan otomatik olarak çekilir.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};