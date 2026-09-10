import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Auth from "@/pages/Auth";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";
import Home from "./pages/Home";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";
import Reports from "./pages/Reports";

function Router() {
  const { loading, isAuthenticated } = useAuth();
  const [location] = useLocation();
  if (location === "/auth") return <Auth />;
  if (loading) return <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Loading your secure workspace…</div>;
  if (!isAuthenticated) return <Auth />;
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/progress" component={Progress} />
      <Route path="/reports" component={Reports} />
      <Route path="/profile" component={Profile} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
