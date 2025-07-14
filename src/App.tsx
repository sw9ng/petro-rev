import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AttendantAuthProvider } from "@/contexts/AttendantAuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AttendantDashboard from "./pages/AttendantDashboard";
import { Landing } from "./pages/Landing";
import CashRegister from "./pages/CashRegister";
import CustomerDetail from "./pages/CustomerDetail";
import NotFound from "./pages/NotFound";
import Accounting from "./pages/Accounting";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AttendantAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/attendant-dashboard" element={<AttendantDashboard />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/cash-register" element={<CashRegister />} />
                <Route path="/customer/:id" element={<CustomerDetail />} />
                <Route path="/accounting" element={<Accounting />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AttendantAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
