
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Upload } from "lucide-react";
import { useTaxRegistry } from "@/hooks/useTaxRegistry";
import { useToast } from "@/hooks/use-toast";

export const TaxRegistrySearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { searchByTaxNumber } = useTaxRegistry();
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Uyarı",
        description: "Lütfen VKN/TCKN giriniz",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchByTaxNumber(searchTerm);
      setSearchResults([result]);
      toast({
        title: "Başarılı",
        description: "Mükellef bilgileri bulundu",
      });
    } catch (error) {
      setSearchResults([]);
      toast({
        title: "Bulunamadı",
        description: "Bu VKN/TCKN ile kayıtlı mükellef bulunamadı",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      toast({
        title: "Bilgi",
        description: "CSV yükleme özelliği yakında eklenecek",
      });
    } else {
      toast({
        title: "Hata",
        description: "Lütfen geçerli bir CSV dosyası seçin",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Mükellef Sorgulama</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Label htmlFor="tax-search">VKN/TCKN</Label>
                <Input
                  id="tax-search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="VKN veya TCKN giriniz"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleSearch} disabled={isSearching}>
                  <Search className="h-4 w-4 mr-2" />
                  {isSearching ? "Aranıyor..." : "Sorgula"}
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <Label htmlFor="csv-upload">Toplu VKN Yükleme</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="flex-1"
                />
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Yükle
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                CSV dosyasında VKN/TCKN bilgileri bulunmalıdır
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mükellef Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>VKN/TCKN</TableHead>
                  <TableHead>Ünvan</TableHead>
                  <TableHead>Vergi Dairesi</TableHead>
                  <TableHead>Adres</TableHead>
                  <TableHead>Telefon</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchResults.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{result.tax_number}</TableCell>
                    <TableCell>{result.company_title}</TableCell>
                    <TableCell>{result.tax_office || "-"}</TableCell>
                    <TableCell>{result.address || "-"}</TableCell>
                    <TableCell>{result.phone || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
