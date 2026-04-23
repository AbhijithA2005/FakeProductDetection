import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { login } from "@/lib/auth";
import { storage } from "@/lib/storage";
import type { Role, User } from "@/lib/types";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("consumer");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !name) {
      setError("Please fill out all fields.");
      return;
    }
    
    const users = storage.getUsers();
    if (users.find(u => u.username === username)) {
      setError("Username already exists.");
      return;
    }

    const newUser: User = { username, password, role, name };
    storage.setUsers([...users, newUser]);
    
    login(username, password);
    window.dispatchEvent(new Event("bt:session"));
    
    if (role === "admin") {
      setLocation("/dashboard");
    } else if (role === "retailer") {
      setLocation("/supply-chain");
    } else if (role === "inspector") {
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
              Join the Network
            </div>
            <h1 className="mt-4 font-serif text-5xl leading-[1.05] md:text-6xl">
              Create a <span className="italic text-primary">BlockTrust</span> account
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Register to participate in the supply chain ecosystem. 
              Whether you are verifying authenticity or managing distributions, 
              your identity anchors your interactions with the ledger.
            </p>
            <div className="mt-8">
              <Link href="/login" className="text-sm text-primary hover:underline">
                Already have an account? Sign in here.
              </Link>
            </div>
          </div>

          <Card className="backdrop-blur-md bg-card/80 border-primary/20 shadow-xl mx-auto w-full max-w-md">
            <CardHeader className="pb-4">
              <CardTitle className="font-serif text-2xl">Create Account</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name or Organization</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="bg-background/50"
                  />
                </div>
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
                    autoComplete="new-password"
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consumer">Consumer</SelectItem>
                      <SelectItem value="retailer">Retailer / Distributor</SelectItem>
                      <SelectItem value="inspector">Field Inspector</SelectItem>
                      <SelectItem value="admin">Admin / Manufacturer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {error && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" size="lg" className="w-full text-base mt-2">
                  Sign up
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
