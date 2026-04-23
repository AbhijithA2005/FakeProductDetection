import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { storage } from "@/lib/storage";
import { exportScanLogsCSV } from "@/lib/csv";

export default function ScanLogs() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"ALL" | "AUTHENTIC" | "FAKE" | "SUSPICIOUS">("ALL");
  const scans = storage.getScans();

  const rows = useMemo(() => {
    const n = q.trim().toLowerCase();
    return scans.filter((s) => {
      if (filter !== "ALL" && s.result !== filter) return false;
      if (!n) return true;
      return [s.productId, s.location, s.role, s.reason, s.id]
        .join(" ")
        .toLowerCase()
        .includes(n);
    });
  }, [q, filter, scans]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Audit trail
          </div>
          <h1 className="mt-2 font-serif text-4xl">Scan logs</h1>
        </div>
        <Button variant="outline" onClick={() => exportScanLogsCSV(rows)}>
          <Download className="mr-1 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by product, role, location, reason…"
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All results</SelectItem>
            <SelectItem value="AUTHENTIC">Authentic</SelectItem>
            <SelectItem value="FAKE">Fake</SelectItem>
            <SelectItem value="SUSPICIOUS">Suspicious</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="mt-6 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(s.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{s.productId}</TableCell>
                  <TableCell className="capitalize">{s.role}</TableCell>
                  <TableCell>{s.location}</TableCell>
                  <TableCell>
                    <StatusBadge status={s.result} />
                  </TableCell>
                  <TableCell className="max-w-sm text-sm text-muted-foreground">
                    {s.reason}
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    No scan logs match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
