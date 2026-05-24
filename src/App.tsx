
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Dashboard from "./pages/Dashboard";
import Simulador from "./pages/Simulador";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import Categorias from "./pages/Categorias";
import Preferencias from "./pages/Preferencias";
import { AuthGuard } from "./components/auth/AuthGuard";
import { AppLayout } from "./components/layout/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<AuthGuard><AppLayout><Dashboard /></AppLayout></AuthGuard>} />
          <Route path="/simulador" element={<AuthGuard><AppLayout><Simulador /></AppLayout></AuthGuard>} />
          <Route path="/categorias" element={<AuthGuard><AppLayout><Categorias /></AppLayout></AuthGuard>} />
          <Route path="/preferencias" element={<AuthGuard><AppLayout><Preferencias /></AppLayout></AuthGuard>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
