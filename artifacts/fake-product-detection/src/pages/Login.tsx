import { useState } from "react";
import { useLocation } from "wouter";
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
    setLocation("/dashboard");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <div className="grid gap-10 md:grid-cols-[1.05fr_1fr]">
        <div>

          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Role selection
          </div>
          <h1 className="mt-3 font-serif text-4xl">Sign in to BlockTrust</h1>
          <p className="mt-3 text-muted-foreground">
            Pick a role to see what the system looks like from that vantage
            point. All accounts share the same ledger — only the permitted
            actions change.
          </p>
          <div className="mt-6 space-y-2">
            {DEMO.map((d) => (
              <button
                key={d.user}
                type="button"
                onClick={() => {
                  setUsername(d.user);
                  setPassword(d.pass);
                }}
                className="flex w-full items-center justify-between rounded-md border border-border bg-card px-4 py-3 text-left text-sm hover-elevate"
              >
                <span>{d.label}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {d.user} / {d.pass}
                </span>
              </button>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Credentials</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
