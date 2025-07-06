
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calculator, TrendingUp, DollarSign, Fuel } from 'lucide-react';
import { formatCurrency } from '@/lib/numberUtils';

interface FuelProfitData {
  fuel_type: string;
  purchase_price: number;
  average_sale_price: number;
  total_liters: number;
  total_revenue: number;
  profit_per_liter: number;
  total_profit: number;
}

interface FuelProfitCalculatorProps {
  fuelSalesData: Array<{
    fuel_type: string;
    total_amount: number;
    total_liters: number;
  }>;
}

export const FuelProfitCalculator = ({ fuelSalesData }: FuelProfitCalculatorProps) => {
  const [purchasePrices, setPurchasePrices] = useState<Record<string, number>>({});
  const [profitData, setProfitData] = useState<FuelProfitData[]>([]);

  // Load saved purchase prices from localStorage
  useEffect(() => {
    const savedPrices = localStorage.getItem('fuelPurchasePrices');
    if (savedPrices) {
      setPurchasePrices(JSON.parse(savedPrices));
    }
  }, []);

  // Calculate profit data when purchase prices or fuel sales data changes
  useEffect(() => {
    if (fuelSalesData.length > 0) {
      calculateProfitData();
    }
  }, [fuelSalesData, purchasePrices]);

  const handlePurchasePriceChange = (fuelType: string, price: string) => {
    const numericPrice = parseFloat(price) || 0;
    const updatedPrices = {
      ...purchasePrices,
      [fuelType]: numericPrice
    };
    setPurchasePrices(updatedPrices);
    // Save to localStorage for persistence
    localStorage.setItem('fuelPurchasePrices', JSON.stringify(updatedPrices));
  };

  const calculateProfitData = () => {
    const calculatedData = fuelSalesData.map(fuel => {
      const purchasePrice = purchasePrices[fuel.fuel_type] || 0;
      const averageSalePrice = fuel.total_liters > 0 ? fuel.total_amount / fuel.total_liters : 0;
      const profitPerLiter = averageSalePrice - purchasePrice;
      const totalProfit = profitPerLiter * fuel.total_liters;

      return {
        fuel_type: fuel.fuel_type,
        purchase_price: purchasePrice,
        average_sale_price: averageSalePrice,
        total_liters: fuel.total_liters,
        total_revenue: fuel.total_amount,
        profit_per_liter: profitPerLiter,
        total_profit: totalProfit
      };
    });

    setProfitData(calculatedData);
  };

  const totalProfit = profitData.reduce((sum, data) => sum + data.total_profit, 0);
  const totalRevenue = profitData.reduce((sum, data) => sum + data.total_revenue, 0);
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calculator className="h-5 w-5" />
          <span>Akaryakıt Kâr Hesaplama</span>
        </CardTitle>
        <CardDescription>
          Alış fiyatlarını girerek akaryakıt satışlarından elde edilen kârı hesaplayın
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Purchase Price Inputs */}
        {fuelSalesData.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Fuel className="h-4 w-4" />
              <span>Alış Fiyatları (₺/Litre)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {fuelSalesData.map((fuel) => (
                <div key={fuel.fuel_type} className="space-y-2">
                  <Label className="text-sm font-medium">
                    {fuel.fuel_type}
                    <span className="text-gray-500 text-xs ml-1">
                      (Ort. Satış: {formatCurrency(fuel.total_liters > 0 ? fuel.total_amount / fuel.total_liters : 0)}/L)
                    </span>
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={purchasePrices[fuel.fuel_type] || ''}
                    onChange={(e) => handlePurchasePriceChange(fuel.fuel_type, e.target.value)}
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Profit Analysis */}
        {profitData.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Kâr Analizi</span>
            </h4>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-900">Toplam Kâr</p>
                      <p className="text-xl font-bold text-green-700">{formatCurrency(totalProfit)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">Kâr Marjı</p>
                      <p className="text-xl font-bold text-blue-700">%{profitMargin.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Fuel className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-900">Toplam Ciro</p>
                      <p className="text-xl font-bold text-purple-700">{formatCurrency(totalRevenue)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Breakdown */}
            <div className="space-y-4">
              <h5 className="font-medium text-gray-900">Yakıt Türü Bazında Detay</h5>
              {profitData.map((data) => (
                <div key={data.fuel_type} className="border rounded-lg p-4 bg-gray-50">
                  <h6 className="font-medium text-gray-900 mb-3">{data.fuel_type}</h6>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Toplam Litre</p>
                      <p className="font-semibold">{data.total_liters.toFixed(2)} L</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Alış Fiyatı</p>
                      <p className="font-semibold">{formatCurrency(data.purchase_price)}/L</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Ort. Satış Fiyatı</p>
                      <p className="font-semibold">{formatCurrency(data.average_sale_price)}/L</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Litre Başı Kâr</p>
                      <p className={`font-semibold ${data.profit_per_liter >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {data.profit_per_liter >= 0 ? '+' : ''}{formatCurrency(data.profit_per_liter)}/L
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Toplam Ciro</p>
                      <p className="font-semibold text-blue-600">{formatCurrency(data.total_revenue)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Toplam Kâr</p>
                      <p className={`font-semibold ${data.total_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {data.total_profit >= 0 ? '+' : ''}{formatCurrency(data.total_profit)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {fuelSalesData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Fuel className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Seçilen dönemde akaryakıt satışı verisi bulunmuyor.</p>
            <p className="text-sm">Kâr hesaplaması için akaryakıt satış verilerine ihtiyaç vardır.</p>
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="p-1 bg-amber-100 rounded">
              <svg className="h-4 w-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-amber-800">Bilgi</p>
              <p className="text-sm text-amber-700 mt-1">
                Alış fiyatları bir kez girildiğinde otomatik olarak kaydedilir. Kâr hesaplaması gerçek zamanlı olarak güncellenir.
                Hesaplamalar seçilen tarih aralığındaki akaryakıt satış verilerine dayanmaktadır.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
