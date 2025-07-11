
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import { Landing } from "./pages/Landing";
import CashRegister from "./pages/CashRegister";
import CustomerDetail from "./pages/CustomerDetail";
import AttendantDashboard from "./pages/AttendantDashboard";
import EInvoice from "./pages/EInvoice";
import EFaturaTest from "./pages/EFaturaTest";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/cash-register" element={<CashRegister />} />
              <Route path="/customer/:id" element={<CustomerDetail />} />
              <Route path="/attendant-dashboard" element={<AttendantDashboard />} />
              <Route path="/e-fatura" element={<EInvoice />} />
              <Route path="/e-fatura-test" element={<EFaturaTest />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
