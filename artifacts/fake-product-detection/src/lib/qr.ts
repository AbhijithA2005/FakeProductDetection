import QRCode from "qrcode";
import type { Product } from "./types";

export function buildPayload(product: Product): string {
  return JSON.stringify({ pid: product.id, tk: product.verificationToken });
}

export async function generateQRDataURL(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    margin: 1,
    width: 320,
    color: { dark: "#1a1a1a", light: "#fdfcf8" },
  });
}

export function parseScanned(raw: string): { pid: string; tk?: string } {
  const trimmed = raw.trim();
  try {
    const obj = JSON.parse(trimmed);
    if (obj && typeof obj === "object" && typeof obj.pid === "string") {
      return { pid: obj.pid, tk: obj.tk };
    }
  } catch {
    /* not JSON, treat as raw product id */
  }
  return { pid: trimmed };
}
