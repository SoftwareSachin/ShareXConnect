import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import NetworkTopology from "@/pages/network-topology";
import ProvisionSpoke from "@/pages/provision-spoke";
import SecurityPolicies from "@/pages/security-policies";
import Monitoring from "@/pages/monitoring";
import Compliance from "@/pages/compliance";
import HealthDashboard from "@/pages/health-dashboard";
import MainLayout from "@/components/layout/main-layout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/network-topology" component={NetworkTopology} />
      <Route path="/provision-spoke" component={ProvisionSpoke} />
      <Route path="/security-policies" component={SecurityPolicies} />
      <Route path="/monitoring" component={Monitoring} />
      <Route path="/compliance" component={Compliance} />
      <Route path="/health" component={HealthDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <MainLayout>
          <Router />
        </MainLayout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
