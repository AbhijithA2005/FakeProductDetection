import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import themeImage from "@assets/image_1776957916098.png";

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "Abstract",
    body: [
      "BlockTrust is a blockchain-inspired product authentication system that pairs unique QR-coded identities with an immutable, SHA-256 hash-chained ledger to detect counterfeit, tampered, and suspicious products across the supply chain.",
    ],
  },
  {
    title: "Problem Statement",
    body: [
      "Counterfeit products cause billions in revenue loss and harm consumers in industries like pharma, cosmetics, electronics, and FMCG. Existing barcode-only systems are easy to duplicate and provide no cryptographic guarantee of origin or custody.",
    ],
  },
  {
    title: "Proposed System",
    body: [
      "Manufacturers register products which are immutably written to a hash-chained ledger and issued a QR and serial identity. Retailers, consumers, and inspectors verify products in seconds via scan. Ownership transfers, scan events, and detection rules all write new blocks, keeping a full audit trail.",
    ],
  },
  {
    title: "Blockchain Logic",
    body: [
      "Each block contains: index, timestamp, type, data, previousHash, and hash. The hash is computed as SHA-256(index | timestamp | type | JSON(data) | previousHash | nonce). A chain is valid when every block's recomputed hash matches its stored hash AND its previousHash equals the previous block's hash. Altering any historical block cascades an invalidation through every subsequent block.",
      "This academic prototype simulates a blockchain in the browser using the Web Crypto API. It demonstrates immutability, transparency, traceability, and tamper detection without requiring real on-chain deployment.",
    ],
  },
  {
    title: "Detection Engine",
    body: [
      "Fake — product ID not on ledger, verification token mismatch, or chain validation failure.",
      "Suspicious — same code scanned from multiple distant locations within 60 minutes, or product marked inactive yet still scanning in the wild.",
      "Authentic — ledger record exists, token matches (if supplied), chain is valid, no anomalous scan pattern detected.",
    ],
  },
  {
    title: "Advantages",
    body: [
      "Tamper-evident audit trail, role-based workflows, real-time verification, cryptographic proof of origin, no specialized hardware needed.",
    ],
  },
  {
    title: "Future Scope",
    body: [
      "On-chain deployment via Ethereum/Hyperledger Fabric, multi-org consensus, NFC/holographic tag binding, anomaly detection with ML, merchant-side PoS integration, and consumer mobile app with offline verification.",
    ],
  },
];

export default function About() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-6">
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Project documentation
      </div>
      <h1 className="mt-2 font-serif text-4xl">
        About <span className="italic text-primary">BlockTrust</span>
      </h1>

      <div className="mt-8 overflow-hidden rounded-xl border border-border bg-card">
        <img
          src={themeImage}
          alt="BlockTrust three-layer infrastructure"
          className="w-full object-cover"
        />
        <div className="border-t border-border p-5 text-sm text-muted-foreground">
          BlockTrust organizes authenticity as three cooperating layers:
          <span className="text-foreground"> discovery &amp; search</span>,
          <span className="text-foreground"> clean &amp; enrich</span>, and an
          <span className="text-foreground"> always-current data base</span> —
          mirrored in the ledger, verification engine, and registry.
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {SECTIONS.map((s) => (
          <Card key={s.title}>
            <CardHeader>
              <CardTitle className="font-serif">{s.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {s.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="font-serif">Demo credentials</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-2">Role</th>
                <th className="pb-2">Username</th>
                <th className="pb-2">Password</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              <tr><td>Admin / Manufacturer</td><td>admin</td><td>admin123</td></tr>
              <tr><td>Retailer / Distributor</td><td>retailer</td><td>retail123</td></tr>
              <tr><td>Consumer</td><td>consumer</td><td>consumer123</td></tr>
              <tr><td>Inspector</td><td>inspector</td><td>inspect123</td></tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-serif">Demo walkthrough</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {[
            "Sign in as admin / admin123",
            "Open Products → Register a new product (QR and block are minted)",
            "Open the new product — download the QR, copy the Product ID",
            "Go to Verify → paste the Product ID → see Authentic result",
            "Go to Verify → paste a made-up ID → see Fake result",
            "Repeat the same verification from two different locations quickly → see Suspicious",
            "On the product detail page, transfer ownership to a new party",
            "Open Blockchain → press Simulate tampering → press Validate chain → see detection",
            "Press Reset demo to restore seeded data",
          ].map((s, i) => (
            <div key={i}>
              <span className="font-mono text-xs text-foreground">{String(i + 1).padStart(2, "0")}.</span>{" "}
              {s}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
