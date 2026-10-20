/**
 * Project ACK: Local Database Schema
 * op-sqlite Synchronous SQLite DDL Definition
 */

export const SCHEMA_VERSION = 1;

export const DDL_STATEMENTS = [
  // 1. Users Table
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    github_username TEXT UNIQUE NOT NULL,
    phone_number TEXT UNIQUE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    status_message TEXT,
    last_seen TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,

  // 2. Chats Table (DMs, Groups, Channels, Webhooks)
  `CREATE TABLE IF NOT EXISTS chats (
    id TEXT PRIMARY KEY,
    type TEXT CHECK(type IN ('dm', 'group', 'channel', 'webhook')) NOT NULL,
    title TEXT,
    avatar_url TEXT,
    repo_webhook_secret TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,

  // 3. Chat Participants Junction Table
  `CREATE TABLE IF NOT EXISTS chat_members (
    chat_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'member')) DEFAULT 'member',
    PRIMARY KEY (chat_id, user_id),
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );`,

  // 4. Messages Table (Core Message Store)
  `CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT CHECK(message_type IN ('text', 'code', 'env_secret', 'system', 'media')) DEFAULT 'text',
    status TEXT CHECK(status IN ('pending', 'sent', 'delivered', 'read')) DEFAULT 'pending',
    quoted_message_id TEXT,
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (quoted_message_id) REFERENCES messages(id) ON DELETE SET NULL
  );`,

  // 5. Dev Status Table (24h Ship Logs)
  `CREATE TABLE IF NOT EXISTS status_posts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    media_url TEXT,
    caption TEXT,
    preview_url TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );`,

  // Indexes for high performance querying
  `CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages (chat_id, created_at DESC);`,
  `CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages (sender_id);`,
  `CREATE INDEX IF NOT EXISTS idx_chat_members_user ON chat_members (user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_status_posts_expires ON status_posts (expires_at);`,
];
