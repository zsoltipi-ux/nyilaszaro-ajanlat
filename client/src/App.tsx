import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Demo from "./pages/Demo";
import Integracio from "./pages/Integracio";

function Router() {
  return (
    <Switch>
      {/* Landing page – AjánlatAI product page */}
      <Route path="/landing" component={Landing} />
      {/* 3-step demo flow */}
      <Route path="/demo" component={Demo} />
      {/* AI integration showcase page */}
      <Route path="/integracio" component={Integracio} />
      {/* Original quotation preparation tool */}
      <Route path="/" component={Home} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
