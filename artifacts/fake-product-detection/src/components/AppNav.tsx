import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Moon, Sun, ShieldCheck, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { currentUser, logout } from "@/lib/auth";
import type { User } from "@/lib/types";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/products", label: "Products" },
  { href: "/verify", label: "Verify" },
  { href: "/supply-chain", label: "Supply Chain" },
  { href: "/scan-logs", label: "Scan Logs" },
  { href: "/reports", label: "Reports" },
  { href: "/blockchain", label: "Explorer" },
  { href: "/about", label: "About" },
];

export function AppNav() {
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(currentUser());
  const [dark, setDark] = useState(
    typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    const handler = () => setUser(currentUser());
    window.addEventListener("storage", handler);
    window.addEventListener("bt:session", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("bt:session", handler);
    };
  }, []);

  const onLogout = () => {
    logout();
    setUser(null);
    window.dispatchEvent(new Event("bt:session"));
    setLocation("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="rounded-md bg-primary p-1.5 text-primary-foreground">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <div className="font-serif text-lg">BlockTrust</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Ledger · Verify · Trust
            </div>
          </div>
        </Link>

        <nav className="ml-auto hidden flex-wrap items-center gap-1 text-sm lg:flex">
          {NAV.map((item) => {
            const active = location === item.href ||
              (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-1.5 transition-colors ${
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDark((d) => !d)}
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <Badge variant="outline" className="capitalize">
                {user.role} · {user.name}
              </Badge>
              <Button size="sm" variant="ghost" onClick={onLogout}>
                <LogOut className="mr-1 h-3.5 w-3.5" /> Logout
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm">Sign in</Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col p-4 md:px-6">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            {user && (
              <Button size="sm" variant="ghost" className="mt-2" onClick={onLogout}>
                <LogOut className="mr-1 h-3.5 w-3.5" /> Logout ({user.username})
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function AppFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-muted-foreground md:px-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="font-serif text-foreground">BlockTrust</div>
            <div>Blockchain-inspired supply chain authenticity — academic prototype.</div>
          </div>
          <div className="font-mono text-xs">
            SHA-256 · Hash-chained ledger · Immutable · Tamper-evident
          </div>
        </div>
      </div>
    </footer>
  );
}
