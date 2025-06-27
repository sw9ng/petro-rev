import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Trash2, Edit2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePersonnel, Personnel } from '@/hooks/usePersonnel';
import { PersonnelEditDialog } from './PersonnelEditDialog';

export const PersonnelManagement = () => {
  const { toast } = useToast();
  const { personnel, loading, addPersonnel, updatePersonnel, deletePersonnel } = usePersonnel();
  const [newPersonnelOpen, setNewPersonnelOpen] = useState(false);
  const [editPersonnelOpen, setEditPersonnelOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
  const [newPersonnelData, setNewPersonnelData] = useState({
    name: '',
    email: '',
    phone: '',
    role: ''
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
        title: "Personel Eklendi",
        description: "Yeni personel başarıyla eklendi.",
      });
      
      setNewPersonnelOpen(false);
      setNewPersonnelData({
        name: '',
        email: '',
        phone: '',
        role: ''
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
                    </CardDescription>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPersonnel(person)}
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
                          <AlertDialogAction onClick={() => handleDeletePersonnel(person.id)}>
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
    </div>
  );
};
