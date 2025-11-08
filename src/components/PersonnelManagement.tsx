
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Trash2, Edit2, Users, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePersonnel, Personnel } from '@/hooks/usePersonnel';
import { PersonnelEditDialog } from './PersonnelEditDialog';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { supabase } from '@/integrations/supabase/client';

export const PersonnelManagement = () => {
  const { toast } = useToast();
  const { personnel, loading, addPersonnel, updatePersonnel, deletePersonnel } = usePersonnel();
  const { isPremium } = usePremiumStatus();
  const [newPersonnelOpen, setNewPersonnelOpen] = useState(false);
  const [editPersonnelOpen, setEditPersonnelOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({
    personnelId: '',
    personnelName: '',
    newPassword: ''
  });
  const [newPersonnelData, setNewPersonnelData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    attendant_email: '',
    attendant_password: ''
  });

  const handleCreatePersonnel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPersonnelData.name || !newPersonnelData.role) {
      toast({
        title: "Hata",
        description: "Ad ve rol alanları zorunludur.",
        variant: "destructive"
      });
      return;
    }

    // Check freemium limits
    if (!isPremium && personnel.length >= 5) {
      toast({
        title: "Limit Aşıldı",
        description: "Ücretsiz plan ile maksimum 5 personel ekleyebilirsiniz. Premium'a yükseltin.",
        variant: "destructive"
      });
      return;
    }

    // Hash password if provided for pump attendants
    let attendant_password_hash = null;
    if (newPersonnelData.role === 'pompacı' && newPersonnelData.attendant_password) {
      const { data, error } = await supabase.rpc('hash_attendant_password', {
        password: newPersonnelData.attendant_password
      });
      
      if (error) {
        toast({
          title: "Hata",
          description: "Şifre hashleme hatası.",
          variant: "destructive"
        });
        return;
      }
      attendant_password_hash = data;
    }

    const { error } = await addPersonnel({
      name: newPersonnelData.name,
      email: newPersonnelData.email,
      phone: newPersonnelData.phone,
      role: newPersonnelData.role,
      status: 'active',
      attendant_email: newPersonnelData.role === 'pompacı' ? newPersonnelData.attendant_email : null,
      attendant_password_hash
    });

    if (error) {
      toast({
        title: "Hata",
        description: "Personel eklenirken bir hata oluştu.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Personel Eklendi",
        description: "Yeni personel başarıyla eklendi.",
      });
      
      setNewPersonnelOpen(false);
      setNewPersonnelData({
        name: '',
        email: '',
        phone: '',
        role: '',
        attendant_email: '',
        attendant_password: ''
      });
    }
  };

  const handleEditPersonnel = (person: Personnel) => {
    setSelectedPersonnel(person);
    setEditPersonnelOpen(true);
  };

  const handleUpdatePersonnel = async (personnelData: Partial<Personnel>) => {
    if (!selectedPersonnel) return { error: 'No personnel selected' };
    return await updatePersonnel(selectedPersonnel.id, personnelData);
  };

  const handleDeletePersonnel = async (personnelId: string) => {
    const { error } = await deletePersonnel(personnelId);

    if (error) {
      toast({
        title: "Hata",
        description: "Personel silinirken bir hata oluştu.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Personel Silindi",
        description: "Personel başarıyla silindi (geçmiş veriler korundu).",
      });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetPasswordData.newPassword || resetPasswordData.newPassword.length < 6) {
      toast({
        title: "Hata",
        description: "Şifre en az 6 karakter olmalıdır.",
        variant: "destructive"
      });
      return;
    }

    // Hash the new password
    const { data: hashedPassword, error: hashError } = await supabase.rpc('hash_attendant_password', {
      password: resetPasswordData.newPassword
    });
    
    if (hashError) {
      toast({
        title: "Hata",
        description: "Şifre hashleme hatası.",
        variant: "destructive"
      });
      return;
    }

    // Update the personnel record with new password hash
    const { error } = await updatePersonnel(resetPasswordData.personnelId, {
      attendant_password_hash: hashedPassword
    });

    if (error) {
      toast({
        title: "Hata",
        description: "Şifre sıfırlama başarısız oldu.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Başarılı",
        description: `${resetPasswordData.personnelName} için yeni şifre belirlendi.`,
      });
      setResetPasswordOpen(false);
      setResetPasswordData({ personnelId: '', personnelName: '', newPassword: '' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Personel bilgileri yükleniyor...</p>
      </div>
    );
  }

  const activePersonnel = personnel.filter(p => p.status === 'active');

  return (
    <div className="space-y-6">
      {/* Başlık ve Yeni Personel Butonu */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Personel Yönetimi</h2>
          <p className="text-muted-foreground">Personel bilgilerini ekle ve yönet</p>
        </div>
        <Dialog open={newPersonnelOpen} onOpenChange={setNewPersonnelOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Personel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Yeni Personel Ekle</DialogTitle>
              <DialogDescription>Personel bilgilerini girin</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePersonnel} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Ad Soyad *</Label>
                <Input 
                  value={newPersonnelData.name}
                  onChange={(e) => setNewPersonnelData({...newPersonnelData, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>E-posta</Label>
                <Input 
                  type="email"
                  value={newPersonnelData.email}
                  onChange={(e) => setNewPersonnelData({...newPersonnelData, email: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input 
                  value={newPersonnelData.phone}
                  onChange={(e) => setNewPersonnelData({...newPersonnelData, phone: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Rol *</Label>
                <Select value={newPersonnelData.role} onValueChange={(value) => setNewPersonnelData({...newPersonnelData, role: value})}>
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
              {newPersonnelData.role === 'pompacı' && (
                <>
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-sm mb-3 text-blue-600">Pompacı Giriş Bilgileri</h4>
                    <p className="text-xs text-gray-500 mb-3">Bu bilgiler pompacının kendi paneline giriş yapması için kullanılacaktır.</p>
                    
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Giriş E-postası *</Label>
                        <Input 
                          type="email"
                          placeholder="ornek@email.com"
                          value={newPersonnelData.attendant_email}
                          onChange={(e) => setNewPersonnelData({...newPersonnelData, attendant_email: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Giriş Şifresi *</Label>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="Güvenli bir şifre girin"
                            value={newPersonnelData.attendant_password}
                            onChange={(e) => setNewPersonnelData({...newPersonnelData, attendant_password: e.target.value})}
                            required
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
                          Bu şifre ile pompacı kendi paneline giriş yapabilecektir.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <Button type="submit" className="w-full">
                Personel Ekle
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Personel Listesi */}
      {activePersonnel.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-muted-foreground">Henüz personel eklenmemiş.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activePersonnel.map((person) => (
            <Card key={person.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{person.name}</CardTitle>
                    <CardDescription>
                      <Badge variant="secondary" className="mt-1">
                        {person.role}
                      </Badge>
                      {person.role === 'pompacı' && person.attendant_email && (
                        <Badge variant="outline" className="mt-1 ml-2 bg-green-50 text-green-700 border-green-200">
                          Panel Erişimi Var
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPersonnel(person);
                        setEditPersonnelOpen(true);
                      }}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Personeli Sil</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bu personeli silmek istediğinizden emin misiniz? Geçmiş vardiya kayıtları korunacak.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>İptal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deletePersonnel(person.id)}>
                            Sil
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {person.email && (
                    <div>
                      <span className="text-muted-foreground">E-posta:</span>
                      <p>{person.email}</p>
                    </div>
                  )}
                  {person.phone && (
                    <div>
                      <span className="text-muted-foreground">Telefon:</span>
                      <p>{person.phone}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Başlangıç:</span>
                    <p>{new Date(person.join_date).toLocaleDateString('tr-TR')}</p>
                  </div>
                  {person.role === 'pompacı' && person.attendant_email && (
                    <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-700 font-medium text-xs">Panel Giriş Bilgileri:</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                          onClick={() => {
                            setResetPasswordData({
                              personnelId: person.id,
                              personnelName: person.name,
                              newPassword: ''
                            });
                            setResetPasswordOpen(true);
                          }}
                        >
                          <KeyRound className="h-3 w-3 mr-1" />
                          Şifre Sıfırla
                        </Button>
                      </div>
                      <p className="text-blue-600 text-sm font-medium">{person.attendant_email}</p>
                      <p className="text-blue-500 text-xs mt-1">Şifre: ••••••••</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PersonnelEditDialog
        personnel={selectedPersonnel}
        isOpen={editPersonnelOpen}
        onOpenChange={setEditPersonnelOpen}
        onUpdate={handleUpdatePersonnel}
      />

      {/* Password Reset Dialog */}
      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pompacı Şifresini Sıfırla</DialogTitle>
            <DialogDescription>
              {resetPasswordData.personnelName} için yeni panel giriş şifresi belirleyin.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label>Yeni Şifre *</Label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"}
                  placeholder="En az 6 karakter"
                  value={resetPasswordData.newPassword}
                  onChange={(e) => setResetPasswordData({...resetPasswordData, newPassword: e.target.value})}
                  required
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
              <p className="text-xs text-muted-foreground">
                Bu yeni şifre ile pompacı kendi paneline giriş yapabilecektir.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setResetPasswordOpen(false)}>
                İptal
              </Button>
              <Button type="submit">
                Şifreyi Güncelle
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
