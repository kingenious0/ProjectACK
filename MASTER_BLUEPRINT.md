# MASTER ENGINEERING BLUEPRINT: ACK (The Developer Messenger)
**Project Codename:** Project ACK  
**Target Audience:** Software Engineers, Indie Hackers, CS Students, and Tech Teams  
**Platforms:** Android (Play Store via Bare React Native), Desktop/Web (Tauri / Next.js)

---

## 1. DESIGN SYSTEM & COLOR SCHEME (Obsidian & Cyber-Emerald)
To avoid any trademark or Play Store rejection issues with WhatsApp's signature green (`#25D366`), ACK uses a high-contrast developer theme inspired by custom VS Code dark themes and terminal aesthetics.

- **Background (App Canvas):** `#0B0F12` (Deep Obsidian / Void Black)
- **Surface / Cards / Input Bars:** `#131B22` (Dark Slate Gray)
- **Primary Accent (Cyber Emerald):** `#00FF66` (Terminal Green — active states, primary buttons, sent ticks)
- **Secondary Accent (Dev Gold / Amber):** `#FFB800` (.env vaults, warnings, code-tag badges)
- **Text Primary (High Contrast):** `#F0F6FC`
- **Text Muted / Timestamps:** `#8B949E`
- **Bubble Sent (User):** `#003B1F` (Dark Emerald tint with `#00FF66` border stroke)
- **Bubble Received (Peer):** `#161B22` (Dark Slate)
- **Border / Divider:** `#30363D`
- **Code Block Background:** `#090D10`
- **Syntax Keyword:** `#FF7B72`
- **Syntax String:** `#A5D6FF`
- **Syntax Function / Identifier:** `#7EE787`

---

## 2. PRODUCT REQUIREMENTS DOCUMENT (PRD)

### 2.1 Feature Breakdown & User Scenarios

#### Scenario 1: Code Sharing & Line-by-Line Review
- **User Flow:** User copies a snippet or git diff, opens an ACK chat, and taps the `</>` code icon. The app formats it in a dark-mode syntax block with line numbers.
- **Edge Case:** Very long code blocks auto-collapse after 15 lines with a "Show More" expansion toggle. Tapping any line number opens an inline reply thread specific to that code line.

#### Scenario 2: Burn-After-Reading .env Vault
- **User Flow:** User taps the lock icon in the chat bar, pastes secret API keys or database connection strings, and sets an optional read-timer.
- **Edge Case:** Once the recipient taps "Copy All", the UI instantly masks the text with asterisks and triggers an API call / local purge to wipe the payload from the relay server permanently.

#### Scenario 3: Repo-Linked Team Chat
- **User Flow:** Admin links a group chat to a GitHub repository (`org/repo`). Whenever a PR is opened or a build fails, an interactive card drops into the chat with action buttons (`[View PR]`, `[Trigger Rebuild]`).

---

## 3. TECHNICAL REQUIREMENTS DOCUMENT (TRD)

### 3.1 Stack Architecture
- **Mobile Runtime:** React Native (Bare CLI) — eliminates Expo build limits, allows local Gradle compilation (`npx react-native run-android`).
- **Local Storage Engine:** `op-sqlite` (Synchronous C++ bindings for SQLite on Android/iOS; handles 100k+ messages with zero frame drops).
- **Real-Time Transport Layer:** Supabase Realtime (WebSocket Broadcast & Postgres Changes) acting strictly as an ephemeral message relay (messages are deleted from cloud DB as soon as device ACKs receipt).
- **Encryption Layer:** WebCrypto / AES-GCM for client-side .env secret encryption.

### 3.2 Local Database Schema (op-sqlite SQL DDL)
```sql
-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    github_username TEXT UNIQUE NOT NULL,
    phone_number TEXT UNIQUE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    status_message TEXT,
    last_seen TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chats Table (DMs, Groups, Channels)
CREATE TABLE IF NOT EXISTS chats (
    id TEXT PRIMARY KEY,
    type TEXT CHECK(type IN ('dm', 'group', 'channel', 'webhook')) NOT NULL,
    title TEXT,
    avatar_url TEXT,
    repo_webhook_secret TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat Participants Junction Table
CREATE TABLE IF NOT EXISTS chat_members (
    chat_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'member')) DEFAULT 'member',
    PRIMARY KEY (chat_id, user_id),
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Messages Table (The Core Message Store)
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT CHECK(message_type IN ('text', 'code', 'env_secret', 'system', 'media')) DEFAULT 'text',
    status TEXT CHECK(status IN ('pending', 'sent', 'delivered', 'read')) DEFAULT 'pending',
    quoted_message_id TEXT,
    metadata TEXT, -- JSON string for extra payload (e.g., code language, diff stats)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (quoted_message_id) REFERENCES messages(id) ON DELETE SET NULL
);

-- Dev Status Table (24h Ship Logs)
CREATE TABLE IF NOT EXISTS status_posts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    media_url TEXT,
    caption TEXT,
    preview_url TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 4. SYSTEM WORKFLOWS (ASCII Sequence)

### 4.1 Message Delivery & Real-Time Relay Workflow
```text
[ Sender Device ]                        [ Supabase Relay WS ]                [ Recipient Device ]
       |                                          |                                    |
       |-- 1. Save to local SQLite (Pending) ---->|                                    |
       |-- 2. Broadcast via WebSockets ---------->|                                    |
       |                                          |-- 3. Push to online peer --------->|
       |                                          |                                    |-- 4. Save to local SQLite
       |                                          |<-- 5. Send 'Delivered' ACK --------|-- 6. Render 2 Gray Ticks
       |<-- 7. Update status to 'Delivered' ------|
```

---

## 5. DEVELOPMENT PHASES & MILESTONES

### Phase 1: Core Foundation & Local DB (Weeks 1–2)
- Initialize React Native Bare CLI project structure.
- Configure `op-sqlite` and run the DDL migration scripts.
- Build the local state machine for optimistic UI message rendering (instant display with pending clock icon).

### Phase 2: Auth & Contact Discovery (Week 3)
- Integrate GitHub OAuth via Supabase Auth.
- Implement phone number hashing and local phonebook contact synchronization.
- Build the main chat list UI and 4-tab bottom navigation using the Obsidian & Cyber-Emerald color palette.

### Phase 3: Developer Superpower Bubbles (Weeks 4–5)
- Integrate syntax highlighting engines for code blocks (`message_type = 'code'`).
- Build line-item reply threading.
- Implement client-side AES encryption/decryption for burn-after-reading .env vaults.

### Phase 4: Ship Status, Webhooks & Polish (Week 6)
- Build the 24-hour Dev Ship Log status viewer.
- Implement incoming GitHub repo webhook endpoints (`/api/hook/:chatId`).
- Performance profiling, APK generation via local Gradle, and Play Store release preparation.
