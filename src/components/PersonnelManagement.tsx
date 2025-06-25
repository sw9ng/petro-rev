
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, User, Clock, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePersonnel } from '@/hooks/usePersonnel';

export const PersonnelManagement = () => {
  const { toast } = useToast();
  const { personnel, loading, addPersonnel, deletePersonnel } = usePersonnel();
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [newPersonnelData, setNewPersonnelData] = useState({
    name: '',
    email: '',
    phone: '',
    role: ''
  });

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPersonnelData.name || !newPersonnelData.role) {
      toast({
        title: "Hata",
        description: "Ad soyad ve görev alanları zorunludur.",
        variant: "destructive"
      });
      return;
    }

    const { error } = await addPersonnel({
      ...newPersonnelData,
      status: 'active'
    });

    if (error) {
      toast({
        title: "Hata",
        description: "Personel eklenirken bir hata oluştu.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Başarılı",
        description: "Personel başarıyla eklendi.",
      });
      setAddStaffOpen(false);
      setNewPersonnelData({ name: '', email: '', phone: '', role: '' });
    }
  };

  const handleDeletePersonnel = async (personnelId: string, name: string) => {
    const { error } = await deletePersonnel(personnelId);

    if (error) {
      toast({
        title: "Hata",
        description: "Personel silinirken bir hata oluştu.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Başarılı",
        description: `${name} personel listesinden kaldırıldı. Geçmiş vardiya kayıtları korundu.`,
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Personel Yönetimi</h2>
          <p className="text-muted-foreground">Personeli yönet ve performansı takip et</p>
        </div>
        <Dialog open={addStaffOpen} onOpenChange={setAddStaffOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Personel Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Yeni Personel Ekle</DialogTitle>
              <DialogDescription>Yeni çalışanın detaylarını girin</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddStaff} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ad Soyad *</Label>
                <Input 
                  id="name" 
                  placeholder="Ad soyad girin"
                  value={newPersonnelData.name}
                  onChange={(e) => setNewPersonnelData({...newPersonnelData, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="E-posta adresini girin"
                  value={newPersonnelData.email}
                  onChange={(e) => setNewPersonnelData({...newPersonnelData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon Numarası</Label>
                <Input 
                  id="phone" 
                  placeholder="Telefon numarasını girin"
                  value={newPersonnelData.phone}
                  onChange={(e) => setNewPersonnelData({...newPersonnelData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Görev *</Label>
                <Input 
                  id="role" 
                  placeholder="örn. Pompa Görevlisi, Vardiya Amiri"
                  value={newPersonnelData.role}
                  onChange={(e) => setNewPersonnelData({...newPersonnelData, role: e.target.value})}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Personel Ekle
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Staff Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Toplam Personel</span>
            </div>
            <p className="text-2xl font-bold mt-2">{personnel.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Aktif Personel</span>
            </div>
            <p className="text-2xl font-bold mt-2">{activePersonnel.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium">Pasif Personel</span>
            </div>
            <p className="text-2xl font-bold mt-2">{personnel.filter(p => p.status !== 'active').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Staff List */}
      {activePersonnel.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Henüz aktif personel eklenmemiş.</p>
            <p className="text-sm text-muted-foreground mt-2">Yeni personel eklemek için yukarıdaki butonu kullanın.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activePersonnel.map((member) => (
            <Card key={member.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <CardDescription>{member.role}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="default">aktif</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div className="space-y-2">
                  {member.email && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">E-posta:</span>
                      <span>{member.email}</span>
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Telefon:</span>
                      <span>{member.phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Başlangıç:</span>
                    <span>{new Date(member.join_date).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Bilgileri Düzenle
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Personeli Sil</AlertDialogTitle>
                        <AlertDialogDescription>
                          {member.name} adlı personeli silmek istediğinizden emin misiniz? 
                          Bu işlem personeli aktif listeden kaldıracak ancak geçmiş vardiya kayıtları korunacaktır.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeletePersonnel(member.id, member.name)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Sil
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
