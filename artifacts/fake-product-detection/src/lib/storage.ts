import { addBlock, genesisBlock, getChain, saveChain } from "./blockchain";
import type { Product, ScanLog, Transfer, User } from "./types";

const K = {
  users: "bt_users",
  products: "bt_products",
  scans: "bt_scans",
  transfers: "bt_transfers",
  session: "bt_session",
  seeded: "bt_seeded",
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getUsers: () => read<User[]>(K.users, []),
  setUsers: (u: User[]) => write(K.users, u),
  getProducts: () => read<Product[]>(K.products, []),
  setProducts: (p: Product[]) => write(K.products, p),
  getScans: () => read<ScanLog[]>(K.scans, []),
  setScans: (s: ScanLog[]) => write(K.scans, s),
  getTransfers: () => read<Transfer[]>(K.transfers, []),
  setTransfers: (t: Transfer[]) => write(K.transfers, t),
  getSession: () => read<User | null>(K.session, null),
  setSession: (u: User | null) =>
    u ? write(K.session, u) : localStorage.removeItem(K.session),
};

export function addProduct(p: Product): void {
  const list = storage.getProducts();
  list.push(p);
  storage.setProducts(list);
}

export function addScan(s: ScanLog): void {
  const list = storage.getScans();
  list.unshift(s);
  storage.setScans(list);
}

export function addTransfer(t: Transfer): void {
  const list = storage.getTransfers();
  list.push(t);
  storage.setTransfers(list);
}

function rid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function seedIfNeeded(): Promise<void> {
  if (localStorage.getItem(K.seeded) === "1") return;

  // Users
  const users: User[] = [
    { username: "admin", password: "admin123", role: "admin", name: "Admin User" },
    { username: "retailer", password: "retail123", role: "retailer", name: "Retail Partner" },
    { username: "consumer", password: "consumer123", role: "consumer", name: "End Consumer" },
    { username: "inspector", password: "inspect123", role: "inspector", name: "Field Inspector" },
  ];
  storage.setUsers(users);

  // Genesis chain
  const genesis = await genesisBlock();
  saveChain([genesis]);

  const now = Date.now();
  const mkDate = (d = 0) => new Date(now - d * 86400000).toISOString().slice(0, 10);

  const seedProducts: Omit<Product, "verificationToken" | "registeredAt">[] = [
    {
      id: "PID-NVP-001",
      name: "NovaPharma Paracetamol 500mg",
      brand: "NovaPharma",
      category: "Pharmaceuticals",
      batchNumber: "BATCH-NVP-2026-07",
      serialNumber: "SN-NVP-000001",
      mfgDate: mkDate(60),
      expiryDate: mkDate(-365),
      manufacturer: "NovaPharma Laboratories",
      factoryLocation: "Pune, IN",
      price: 49,
      currentOwner: "NovaPharma Laboratories",
      status: "active",
    },
    {
      id: "PID-ART-002",
      name: "AuroraTech True Wireless Earbuds",
      brand: "AuroraTech",
      category: "Electronics",
      batchNumber: "BATCH-ART-2026-03",
      serialNumber: "SN-ART-000002",
      mfgDate: mkDate(40),
      manufacturer: "AuroraTech Pvt Ltd",
      factoryLocation: "Shenzhen, CN",
      price: 2499,
      currentOwner: "AuroraTech Pvt Ltd",
      status: "active",
    },
    {
      id: "PID-GLH-003",
      name: "GreenLeaf Organic Honey 500g",
      brand: "GreenLeaf",
      category: "Food & Beverage",
      batchNumber: "BATCH-GLH-2026-01",
      serialNumber: "SN-GLH-000003",
      mfgDate: mkDate(20),
      expiryDate: mkDate(-720),
      manufacturer: "GreenLeaf Organics",
      factoryLocation: "Bengaluru, IN",
      price: 399,
      currentOwner: "GreenLeaf Organics",
      status: "active",
    },
    {
      id: "PID-VLP-004",
      name: "Velora Matte Lipstick",
      brand: "Velora",
      category: "Cosmetics",
      batchNumber: "BATCH-VLP-2026-05",
      serialNumber: "SN-VLP-000004",
      mfgDate: mkDate(15),
      manufacturer: "Velora Beauty Co.",
      factoryLocation: "Milan, IT",
      price: 899,
      currentOwner: "Velora Beauty Co.",
      status: "active",
    },
    {
      id: "PID-ICP-005",
      name: "IronCore 20000mAh Power Bank",
      brand: "IronCore",
      category: "Electronics",
      batchNumber: "BATCH-ICP-2026-02",
      serialNumber: "SN-ICP-000005",
      mfgDate: mkDate(90),
      manufacturer: "IronCore Devices",
      factoryLocation: "Taipei, TW",
      price: 1799,
      currentOwner: "IronCore Devices",
      status: "active",
    },
  ];

  const TOKEN_MAP: Record<string, string> = {
    "PID-NVP-001": "TK-HW2LT6", // Match from 1st screenshot
    "PID-VLP-004": "TK-TXG7T1", // Match from 2nd screenshot
    "PID-ART-002": "TK-ART002",
    "PID-GLH-003": "TK-GLH003",
    "PID-ICP-005": "TK-1L1SVF", // Match from 3rd screenshot
  };

  const products: Product[] = [];
  for (const p of seedProducts) {
    const full: Product = {
      ...p,
      verificationToken: TOKEN_MAP[p.id] ?? rid("TK"),
      registeredAt: new Date().toISOString(),
    };
    products.push(full);
    await addBlock("PRODUCT_REGISTER", {
      productId: full.id,
      name: full.name,
      brand: full.brand,
      batchNumber: full.batchNumber,
      serialNumber: full.serialNumber,
      verificationToken: full.verificationToken,
      registeredAt: full.registeredAt,
    });
  }
  storage.setProducts(products);

  // Ownership transfer chain for PID-ART-002: Mfg -> Distributor -> Retailer -> Consumer
  const transfers: Transfer[] = [];
  const chainPath = [
    "AuroraTech Pvt Ltd",
    "Pacific Distribution Co.",
    "UrbanTech Retail",
    "End Consumer",
  ];
  for (let i = 0; i < chainPath.length - 1; i++) {
    const block = await addBlock("OWNERSHIP_TRANSFER", {
      productId: "PID-ART-002",
      from: chainPath[i],
      to: chainPath[i + 1],
    });
    transfers.push({
      id: rid("TR"),
      productId: "PID-ART-002",
      from: chainPath[i]!,
      to: chainPath[i + 1]!,
      timestamp: block.timestamp,
      blockHash: block.hash,
    });
    const idx = products.findIndex((p) => p.id === "PID-ART-002");
    if (idx >= 0) products[idx]!.currentOwner = chainPath[i + 1]!;
  }
  storage.setProducts(products);
  storage.setTransfers(transfers);

  // Seed scan logs
  const scans: ScanLog[] = [
    {
      id: rid("SC"),
      productId: "PID-NVP-001",
      timestamp: new Date(now - 3600_000).toISOString(),
      role: "consumer",
      location: "Mumbai, IN",
      result: "AUTHENTIC",
      reason: "Product verified on chain.",
      deviceInfo: "Mobile / Chrome",
    },
    {
      id: rid("SC"),
      productId: "PID-GLH-003",
      timestamp: new Date(now - 2 * 3600_000).toISOString(),
      role: "retailer",
      location: "Bengaluru, IN",
      result: "AUTHENTIC",
      reason: "Product verified on chain.",
      deviceInfo: "Desktop / Firefox",
    },
    {
      id: rid("SC"),
      productId: "PID-UNKNOWN-XXX",
      timestamp: new Date(now - 30 * 60_000).toISOString(),
      role: "inspector",
      location: "Delhi, IN",
      result: "FAKE",
      reason: "Product ID not present on ledger.",
      deviceInfo: "Desktop / Safari",
    },
    {
      id: rid("SC"),
      productId: "PID-ICP-005",
      timestamp: new Date(now - 15 * 60_000).toISOString(),
      role: "consumer",
      location: "Chennai, IN",
      result: "SUSPICIOUS",
      reason: "Same code scanned from multiple distant locations within 60 minutes.",
      deviceInfo: "Mobile / Safari",
    },
    {
      id: rid("SC"),
      productId: "PID-ICP-005",
      timestamp: new Date(now - 10 * 60_000).toISOString(),
      role: "consumer",
      location: "Kolkata, IN",
      result: "SUSPICIOUS",
      reason: "Duplicate scan pattern detected.",
      deviceInfo: "Mobile / Chrome",
    },
  ];
  storage.setScans(scans);

  localStorage.setItem(K.seeded, "1");
  // Ensure chain in storage matches
  void getChain();
}
