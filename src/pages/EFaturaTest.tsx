import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Copy, Send, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FaturaData {
  faturaNo: string;
  tarih: string;
  gondericiVKN: string;
  gondericiUnvan: string;
  aliciVKN: string;
  aliciUnvan: string;
  yakitTuru: string;
  litre: string;
  birimFiyat: string;
  kdvOrani: string;
  pompaNo: string;
  plaka: string;
  istasyonKodu: string;
}

interface UyumsoftResponse {
  success: boolean;
  message: string;
  status?: number;
  response?: string;
  error?: string;
}

const EFaturaTest = () => {
  const { toast } = useToast();
  const [faturaData, setFaturaData] = useState<FaturaData>({
    faturaNo: '',
    tarih: '2025-07-11',
    gondericiVKN: '1234567890',
    gondericiUnvan: 'XYZ Akaryakıt Ltd.',
    aliciVKN: '2222222222',
    aliciUnvan: 'Ahmet Yılmaz',
    yakitTuru: 'Benzin',
    litre: '50',
    birimFiyat: '40.50',
    kdvOrani: '20',
    pompaNo: 'Pompa 3',
    plaka: '34 ABC 123',
    istasyonKodu: 'IST001'
  });

  const [xmlData, setXmlData] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uyumsoftResponse, setUyumsoftResponse] = useState<UyumsoftResponse | null>(null);

  const generateAkaryakitEFatura = (formData: FaturaData) => {
    const { faturaNo, tarih, gondericiVKN, gondericiUnvan, aliciVKN, aliciUnvan, yakitTuru, litre, birimFiyat, kdvOrani, pompaNo, plaka, istasyonKodu } = formData;
    const tutar = parseFloat(litre) * parseFloat(birimFiyat);
    const kdvTutar = (tutar * parseFloat(kdvOrani)) / 100;
    const toplamTutar = tutar + kdvTutar;

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <cbc:ID>${faturaNo}</cbc:ID>
  <cbc:IssueDate>${tarih}</cbc:IssueDate>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cbc:EndpointID schemeID="VKN">${gondericiVKN}</cbc:EndpointID>
      <cbc:Name>${gondericiUnvan}</cbc:Name>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cbc:EndpointID schemeID="VKN">${aliciVKN}</cbc:EndpointID>
      <cbc:Name>${aliciUnvan}</cbc:Name>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:InvoiceLine>
    <cbc:InvoicedQuantity unitCode="LTR">${litre}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="TRY">${tutar.toFixed(2)}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Description>Akaryakıt: ${yakitTuru} (Pompa: ${pompaNo}, Plaka: ${plaka || 'Yok'}, İstasyon: ${istasyonKodu})</cbc:Description>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="TRY">${parseFloat(birimFiyat).toFixed(2)}</cbc:PriceAmount>
    </cac:Price>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="TRY">${kdvTutar.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cbc:Percent>${kdvOrani}</cbc:Percent>
        <cac:TaxCategory>
          <cac:TaxScheme><cbc:Name>KDV</cbc:Name></cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    </cac:TaxTotal>
  </cac:InvoiceLine>
  <cac:LegalMonetaryTotal>
    <cbc:PayableAmount currencyID="TRY">${toplamTutar.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
</Invoice>`;
    return xml;
  };

  const handleInputChange = (field: keyof FaturaData, value: string) => {
    setFaturaData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateXML = () => {
    if (!faturaData.faturaNo || !faturaData.gondericiVKN || !faturaData.gondericiUnvan || 
        !faturaData.aliciVKN || !faturaData.aliciUnvan || !faturaData.litre || !faturaData.birimFiyat) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen zorunlu alanları doldurun",
        variant: "destructive",
      });
      return;
    }

    const xml = generateAkaryakitEFatura(faturaData);
    setXmlData(xml);
    setUyumsoftResponse(null);
    toast({
      title: "XML Oluşturuldu",
      description: "e-Fatura XML'i başarıyla oluşturuldu",
    });
  };

  const handleSendToUyumsoft = async (action: 'send' | 'bulk-upload' = 'send') => {
    if (!xmlData) {
      toast({
        title: "Hata",
        description: "Önce XML oluşturun",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('uyumsoft-efatura', {
        body: { xmlData, action }
      });

      if (error) {
        throw new Error(error.message);
      }

      setUyumsoftResponse(data);
      
      if (data.success) {
        toast({
          title: "Başarılı",
          description: data.message,
        });
      } else {
        toast({
          title: "Hata",
          description: data.error || "Bilinmeyen hata",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Uyumsoft integration error:', error);
      toast({
        title: "Hata",
        description: error.message || "Uyumsoft entegrasyonunda hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyXML = () => {
    navigator.clipboard.writeText(xmlData);
    toast({
      title: "Kopyalandı",
      description: "XML verisi panoya kopyalandı",
    });
  };

  const handleDownloadXML = () => {
    const blob = new Blob([xmlData], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `e-fatura-${faturaData.faturaNo}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const calculateTotal = () => {
    if (!faturaData.litre || !faturaData.birimFiyat) return 0;
    const tutar = parseFloat(faturaData.litre) * parseFloat(faturaData.birimFiyat);
    const kdvTutar = (tutar * parseFloat(faturaData.kdvOrani)) / 100;
    return tutar + kdvTutar;
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-green-600">Uyumsoft e-Fatura Test Portalı</h1>
        <div className="mt-2 space-y-1">
          <p className="text-gray-600">Uyumsoft Test API ile e-Fatura entegrasyonunu test edin</p>
          <div className="text-sm text-gray-500">
            <p><span className="font-medium">Test Portal:</span> https://efatura-test.uyumsoft.com.tr/Services/Integration</p>
            <p><span className="font-medium">Toplu Yükleme:</span> https://portal-test.uyumsoft.com.tr/Fatura/TopluXml</p>
            <p><span className="font-medium">Test Kimlik:</span> Uyumsoft / Uyumsoft</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              e-Fatura Bilgileri
            </CardTitle>
            <CardDescription>Fatura detaylarını girin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="faturaNo">Fatura Numarası *</Label>
                <Input
                  id="faturaNo"
                  value={faturaData.faturaNo}
                  onChange={(e) => handleInputChange('faturaNo', e.target.value)}
                  placeholder="AKR001-0001"
                  required
                />
              </div>
              <div>
                <Label htmlFor="tarih">Düzenleme Tarihi *</Label>
                <Input
                  id="tarih"
                  type="date"
                  value={faturaData.tarih}
                  onChange={(e) => handleInputChange('tarih', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gondericiVKN">Gönderici VKN *</Label>
                <Input
                  id="gondericiVKN"
                  value={faturaData.gondericiVKN}
                  onChange={(e) => handleInputChange('gondericiVKN', e.target.value)}
                  placeholder="1234567890"
                  required
                />
              </div>
              <div>
                <Label htmlFor="gondericiUnvan">Gönderici Unvan *</Label>
                <Input
                  id="gondericiUnvan"
                  value={faturaData.gondericiUnvan}
                  onChange={(e) => handleInputChange('gondericiUnvan', e.target.value)}
                  placeholder="XYZ Akaryakıt Ltd."
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="aliciVKN">Alıcı VKN *</Label>
                <Input
                  id="aliciVKN"
                  value={faturaData.aliciVKN}
                  onChange={(e) => handleInputChange('aliciVKN', e.target.value)}
                  placeholder="2222222222"
                  required
                />
              </div>
              <div>
                <Label htmlFor="aliciUnvan">Alıcı Unvan *</Label>
                <Input
                  id="aliciUnvan"
                  value={faturaData.aliciUnvan}
                  onChange={(e) => handleInputChange('aliciUnvan', e.target.value)}
                  placeholder="Ahmet Yılmaz"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Yakıt Türü</Label>
                <Select value={faturaData.yakitTuru} onValueChange={(value) => handleInputChange('yakitTuru', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Benzin">Benzin</SelectItem>
                    <SelectItem value="Motorin">Motorin</SelectItem>
                    <SelectItem value="LPG">LPG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>KDV Oranı (%)</Label>
                <Select value={faturaData.kdvOrani} onValueChange={(value) => handleInputChange('kdvOrani', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18">18%</SelectItem>
                    <SelectItem value="20">20%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="litre">Litre Miktarı *</Label>
                <Input
                  id="litre"
                  type="number"
                  step="0.01"
                  value={faturaData.litre}
                  onChange={(e) => handleInputChange('litre', e.target.value)}
                  placeholder="50"
                  required
                />
              </div>
              <div>
                <Label htmlFor="birimFiyat">Birim Fiyat (₺) *</Label>
                <Input
                  id="birimFiyat"
                  type="number"
                  step="0.01"
                  value={faturaData.birimFiyat}
                  onChange={(e) => handleInputChange('birimFiyat', e.target.value)}
                  placeholder="40.50"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="pompaNo">Pompa Numarası</Label>
                <Input
                  id="pompaNo"
                  value={faturaData.pompaNo}
                  onChange={(e) => handleInputChange('pompaNo', e.target.value)}
                  placeholder="Pompa 3"
                />
              </div>
              <div>
                <Label htmlFor="plaka">Plaka</Label>
                <Input
                  id="plaka"
                  value={faturaData.plaka}
                  onChange={(e) => handleInputChange('plaka', e.target.value)}
                  placeholder="34 ABC 123"
                />
              </div>
              <div>
                <Label htmlFor="istasyonKodu">İstasyon Kodu</Label>
                <Input
                  id="istasyonKodu"
                  value={faturaData.istasyonKodu}
                  onChange={(e) => handleInputChange('istasyonKodu', e.target.value)}
                  placeholder="IST001"
                />
              </div>
            </div>

            {faturaData.litre && faturaData.birimFiyat && (
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600">Toplam Tutar (KDV Dahil)</div>
                <div className="text-2xl font-bold text-green-600">₺{calculateTotal().toFixed(2)}</div>
              </div>
            )}

            <Button onClick={handleGenerateXML} className="w-full" size="lg">
              <FileText className="h-4 w-4 mr-2" />
              e-Fatura XML Oluştur
            </Button>
          </CardContent>
        </Card>

        {/* XML Output Section */}
        <Card>
          <CardHeader>
            <CardTitle>e-Fatura XML & Test Sonuçları</CardTitle>
            <CardDescription>
              UBL-TR uyumlu XML çıktısı ve Uyumsoft test sonuçları
              {xmlData && (
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" onClick={handleCopyXML}>
                    <Copy className="h-4 w-4 mr-1" />
                    Kopyala
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadXML}>
                    <Download className="h-4 w-4 mr-1" />
                    İndir
                  </Button>
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {xmlData ? (
              <>
                <Textarea
                  value={xmlData}
                  readOnly
                  className="min-h-[300px] font-mono text-sm"
                  placeholder="XML çıktısı burada görünecek..."
                />
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleSendToUyumsoft('send')} 
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isLoading ? 'Gönderiliyor...' : 'Uyumsoft API Testi'}
                  </Button>
                  <Button 
                    onClick={() => handleSendToUyumsoft('bulk-upload')} 
                    disabled={isLoading}
                    variant="outline"
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isLoading ? 'Yükleniyor...' : 'Toplu Yükleme Testi'}
                  </Button>
                </div>

                {uyumsoftResponse && (
                  <div className={`p-4 rounded-lg ${uyumsoftResponse.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="font-medium">Test Sonucu:</div>
                    <div className="text-sm mt-1">
                      {uyumsoftResponse.success ? (
                        <>
                          <p className="text-green-700">{uyumsoftResponse.message}</p>
                          {uyumsoftResponse.status && (
                            <p className="text-gray-600 mt-1">HTTP Status: {uyumsoftResponse.status}</p>
                          )}
                          {uyumsoftResponse.response && (
                            <pre className="text-xs bg-white p-2 rounded mt-2 overflow-auto max-h-32">
                              {uyumsoftResponse.response}
                            </pre>
                          )}
                        </>
                      ) : (
                        <p className="text-red-700">{uyumsoftResponse.error}</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-gray-500">
                Önce formu doldurup "e-Fatura XML Oluştur" butonuna tıklayın
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {xmlData && (
        <Card>
          <CardHeader>
            <CardTitle>Uyumsoft Test Portal Bilgileri</CardTitle>
            <CardDescription>Test API bilgileri ve sonraki adımlar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Test Kimlik Bilgileri:</h4>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Kullanıcı Adı:</span> Uyumsoft</p>
                  <p><span className="font-medium">Şifre:</span> Uyumsoft</p>
                  <p><span className="font-medium">Test Ortamı:</span> Aktif</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Test Endpoint'leri:</h4>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Integration API:</span></p>
                  <p className="text-blue-600 text-xs break-all">https://efatura-test.uyumsoft.com.tr/Services/Integration</p>
                  <p><span className="font-medium">Toplu XML Yükleme:</span></p>
                  <p className="text-blue-600 text-xs break-all">https://portal-test.uyumsoft.com.tr/Fatura/TopluXml</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Sonraki Adımlar:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                <li>Yukarıdaki butonlarla API testlerini çalıştırın</li>
                <li>Test sonuçlarını kontrol edin</li>
                <li>Canlı sistem için kendi API anahtarlarınızı kullanın</li>
                <li>GİB entegrasyonu için gerekli izinleri alın</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EFaturaTest;
