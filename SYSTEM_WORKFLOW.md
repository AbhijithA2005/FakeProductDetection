# BlockTrust: System Workflow and Architecture Pipeline

BlockTrust is a decentralized, blockchain-inspired supply chain authenticity system designed to detect counterfeit and tampered products. 

This document breaks down the overall architecture, data pipeline, and operational workflow of the application.

---

## 1. System Architecture

The application is built using a modern React stack, designed to simulate a fully immutable ledger without requiring an external blockchain network (e.g., Ethereum or Hyperledger) for this academic prototype. 

### Core Components:
- **Frontend Framework:** React 19 + Vite.
- **Styling & UI:** Tailwind CSS v4, Framer Motion, and shadcn/ui components for a premium, accessible interface.
- **Routing:** `wouter` for lightweight, fast client-side routing.
- **Storage Layer:** Browser `localStorage` is used as a persistent database simulation (`src/lib/storage.ts`).
- **Cryptographic Engine:** The Web Crypto API (`src/lib/hash.ts`) is used to generate SHA-256 hashes for data integrity.
- **QR Code Integration:** `html5-qrcode` and `qrcode` libraries handle generating and scanning secure QR codes.

---

## 2. The Blockchain Pipeline

At the heart of the system is an immutable, append-only hash-chained ledger (`src/lib/blockchain.ts`).

### Block Structure
Every event in the system is recorded as a **Block** containing the following properties:
- `index`: Position in the chain.
- `timestamp`: ISO timestamp of creation.
- `type`: Category of event (`GENESIS`, `PRODUCT_REGISTER`, `OWNERSHIP_TRANSFER`, `VERIFICATION`).
- `data`: The JSON payload of the event.
- `previousHash`: The SHA-256 hash of the preceding block.
- `hash`: The SHA-256 hash of all the above properties combined.

### Immutability & Validation Pipeline
1. **Hashing:** The hash is computed as `SHA-256(index | timestamp | type | JSON(data) | previousHash | nonce)`.
2. **Validation:** To validate the chain, the system recalculates the hash of every block. If a single byte in a historical block's data is altered, its re-calculated hash will not match the stored `hash`. Furthermore, it breaks the `previousHash` link of the next block.
3. **Tamper Detection:** If the system detects a break in the chain, it flags the entire ledger as compromised, halting all authentic verifications.

---

## 3. The Detection Engine Pipeline

The Detection Engine (`src/lib/detection.ts`) is responsible for processing verification requests (scans) and evaluating them against the ledger. 

When a user scans a product's QR code, the pipeline executes the following checks:

1. **Chain Integrity Check:** 
   Validates the entire blockchain. If tampering is detected, the product is immediately marked as **FAKE**.
2. **Ledger Lookup:** 
   Searches the ledger for the scanned Product ID. If the ID does not exist, it is marked as **FAKE**.
3. **Cryptographic Token Verification:** 
   If a secure token is provided in the QR code, it must match the `verificationToken` stored on the ledger. Mismatches return **FAKE**.
4. **Lifecycle Status Check:** 
   If the product was previously marked "inactive" (e.g., recalled, destroyed, or consumed) but is scanned again, it returns **SUSPICIOUS**.
5. **Geospatial Anomaly Detection (Heuristic):**
   The engine reviews the recent scan history. If the exact same Product ID is scanned from multiple geographically distinct locations within a 60-minute window, it triggers a **SUSPICIOUS** alert (clone detection).
6. **Success:**
   If all checks pass, the product is verified as **AUTHENTIC**.

---

## 4. Operational Workflow

The real-world lifecycle of a product within the BlockTrust system follows this chronological flow:

### Phase 1: Manufacturing & Registration
- **Actor:** Manufacturer / Admin
- **Action:** A new batch of products is created. The admin registers the product details (name, brand, batch number, serial number).
- **System Response:** The system mints a `PRODUCT_REGISTER` block, generates a secure verification token, and creates a downloadable QR code bound to that specific identity.

### Phase 2: Supply Chain Handoffs
- **Actor:** Manufacturer → Distributor → Retailer
- **Action:** As the physical product moves through the supply chain, the current owner transfers custody to the next party.
- **System Response:** Each transfer mints an `OWNERSHIP_TRANSFER` block. This builds a complete, auditable provenance trail linking the factory floor to the final retail shelf.

### Phase 3: Verification & Auditing
- **Actor:** Consumer or Quality Inspector
- **Action:** The actor uses their smartphone camera to scan the QR code on the product packaging.
- **System Response:** 
  - The Detection Engine executes the validation pipeline.
  - An immutable scan log is generated and saved.
  - The user is presented with a trust dashboard confirming authenticity or warning them of suspicious activity.

### Phase 4: Threat Simulation (Academic Context)
- **Actor:** Admin
- **Action:** Through the Blockchain Explorer dashboard, an admin can simulate a supply chain attack by modifying historical block data.
- **System Response:** The system's cryptographic validation immediately detects the broken hash chain and triggers global tampering alerts, demonstrating the core security property of the ledger.
