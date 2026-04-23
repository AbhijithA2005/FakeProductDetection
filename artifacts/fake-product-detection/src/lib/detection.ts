import { getBlocksForProduct, isChainValid } from "./blockchain";
import { addScan, storage } from "./storage";
import type { Product, Role, ScanLog } from "./types";

export type VerifyResult = {
  status: "AUTHENTIC" | "FAKE" | "SUSPICIOUS";
  reason: string;
  product?: Product;
};

export async function verifyProduct(
  code: string,
  opts: { role?: Role; location?: string; token?: string },
): Promise<VerifyResult> {
  const pid = code.trim();
  if (!pid) return { status: "FAKE", reason: "Empty code." };

  const chainCheck = await isChainValid();
  if (!chainCheck.valid) {
    return {
      status: "FAKE",
      reason: `Blockchain tampering detected at block #${chainCheck.firstInvalidIndex}. Verification unsafe.`,
    };
  }

  const product = storage.getProducts().find((p) => p.id === pid);
  if (!product) {
    return { status: "FAKE", reason: "Product ID not found on the ledger." };
  }

  if (opts.token && opts.token !== product.verificationToken) {
    return { status: "FAKE", reason: "Verification token does not match on-chain record." };
  }

  const blocks = getBlocksForProduct(pid);
  if (blocks.length === 0) {
    return { status: "FAKE", reason: "No blockchain record exists for this product." };
  }

  if (product.status === "inactive") {
    return {
      status: "SUSPICIOUS",
      reason: "Product is marked inactive but is still appearing in market scans.",
      product,
    };
  }

  // Duplicate-scan suspicious pattern: same product scanned from distinct
  // non-empty locations within 60 minutes.
  const now = Date.now();
  const recent = storage
    .getScans()
    .filter(
      (s) =>
        s.productId === pid &&
        now - new Date(s.timestamp).getTime() < 60 * 60_000,
    );
  const locations = new Set(
    recent
      .map((s) => (s.location || "").trim().toLowerCase())
      .filter((loc) => loc.length > 0),
  );
  const currentLoc = (opts.location || "").trim().toLowerCase();
  if (currentLoc && locations.size > 0 && !locations.has(currentLoc)) {
    return {
      status: "SUSPICIOUS",
      reason: "Same code scanned from multiple distant locations within 60 minutes.",
      product,
    };
  }

  return { status: "AUTHENTIC", reason: "Product verified on chain.", product };
}

export async function verifyAndLog(
  code: string,
  opts: { role?: Role; location?: string; token?: string },
): Promise<VerifyResult> {
  const result = await verifyProduct(code, opts);
  const log: ScanLog = {
    id: `SC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    productId: code.trim(),
    timestamp: new Date().toISOString(),
    role: opts.role ?? "consumer",
    location: opts.location ?? "Unknown",
    result: result.status,
    reason: result.reason,
    deviceInfo: navigator.userAgent.split(")")[0]?.slice(0, 80) ?? "Unknown",
  };
  addScan(log);
  return result;
}
