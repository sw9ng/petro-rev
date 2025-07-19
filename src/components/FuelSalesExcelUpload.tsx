
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
        if (!row || row.length < 7) continue;

        try {
          // Based on the image provided:
          // Column A: Document number (skip)
          // Column B: Date/Time (as Excel serial number)
          // Column C: Fuel Type
          // Column D: Transaction number (skip)
          // Column E: License plate (skip)
          // Column F: (empty/skip)
          // Column G: Price per liter
          // Column H: Liters

          const excelDate = row[1]; // Column B - Date as Excel serial number
          const fuelTypeRaw = row[2]?.toString().trim(); // Column C - Fuel Type
          const pricePerLiter = parseFloat(row[6]?.toString().replace(',', '.') || '0'); // Column G - Price
          const liters = parseFloat(row[7]?.toString().replace(',', '.') || '0'); // Column H - Liters

          console.log(`Processing row: Date=${excelDate}, Fuel=${fuelTypeRaw}, Price=${pricePerLiter}, Liters=${liters}`);

          // Skip if essential data is missing
          if (!fuelTypeRaw || !excelDate || liters <= 0 || pricePerLiter <= 0) {
            console.log(`Skipping row due to missing essential data: Date=${excelDate}, Fuel=${fuelTypeRaw}, Price=${pricePerLiter}, Liters=${liters}`);
            continue;
          }

          // Map fuel types from the system to our standard format
          let fuelType: 'MOTORİN' | 'LPG' | 'BENZİN' | 'MOTORİN(DİĞER)';
          
          if (fuelTypeRaw.includes('Motorin') || fuelTypeRaw.includes('MOTORİN')) {
            if (fuelTypeRaw.includes('Diğer') || fuelTypeRaw.includes('(Diğer)')) {
              fuelType = 'MOTORİN(DİĞER)';
            } else {
              fuelType = 'MOTORİN';
            }
          } else if (fuelTypeRaw.includes('LPG')) {
            fuelType = 'LPG';
          } else if (fuelTypeRaw.includes('Kurşunsuz') || fuelTypeRaw.includes('BENZİN') || fuelTypeRaw.includes('Benzin')) {
            fuelType = 'BENZİN';
          } else {
            fuelType = 'MOTORİN(DİĞER)';
          }

          // Convert Excel serial date to JavaScript Date
          let saleDate: Date;
          try {
            if (typeof excelDate === 'number') {
              // Excel date serial number to JavaScript Date
              // Excel's epoch starts from January 1, 1900
              const excelEpoch = new Date(1900, 0, 1);
              const daysSinceEpoch = excelDate - 1; // Excel starts from day 1, not 0
              saleDate = new Date(excelEpoch.getTime() + daysSinceEpoch * 24 * 60 * 60 * 1000);
            } else {
              // Try to parse as string date
              saleDate = new Date(excelDate);
            }

            // If date is invalid, use current date
            if (isNaN(saleDate.getTime())) {
              saleDate = new Date();
            }
          } catch (e) {
            console.error('Date parsing error:', e);
            saleDate = new Date();
          }

          const totalAmount = liters * pricePerLiter;

          const fuelSaleData = {
            fuel_type: fuelType,
            liters: liters,
            price_per_liter: pricePerLiter,
            total_amount: totalAmount,
            amount: totalAmount,
            sale_time: saleDate.toISOString(),
            shift: saleDate.getHours() >= 6 && saleDate.getHours() < 18 ? 'Gündüz' : 'Gece'
          };

          console.log('Adding fuel sale:', fuelSaleData);

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
            • <strong>B Sütunu:</strong> Tarih/Saat
            <br />
            • <strong>C Sütunu:</strong> Yakıt Tipi (Motorin, LPG, Kurşunsuz Benzin vb.)
            <br />
            • <strong>G Sütunu:</strong> Litre Fiyatı
            <br />
            • <strong>H Sütunu:</strong> Litre Miktarı
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
