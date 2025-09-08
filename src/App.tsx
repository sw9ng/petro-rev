
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import { Landing } from "./pages/Landing";
import CustomerDetail from "./pages/CustomerDetail";
import CashRegister from "./pages/CashRegister";
import Accounting from "./pages/Accounting";
import TankerTracking from "./pages/TankerTracking";
import AttendantDashboard from "./pages/AttendantDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<Landing />} />
                <Route path="/dashboard" element={<Index />} />
                <Route path="/customer/:id" element={<CustomerDetail />} />
                <Route path="/cash-register" element={<CashRegister />} />
                <Route path="/accounting" element={<Accounting />} />
                <Route path="/tanker-tracking" element={<TankerTracking />} />
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
