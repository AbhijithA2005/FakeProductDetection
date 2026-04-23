export type Role = 'admin' | 'retailer' | 'consumer' | 'inspector';

export interface User {
  username: string;
  password?: string;
  role: Role;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  batchNumber: string;
  serialNumber: string;
  mfgDate: string;
  expiryDate?: string;
  manufacturer: string;
  factoryLocation: string;
  price: number;
  currentOwner: string;
  status: 'active' | 'inactive';
  verificationToken: string;
  registeredAt: string;
}

export type BlockType = 'GENESIS' | 'PRODUCT_REGISTER' | 'OWNERSHIP_TRANSFER' | 'VERIFICATION';

export interface Block {
  index: number;
  timestamp: string;
  type: BlockType;
  data: any;
  previousHash: string;
  hash: string;
  nonce?: number;
}

export interface ScanLog {
  id: string;
  productId: string;
  timestamp: string;
  role: Role;
  location: string;
  result: 'AUTHENTIC' | 'FAKE' | 'SUSPICIOUS';
  reason: string;
  deviceInfo: string;
}

export interface Transfer {
  id: string;
  productId: string;
  from: string;
  to: string;
  timestamp: string;
  blockHash: string;
}
