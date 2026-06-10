import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AuthPage from "./pages/Auth.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Wizard from "./pages/Wizard.tsx";
import Capture from "./pages/Capture.tsx";
import Viewer from "./pages/Viewer.tsx";
import Demo from "./pages/Demo.tsx";
import Analytics from "./pages/Analytics.tsx";
import AnalyticsLocation from "./pages/AnalyticsLocation.tsx";
import { AuthProvider } from "@/lib/auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/wizard/:id" element={<Wizard />} />
            <Route path="/capture/:id" element={<Capture />} />
            <Route path="/find/:slug" element={<Viewer />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/analytics/:id" element={<AnalyticsLocation />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
