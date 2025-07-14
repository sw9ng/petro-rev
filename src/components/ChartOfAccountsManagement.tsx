
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Calculator } from "lucide-react";
import { useChartOfAccounts } from "@/hooks/useChartOfAccounts";

interface ChartOfAccountsManagementProps {
  companyId: string;
}

export const ChartOfAccountsManagement = ({ companyId }: ChartOfAccountsManagementProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    account_code: "",
    account_name: "",
    account_type: "asset",
    parent_account_id: "",
  });

  const { accounts, isLoading, createAccount } = useChartOfAccounts(companyId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAccount.mutate({
      ...formData,
      parent_account_id: formData.parent_account_id || null,
    });
    setIsDialogOpen(false);
    setFormData({
      account_code: "",
      account_name: "",
      account_type: "asset",
      parent_account_id: "",
    });
  };

  const getAccountTypeLabel = (type: string) => {
    const typeMap = {
      asset: "Varlık",
      liability: "Borç",
      equity: "Özsermaye",
      revenue: "Gelir",
      expense: "Gider",
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Calculator className="h-5 w-5" />
          <span>Hesap Planı</span>
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Hesap
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Hesap Oluştur</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="account-code">Hesap Kodu</Label>
                <Input
                  id="account-code"
                  value={formData.account_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, account_code: e.target.value }))}
                  placeholder="Örn: 100.01"
                  required
                />
              </div>

              <div>
                <Label htmlFor="account-name">Hesap Adı</Label>
                <Input
                  id="account-name"
                  value={formData.account_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, account_name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="account-type">Hesap Türü</Label>
                <Select 
                  value={formData.account_type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, account_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asset">Varlık</SelectItem>
                    <SelectItem value="liability">Borç</SelectItem>
                    <SelectItem value="equity">Özsermaye</SelectItem>
                    <SelectItem value="revenue">Gelir</SelectItem>
                    <SelectItem value="expense">Gider</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="parent-account">Ana Hesap (Opsiyonel)</Label>
                <Select 
                  value={formData.parent_account_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, parent_account_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ana hesap seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.account_code} - {account.account_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit">Kaydet</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Yükleniyor...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hesap Kodu</TableHead>
                <TableHead>Hesap Adı</TableHead>
                <TableHead>Tür</TableHead>
                <TableHead>Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.account_code}</TableCell>
                  <TableCell>{account.account_name}</TableCell>
                  <TableCell>{getAccountTypeLabel(account.account_type)}</TableCell>
                  <TableCell>
                    {account.is_active ? (
                      <span className="text-green-600">Aktif</span>
                    ) : (
                      <span className="text-red-600">Pasif</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
