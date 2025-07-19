
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { useFuelSales } from '@/hooks/useFuelSales';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export const FuelSalesExcelUpload = () => {
  const { addFuelSale } = useFuelSales();
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
        if (!row[0] || !row[1] || !row[2] || !row[3]) continue; // Zorunlu alanlar kontrolü

        const fuelType = row[0]?.toString().trim();
        const liters = parseFloat(row[1]?.toString() || '0');
        const pricePerLiter = parseFloat(row[2]?.toString() || '0');
        const saleTime = row[3] ? new Date(row[3]).toISOString() : new Date().toISOString();
        const shift = row[4]?.toString().trim() || 'Gündüz';

        // Yakıt tipi validasyonu
        const validFuelTypes = ['MOTORİN', 'LPG', 'BENZİN', 'MOTORİN(DİĞER)'];
        if (!validFuelTypes.includes(fuelType)) {
          errorCount++;
          continue;
        }

        if (liters > 0 && pricePerLiter > 0) {
          const fuelSaleData = {
            fuel_type: fuelType as 'MOTORİN' | 'LPG' | 'BENZİN' | 'MOTORİN(DİĞER)',
            liters: liters,
            price_per_liter: pricePerLiter,
            total_amount: liters * pricePerLiter,
            amount: liters * pricePerLiter,
            sale_time: saleTime,
            shift: shift
          };

          const result = await addFuelSale(fuelSaleData);
          if (result.error) {
            errorCount++;
          } else {
            successCount++;
          }
        } else {
          errorCount++;
        }
      }

      toast.success(`${successCount} yakıt satışı başarıyla eklendi.${errorCount > 0 ? ` ${errorCount} kayıt eklenemedi.` : ''}`);
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
          <DialogTitle>Yakıt Satışları Yükle</DialogTitle>
          <DialogDescription>
            Excel dosyasından yakıt satışları yükleyin. Dosya formatı:
            <br />
            <strong>1. Sütun:</strong> Yakıt Tipi (MOTORİN, LPG, BENZİN, MOTORİN(DİĞER))
            <br />
            <strong>2. Sütun:</strong> Litre
            <br />
            <strong>3. Sütun:</strong> Litre Fiyatı
            <br />
            <strong>4. Sütun:</strong> Satış Tarihi/Saati
            <br />
            <strong>5. Sütun:</strong> Vardiya (opsiyonel)
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
