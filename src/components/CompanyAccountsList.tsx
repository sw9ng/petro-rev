
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Building2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CompanyAccountsListProps {
  companyId: string;
}

export const CompanyAccountsList = ({ companyId }: CompanyAccountsListProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    notes: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts, isLoading } = useQuery({
    queryKey: ["company-accounts", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_accounts")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createAccount = useMutation({
    mutationFn: async (accountData: any) => {
      const { data, error } = await supabase
        .from("company_accounts")
        .insert({ ...accountData, company_id: companyId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-accounts", companyId] });
      setIsDialogOpen(false);
      setFormData({ name: "", phone: "", address: "", notes: "" });
      toast({
        title: "Başarılı",
        description: "Cari hesap başarıyla oluşturuldu",
      });
    },
  });

  const updateAccount = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from("company_accounts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-accounts", companyId] });
      setIsDialogOpen(false);
      setEditingAccount(null);
      setFormData({ name: "", phone: "", address: "", notes: "" });
      toast({
        title: "Başarılı",
        description: "Cari hesap başarıyla güncellendi",
      });
    },
  });

  const deleteAccount = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("company_accounts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-accounts", companyId] });
      toast({
        title: "Başarılı",
        description: "Cari hesap başarıyla silindi",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAccount) {
      updateAccount.mutate({ id: editingAccount.id, ...formData });
    } else {
      createAccount.mutate(formData);
    }
  };

  const handleEdit = (account: any) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      phone: account.phone || "",
      address: account.address || "",
      notes: account.notes || ""
    });
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="h-5 w-5" />
          <span>Cari Hesaplar</span>
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingAccount(null);
              setFormData({ name: "", phone: "", address: "", notes: "" });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Cari
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? "Cari Hesap Düzenle" : "Yeni Cari Hesap"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Cari Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="address">Adres</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notlar</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit">
                  {editingAccount ? "Güncelle" : "Kaydet"}
                </Button>
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
                <TableHead>Cari Adı</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Adres</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts?.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>{account.phone}</TableCell>
                  <TableCell>{account.address}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(account)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteAccount.mutate(account.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
