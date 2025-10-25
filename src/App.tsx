import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { lazy, Suspense } from "react";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Landing = lazy(() => import("./pages/Landing").then(module => ({ default: module.Landing })));
const CustomerDetail = lazy(() => import("./pages/CustomerDetail"));
const CashRegister = lazy(() => import("./pages/CashRegister"));
const Accounting = lazy(() => import("./pages/Accounting"));
const TankerTracking = lazy(() => import("./pages/TankerTracking"));
const AttendantDashboard = lazy(() => import("./pages/AttendantDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              }>
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
              </Suspense>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
