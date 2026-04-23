import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { storage } from "@/lib/storage";


export default function Products() {
  const [q, setQ] = useState("");
  const products = storage.getProducts();

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return products;
    return products.filter((p) =>
      [p.id, p.name, p.brand, p.batchNumber, p.serialNumber, p.category]
        .join(" ")
        .toLowerCase()
        .includes(n),
    );
  }, [q, products]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="grid items-center gap-6 md:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Registry
          </div>
          <h1 className="mt-2 font-serif text-4xl">Registered products</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Every item below has its own block on the BlockTrust ledger and a
            QR-coded identity. Search by ID, brand, batch, or serial.
          </p>
          <Link href="/products/register" className="mt-4 inline-block">
            <Button>
              <Plus className="mr-1 h-4 w-4" /> Register product
            </Button>
          </Link>
        </div>

      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by ID, brand, batch, serial…"
            className="pl-9"
          />
        </div>
        <Badge variant="outline">{filtered.length} results</Badge>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <Link key={p.id} href={`/products/${p.id}`}>
            <Card className="group h-full cursor-pointer hover-elevate">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      {p.category}
                    </div>
                    <div className="mt-1 font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.brand}</div>
                  </div>
                  <Badge
                    variant={p.status === "active" ? "default" : "destructive"}
                    className={
                      p.status === "active"
                        ? "bg-emerald-600 text-white hover:bg-emerald-600"
                        : ""
                    }
                  >
                    {p.status}
                  </Badge>
                </div>
                <dl className="mt-4 space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <dt>ID</dt>
                    <dd className="font-mono">{p.id}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Batch</dt>
                    <dd className="font-mono">{p.batchNumber}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Serial</dt>
                    <dd className="font-mono">{p.serialNumber}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Owner</dt>
                    <dd className="truncate max-w-[160px]">{p.currentOwner}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-md border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No products match your search.
          </div>
        )}
      </div>
    </div>
  );
}
