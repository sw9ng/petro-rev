
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

      // Skip header row and process data
      const rows = jsonData.slice(1) as any[][];

      let successCount = 0;
      let errorCount = 0;

      for (const row of rows) {
        // Skip empty rows
        if (!row || row.length < 4) continue;

        try {
          // Extract data from columns based on the format shown in image
          // Column B: Tarih (Date)
          // Column C: Yakıt (Fuel Type) 
          // Column E: Fiyat (Price)
          // Column F: Litre (Liters)
          // Column G: Tutar (Total Amount)

          const dateStr = row[1]?.toString().trim(); // Column B - Tarih
          const fuelTypeRaw = row[2]?.toString().trim(); // Column C - Yakıt
          const pricePerLiter = parseFloat(row[4]?.toString().replace(',', '.') || '0'); // Column E - Fiyat
          const liters = parseFloat(row[5]?.toString().replace(',', '.') || '0'); // Column F - Litre
          const totalAmount = parseFloat(row[6]?.toString().replace(',', '.') || '0'); // Column G - Tutar

          // Skip if essential data is missing
          if (!fuelTypeRaw || !dateStr || liters <= 0 || totalAmount <= 0) {
            console.log(`Skipping row due to missing data: ${JSON.stringify(row.slice(0, 8))}`);
            continue;
          }

          // Map fuel types from the system to our standard format
          let fuelType: 'MOTORİN' | 'LPG' | 'BENZİN' | 'MOTORİN(DİĞER)';
          
          if (fuelTypeRaw.includes('Motorin') || fuelTypeRaw.includes('MOTORİN')) {
            fuelType = 'MOTORİN';
          } else if (fuelTypeRaw.includes('LPG')) {
            fuelType = 'LPG';
          } else if (fuelTypeRaw.includes('Kurşunsuz') || fuelTypeRaw.includes('BENZİN')) {
            fuelType = 'BENZİN';
          } else {
            fuelType = 'MOTORİN(DİĞER)';
          }

          // Parse date - handle various date formats
          let saleDate: Date;
          try {
            // Try different date parsing approaches
            if (typeof dateStr === 'string') {
              // Handle DD.MM.YYYY format or similar
              const dateParts = dateStr.split(/[.\-\/]/);
              if (dateParts.length >= 3) {
                const day = parseInt(dateParts[0]);
                const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
                const year = parseInt(dateParts[2]);
                saleDate = new Date(year, month, day);
              } else {
                saleDate = new Date(dateStr);
              }
            } else {
              saleDate = new Date(dateStr);
            }

            // If date is invalid, use current date
            if (isNaN(saleDate.getTime())) {
              saleDate = new Date();
            }
          } catch (e) {
            saleDate = new Date();
          }

          // Calculate price per liter if not provided or zero
          const calculatedPricePerLiter = pricePerLiter > 0 ? pricePerLiter : (totalAmount / liters);

          const fuelSaleData = {
            fuel_type: fuelType,
            liters: liters,
            price_per_liter: calculatedPricePerLiter,
            total_amount: totalAmount,
            amount: totalAmount,
            sale_time: saleDate.toISOString(),
            shift: saleDate.getHours() >= 6 && saleDate.getHours() < 18 ? 'Gündüz' : 'Gece'
          };

          const result = await addFuelSale(fuelSaleData);
          if (result.error) {
            console.error('Error adding fuel sale:', result.error);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (error) {
          console.error('Error processing row:', error, row);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} yakıt satışı başarıyla eklendi.${errorCount > 0 ? ` ${errorCount} kayıt eklenemedi.` : ''}`);
      } else {
        toast.error("Hiçbir kayıt eklenemedi. Lütfen dosya formatını kontrol edin.");
      }
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Yakıt Satışları Excel Yükle</DialogTitle>
          <DialogDescription>
            Otomasyon sisteminden alınan Excel dosyasını yükleyin.
            <br /><br />
            <strong>Dosya formatı:</strong>
            <br />
            • <strong>B Sütunu:</strong> Tarih
            <br />
            • <strong>C Sütunu:</strong> Yakıt Tipi (Motorin, LPG, Kurşunsuz vb.)
            <br />
            • <strong>E Sütunu:</strong> Birim Fiyat
            <br />
            • <strong>F Sütunu:</strong> Litre
            <br />
            • <strong>G Sütunu:</strong> Toplam Tutar
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
            {isUploading && (
              <p className="text-sm text-gray-500">Dosya işleniyor, lütfen bekleyin...</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isUploading}>
            İptal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
