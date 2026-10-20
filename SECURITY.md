# Security Policy

**Project ACK (The Developer Messenger)** takes security, developer privacy, and code confidentiality with paramount importance. Because software developers exchange proprietary architecture, code snippets, and confidential environment variables (`.env`), our stack is built around a **zero-trust, client-encrypted, ephemeral relay architecture**.

---

## 🛡️ Security Architecture & Assurances

### 1. Burn-After-Reading .env Vaults
- **Algorithm:** AES-GCM 256-bit client-side encryption.
- **Key Derivation & Handling:** Encryption keys are generated client-side and held ephemerally.
- **Copy-to-Mask Purge:** Tapping "Copy All" on a secret payload immediately masks the UI buffer with asterisks (`**************************************** [BURNED]`), writes the payload directly to the clipboard, and triggers an immediate local and relay deletion.
- **No Cloud Retention:** Secret payloads are never retained on relay databases after receipt acknowledgment.

### 2. Ephemeral Real-Time Transport
- The WebSocket relay server acts strictly as an ephemeral message router.
- When message status transitions to `delivered` / `read` via recipient ACK, the transient relay record is wiped permanently.

### 3. Local SQLite Sandboxing
- Local storage uses `@op-engineering/op-sqlite` inside the OS-sandboxed application sandbox.
- Keys and database files are protected by Android KeyStore / iOS Secure Enclave on supported devices.

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability or cryptographic flaw within Project ACK, please **DO NOT** create a public GitHub issue.

Please follow our responsible disclosure protocol:

1. **Email:** Send details directly to `kingenious0@gmail.com` with the subject line:  
   `[SECURITY VULNERABILITY] Project ACK - <Short Summary>`.
2. **Include in Report:**
   - Detailed description of the vulnerability and attack vector.
   - Proof of Concept (PoC) code or reproduction steps.
   - Impact assessment (e.g. key leakage, relay bypass, injection).
3. **Response Timeline:**
   - **Acknowledgment:** Within 24 hours.
   - **Triage & Assessment:** Within 72 hours.
   - **Remediation & Patch:** Prioritized before public advisory.

---

## ⚠️ Supported Versions

| Version | Supported |
|---|---|
| `1.x.x` (Current Main) | ✅ Active Security Patches |
| `< 1.0.0` | ⚠️ Security updates on best-effort basis |
