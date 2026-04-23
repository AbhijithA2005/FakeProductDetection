import { sha256 } from "./hash";
import type { Block, BlockType } from "./types";

const CHAIN_KEY = "bt_chain";
const TAMPER_KEY = "bt_tamper_flag";

export async function calculateHash(
  index: number,
  timestamp: string,
  type: BlockType,
  data: unknown,
  previousHash: string,
  nonce = 0,
): Promise<string> {
  return sha256(
    `${index}|${timestamp}|${type}|${JSON.stringify(data)}|${previousHash}|${nonce}`,
  );
}

export async function createBlock(
  index: number,
  type: BlockType,
  data: unknown,
  previousHash: string,
): Promise<Block> {
  const timestamp = new Date().toISOString();
  const hash = await calculateHash(index, timestamp, type, data, previousHash);
  return { index, timestamp, type, data, previousHash, hash };
}

export async function genesisBlock(): Promise<Block> {
  return createBlock(0, "GENESIS", { note: "BlockTrust Genesis Block" }, "0".repeat(64));
}

export function getChain(): Block[] {
  try {
    const raw = localStorage.getItem(CHAIN_KEY);
    return raw ? (JSON.parse(raw) as Block[]) : [];
  } catch {
    return [];
  }
}

export function saveChain(chain: Block[]): void {
  localStorage.setItem(CHAIN_KEY, JSON.stringify(chain));
}

export async function addBlock(type: BlockType, data: unknown): Promise<Block> {
  const chain = getChain();
  const prev = chain[chain.length - 1];
  const block = await createBlock(
    chain.length,
    type,
    data,
    prev ? prev.hash : "0".repeat(64),
  );
  chain.push(block);
  saveChain(chain);
  return block;
}

export async function isChainValid(): Promise<{
  valid: boolean;
  firstInvalidIndex: number | null;
}> {
  const chain = getChain();
  for (let i = 0; i < chain.length; i++) {
    const b = chain[i]!;
    const expected = await calculateHash(
      b.index,
      b.timestamp,
      b.type,
      b.data,
      b.previousHash,
      b.nonce ?? 0,
    );
    if (expected !== b.hash) return { valid: false, firstInvalidIndex: i };
    if (i > 0 && b.previousHash !== chain[i - 1]!.hash) {
      return { valid: false, firstInvalidIndex: i };
    }
  }
  return { valid: true, firstInvalidIndex: null };
}

export function getBlocksForProduct(productId: string): Block[] {
  return getChain().filter((b) => {
    const d = b.data as Record<string, unknown> | null;
    if (!d || typeof d !== "object") return false;
    return d["productId"] === productId || d["id"] === productId;
  });
}

export function simulateTampering(): boolean {
  const chain = getChain();
  const target = chain.find((b) => b.type === "PRODUCT_REGISTER");
  if (!target) return false;
  const data = target.data as Record<string, unknown>;
  target.data = { ...data, brand: "TAMPERED-BRAND" };
  saveChain(chain);
  localStorage.setItem(TAMPER_KEY, "1");
  return true;
}

export function isTampered(): boolean {
  return localStorage.getItem(TAMPER_KEY) === "1";
}

export async function resetChain(rebuild: () => Promise<void>): Promise<void> {
  localStorage.removeItem(CHAIN_KEY);
  localStorage.removeItem(TAMPER_KEY);
  const genesis = await genesisBlock();
  saveChain([genesis]);
  await rebuild();
}
