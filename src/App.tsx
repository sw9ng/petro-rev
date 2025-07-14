import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AttendantAuthProvider } from "@/contexts/AttendantAuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AttendantDashboard from "./pages/AttendantDashboard";
import { Landing } from "./pages/Landing";
import CashRegister from "./pages/CashRegister";
import CustomerDetail from "./pages/CustomerDetail";
import NotFound from "./pages/NotFound";
import PetronetSync from '@/pages/PetronetSync';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AttendantAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Router>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/attendant-dashboard" element={<AttendantDashboard />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/cash-register" element={<CashRegister />} />
                <Route path="/customer/:id" element={<CustomerDetail />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
                <Route path="/petronet-sync" element={<PetronetSync />} />
              </Routes>
            </Router>
          </TooltipProvider>
        </AttendantAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
