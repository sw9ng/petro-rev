
import { useState } from "react";
import { Building2 } from "lucide-react";

import { DashboardOverview } from "@/components/DashboardOverview";
import { ChartOfAccountsManagement } from "@/components/ChartOfAccountsManagement";
import { CompanyAccountsList } from "@/components/CompanyAccountsList";
import { CompanyCashManagement } from "@/components/CompanyCashManagement";
import { UyumsoftIntegration } from "@/components/UyumsoftIntegration";
import { InvoiceManagement } from "@/components/InvoiceManagement";
import { Card, CardContent } from "@/components/ui/card";

interface AccountingProps {
  selectedCompany: string | null;
  activeTab:
    | "overview"
    | "chart-of-accounts"
    | "company-accounts"
    | "invoices"
    | "uyumsoft"
    | "cash";
}

const Accounting = ({ selectedCompany, activeTab }: AccountingProps) => {
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

  return <>{renderContent()}</>;
};

export default Accounting;
