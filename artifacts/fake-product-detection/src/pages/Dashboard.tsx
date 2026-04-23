import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { storage } from "@/lib/storage";
import { getChain, isChainValid } from "@/lib/blockchain";
import themeImage from "@assets/image_1776957916098.png";

export default function Dashboard() {
  const [products, setProducts] = useState(storage.getProducts());
  const [scans, setScans] = useState(storage.getScans());
  const [chainLen, setChainLen] = useState(getChain().length);
  const [valid, setValid] = useState<boolean | null>(null);

  useEffect(() => {
    setProducts(storage.getProducts());
    setScans(storage.getScans());
    setChainLen(getChain().length);
    isChainValid().then((r) => setValid(r.valid));
  }, []);

  const counts = useMemo(() => {
    const c = { AUTHENTIC: 0, FAKE: 0, SUSPICIOUS: 0 };
    scans.forEach((s) => {
      c[s.result] += 1;
    });
    return c;
  }, [scans]);

  const chartData = useMemo(() => {
    const byDay: Record<string, number> = {};
    scans.forEach((s) => {
      const d = new Date(s.timestamp).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      byDay[d] = (byDay[d] ?? 0) + 1;
    });
    return Object.entries(byDay)
      .slice(-10)
      .map(([name, value]) => ({ name, value }));
  }, [scans]);

  const stats = [
    { label: "Products Registered", value: products.length },
    { label: "QR Codes Issued", value: products.length },
    { label: "Total Verifications", value: scans.length },
    { label: "Ledger Blocks", value: chainLen },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Command center
          </div>
          <h1 className="mt-2 font-serif text-4xl">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          {valid === null ? (
            <Badge variant="outline">Validating chain…</Badge>
          ) : valid ? (
            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
              Chain valid
            </Badge>
          ) : (
            <Badge variant="destructive">Tampering detected</Badge>
          )}
          <Link href="/products/register">
            <Button>Register product</Button>
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
              <div className="mt-2 font-serif text-4xl">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="grid items-center gap-0 md:grid-cols-[1fr_1.2fr]">
          <div className="p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Reference architecture
            </div>
            <h2 className="mt-2 font-serif text-2xl">
              Three layers of <span className="italic text-primary">trust</span>
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              The same shape that powers data infrastructure powers product
              authenticity here — discover &amp; search, clean &amp; enrich, and
              an always-current ledger keep your registry honest.
            </p>
          </div>
          <div className="border-t border-border bg-secondary/30 p-4 md:border-l md:border-t-0">
            <img
              src={themeImage}
              alt="BlockTrust three-layer architecture"
              className="mx-auto max-h-72 w-full rounded-md object-contain"
            />
          </div>
        </div>
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-serif">Scans over time</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No scan activity yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="2 4" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      color: "hsl(var(--popover-foreground))",
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Verification mix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(["AUTHENTIC", "SUSPICIOUS", "FAKE"] as const).map((k) => {
              const total = Math.max(1, scans.length);
              const val = counts[k];
              const pct = Math.round((val / total) * 100);
              const color =
                k === "AUTHENTIC"
                  ? "bg-emerald-600"
                  : k === "FAKE"
                    ? "bg-destructive"
                    : "bg-amber-500";
              return (
                <div key={k}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <StatusBadge status={k} />
                    <span className="font-mono text-xs">{val} · {pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full ${color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Recent products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {products.slice(-5).reverse().map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3 hover-elevate"
              >
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.brand} · {p.batchNumber}
                  </div>
                </div>
                <code className="font-mono text-xs text-muted-foreground">{p.id}</code>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Recent scans</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {scans.slice(0, 6).map((s) => (
              <div
                key={s.id}
                className="flex items-start justify-between gap-4 rounded-md border border-border bg-card px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">{s.productId}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(s.timestamp).toLocaleString()} · {s.role} · {s.location}
                  </div>
                </div>
                <StatusBadge status={s.result} />
              </div>
            ))}
            {scans.length === 0 && (
              <div className="text-sm text-muted-foreground">No scans yet.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
