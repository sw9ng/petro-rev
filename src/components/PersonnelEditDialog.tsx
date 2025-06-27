
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Personnel } from '@/hooks/usePersonnel';

interface PersonnelEditDialogProps {
  personnel: Personnel | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (personnelData: Partial<Personnel>) => Promise<{ error?: any }>;
}

export const PersonnelEditDialog = ({ 
  personnel, 
  isOpen, 
  onOpenChange, 
  onUpdate 
}: PersonnelEditDialogProps) => {
  const { toast } = useToast();
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    role: ''
  });

  useEffect(() => {
    if (personnel) {
      setEditData({
        name: personnel.name || '',
        email: personnel.email || '',
        phone: personnel.phone || '',
        role: personnel.role || ''
      });
    }
  }, [personnel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!personnel) return;

    if (!editData.name || !editData.role) {
      toast({
        title: "Hata",
        description: "Ad ve rol alanları zorunludur.",
        variant: "destructive"
      });
      return;
    }

    const { error } = await onUpdate(editData);

    if (error) {
      toast({
        title: "Hata",
        description: "Personel güncellenirken bir hata oluştu.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Başarılı",
        description: "Personel bilgileri güncellendi.",
      });
      onOpenChange(false);
    }
  };

  if (!personnel) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Personel Düzenle</DialogTitle>
          <DialogDescription>Personel bilgilerini güncelleyin</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Ad Soyad *</Label>
            <Input 
              value={editData.name}
              onChange={(e) => setEditData({...editData, name: e.target.value})}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>E-posta</Label>
            <Input 
              type="email"
              value={editData.email}
              onChange={(e) => setEditData({...editData, email: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Telefon</Label>
            <Input 
              value={editData.phone}
              onChange={(e) => setEditData({...editData, phone: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Rol *</Label>
            <Select value={editData.role} onValueChange={(value) => setEditData({...editData, role: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Rol seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pompacı">Pompacı</SelectItem>
                <SelectItem value="kasiyer">Kasiyer</SelectItem>
                <SelectItem value="vardiya_amiri">Vardiya Amiri</SelectItem>
                <SelectItem value="teknisyen">Teknisyen</SelectItem>
                <SelectItem value="köy_tankeri">Köy Tankeri</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              İptal
            </Button>
            <Button type="submit" className="flex-1">
              Güncelle
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
