
import { useState } from "react";
import { Building2 } from "lucide-react";

import { DashboardOverview } from "@/components/DashboardOverview";
import { ChartOfAccountsManagement } from "@/components/ChartOfAccountsManagement";
import { CompanyAccountsList } from "@/components/CompanyAccountsList";
import { CompanyCashManagement } from "@/components/CompanyCashManagement";
import { UyumsoftIntegration } from "@/components/UyumsoftIntegration";
import { InvoiceManagement } from "@/components/InvoiceManagement";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCompanies } from "@/hooks/useCompanies";

const Accounting = () => {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "chart-of-accounts" | "company-accounts" | "invoices" | "uyumsoft" | "cash"
  >("overview");
  
  const { companies, isLoading: companiesLoading } = useCompanies();

  const renderContent = () => {
    if (!selectedCompany) {
      return (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Şirket Seçin</h3>
            <p className="text-gray-500">Muhasebe işlemlerini görmek için bir şirket seçin.</p>
          </CardContent>
        </Card>
      );
    }

    switch (activeTab) {
      case "overview":
        return <DashboardOverview companyId={selectedCompany} />;
      case "chart-of-accounts":
        return <ChartOfAccountsManagement companyId={selectedCompany} />;
      case "company-accounts":
        return <CompanyAccountsList companyId={selectedCompany} />;
      case "invoices":
        return <InvoiceManagement companyId={selectedCompany} />;
      case "uyumsoft":
        return <UyumsoftIntegration companyId={selectedCompany} />;
      case "cash":
        return <CompanyCashManagement companyId={selectedCompany} />;
      default:
        return <DashboardOverview companyId={selectedCompany} />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Muhasebe</h1>
        <div className="w-64">
          <Select value={selectedCompany || ""} onValueChange={setSelectedCompany}>
            <SelectTrigger>
              <SelectValue placeholder="Şirket seçin..." />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedCompany && (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Özet</TabsTrigger>
            <TabsTrigger value="chart-of-accounts">Hesap Planı</TabsTrigger>
            <TabsTrigger value="company-accounts">Cariler</TabsTrigger>
            <TabsTrigger value="invoices">Faturalar</TabsTrigger>
            <TabsTrigger value="uyumsoft">Uyumsoft</TabsTrigger>
            <TabsTrigger value="cash">Kasa</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {renderContent()}
          </TabsContent>

          <TabsContent value="chart-of-accounts" className="space-y-4">
            {renderContent()}
          </TabsContent>

          <TabsContent value="company-accounts" className="space-y-4">
            {renderContent()}
          </TabsContent>

          <TabsContent value="invoices" className="space-y-4">
            {renderContent()}
          </TabsContent>

          <TabsContent value="uyumsoft" className="space-y-4">
            {renderContent()}
          </TabsContent>

          <TabsContent value="cash" className="space-y-4">
            {renderContent()}
          </TabsContent>
        </Tabs>
      )}

      {!selectedCompany && renderContent()}
    </div>
  );
};

export default Accounting;
