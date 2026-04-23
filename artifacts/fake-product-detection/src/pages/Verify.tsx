import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { motion } from "framer-motion";
import { Camera, CameraOff, ShieldCheck, XCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { verifyAndLog } from "@/lib/detection";
import { parseScanned } from "@/lib/qr";
import { currentUser } from "@/lib/auth";
import type { VerifyResult } from "@/lib/detection";
import type { Role } from "@/lib/types";


export default function Verify() {
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [location, setLocation] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const user = currentUser();
  const role: Role = (user?.role as Role) ?? "consumer";

  const run = async (pid: string, tk?: string) => {
    const r = await verifyAndLog(pid, {
      role,
      location: location || "Unknown",
      ...(tk ? { token: tk } : {}),
    });
    setResult(r);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    const parsed = parseScanned(code);
    await run(parsed.pid, token || parsed.tk);
  };

  const startScan = async () => {
    setResult(null);
    try {
      const qr = new Html5Qrcode("qr-reader");
      scannerRef.current = qr;
      setScanning(true);
      await qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 220 },
        async (decoded) => {
          const parsed = parseScanned(decoded);
          setCode(decoded);
          await run(parsed.pid, parsed.tk);
          await stopScan();
        },
        () => {},
      );
    } catch {
      setScanning(false);
      setResult({
        status: "FAKE",
        reason: "Camera access is not available in this browser or was denied.",
      });
    }
  };

  const stopScan = async () => {
    try {
      await scannerRef.current?.stop();
      await scannerRef.current?.clear();
    } catch {
      /* ignore */
    }
    scannerRef.current = null;
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      void stopScan();
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <div className="grid items-center gap-8 md:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Public verification
          </div>
          <h1 className="mt-2 font-serif text-4xl">Is this product real?</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Scan the product's QR code or paste its ID below. BlockTrust will
            cross-check the ledger, verify the cryptographic chain, and review
            recent scan behavior for suspicious patterns.
          </p>
        </div>

      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Enter a code</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="code">Product ID or scanned payload</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="PID-NVP-001"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="token">Verification token (optional)</Label>
                  <Input
                    id="token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="TK-…"
                  />
                </div>
                <div>
                  <Label htmlFor="loc">Your location</Label>
                  <Input
                    id="loc"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Mumbai, IN"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Verify
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Camera scan</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              id="qr-reader"
              className="aspect-square w-full overflow-hidden rounded-md border border-border bg-secondary/40"
            />
            <div className="mt-4 flex gap-2">
              {!scanning ? (
                <Button onClick={startScan} variant="outline" className="flex-1">
                  <Camera className="mr-2 h-4 w-4" /> Start camera
                </Button>
              ) : (
                <Button onClick={stopScan} variant="destructive" className="flex-1">
                  <CameraOff className="mr-2 h-4 w-4" /> Stop
                </Button>
              )}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Tip: give the browser camera permission when asked. On desktop the
              built-in webcam works as well.
            </p>
          </CardContent>
        </Card>
      </div>

      {result && <ResultPanel result={result} />}
    </div>
  );
}

function ResultPanel({ result }: { result: VerifyResult }) {
  const tone =
    result.status === "AUTHENTIC"
      ? {
          bg: "bg-emerald-600 text-white",
          icon: ShieldCheck,
          title: "Authentic product",
        }
      : result.status === "FAKE"
        ? { bg: "bg-destructive text-destructive-foreground", icon: XCircle, title: "Fake / Not verified" }
        : { bg: "bg-amber-500 text-black", icon: AlertTriangle, title: "Suspicious activity" };
  const Icon = tone.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-8"
    >
      <Card className="overflow-hidden">
        <div className={`${tone.bg} flex items-center gap-3 px-6 py-4`}>
          <Icon className="h-5 w-5" />
          <div className="font-serif text-2xl">{tone.title}</div>
        </div>
        <CardContent className="p-6">
          <div className="text-sm text-muted-foreground">{result.reason}</div>
          {result.product && (
            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Product</dt>
                <dd>{result.product.name}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Brand</dt>
                <dd>{result.product.brand}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Batch</dt>
                <dd className="font-mono">{result.product.batchNumber}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Current Owner</dt>
                <dd>{result.product.currentOwner}</dd>
              </div>
            </dl>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
