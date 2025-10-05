import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Home from "@/pages/home";
import Portfolio from "@/pages/portfolio";
import Timeline from "@/pages/timeline";
import Profile from "@/pages/profile";
import Activities from "@/pages/activities";
import GiftGiver from "@/pages/gift-giver";
import AddChild from "@/pages/add-child";
import AuthPage from "@/pages/auth";
import SproutRequestPage from "@/pages/sprout-request";
// Contributor dashboard now uses standard home page
import NotFound from "@/pages/not-found";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <AuthPage />;
  }
  
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/gift/:giftCode" component={GiftGiver} />
      <Route path="/sprout/:requestCode" component={SproutRequestPage} />
      {/* Redirect contributor dashboard to home */}
      <Route path="/contributor-dashboard">
        {() => {
          window.location.href = '/';
          return null;
        }}
      </Route>
      <Route path="/">
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      </Route>
      <Route path="/portfolio/:childId">
        <ProtectedRoute>
          <Portfolio />
        </ProtectedRoute>
      </Route>
      <Route path="/timeline/:childId">
        <ProtectedRoute>
          <Timeline />
        </ProtectedRoute>
      </Route>
      <Route path="/activities">
        <ProtectedRoute>
          <Activities />
        </ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      <Route path="/add-child">
        <ProtectedRoute>
          <AddChild />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
