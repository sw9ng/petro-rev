
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export const CustomerExcelUpload = () => {
  const { addCustomer } = useCustomers();
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error("Lütfen Excel dosyası (.xlsx veya .xls) seçin.");
      return;
    }

    setIsUploading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length < 2) {
        toast.error("Excel dosyası boş veya geçersiz.");
        setIsUploading(false);
        return;
      }

      // İlk satırı başlık olarak kabul et
      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1) as any[][];

      let successCount = 0;
      let errorCount = 0;

      for (const row of rows) {
        if (!row[0] || row[0].toString().trim() === '') continue; // Boş satırları atla

        const customerData = {
          name: row[0]?.toString().trim() || '',
          phone: row[1]?.toString().trim() || '',
          address: row[2]?.toString().trim() || '',
          notes: row[3]?.toString().trim() || ''
        };

        if (customerData.name) {
          const result = await addCustomer(customerData);
          if (result.error) {
            errorCount++;
          } else {
            successCount++;
          }
        }
      }

      toast.success(`${successCount} müşteri başarıyla eklendi.${errorCount > 0 ? ` ${errorCount} kayıt eklenemedi.` : ''}`);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Excel dosyası işleme hatası:', error);
      toast.error("Excel dosyası işlenirken bir hata oluştu.");
    }

    setIsUploading(false);
    event.target.value = '';
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <FileSpreadsheet className="h-4 w-4" />
          <span>Excel Yükle</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Müşteri Listesi Yükle</DialogTitle>
          <DialogDescription>
            Excel dosyasından müşteri listesi yükleyin. Dosya formatı:
            <br />
            <strong>1. Sütun:</strong> Müşteri Adı (zorunlu)
            <br />
            <strong>2. Sütun:</strong> Telefon
            <br />
            <strong>3. Sütun:</strong> Adres
            <br />
            <strong>4. Sütun:</strong> Notlar
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            İptal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
