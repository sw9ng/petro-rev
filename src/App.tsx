
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { SettingsDialog } from "@/components/SettingsDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import { Landing } from "./pages/Landing";
import CustomerDetail from "./pages/CustomerDetail";
import CashRegister from "./pages/CashRegister";
import Accounting from "./pages/Accounting";
import AttendantDashboard from "./pages/AttendantDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Çıkış yapılırken hata oluştu: ' + error.message);
      } else {
        toast.success('Başarıyla çıkış yapıldı');
      }
    } catch (error) {
      toast.error('Çıkış yapılırken hata oluştu');
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              {/* Header with logout and settings */}
              <header className="border-b bg-card">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                  <h1 className="text-lg font-semibold text-foreground">
                    Akaryakıt İstasyonu Yönetim Sistemi
                  </h1>
                  <div className="flex items-center gap-2">
                    <SettingsDialog />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleLogout}
                      className="flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Çıkış
                    </Button>
                  </div>
                </div>
              </header>

              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/" element={<Index />} />
                <Route path="/customer/:id" element={<CustomerDetail />} />
                <Route path="/cash-register" element={<CashRegister />} />
                <Route path="/accounting" element={<Accounting />} />
                <Route path="/attendant-dashboard" element={<AttendantDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
