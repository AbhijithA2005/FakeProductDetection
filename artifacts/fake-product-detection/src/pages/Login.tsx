import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { login } from "@/lib/auth";


const DEMO = [
  { user: "admin", pass: "admin123", label: "Admin / Manufacturer" },
  { user: "retailer", pass: "retail123", label: "Retailer / Distributor" },
  { user: "consumer", pass: "consumer123", label: "Consumer" },
  { user: "inspector", pass: "inspect123", label: "Inspector" },
];

export default function Login() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const u = login(username, password);
    if (!u) {
      setError("Invalid credentials. Try one of the demo accounts listed.");
      return;
    }
    window.dispatchEvent(new Event("bt:session"));
    if (u.role === "admin") {
      setLocation("/dashboard");
    } else if (u.role === "retailer") {
      setLocation("/supply-chain");
    } else if (u.role === "inspector") {
      setLocation("/scan-logs");
    } else {
      setLocation("/verify");
    }
  };

  return (
    <div className="relative flex-1 flex items-center min-h-[calc(100vh-140px)]">
      <div className="absolute inset-0 gridlines opacity-[0.25]" aria-hidden />
      
      <div className="relative mx-auto w-full max-w-6xl px-4 py-16 md:px-6">
        <div className="grid items-center gap-12 md:grid-cols-[1.05fr_1fr]">
          <div className="max-w-xl">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Authentication
            </div>
            <h1 className="mt-4 font-serif text-5xl leading-[1.05] md:text-6xl">
              Sign in to <span className="italic text-primary">BlockTrust</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Pick a role to see what the system looks like from that vantage
              point. All accounts share the same ledger — only the permitted
              actions change.
            </p>
            <div className="mt-8">
              <Link href="/signup" className="text-sm text-primary hover:underline">
                Don't have an account? Sign up here.
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {DEMO.map((d) => (
                <button
                  key={d.user}
                  type="button"
                  onClick={() => {
                    setUsername(d.user);
                    setPassword(d.pass);
                  }}
                  className="flex flex-col items-start justify-center rounded-md border border-border bg-card/50 backdrop-blur-sm px-4 py-4 text-left transition-all hover:bg-secondary hover:border-primary/50"
                >
                  <span className="font-medium">{d.label}</span>
                  <span className="mt-1 font-mono text-xs text-muted-foreground">
                    {d.user} / {d.pass}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Card className="backdrop-blur-md bg-card/80 border-primary/20 shadow-xl mx-auto w-full max-w-md">
            <CardHeader className="pb-4">
              <CardTitle className="font-serif text-2xl">Credentials</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="bg-background/50"
                  />
                </div>
                {error && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" size="lg" className="w-full text-base">
                  Sign in
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
