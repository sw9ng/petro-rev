
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Personnel } from '@/hooks/usePersonnel';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
    role: '',
    attendant_email: '',
    attendant_password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (personnel) {
      setEditData({
        name: personnel.name || '',
        email: personnel.email || '',
        phone: personnel.phone || '',
        role: personnel.role || '',
        attendant_email: personnel.attendant_email || '',
        attendant_password: ''
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

    // Hash password if provided for pump attendants
    let updateData: any = { ...editData };
    if (editData.role === 'pompacı' && editData.attendant_password) {
      const { data, error: hashError } = await supabase.rpc('hash_attendant_password', {
        password: editData.attendant_password
      });
      
      if (hashError) {
        toast({
          title: "Hata",
          description: "Şifre hashleme hatası.",
          variant: "destructive"
        });
        return;
      }
      updateData.attendant_password_hash = data;
    }

    // Remove password from update data to avoid sending plain text
    delete updateData.attendant_password;

    const { error } = await onUpdate(updateData);

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

          {/* Pump Attendant Login Fields */}
          {editData.role === 'pompacı' && (
            <>
              <div className="border-t pt-4">
                <h4 className="font-medium text-sm mb-3 text-blue-600">Pompacı Giriş Bilgileri</h4>
                <p className="text-xs text-gray-500 mb-3">Bu bilgiler pompacının kendi paneline giriş yapması için kullanılacaktır.</p>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Giriş E-postası</Label>
                    <Input 
                      type="email"
                      placeholder="ornek@email.com"
                      value={editData.attendant_email}
                      onChange={(e) => setEditData({...editData, attendant_email: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Yeni Şifre (Değiştirmek için)</Label>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"}
                        placeholder="Yeni şifre girin (boş bırakır değiştirmezsiniz)"
                        value={editData.attendant_password}
                        onChange={(e) => setEditData({...editData, attendant_password: e.target.value})}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Boş bırakırsanız mevcut şifre değiştirilmez.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

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
