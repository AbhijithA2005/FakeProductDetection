import { useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppFooter, AppNav } from "@/components/AppNav";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
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
import { currentUser } from "@/lib/auth";
import type { Role } from "@/lib/types";

const queryClient = new QueryClient();

function ProtectedRoute({ path, component: Component, allowedRoles }: { path: string, component: any, allowedRoles: Role[] }) {
  return (
    <Route path={path}>
      {() => {
        const user = currentUser();
        if (!user || !allowedRoles.includes(user.role)) {
          return <Redirect to={user ? "/" : "/login"} />;
        }
        return <Component />;
      }}
    </Route>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        {() => {
          const user = currentUser();
          if (!user) return <Redirect to="/login" />;
          if (user.role === "admin") return <Redirect to="/dashboard" />;
          if (user.role === "retailer") return <Redirect to="/supply-chain" />;
          if (user.role === "inspector") return <Redirect to="/scan-logs" />;
          return <Redirect to="/verify" />;
        }}
      </Route>
      <Route path="/home" component={Home} />
      <Route path="/login">
        {() => {
          const user = currentUser();
          if (user) return <Redirect to="/" />;
          return <Login />;
        }}
      </Route>
      <Route path="/signup">
        {() => {
          const user = currentUser();
          if (user) return <Redirect to="/" />;
          return <Signup />;
        }}
      </Route>
      <ProtectedRoute path="/dashboard" component={Dashboard} allowedRoles={["admin"]} />
      <ProtectedRoute path="/products" component={Products} allowedRoles={["admin", "retailer"]} />
      <ProtectedRoute path="/products/register" component={RegisterProduct} allowedRoles={["admin"]} />
      <ProtectedRoute path="/products/:id" component={ProductDetail} allowedRoles={["admin", "retailer"]} />
      <ProtectedRoute path="/verify" component={Verify} allowedRoles={["admin", "retailer", "inspector", "consumer"]} />
      <ProtectedRoute path="/supply-chain" component={SupplyChain} allowedRoles={["admin", "retailer"]} />
      <ProtectedRoute path="/scan-logs" component={ScanLogs} allowedRoles={["admin", "inspector"]} />
      <ProtectedRoute path="/reports" component={Reports} allowedRoles={["admin", "inspector"]} />
      <ProtectedRoute path="/blockchain" component={BlockchainExplorer} allowedRoles={["admin"]} />
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
