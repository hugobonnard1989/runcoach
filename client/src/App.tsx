import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import Dashboard from "@/pages/dashboard";
import PlanPage from "@/pages/plan";
import ActivitiesPage from "@/pages/activities";
import AnalysisPage from "@/pages/analysis";
import WeightPage from "@/pages/weight";
import SettingsPage from "@/pages/settings";
import ChatPage from "@/pages/chat";
import NotFound from "@/pages/not-found";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/plan" component={PlanPage} />
      <Route path="/activities" component={ActivitiesPage} />
      <Route path="/analysis" component={AnalysisPage} />
      <Route path="/weight" component={WeightPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/chat" component={ChatPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <Router hook={useHashLocation}>
            <SidebarProvider style={style as React.CSSProperties}>
              <div className="flex h-screen w-full overflow-hidden">
                <AppSidebar />
                <div className="flex flex-col flex-1 min-w-0">
                  <header className="flex items-center gap-2 px-4 py-2 border-b bg-card/50 backdrop-blur-sm shrink-0">
                    <SidebarTrigger data-testid="button-sidebar-toggle" />
                    <div className="flex-1" />
                    <PerplexityAttribution />
                  </header>
                  <main className="flex-1 overflow-y-auto">
                    <AppRouter />
                  </main>
                </div>
              </div>
            </SidebarProvider>
          </Router>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
