import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Fuel, Plus, Truck, MoreVertical, TrendingUp, TrendingDown } from 'lucide-react';
import { useTankers } from '@/hooks/useTankers';
import { formatCurrency } from '@/lib/numberUtils';
import { TankerDetailDialog } from './TankerDetailDialog';
import { CreateTankerDialog } from './CreateTankerDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useDeleteTanker } from '@/hooks/useTankers';

export const TankerManagement = () => {
  const { data: tankers, isLoading } = useTankers();
  const [selectedTankerId, setSelectedTankerId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const deleteTankerMutation = useDeleteTanker();

  const handleDeleteTanker = (id: string) => {
    if (confirm('Bu tankeri silmek istediğinizden emin misiniz?')) {
      deleteTankerMutation.mutate(id);
    }
  };

  const getFuelPercentage = (current: number, capacity: number) => {
    if (capacity === 0) return 0;
    return Math.min((current / capacity) * 100, 100);
  };

  const getFuelStatus = (percentage: number) => {
    if (percentage <= 20) return { color: 'destructive', text: 'Kritik' };
    if (percentage <= 50) return { color: 'warning', text: 'Düşük' };
    if (percentage <= 80) return { color: 'default', text: 'Normal' };
    return { color: 'success', text: 'Yüksek' };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Truck className="h-5 w-5 text-primary" />
              <span>Tanker Takibi</span>
            </h3>
            <p className="text-sm text-muted-foreground">Tanker yakıt seviyelerini takip edin</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Truck className="h-5 w-5 text-primary" />
            <span>Tanker Takibi</span>
          </h3>
          <p className="text-sm text-muted-foreground">Tanker yakıt seviyelerini takip edin</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Yeni Tanker</span>
        </Button>
      </div>

      {!tankers || tankers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Henüz tanker eklenmemiş</h3>
            <p className="text-muted-foreground mb-4">İlk tankerinizi ekleyerek yakıt takibi yapmaya başlayın</p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>İlk Tankeri Ekle</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tankers.map((tanker) => {
            const percentage = getFuelPercentage(tanker.current_fuel_level, tanker.capacity);
            const status = getFuelStatus(percentage);
            
            return (
              <Card key={tanker.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Fuel className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{tanker.name}</CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedTankerId(tanker.id)}>
                          Detayları Görüntüle
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteTanker(tanker.id)}
                          className="text-destructive"
                        >
                          Tankeri Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <Badge variant={status.color === 'success' ? 'default' : status.color === 'warning' ? 'secondary' : status.color as any} className="w-fit">
                    {status.text}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4" onClick={() => setSelectedTankerId(tanker.id)}>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Yakıt Seviyesi</span>
                      <span className="font-medium">{percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={percentage} className="h-3" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Mevcut</p>
                      <p className="font-semibold text-foreground">
                        {tanker.current_fuel_level.toLocaleString()} L
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Kapasite</p>
                      <p className="font-semibold text-foreground">
                        {tanker.capacity.toLocaleString()} L
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Doluluk Oranı</span>
                      <div className="flex items-center space-x-1">
                        {percentage > 50 ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        )}
                        <span className="font-medium">{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CreateTankerDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />

      {selectedTankerId && (
        <TankerDetailDialog
          tankerId={selectedTankerId}
          onClose={() => setSelectedTankerId(null)}
        />
      )}
    </div>
  );
};