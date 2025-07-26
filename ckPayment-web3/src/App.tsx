import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Features from "./pages/Features";
import HowItWorks from "./pages/HowItWorks";
import StartBuilding from "./pages/StartBuilding";
import ECommerce from "./pages/ECommerce";
import Gaming from "./pages/Gaming";
import DeFi from "./pages/DeFi";
import NFTMarketplaces from "./pages/NFTMarketplaces";
import Education from "./pages/Education";
import CreatorEconomy from "./pages/CreatorEconomy";
import ProfileManagement from "./pages/ProfileManagement";
import NotFound from "./pages/NotFound";
import Docs from "./pages/Docs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/features" element={<Features />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/start-building" element={<StartBuilding />} />
          <Route path="/ecommerce" element={<ECommerce />} />
          <Route path="/gaming" element={<Gaming />} />
          <Route path="/defi" element={<DeFi />} />
          <Route path="/nft-marketplaces" element={<NFTMarketplaces />} />
          <Route path="/education" element={<Education />} />
          <Route path="/creator-economy" element={<CreatorEconomy />} />
          <Route path="/profile-management" element={<ProfileManagement />} />
          <Route path="/ProfileManagement" element={<ProfileManagement />} />
          <Route path="/docs" element={<Docs />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
