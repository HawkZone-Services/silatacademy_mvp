import { Toaster } from "@/shared/ui/toaster";
import { Toaster as Sonner } from "@/shared/ui/sonner";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, useRoutes } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";

import { appRoutes } from "@/app/router";
import { DevNavigatorUltra } from "@/shared/ui/dev/DevNavigatorUltra";
import { useSyncBootstrap } from "@/offline/hooks/useSyncBootstrap";

const queryClient = new QueryClient();

// Component that renders routes from RouteObject Tree
function AppRoutes() {
  useSyncBootstrap();
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
