# Contributing to Project ACK (The Developer Messenger)

Thank you for your interest in contributing to **Project ACK**! We are building a high-velocity, developer-first communication platform engineered with synchronous SQLite performance (`op-sqlite`), zero-trust `.env` encryption, and native git integrations.

Please review this guide before submitting code or opening issues.

---

## 🛠️ Development Setup

### Prerequisites
- **Node.js:** `>= 22.11.0`
- **Package Manager:** `npm` (or `yarn`)
- **Android Studio / SDK:** For Android Bare compilation (`npx react-native run-android`)
- **Git**

### Installation
```bash
# Clone the repository
git clone https://github.com/kingenious0/ProjectACK.git
cd ProjectACK

# Install dependencies
npm install

# Run TypeScript checks
npx tsc --noEmit

# Run unit tests
npm test
```

---

## 🏛️ Architecture & Principles

1. **Obsidian & Cyber-Emerald Theme:**
   - App Canvas: `#0B0F12`
   - Surface / Cards: `#131B22`
   - Primary Accent: `#00FF66`
   - Warning / Vault: `#FFB800`
   - Always consume tokens from `src/theme/colors.ts`. Avoid hardcoding ad-hoc hex values.

2. **Local Storage Engine (`op-sqlite`):**
   - We utilize `@op-engineering/op-sqlite` for synchronous C++ SQLite operations.
   - Any database schema changes must be updated in `src/db/schema.ts` and reflected in `src/db/types.ts`.
   - Never run blocking file I/O on the main JavaScript thread outside the SQLite driver.

3. **Client-Side Cryptography (`src/utils/crypto.ts`):**
   - Burn-After-Reading `.env` vaults use AES-GCM 256-bit encryption.
   - Plaintext secrets must never be logged or sent unencrypted over the relay.

---

## 🔀 Branching & Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new feature (e.g. `feat: add line-item syntax comment threads`)
- `fix:` A bug fix (e.g. `fix: prevent duplicate ACK relay ticks`)
- `docs:` Documentation changes (e.g. `docs: update op-sqlite setup notes`)
- `perf:` Performance improvements (e.g. `perf: optimize flatlist render window`)
- `refactor:` Code refactoring without behavioral change
- `test:` Adding or updating tests

---

## 📋 Pull Request Process

1. Fork the repository and create your branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Verify all TypeScript types pass:
   ```bash
   npx tsc --noEmit
   ```
3. Run the test suite:
   ```bash
   npm test
   ```
4. Push your branch and open a PR against `main` using our [Pull Request Template](.github/pull_request_template.md).
5. Ensure CI checks pass. All PRs require review from a maintainer before merging.

---

## 💬 Community & Help

- Report bugs or request features via [GitHub Issues](https://github.com/kingenious0/ProjectACK/issues).
- For security-sensitive disclosures, please consult our [Security Policy](SECURITY.md).
