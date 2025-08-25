import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/lib/auth";
import ProtectedRoute from "@/components/auth/protected-route";

// Pages
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import Discover from "@/pages/discover";
import Reviews from "@/pages/reviews";
import Starred from "@/pages/starred";
import Admin from "@/pages/admin";
import ProjectDetail from "@/pages/project-detail";
import EditProject from "@/pages/edit-project";
import ProjectCollaborate from "@/pages/project-collaborate";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Switch>
      <Route path="/auth/login">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <Login />}
      </Route>
      
      <Route path="/auth/register">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <Register />}
      </Route>
      
      <Route path="/">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <Redirect to="/auth/login" />}
      </Route>

      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/projects" component={Projects} />
      <Route path="/project/:id" component={ProjectDetail} />
      <ProtectedRoute path="/project/:id/edit" component={EditProject} />
      <ProtectedRoute path="/project/:id/collaborate" component={ProjectCollaborate} />
      <ProtectedRoute path="/discover" component={Discover} />
      <ProtectedRoute path="/reviews" component={Reviews} />
      <ProtectedRoute path="/starred" component={Starred} />
      <ProtectedRoute path="/admin" component={Admin} />
      <ProtectedRoute path="/users" component={Admin} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
