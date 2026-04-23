import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { addBlock } from "@/lib/blockchain";
import { addProduct, storage } from "@/lib/storage";
import type { Product } from "@/lib/types";

function rid(p: string) {
  return `${p}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

const FIELDS: { name: keyof Omit<Product, "status" | "verificationToken" | "registeredAt">; label: string; type?: string; required?: boolean; placeholder?: string }[] = [
  { name: "id", label: "Product ID", required: true, placeholder: "PID-XYZ-001" },
  { name: "name", label: "Product Name", required: true },
  { name: "brand", label: "Brand Name", required: true },
  { name: "category", label: "Category", required: true },
  { name: "batchNumber", label: "Batch Number", required: true },
  { name: "serialNumber", label: "Serial Number", required: true },
  { name: "mfgDate", label: "Manufacturing Date", type: "date", required: true },
  { name: "expiryDate", label: "Expiry Date", type: "date" },
  { name: "manufacturer", label: "Manufacturer Name", required: true },
  { name: "factoryLocation", label: "Factory Location", required: true },
  { name: "price", label: "Price (₹)", type: "number", required: true },
  { name: "currentOwner", label: "Current Owner", required: true },
];

export default function RegisterProduct() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState<Record<string, string>>({
    id: rid("PID"),
    serialNumber: rid("SN"),
    batchNumber: rid("BATCH"),
    mfgDate: new Date().toISOString().slice(0, 10),
  });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    for (const f of FIELDS) {
      if (f.required && !form[f.name]) {
        setErr(`Please fill the "${f.label}" field.`);
        return;
      }
    }
    const exists = storage.getProducts().some((p) => p.id === form["id"]);
    if (exists) {
      setErr("Duplicate Product ID — this ID is already registered.");
      return;
    }
    setBusy(true);
    const product: Product = {
      id: form["id"]!,
      name: form["name"]!,
      brand: form["brand"]!,
      category: form["category"]!,
      batchNumber: form["batchNumber"]!,
      serialNumber: form["serialNumber"]!,
      mfgDate: form["mfgDate"]!,
      expiryDate: form["expiryDate"] || undefined,
      manufacturer: form["manufacturer"]!,
      factoryLocation: form["factoryLocation"]!,
      price: Number(form["price"] || 0),
      currentOwner: form["currentOwner"]!,
      status: "active",
      verificationToken: rid("TK"),
      registeredAt: new Date().toISOString(),
    };
    addProduct(product);
    await addBlock("PRODUCT_REGISTER", {
      productId: product.id,
      name: product.name,
      brand: product.brand,
      batchNumber: product.batchNumber,
      serialNumber: product.serialNumber,
      verificationToken: product.verificationToken,
      registeredAt: product.registeredAt,
    });
    setBusy(false);
    setLocation(`/products/${product.id}`);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        New registration
      </div>
      <h1 className="mt-2 font-serif text-4xl">Register a product</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Submitting this form mints a product record, writes a new
        blockchain block, and issues a QR code and serial code you can attach
        to the physical item.
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="font-serif">Product details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {FIELDS.map((f) => (
              <div key={f.name}>
                <Label htmlFor={f.name}>
                  {f.label}
                  {f.required && <span className="text-destructive"> *</span>}
                </Label>
                <Input
                  id={f.name}
                  type={f.type ?? "text"}
                  placeholder={f.placeholder}
                  value={form[f.name] ?? ""}
                  onChange={(e) => set(f.name, e.target.value)}
                />
              </div>
            ))}
            {err && (
              <Alert variant="destructive" className="md:col-span-2">
                <AlertDescription>{err}</AlertDescription>
              </Alert>
            )}
            <div className="md:col-span-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setLocation("/products")}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Registering…" : "Register & mint block"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
