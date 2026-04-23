import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { Download, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { storage, addTransfer } from "@/lib/storage";
import { addBlock, getBlocksForProduct } from "@/lib/blockchain";
import { buildPayload, generateQRDataURL } from "@/lib/qr";
import type { Product, Transfer } from "@/lib/types";

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [qr, setQr] = useState<string>("");
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [newOwner, setNewOwner] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = () => {
    const p = storage.getProducts().find((x) => x.id === params.id) ?? null;
    setProduct(p);
    setTransfers(storage.getTransfers().filter((t) => t.productId === params.id));
  };

  useEffect(() => {
    refresh();
  }, [params.id]);

  useEffect(() => {
    if (!product) return;
    generateQRDataURL(buildPayload(product)).then(setQr);
  }, [product]);

  const blocks = useMemo(
    () => (product ? getBlocksForProduct(product.id) : []),
    [product, transfers],
  );

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
        <h1 className="font-serif text-3xl">Product not found</h1>
        <p className="mt-3 text-muted-foreground">
          The product ID <code className="font-mono">{params.id}</code> is not on the ledger.
        </p>
        <Link href="/products">
          <Button className="mt-6">Back to products</Button>
        </Link>
      </div>
    );
  }

  const transfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwner.trim()) return;
    setBusy(true);
    const block = await addBlock("OWNERSHIP_TRANSFER", {
      productId: product.id,
      from: product.currentOwner,
      to: newOwner.trim(),
    });
    const t: Transfer = {
      id: `TR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      productId: product.id,
      from: product.currentOwner,
      to: newOwner.trim(),
      timestamp: block.timestamp,
      blockHash: block.hash,
    };
    addTransfer(t);
    const products = storage.getProducts();
    const idx = products.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      products[idx]!.currentOwner = newOwner.trim();
      storage.setProducts(products);
    }
    setNewOwner("");
    setBusy(false);
    refresh();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {product.category}
          </div>
          <h1 className="mt-2 font-serif text-4xl">{product.name}</h1>
          <div className="mt-1 text-muted-foreground">
            {product.brand} · <code className="font-mono text-xs">{product.id}</code>
          </div>
        </div>
        <Badge
          className={
            product.status === "active"
              ? "bg-emerald-600 text-white hover:bg-emerald-600"
              : "bg-destructive text-destructive-foreground"
          }
        >
          {product.status}
        </Badge>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-serif">Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {[
                ["Batch Number", product.batchNumber],
                ["Serial Number", product.serialNumber],
                ["Manufacturer", product.manufacturer],
                ["Factory Location", product.factoryLocation],
                ["Mfg Date", product.mfgDate],
                ["Expiry Date", product.expiryDate ?? "—"],
                ["Price", `₹ ${product.price}`],
                ["Current Owner", product.currentOwner],
                ["Registered", new Date(product.registeredAt).toLocaleString()],
                ["Verification Token", product.verificationToken],
              ].map(([k, v]) => (
                <div key={k as string}>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                    {k}
                  </dt>
                  <dd className="font-mono">{v}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">QR code</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {qr ? (
              <img
                src={qr}
                alt={`QR for ${product.id}`}
                className="w-56 rounded-md border border-border bg-white p-2"
              />
            ) : (
              <div className="h-56 w-56 animate-pulse rounded-md bg-secondary" />
            )}
            <div className="rounded-md border border-border bg-secondary/40 px-3 py-2 font-mono text-xs">
              {product.id} · {product.verificationToken}
            </div>
            {qr && (
              <a href={qr} download={`${product.id}.png`}>
                <Button variant="outline" size="sm">
                  <Download className="mr-1 h-4 w-4" /> Download PNG
                </Button>
              </a>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Supply chain journey</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <div>
                  <div className="text-sm font-medium">{product.manufacturer}</div>
                  <div className="text-xs text-muted-foreground">
                    Origin · {new Date(product.registeredAt).toLocaleDateString()}
                  </div>
                </div>
              </li>
              {transfers.map((t) => (
                <li key={t.id} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-accent" />
                  <div>
                    <div className="text-sm font-medium">
                      {t.from} <ArrowRight className="inline h-3 w-3" /> {t.to}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(t.timestamp).toLocaleString()} ·{" "}
                      <span className="font-mono">{t.blockHash.slice(0, 10)}…</span>
                    </div>
                  </div>
                </li>
              ))}
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-foreground" />
                <div>
                  <div className="text-sm font-medium">
                    Current owner: {product.currentOwner}
                  </div>
                  <div className="text-xs text-muted-foreground">Now</div>
                </div>
              </li>
            </ol>
            <Separator className="my-5" />
            <form onSubmit={transfer} className="space-y-3">
              <Label htmlFor="newOwner">Transfer ownership to</Label>
              <div className="flex gap-2">
                <Input
                  id="newOwner"
                  placeholder="e.g. UrbanTech Retail"
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                />
                <Button type="submit" disabled={busy || !newOwner.trim()}>
                  Transfer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">On-chain activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {blocks.map((b) => (
              <div
                key={b.hash}
                className="rounded-md border border-border bg-card px-4 py-3 font-mono text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    #{b.index} · {b.type}
                  </span>
                  <span className="text-muted-foreground">
                    {new Date(b.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="mt-1 truncate">hash: {b.hash}</div>
                <div className="truncate text-muted-foreground">
                  prev: {b.previousHash}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
