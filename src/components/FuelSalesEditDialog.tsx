
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFuelSales, FuelSale } from '@/hooks/useFuelSales';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface FuelSalesEditDialogProps {
  sale: FuelSale | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (saleId: string, updatedData: any) => Promise<void>;
}

const fuelTypes = [
  { value: 'BENZİN', label: 'Benzin' },
  { value: 'LPG', label: 'LPG' },
  { value: 'MOTORİN', label: 'Motorin' },
  { value: 'MOTORİN(DİĞER)', label: 'Motorin (Diğer)' }
];

const shiftOptions = [
  { value: 'Gündüz', label: 'Gündüz' },
  { value: 'Gece', label: 'Gece' }
];

export const FuelSalesEditDialog = ({ sale, open, onClose, onUpdate }: FuelSalesEditDialogProps) => {
  const [editData, setEditData] = useState({
    fuel_type: '',
    liters: '',
    total_amount: '',
    shift: '',
    sale_time: ''
  });

  useEffect(() => {
    if (sale) {
      setEditData({
        fuel_type: sale.fuel_type,
        liters: sale.liters.toString(),
        total_amount: sale.total_amount.toString(),
        shift: sale.shift || '',
        sale_time: format(new Date(sale.sale_time), 'yyyy-MM-dd')
      });
    }
  }, [sale]);

  const calculatePricePerLiter = () => {
    const liters = parseFloat(editData.liters);
    const totalAmount = parseFloat(editData.total_amount);
    
    if (liters > 0 && totalAmount > 0) {
      return (totalAmount / liters).toFixed(3);
    }
    return '0.000';
  };

  const handleSave = async () => {
    if (!sale) return;

    const liters = parseFloat(editData.liters);
    const totalAmount = parseFloat(editData.total_amount);

    if (liters <= 0 || totalAmount <= 0) {
      toast.error('Litre ve toplam fiyat sıfırdan büyük olmalıdır');
      return;
    }

    const pricePerLiter = totalAmount / liters;
    const saleDate = new Date(editData.sale_time);
    
    try {
      await onUpdate(sale.id, {
        fuel_type: editData.fuel_type as 'MOTORİN' | 'LPG' | 'BENZİN' | 'MOTORİN(DİĞER)',
        liters: liters,
        price_per_liter: pricePerLiter,
        total_amount: totalAmount,
        amount: totalAmount,
        sale_time: saleDate.toISOString(),
        shift: editData.shift || null
      });

      toast.success('Yakıt satışı başarıyla güncellendi');
      onClose();
    } catch (err) {
      toast.error('Beklenmeyen hata oluştu');
    }
  };

  if (!sale) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Yakıt Satışını Düzenle</DialogTitle>
          <DialogDescription>
            Yakıt satış bilgilerini düzenleyin
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Yakıt Türü</Label>
            <Select value={editData.fuel_type} onValueChange={(value) => setEditData({...editData, fuel_type: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fuelTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Satılan Litre</Label>
            <Input
              type="number"
              step="0.01"
              value={editData.liters}
              onChange={(e) => setEditData({...editData, liters: e.target.value})}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label>Toplam Fiyat (₺)</Label>
            <Input
              type="number"
              step="0.01"
              value={editData.total_amount}
              onChange={(e) => setEditData({...editData, total_amount: e.target.value})}
              placeholder="0.00"
            />
          </div>

          {editData.liters && editData.total_amount && (
            <div>
              <Label>Birim Fiyat (Otomatik)</Label>
              <Input
                type="text"
                value={`₺${calculatePricePerLiter()}`}
                readOnly
                className="bg-green-50 border-green-200 text-green-800"
              />
            </div>
          )}

          <div>
            <Label>Vardiya (Opsiyonel)</Label>
            <Select value={editData.shift} onValueChange={(value) => setEditData({...editData, shift: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Vardiya seçin (opsiyonel)" />
              </SelectTrigger>
              <SelectContent>
                {shiftOptions.map(shift => (
                  <SelectItem key={shift.value} value={shift.value}>
                    {shift.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Satış Tarihi</Label>
            <Input
              type="date"
              value={editData.sale_time}
              onChange={(e) => setEditData({...editData, sale_time: e.target.value})}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            İptal
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
