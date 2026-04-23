import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, RefreshCw, Bug, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getChain, isChainValid, simulateTampering } from "@/lib/blockchain";
import type { Block } from "@/lib/types";

export default function BlockchainExplorer() {
  const [chain, setChain] = useState<Block[]>(getChain());
  const [valid, setValid] = useState<boolean | null>(null);
  const [firstBad, setFirstBad] = useState<number | null>(null);

  const refresh = async () => {
    setChain(getChain());
    const r = await isChainValid();
    setValid(r.valid);
    setFirstBad(r.firstInvalidIndex);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const tamper = async () => {
    if (!simulateTampering()) return;
    await refresh();
  };

  const hardReset = async () => {
    if (!confirm("This will clear all BlockTrust data and reseed the demo. Continue?")) return;
    [
      "bt_chain",
      "bt_tamper_flag",
      "bt_products",
      "bt_scans",
      "bt_transfers",
      "bt_users",
      "bt_session",
      "bt_seeded",
    ].forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Chain explorer
          </div>
          <h1 className="mt-2 font-serif text-4xl">BlockTrust ledger</h1>
          <p className="mt-2 text-muted-foreground">
            {chain.length} blocks · SHA-256 hash-chained · previous-hash linked.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="mr-1 h-4 w-4" /> Validate chain
          </Button>
          <Button onClick={tamper} variant="secondary">
            <Bug className="mr-1 h-4 w-4" /> Simulate tampering
          </Button>
          <Button onClick={hardReset} variant="ghost">
            <RotateCcw className="mr-1 h-4 w-4" /> Reset demo
          </Button>
        </div>
      </div>

      <Card className="mt-6">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            {valid === null ? (
              <Badge variant="outline">Validating…</Badge>
            ) : valid ? (
              <Badge className="gap-1 bg-emerald-600 text-white hover:bg-emerald-600">
                <CheckCircle2 className="h-3 w-3" /> Chain is valid
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" /> Tampering detected at block #{firstBad}
              </Badge>
            )}
            <div className="text-sm text-muted-foreground">
              {valid
                ? "Every block's hash matches its content and links its predecessor."
                : "A block's data or link was altered — integrity is broken from this point forward."}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 space-y-4">
        {chain.map((b, i) => {
          const broken = firstBad !== null && i >= firstBad;
          return (
            <motion.div
              key={b.hash + i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              <Card className={broken ? "border-destructive/60" : ""}>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-serif">
                    Block #{b.index}{" "}
                    <span className="ml-2 text-xs uppercase tracking-wider text-muted-foreground">
                      {b.type}
                    </span>
                  </CardTitle>
                  <div className="text-xs text-muted-foreground">
                    {new Date(b.timestamp).toLocaleString()}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 font-mono text-xs">
                  <div>
                    <span className="text-muted-foreground">hash</span>
                    <div className="break-all">{b.hash}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">prev</span>
                    <div className="break-all">{b.previousHash}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">data</span>
                    <pre className="mt-1 overflow-x-auto rounded-md bg-secondary/40 p-3 text-[11px]">
                      {JSON.stringify(b.data, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
