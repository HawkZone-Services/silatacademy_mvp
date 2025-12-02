import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, useRoutes } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";

import { DevNavigatorUltra } from "./components/dev/DevNavigatorUltra";
import { appRoutes } from "@/routes/appRoutes";

const queryClient = new QueryClient();

// Component that renders routes from RouteObject Tree
function AppRoutes() {
  return useRoutes(appRoutes);
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        {/* Ultra Pro Developer Navigator */}
        <DevNavigatorUltra />

        <LanguageProvider>
          {/* Auto-render routes */}
          <AppRoutes />
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
