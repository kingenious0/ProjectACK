<p align="center">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="128" height="128">
    <defs>
      <linearGradient id="ackBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#111114" />
        <stop offset="100%" stop-color="#08080A" />
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="116" fill="url(#ackBg)" stroke="#26262B" stroke-width="6" />
    <!-- Echo Check -->
    <path d="M 196 234 L 261 299 L 381 169" fill="none" stroke="#4E4485" stroke-width="52" stroke-linecap="round" stroke-linejoin="round" />
    <!-- Main Check -->
    <path d="M 170 260 L 235 325 L 355 195" fill="none" stroke="#8B7CFF" stroke-width="52" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</p>

<h1 align="center">Ack — Got it.</h1>

<p align="center">
  <strong>Chat for people who ship.</strong><br>
  The high-velocity developer messenger and collaboration center combining in-chat code reviews, zero-trust ephemeral .env vaults, repository incident rooms, voice waveforms, and desktop pair programming.
</p>

<p align="center">
  <a href="https://github.com/kingenious0/ProjectACK/stargazers"><img src="https://img.shields.io/github/stars/kingenious0/ProjectACK?style=for-the-badge&color=8B7CFF&logo=github&label=Stars" alt="GitHub Stars"></a>
  <a href="https://github.com/kingenious0/ProjectACK/network/members"><img src="https://img.shields.io/github/forks/kingenious0/ProjectACK?style=for-the-badge&color=A99DFF&logo=github&label=Forks" alt="GitHub Forks"></a>
  <img src="https://img.shields.io/badge/Theme-Ack_Obsidian_&_Violet-0B0B0D?style=for-the-badge&logoColor=8B7CFF" alt="Ack Theme">
  <img src="https://img.shields.io/badge/Vite-8.x_React_19-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 8 React 19">
  <img src="https://img.shields.io/badge/Security-AES--GCM_256_WebCrypto-8B7CFF?style=for-the-badge&logo=shield&logoColor=white" alt="AES-GCM WebCrypto">
  <a href="https://paystack.shop/pay/project-ack"><img src="https://img.shields.io/badge/Sponsor-Paystack-00C3F7?style=for-the-badge&logo=paystack&logoColor=white" alt="Sponsor Project Ack"></a>
</p>

<p align="center">
  <a href="https://github.com/topics/developer-tools"><img src="https://img.shields.io/badge/topic-developer--tools-131316?style=flat-square&logo=github&logoColor=8B7CFF" alt="developer-tools"></a>
  <a href="https://github.com/topics/code-review"><img src="https://img.shields.io/badge/topic-code--review-131316?style=flat-square&logo=git&logoColor=8B7CFF" alt="code-review"></a>
  <a href="https://github.com/topics/end-to-end-encryption"><img src="https://img.shields.io/badge/topic-e2ee-131316?style=flat-square&logo=keybase&logoColor=8B7CFF" alt="e2ee"></a>
  <a href="https://github.com/topics/react"><img src="https://img.shields.io/badge/topic-react-131316?style=flat-square&logo=react&logoColor=61DAFB" alt="react"></a>
  <a href="https://github.com/topics/typescript"><img src="https://img.shields.io/badge/topic-typescript-131316?style=flat-square&logo=typescript&logoColor=3178C6" alt="typescript"></a>
  <a href="https://github.com/topics/zero-trust"><img src="https://img.shields.io/badge/topic-zero--trust-131316?style=flat-square&logo=securityscorecard&logoColor=FFB800" alt="zero-trust"></a>
</p>

---

## 🎯 What Problem Does Ack Solve?

Modern engineering teams communicate across a fragmented, noisy stack. Slack and Discord were built for general office chat and communities, not software engineers actively building, debugging, and deploying systems.

### 1. The Context Switching Tax
Reviewing a pull request, checking CI status, or discussing a stack trace forces developers to constantly jump between their editor, GitHub, CI dashboards, and chat apps. Conversations lose context, pull requests sit idle, and momentum is destroyed.

### 2. The Persistent Secret Hazard
Engineers frequently share database URLs, `.env` snippets, API tokens, and temporary keys over plain-text team chats. Those secrets remain forever indexed in chat logs, backup exports, and third-party SaaS databases — creating massive security vulnerabilities and credential leak risks.

### 3. Notification Noise & Bloat
Corporate messaging apps prioritize threads, status updates, and generic channels that flood developers with distractions. Software development requires focus, precision, and purpose-built developer ergonomics: diff cards, syntax highlighting, quick voice memos, and synchronized pair programming.

**Ack fixes this.** It is a fast, keyboard-friendly, mobile-first messenger engineered specifically for engineers, indie hackers, and shipping teams.

---

## 🚀 System Capabilities: What We Have (`Shipped ✅`)

Ack is structured as a complete, functional developer communication platform with rich local persistence and client-side encryption.

### 1. In-Chat Code Reviews & Diff Inspection (`PR Cards`)
- **Interactive Diff Drawer:** Click any PR card in a chat stream to slide out the code review drawer.
- **Unified Diff Views:** Syntax-highlighted additions (`+`), deletions (`-`), and unchanged lines with line numbering.
- **Inline Comments:** Add feedback targeted to specific lines of code.
- **Decision Controls:** Submit instant **Approve** or **Request Changes** with automated chat activity logging.
- **Diff Stats:** Additions, deletions, and changed files counters.

### 2. Zero-Trust Ephemeral .env Vaults
- **Client-Side `AES-GCM-256` Encryption:** Secrets are encrypted in the browser using the Web Cryptography API before transmission or storage.
- **Burn-After-Reading:** Recipients can click **"Copy & Burn"** — the secret is copied to the clipboard and immediately shredded from storage.
- **Configurable Time-to-Live (TTL):** Self-destruct timers (30 seconds, 1 minute, 5 minutes, 10 minutes).
- **Burned Secret Screen:** Visual warning modal with the exact timestamp of consumption, sender attribution, and a 1-tap **"Ask sender for a new secret"** action.

### 3. Groups, Repositories & Incident Rooms
- **2-Step Group Creation Wizard:** Add members with instant search and removable chip tokens, name the group, upload a photo, and link a GitHub repository.
- **Repository Metadata:** Displays repository branch badges (`main#passing`) and direct commit/PR shortcuts.
- **Group Info Drawer:** Comprehensive member list with roles (Admin / Member), online indicators, linked repository card, mute options, and leave group action.
- **Direct Navigation:** Group creation immediately selects and opens the newly formed chat room without blank frames.

### 4. Developer Media & Voice Notes
- **Waveform Voice Recorder:** Live microphone recording with pulsing red record indicator, dynamic millisecond timer, frequency waveform animation, trash cancel, and send trigger.
- **Interactive Audio Bubble:** Playback scrubbers, time remaining, and custom speed toggles.
- **Real File & Document Picker:** Share `.ts`, `.py`, `.json`, `.pdf`, `.zip`, `.tar.gz`, `.csv` with auto-colored filetype badges and one-click download.
- **Device Image Picker & Review:** Photo selection with pre-send caption composer and fullscreen lightbox viewer with zoom actions.
- **Dev-Centric Emoji Drawer:** Quick access to standard emojis plus developer essentials (`🚀`, `🐛`, `⚡`, `🔒`, `📦`, `🐙`, `🛠️`, `💻`).

### 5. Calls & Desktop Pair Programming
- **Start Call Bottom Sheet:** 1-tap selection between **Voice Session**, **Video Call**, and **Pair Programming**.
- **Voice Sessions:** Minimalist caller avatar, mono call timer, pulsing audio waveform bars, and speaker toggles.
- **Video Calling:** Mobile-first video stage with remote full-screen tile, picture-in-picture self-view, and mute/camera controls.
- **Desktop Pair Programming (1024px+):**
  - **Screen Size Guard:** Mobile viewports display a responsive guidance modal explaining screen real estate requirements, with a **"Copy link to open on desktop"** button.
  - **Pair Studio:** Top bar with repository context and timer; left 360px video sidebar; right pane with an integrated shared code editor, file tabs, and live editor presence tags.

### 6. Notifications & Global Search
- **Notifications Center:** Filter by **All**, **Mentions**, and **Reviews**. Unread accent dots, amber alerts for burned vault events, and **Mark all read** action.
- **Universal Search Modal:** Instant fuzzy search across conversation titles, contacts, and message contents.

### 7. Brand Identity & Splash Screen
- **The Ack Mark:** A primary `#8B7CFF` violet check with an offset `#4E4485` echo check, symbolizing *"a message sent, then acknowledged"*.
- **3-Phase Animated Splash Screen:**
  - `1 · Sent` (0–300 ms): Echo check fades in.
  - `2 · Delivered` (300–650 ms): Main check draws in over the echo.
  - `3 · Acknowledged` (650–1100 ms): Bold **Ack** wordmark and *"Got it."* tagline appear, then smoothly transition into Home.
- **PWA Ready:** Vector favicons, web manifest, touch icons (`192x192` & `512x512`), and service worker offline caching.

---

## 🚧 Roadmap: What We Don't Have Yet (`In Progress & Planned`)

While the frontend experience, developer workflows, and local zero-trust cryptography are complete, the following cloud, backend, and native features are planned for upcoming releases:

| Feature Area | Status | Target Specification |
| :--- | :---: | :--- |
| **Cloud WebSocket Mesh** | 🚧 In Progress | Distributed WebSocket server (Node.js/Go) for cross-device real-time sync replacing the local demo state engine. |
| **WebRTC Multi-Peer Mesh** | 🚧 In Progress | Turn/Stun server infrastructure to relay live video and pair programming canvas across remote machines without third-party services. |
| **Live GitHub App Webhook Relay** | 📅 Planned | Serverless webhook endpoint to automatically pipe live GitHub PR comments, commit pushes, and CI action failures directly into linked repo rooms. |
| **Passkey / Hardware Security Key Auth** | 📅 Planned | FIDO2 / WebAuthn passkey authentication to derive AES encryption keys directly from your YubiKey or Touch ID. |
| **Terminal CLI Tool (`ack-cli`)** | 📅 Planned | Send encrypted secrets (`ack vault send --burn`), trigger PR reviews (`ack review pr#42`), or notify rooms from CI workflows. |
| **Native App Shells** | 📅 Planned | Tauri / Electron wrapper for macOS/Linux/Windows and Capacitor wrapper for iOS and Android app stores. |
| **End-to-End Key Exchange (Double Ratchet)** | 📅 Planned | Signal protocol-style double ratchet key agreement for asynchronous offline messaging between multiple devices. |

---

## 🎨 Design System & Color Tokens

Ack uses a bespoke dark theme inspired by code editors and dark interfaces:

| Token Name | Hex Code | Visual Application |
| :--- | :--- | :--- |
| `--ack-bg` | `#0B0B0D` | Master background / canvas |
| `--ack-surface` | `#131316` | Sidebar panes, input containers, modal bodies |
| `--ack-surface-2` | `#17171B` | Secondary cards, hovered list items, docks |
| `--ack-border` | `#26262B` | Subtle panel dividers and input borders |
| `--ack-accent` | `#8B7CFF` | Primary action buttons, active checks, links |
| `--ack-accent-text` | `#A99DFF` | Secondary accents, tags, and highlights |
| `--ack-accent-tint` | `#272250` | Active selected chips and message highlights |
| `--ack-echo` | `#4E4485` | Behind-the-check brand echo mark |
| `--ack-text` | `#ECECEF` | High-contrast body typography |
| `--ack-muted` | `#9A9AA3` | Subtitles, timestamps, and placeholder labels |
| `--ack-success` | `#30D158` | Passing CI builds, online presence indicators |
| `--ack-warning` | `#FFD60A` | Pending PR reviews, amber notification dots |
| `--ack-danger` | `#FF453A` | Burned secrets, failed messages, destructive actions |

---

## 🏛️ Architecture & Directory Layout

```
WhatsDev/
├── public/
│   ├── favicon.svg             # Clean 32x32 Ack check & echo favicon
│   ├── icon-192.svg            # 192x192 Web manifest & touch icon
│   ├── icon-512.svg            # 512x512 Master squircle brand icon
│   ├── manifest.json           # PWA standalone manifest configuration
│   └── sw.js                   # Service worker for offline asset caching
├── src/
│   ├── components/
│   │   ├── calls/
│   │   │   └── StartCallSheet.tsx          # Voice / Video / Pair programming selector
│   │   ├── chat/
│   │   │   ├── BurnedSecretModal.tsx       # "Secret burned" warning dialog
│   │   │   ├── ChatList.tsx                # Conversations pane & bottom navigation
│   │   │   ├── ChatView.tsx                # Message stream, composer, and diff inspector
│   │   │   ├── CodeReviewDrawer.tsx        # In-chat pull request diff & review studio
│   │   │   ├── CreateGroupModal.tsx        # 2-step group & repository setup wizard
│   │   │   ├── GroupInfoModal.tsx          # Team members & linked repo overview
│   │   │   ├── NewChatModal.tsx            # Contact picker & quick actions
│   │   │   ├── NotificationsModal.tsx      # Filterable notification center
│   │   │   ├── SearchModal.tsx             # Universal fuzzy search
│   │   │   ├── SettingsModal.tsx           # Profile, encryption keys, and appearance
│   │   │   └── SignInModal.tsx             # GitHub / Email developer auth
│   │   ├── whatsapp/                       # Specialized chat bubbles (code, images, docs)
│   │   ├── AudioWaveBubble.tsx             # Audio voice note player
│   │   ├── CreateCodeModal.tsx             # Syntax-highlighted snippet creator
│   │   ├── CreateVaultModal.tsx            # Ephemeral .env secret creator
│   │   ├── SplashScreen.tsx                # 3-phase animated startup splash
│   │   └── VideoCallOverlay.tsx            # Audio, video & pair programming workspace
│   ├── theme/
│   │   ├── ack.css                         # Ack design tokens & animations
│   │   └── colors.ts                       # Typed CSS variable bindings
│   ├── utils/
│   │   └── crypto.ts                       # WebCrypto AES-GCM-256 client cipher
│   ├── web-db/
│   │   └── store.ts                        # Reactive store with localStorage sync
│   ├── App.tsx                             # Master single-pane / split-pane shell
│   ├── index.css                           # Global resets, scrollbars & typography
│   └── main.tsx                            # React 19 entrypoint
├── index.html                              # HTML5 container & font declarations
├── package.json                            # Dependencies, build scripts & metadata
├── tsconfig.json                           # TypeScript compiler rules
└── vite.config.ts                          # Vite 8 bundling & dev server settings
```

---

## 🔒 Security Architecture: Zero-Trust by Design

Ack treats privacy as a non-negotiable engineering primitive:

1. **Client-Side Key Derivation:** Every secret created in a Vault message is encrypted using an ephemeral `AES-GCM` 256-bit key generated via `window.crypto.subtle`.
2. **In-Browser Decryption:** The ciphertext is only decrypted in memory when an authorized recipient renders the secret card.
3. **Guaranteed Local Shredding:** Tapping **"Copy & Burn"** copies the plaintext to the clipboard, scrubs the memory reference, replaces the stored record with a burned marker, and dispatches a purge event across connected tabs.
4. **No Server-Side Plaintext:** When cloud relays are enabled, the server only ever handles encrypted ciphertext payloads.

---

## 🛠️ Local Development & Quickstart

### Prerequisites
- **Node.js** `>= 18.0.0` (Node 20+ recommended)
- **npm** or **pnpm**

### 1. Clone & Install
```bash
git clone https://github.com/kingenious0/ProjectACK.git
cd ProjectACK
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` (or the port output by Vite).

### 3. Production Build
```bash
npm run build
```
Compiles TypeScript and outputs an optimized bundle to `dist/` with zero type errors.

---

## 🤝 Contributing

We welcome contributions from engineers who care deeply about developer experience, privacy, and performance:

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes with conventional commits (`git commit -m "feat: add keyboard shortcut for review comments"`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

Developed with ❤️ for developers who ship.
