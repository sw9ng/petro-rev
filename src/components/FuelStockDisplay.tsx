
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFuelStock } from '@/hooks/useFuelStock';
import { Fuel, TrendingDown, AlertTriangle } from 'lucide-react';

export const FuelStockDisplay = () => {
  const { fuelStock, loading } = useFuelStock();

  if (loading) {
    return <div className="flex justify-center items-center h-32">Yükleniyor...</div>;
  }

  const fuelTypes = ['MOTORİN', 'LPG', 'BENZİN', 'MOTORİN(DİĞER)'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {fuelTypes.map((fuelType) => {
        const stock = fuelStock.find(s => s.fuel_type === fuelType);
        const currentStock = stock ? stock.current_stock : 0;
        const isLowStock = currentStock < 1000; // 1000 litre altı düşük stok

        return (
          <Card key={fuelType} className={isLowStock && currentStock > 0 ? "border-orange-200" : currentStock <= 0 ? "border-red-200" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Fuel className="h-4 w-4" />
                {fuelType}
                {isLowStock && currentStock > 0 && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                {currentStock <= 0 && <TrendingDown className="h-4 w-4 text-red-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                currentStock <= 0 ? 'text-red-600' : 
                isLowStock ? 'text-orange-600' : 
                'text-green-600'
              }`}>
                {currentStock.toFixed(2)} Lt
              </div>
              <p className="text-xs text-gray-500">
                {currentStock <= 0 ? 'Stok Yok' : 
                 isLowStock ? 'Düşük Stok' : 
                 'Stok Durumu İyi'}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
