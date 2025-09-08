import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateTanker } from '@/hooks/useTankers';

interface CreateTankerDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTankerDialog = ({ isOpen, onClose }: CreateTankerDialogProps) => {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [currentFuelLevel, setCurrentFuelLevel] = useState('');
  
  const createTankerMutation = useCreateTanker();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !capacity || parseFloat(capacity) <= 0) {
      return;
    }

    const fuelLevel = currentFuelLevel ? parseFloat(currentFuelLevel) : 0;
    const tankCapacity = parseFloat(capacity);
    
    if (fuelLevel > tankCapacity) {
      alert('Mevcut yakıt seviyesi kapasiteden fazla olamaz');
      return;
    }

    createTankerMutation.mutate(
      {
        name: name.trim(),
        capacity: tankCapacity,
        current_fuel_level: fuelLevel,
      },
      {
        onSuccess: () => {
          setName('');
          setCapacity('');
          setCurrentFuelLevel('');
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    if (!createTankerMutation.isPending) {
      setName('');
      setCapacity('');
      setCurrentFuelLevel('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yeni Tanker Ekle</DialogTitle>
          <DialogDescription>
            Yeni bir tanker ekleyin ve başlangıç yakıt seviyesini belirleyin.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tanker Adı</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="örn. Tanker 1, Ana Tanker"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="capacity">Kapasite (Litre)</Label>
            <Input
              id="capacity"
              type="number"
              step="0.01"
              min="0"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="örn. 50000"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="currentFuel">Mevcut Yakıt Seviyesi (Litre)</Label>
            <Input
              id="currentFuel"
              type="number"
              step="0.01"
              min="0"
              value={currentFuelLevel}
              onChange={(e) => setCurrentFuelLevel(e.target.value)}
              placeholder="örn. 25000 (isteğe bağlı)"
            />
            <p className="text-xs text-muted-foreground">
              Boş bırakırsanız 0 litre olarak kaydedilir
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={createTankerMutation.isPending}
            >
              İptal
            </Button>
            <Button 
              type="submit" 
              disabled={createTankerMutation.isPending}
            >
              {createTankerMutation.isPending ? 'Ekleniyor...' : 'Tanker Ekle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};