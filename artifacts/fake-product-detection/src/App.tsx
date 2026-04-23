import { useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppFooter, AppNav } from "@/components/AppNav";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import RegisterProduct from "@/pages/RegisterProduct";
import ProductDetail from "@/pages/ProductDetail";
import Verify from "@/pages/Verify";
import SupplyChain from "@/pages/SupplyChain";
import ScanLogs from "@/pages/ScanLogs";
import Reports from "@/pages/Reports";
import BlockchainExplorer from "@/pages/Blockchain";
import About from "@/pages/About";
import { seedIfNeeded } from "@/lib/storage";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/products" component={Products} />
      <Route path="/products/register" component={RegisterProduct} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/verify" component={Verify} />
      <Route path="/supply-chain" component={SupplyChain} />
      <Route path="/scan-logs" component={ScanLogs} />
      <Route path="/reports" component={Reports} />
      <Route path="/blockchain" component={BlockchainExplorer} />
      <Route path="/about" component={About} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedIfNeeded().finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="font-serif text-2xl text-foreground">BlockTrust</div>
          <p className="mt-2 text-sm text-muted-foreground">Initializing ledger…</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <div className="flex min-h-screen flex-col bg-background">
            <AppNav />
            <main className="flex-1">
              <Router />
            </main>
            <AppFooter />
          </div>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
