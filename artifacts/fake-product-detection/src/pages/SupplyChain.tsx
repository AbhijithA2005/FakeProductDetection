import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { storage } from "@/lib/storage";
import themeImage from "@assets/image_1776957916098.png";

export default function SupplyChain() {
  const products = storage.getProducts();
  const [pid, setPid] = useState<string>(products[0]?.id ?? "");

  const transfers = useMemo(
    () => storage.getTransfers().filter((t) => t.productId === pid),
    [pid],
  );
  const product = products.find((p) => p.id === pid);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <div className="grid items-center gap-8 md:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Provenance
          </div>
          <h1 className="mt-2 font-serif text-4xl">Supply chain tracker</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Every ownership handoff is written to the ledger. Pick a product
            to see its full custody trail from factory floor to final buyer.
          </p>
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <img
            src={themeImage}
            alt="BlockTrust supply-chain layers"
            className="w-full object-cover"
          />
        </div>
      </div>

      <div className="mt-8 max-w-md">
        <Select value={pid} onValueChange={setPid}>
          <SelectTrigger>
            <SelectValue placeholder="Select a product" />
          </SelectTrigger>
          <SelectContent>
            {products.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name} ({p.id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {product && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="font-serif">{product.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="relative border-l-2 border-border pl-6">
              <Step
                title={product.manufacturer}
                sub={`Origin · ${new Date(product.registeredAt).toLocaleDateString()}`}
                color="bg-primary"
              />
              {transfers.map((t) => (
                <Step
                  key={t.id}
                  title={
                    <>
                      {t.from} <ArrowRight className="inline h-3 w-3" /> {t.to}
                    </>
                  }
                  sub={`${new Date(t.timestamp).toLocaleString()} · block ${t.blockHash.slice(0, 10)}…`}
                  color="bg-accent"
                />
              ))}
              <Step
                title={`Current owner: ${product.currentOwner}`}
                sub="Live"
                color="bg-foreground"
              />
            </ol>
            {transfers.length === 0 && (
              <div className="mt-4 text-sm text-muted-foreground">
                No ownership transfers recorded yet for this product.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Step({
  title,
  sub,
  color,
}: {
  title: React.ReactNode;
  sub: string;
  color: string;
}) {
  return (
    <li className="mb-6 ml-2">
      <span
        className={`absolute -left-[7px] mt-1.5 inline-block h-3 w-3 rounded-full ${color} ring-4 ring-background`}
      />
      <div className="font-medium">{title}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </li>
  );
}
