import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Layers, QrCode, ShieldCheck, Fingerprint, Activity, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { currentUser } from "@/lib/auth";

export default function Home() {
  const user = currentUser();

  const getDashboardText = (role?: string) => {
    switch (role) {
      case "admin": return "Go to Dashboard";
      case "retailer": return "Go to Supply Chain";
      case "inspector": return "Go to Scan Logs";
      case "consumer": return "Go to Verification";
      default: return "Open App";
    }
  };

  return (
    <div className="relative">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 gridlines opacity-[0.25]" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 md:grid-cols-2 md:px-6 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Blockchain · QR · Supply-chain integrity
            </div>
            <h1 className="mt-4 font-serif text-5xl leading-[1.05] md:text-6xl">
              Go to market{" "}
              <span className="italic text-primary">with trusted</span> products.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              BlockTrust combines an immutable hash-chained ledger with QR-coded
              provenance so manufacturers, retailers, inspectors, and consumers
              can verify authenticity in seconds — and catch counterfeits before
              they leave the shelf.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={user ? "/verify" : "/signup"}>
                <Button size="lg" className="gap-2">
                  Verify a product <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {!user ? (
                <Link href="/login">
                  <Button size="lg" variant="outline">
                    Sign in to system
                  </Button>
                </Link>
              ) : (
                <Link href="/">
                  <Button size="lg" variant="outline">
                    {getDashboardText(user.role)}
                  </Button>
                </Link>
              )}
            </div>
            <div className="mt-10 flex items-center gap-6 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <span>Immutable</span>
              <span>·</span>
              <span>Transparent</span>
              <span>·</span>
              <span>Tamper-evident</span>
            </div>
          </motion.div>


        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="mb-10 flex items-end justify-between gap-6 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Platform
            </div>
            <h2 className="mt-2 font-serif text-4xl md:text-5xl">
              One ledger. <span className="italic">Three layers.</span>
            </h2>
          </div>
          <p className="max-w-md text-muted-foreground">
            Always-current authenticity at the base. Tools to register what you
            sell. Verification anyone can run — each works standalone, together
            they give you a live trust fabric.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: Layers,
              tag: "Ledger",
              title: "Hash-chained records that never go stale.",
              body:
                "Every registration, transfer, and verification writes a new SHA-256 linked block. Break one, and every downstream block shows it.",
              href: "/blockchain",
              cta: "Open explorer",
              allowedRoles: ["admin"],
            },
            {
              icon: QrCode,
              tag: "QR provenance",
              title: "Make any product production-ready.",
              body:
                "Register a product once and BlockTrust mints a signed QR and serial code you can print, ship, and trust.",
              href: "/products/register",
              cta: "Register a product",
              allowedRoles: ["admin"],
            },
            {
              icon: ShieldCheck,
              tag: "Verification",
              title: "Describe the product. We confirm the truth.",
              body:
                "Scan or type a code — we cross-check the ledger, scan history, and ownership path in under a second.",
              href: "/verify",
              cta: "Verify now",
              allowedRoles: ["admin", "retailer", "inspector", "consumer"],
            },
          ].map((c, i) => {
            const canAccess = !user || c.allowedRoles.includes(user.role);
            return (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <Card className="group h-full border-card-border">
                <CardContent className="flex h-full flex-col p-6">
                  <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-md border border-border bg-secondary px-2.5 py-1 text-xs uppercase tracking-wider text-muted-foreground">
                    <c.icon className="h-3.5 w-3.5" /> {c.tag}
                  </div>
                  <h3 className="font-serif text-2xl leading-tight">{c.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground flex-1">{c.body}</p>
                  {canAccess ? (
                    <Link
                      href={c.href}
                      className="mt-6 inline-flex w-fit items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all"
                    >
                      {c.cta} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <div className="mt-6 inline-flex w-fit items-center gap-1 text-sm font-medium text-muted-foreground/60 cursor-not-allowed" title="Restricted access">
                      {c.cta} <Lock className="h-3.5 w-3.5 ml-1" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )})}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-4 md:px-6">
          {[
            { icon: Fingerprint, title: "Unique identity", body: "Every product gets a signed serial + QR tied to its on-chain record." },
            { icon: Activity, title: "Live scan log", body: "Retailer, consumer, and inspector scans stream into an auditable feed." },
            { icon: Lock, title: "Tamper-evident", body: "Any change to a block invalidates every block after it — instantly visible." },
            { icon: ShieldCheck, title: "Role-based", body: "Manufacturer, distributor, retailer, consumer, inspector — each sees what they need." },
          ].map((f) => (
            <div key={f.title} className="flex flex-col gap-2">
              <f.icon className="h-5 w-5 text-primary" />
              <div className="font-medium">{f.title}</div>
              <div className="text-sm text-muted-foreground">{f.body}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 text-center md:px-6">
        <h2 className="mx-auto max-w-3xl font-serif text-4xl md:text-5xl">
          Counterfeits cost customers trust.{" "}
          <span className="italic text-primary">Give it back to them.</span>
        </h2>
        <div className="mt-8 flex justify-center gap-3">
          {!user ? (
            <Link href="/signup">
              <Button size="lg">Try a live verification</Button>
            </Link>
          ) : (
            <Link href="/">
              <Button size="lg">
                {getDashboardText(user.role)}
              </Button>
            </Link>
          )}
          <Link href="/about">
            <Button size="lg" variant="outline">
              Read the documentation
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
