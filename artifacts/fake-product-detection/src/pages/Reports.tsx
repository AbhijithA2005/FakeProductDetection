import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { storage } from "@/lib/storage";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function Reports() {
  const scans = storage.getScans();
  const products = storage.getProducts();

  const mix = useMemo(() => {
    const c: Record<string, number> = { AUTHENTIC: 0, SUSPICIOUS: 0, FAKE: 0 };
    scans.forEach((s) => (c[s.result] = (c[s.result] ?? 0) + 1));
    return Object.entries(c).map(([name, value]) => ({ name, value }));
  }, [scans]);

  const top = useMemo(() => {
    const m = new Map<string, number>();
    scans.forEach((s) => m.set(s.productId, (m.get(s.productId) ?? 0) + 1));
    return Array.from(m.entries())
      .map(([pid, value]) => {
        const p = products.find((x) => x.id === pid);
        return { name: p?.name ?? pid, value };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [scans, products]);

  const series = useMemo(() => {
    const m: Record<string, { name: string; authentic: number; fake: number; suspicious: number }> = {};
    scans.forEach((s) => {
      const d = new Date(s.timestamp).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      if (!m[d]) m[d] = { name: d, authentic: 0, fake: 0, suspicious: 0 };
      if (s.result === "AUTHENTIC") m[d].authentic++;
      if (s.result === "FAKE") m[d].fake++;
      if (s.result === "SUSPICIOUS") m[d].suspicious++;
    });
    return Object.values(m);
  }, [scans]);

  const suspicious = scans.filter((s) => s.result !== "AUTHENTIC").slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Analytics
      </div>
      <h1 className="mt-2 font-serif text-4xl">Reports</h1>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Verification mix</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={mix} dataKey="value" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {mix.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    color: "hsl(var(--popover-foreground))",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-serif">Trend over time</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {series.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No data yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="2 4" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="authentic" stroke="hsl(var(--chart-2))" />
                  <Line type="monotone" dataKey="fake" stroke="hsl(var(--chart-4))" />
                  <Line type="monotone" dataKey="suspicious" stroke="hsl(var(--chart-1))" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Top scanned products</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {top.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No scans recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="2 4" />
                  <XAxis type="number" allowDecimals={false} fontSize={12} stroke="hsl(var(--muted-foreground))" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={140}
                    fontSize={11}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Recent suspicious / fake events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suspicious.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No suspicious activity. Ledger is clean.
              </div>
            ) : (
              suspicious.map((s) => (
                <div
                  key={s.id}
                  className="rounded-md border border-border bg-card px-4 py-3 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs">{s.productId}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(s.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1 text-muted-foreground">{s.reason}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
