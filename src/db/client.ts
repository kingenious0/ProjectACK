/**
 * Project ACK: Database Engine Client
 * Powered by @op-engineering/op-sqlite with graceful fallback
 */

import { DDL_STATEMENTS } from './schema';
import {
  UserRow,
  ChatRow,
  ChatMemberRow,
  MessageRow,
  StatusPostRow,
  HydratedChat,
  HydratedMessage,
  MessageStatus,
  MessageType,
  MessageMetadata,
} from './types';

export const CURRENT_USER_ID = 'usr_current_dev';

interface QueryResult<T = any> {
  rows: T[];
  rowsAffected: number;
  insertId?: number;
}

class DatabaseManager {
  private nativeDb: any = null;
  private isNative: boolean = false;
  private isInitialized: boolean = false;

  // In-memory fallback stores when native C++ SQLite is not yet linked
  private memoryStore = {
    users: new Map<string, UserRow>(),
    chats: new Map<string, ChatRow>(),
    chat_members: [] as ChatMemberRow[],
    messages: new Map<string, MessageRow>(),
    status_posts: new Map<string, StatusPostRow>(),
  };

  constructor() {
    this.tryInitNative();
  }

  private tryInitNative() {
    try {
      // Dynamic import / require of op-sqlite
      const opSqlite = require('@op-engineering/op-sqlite');
      if (opSqlite && typeof opSqlite.open === 'function') {
        this.nativeDb = opSqlite.open({ name: 'ack_messenger.db' });
        this.isNative = true;
        console.log('[ACK DB] op-sqlite C++ native engine successfully attached.');
      }
    } catch (e: any) {
      console.warn(
        '[ACK DB] op-sqlite native module not linked yet (e.g. running in JS/Dev mode before Gradle build). Using memory fallback.',
        e?.message
      );
      this.isNative = false;
    }
  }

  public getIsNative(): boolean {
    return this.isNative;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    if (this.isNative && this.nativeDb) {
      try {
        for (const statement of DDL_STATEMENTS) {
          if (this.nativeDb.executeSync) {
            this.nativeDb.executeSync(statement);
          } else if (this.nativeDb.execute) {
            await this.nativeDb.execute(statement);
          }
        }
        console.log('[ACK DB] All DDL statements executed successfully on op-sqlite.');
      } catch (err) {
        console.error('[ACK DB] Failed to execute DDL on native op-sqlite:', err);
      }
    } else {
      console.log('[ACK DB] Initialized memory fallback database tables.');
    }

    await this.seedInitialDataIfEmpty();
    this.isInitialized = true;
  }

  public execute(sql: string, params: any[] = []): QueryResult {
    if (this.isNative && this.nativeDb) {
      try {
        if (this.nativeDb.executeSync) {
          const res = this.nativeDb.executeSync(sql, params);
          return {
            rows: res.rows?._array || res.rows || [],
            rowsAffected: res.rowsAffected || 0,
            insertId: res.insertId,
          };
        }
      } catch (err) {
        console.error('[ACK DB] Native execute error:', err, 'SQL:', sql);
      }
    }

    // Memory store fallback
    return { rows: [], rowsAffected: 0 };
  }

  // Domain Queries
  public async getUsers(): Promise<UserRow[]> {
    if (this.isNative && this.nativeDb) {
      const res = this.execute('SELECT * FROM users ORDER BY display_name ASC');
      if (res.rows.length > 0) return res.rows;
    }
    return Array.from(this.memoryStore.users.values());
  }

  public async getChats(): Promise<HydratedChat[]> {
    const chats: ChatRow[] = [];
    if (this.isNative && this.nativeDb) {
      const res = this.execute('SELECT * FROM chats ORDER BY updated_at DESC');
      if (res.rows.length > 0) {
        chats.push(...res.rows);
      }
    }

    if (chats.length === 0) {
      chats.push(...Array.from(this.memoryStore.chats.values()));
    }

    // Hydrate each chat with last message, peer, and unread count
    const hydrated: HydratedChat[] = [];
    for (const chat of chats) {
      const lastMsg = await this.getLastMessageForChat(chat.id);
      let peerUser: UserRow | undefined;

      if (chat.type === 'dm') {
        const peerId = await this.getDmPeerId(chat.id, CURRENT_USER_ID);
        if (peerId) {
          peerUser = await this.getUserById(peerId);
        }
      }

      hydrated.push({
        ...chat,
        lastMessage: lastMsg || undefined,
        peerUser,
        unreadCount: lastMsg && lastMsg.sender_id !== CURRENT_USER_ID && lastMsg.status !== 'read' ? 1 : 0,
      });
    }

    return hydrated;
  }

  public async getMessages(chatId: string): Promise<HydratedMessage[]> {
    const rawMessages: MessageRow[] = [];

    if (this.isNative && this.nativeDb) {
      const res = this.execute(
        'SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC',
        [chatId]
      );
      if (res.rows.length > 0) {
        rawMessages.push(...res.rows);
      }
    }

    if (rawMessages.length === 0) {
      const memList = Array.from(this.memoryStore.messages.values())
        .filter((m) => m.chat_id === chatId)
        .sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
      rawMessages.push(...memList);
    }

    const hydrated: HydratedMessage[] = [];
    for (const msg of rawMessages) {
      let parsedMetadata: MessageMetadata | undefined;
      if (msg.metadata) {
        try {
          parsedMetadata = JSON.parse(msg.metadata);
        } catch {
          parsedMetadata = undefined;
        }
      }

      const sender = await this.getUserById(msg.sender_id);
      hydrated.push({
        ...msg,
        metadataParsed: parsedMetadata,
        sender: sender || undefined,
      });
    }

    return hydrated;
  }

  public async sendMessage(params: {
    chatId: string;
    senderId: string;
    content: string;
    messageType?: MessageType;
    metadata?: MessageMetadata;
    quotedMessageId?: string;
  }): Promise<HydratedMessage> {
    const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const type: MessageType = params.messageType || 'text';
    const metadataStr = params.metadata ? JSON.stringify(params.metadata) : null;

    const newMsg: MessageRow = {
      id,
      chat_id: params.chatId,
      sender_id: params.senderId,
      content: params.content,
      message_type: type,
      status: 'pending', // Optimistic UI: starts pending with clock icon
      quoted_message_id: params.quotedMessageId || null,
      metadata: metadataStr,
      created_at: now,
    };

    if (this.isNative && this.nativeDb) {
      this.execute(
        `INSERT INTO messages (id, chat_id, sender_id, content, message_type, status, quoted_message_id, metadata, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newMsg.id,
          newMsg.chat_id,
          newMsg.sender_id,
          newMsg.content,
          newMsg.message_type,
          newMsg.status,
          newMsg.quoted_message_id,
          newMsg.metadata,
          newMsg.created_at,
        ]
      );
      this.execute(`UPDATE chats SET updated_at = ? WHERE id = ?`, [now, params.chatId]);
    }

    // Always update memory store
    this.memoryStore.messages.set(id, newMsg);
    const existingChat = this.memoryStore.chats.get(params.chatId);
    if (existingChat) {
      existingChat.updated_at = now;
      this.memoryStore.chats.set(params.chatId, existingChat);
    }

    const sender = await this.getUserById(params.senderId);

    // Simulate real-time ACK sequence from blueprint:
    // 1. Pending (Clock) -> 2. Sent (1 Gray Tick) after 400ms -> 3. Delivered (2 Gray Ticks) after 900ms -> 4. Read (2 Cyber-Emerald Ticks) after 2000ms
    this.simulateRelayAckWorkflow(id);

    return {
      ...newMsg,
      metadataParsed: params.metadata,
      sender: sender || undefined,
    };
  }

  public updateMessageStatus(messageId: string, status: MessageStatus) {
    if (this.isNative && this.nativeDb) {
      this.execute(`UPDATE messages SET status = ? WHERE id = ?`, [status, messageId]);
    }
    const memMsg = this.memoryStore.messages.get(messageId);
    if (memMsg) {
      memMsg.status = status;
      this.memoryStore.messages.set(messageId, memMsg);
    }
  }

  public burnEnvSecret(messageId: string) {
    const msg = this.memoryStore.messages.get(messageId);
    if (msg) {
      msg.content = '**************************************** [BURNED]';
      const meta: MessageMetadata = msg.metadata ? JSON.parse(msg.metadata) : {};
      meta.isBurned = true;
      msg.metadata = JSON.stringify(meta);
      this.memoryStore.messages.set(messageId, msg);

      if (this.isNative && this.nativeDb) {
        this.execute(
          `UPDATE messages SET content = ?, metadata = ? WHERE id = ?`,
          [msg.content, msg.metadata, messageId]
        );
      }
    }
  }

  public async getStatusPosts(): Promise<(StatusPostRow & { user?: UserRow })[]> {
    const posts: StatusPostRow[] = [];
    if (this.isNative && this.nativeDb) {
      const res = this.execute('SELECT * FROM status_posts ORDER BY created_at DESC');
      if (res.rows.length > 0) posts.push(...res.rows);
    }
    if (posts.length === 0) {
      posts.push(...Array.from(this.memoryStore.status_posts.values()));
    }

    const hydrated: (StatusPostRow & { user?: UserRow })[] = [];
    for (const post of posts) {
      const user = await this.getUserById(post.user_id);
      hydrated.push({ ...post, user: user || undefined });
    }
    return hydrated;
  }

  public async getUserById(userId: string): Promise<UserRow | undefined> {
    if (this.isNative && this.nativeDb) {
      const res = this.execute('SELECT * FROM users WHERE id = ?', [userId]);
      if (res.rows.length > 0) return res.rows[0];
    }
    return this.memoryStore.users.get(userId);
  }

  private async getLastMessageForChat(chatId: string): Promise<HydratedMessage | null> {
    if (this.isNative && this.nativeDb) {
      const res = this.execute(
        'SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at DESC LIMIT 1',
        [chatId]
      );
      if (res.rows.length > 0) {
        const raw = res.rows[0];
        let meta;
        try {
          meta = raw.metadata ? JSON.parse(raw.metadata) : undefined;
        } catch {
          meta = undefined;
        }
        return { ...raw, metadataParsed: meta };
      }
    }

    const memList = Array.from(this.memoryStore.messages.values())
      .filter((m) => m.chat_id === chatId)
      .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    if (memList.length > 0) {
      const raw = memList[0];
      let meta;
      try {
        meta = raw.metadata ? JSON.parse(raw.metadata) : undefined;
      } catch {
        meta = undefined;
      }
      return { ...raw, metadataParsed: meta };
    }
    return null;
  }

  private async getDmPeerId(chatId: string, currentUserId: string): Promise<string | null> {
    if (this.isNative && this.nativeDb) {
      const res = this.execute(
        'SELECT user_id FROM chat_members WHERE chat_id = ? AND user_id != ? LIMIT 1',
        [chatId, currentUserId]
      );
      if (res.rows.length > 0) return res.rows[0].user_id;
    }

    const member = this.memoryStore.chat_members.find(
      (m) => m.chat_id === chatId && m.user_id !== currentUserId
    );
    return member ? member.user_id : null;
  }

  private simulateRelayAckWorkflow(messageId: string) {
    // 1. Pending (Clock) is immediate
    setTimeout(() => {
      this.updateMessageStatus(messageId, 'sent');
    }, 450);

    setTimeout(() => {
      this.updateMessageStatus(messageId, 'delivered');
    }, 1100);

    setTimeout(() => {
      this.updateMessageStatus(messageId, 'read');
    }, 2400);
  }

  private async seedInitialDataIfEmpty() {
    // Check if we need to seed
    const users = await this.getUsers();
    if (users.length > 0) return;

    console.log('[ACK DB] Seeding initial developer workspace data...');

    // 1. Seed Current User & Teammates
    const sampleUsers: UserRow[] = [
      {
        id: CURRENT_USER_ID,
        github_username: 'octocat_dev',
        phone_number: '+15550192834',
        display_name: 'Alex (You)',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        status_message: 'shipping v2.4 kernel patch 🚀',
        last_seen: new Date().toISOString(),
      },
      {
        id: 'usr_dan_fe',
        github_username: 'dan_react',
        phone_number: '+15550192835',
        display_name: 'Dan (Frontend Lead)',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        status_message: 'reviewing line 42 diffs',
        last_seen: new Date().toISOString(),
      },
      {
        id: 'usr_sarah_infra',
        github_username: 'sarah_cloud',
        phone_number: '+15550192836',
        display_name: 'Sarah (Infra & SRE)',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        status_message: 'Kube ingress healthy at 99.99%',
        last_seen: new Date().toISOString(),
      },
      {
        id: 'usr_bot_github',
        github_username: 'ack-github-bot',
        phone_number: null,
        display_name: 'GitHub CI Bot',
        avatar_url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
        status_message: 'Listening on /api/hook/:chatId',
        last_seen: new Date().toISOString(),
      },
    ];

    for (const u of sampleUsers) {
      this.memoryStore.users.set(u.id, u);
      if (this.isNative && this.nativeDb) {
        this.execute(
          `INSERT OR IGNORE INTO users (id, github_username, phone_number, display_name, avatar_url, status_message, last_seen)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [u.id, u.github_username, u.phone_number, u.display_name, u.avatar_url, u.status_message, u.last_seen]
        );
      }
    }

    // 2. Seed Chats
    const sampleChats: ChatRow[] = [
      {
        id: 'chat_dm_dan',
        type: 'dm',
        title: 'Dan (Frontend Lead)',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        repo_webhook_secret: null,
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'chat_group_infra',
        type: 'group',
        title: 'prod-cluster-infra ⚡',
        avatar_url: null,
        repo_webhook_secret: 'whsec_9876543210',
        created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
        updated_at: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: 'chat_channel_repo',
        type: 'webhook',
        title: 'github: ack-messenger/core',
        avatar_url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
        repo_webhook_secret: 'whsec_github_repo_webhook_secret',
        created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ];

    for (const c of sampleChats) {
      this.memoryStore.chats.set(c.id, c);
      if (this.isNative && this.nativeDb) {
        this.execute(
          `INSERT OR IGNORE INTO chats (id, type, title, avatar_url, repo_webhook_secret, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [c.id, c.type, c.title, c.avatar_url, c.repo_webhook_secret, c.created_at, c.updated_at]
        );
      }
    }

    // 3. Seed Chat Members
    const members: ChatMemberRow[] = [
      { chat_id: 'chat_dm_dan', user_id: CURRENT_USER_ID, role: 'member' },
      { chat_id: 'chat_dm_dan', user_id: 'usr_dan_fe', role: 'member' },
      { chat_id: 'chat_group_infra', user_id: CURRENT_USER_ID, role: 'admin' },
      { chat_id: 'chat_group_infra', user_id: 'usr_dan_fe', role: 'member' },
      { chat_id: 'chat_group_infra', user_id: 'usr_sarah_infra', role: 'member' },
      { chat_id: 'chat_channel_repo', user_id: CURRENT_USER_ID, role: 'admin' },
      { chat_id: 'chat_channel_repo', user_id: 'usr_bot_github', role: 'member' },
    ];

    for (const m of members) {
      this.memoryStore.chat_members.push(m);
      if (this.isNative && this.nativeDb) {
        this.execute(
          `INSERT OR IGNORE INTO chat_members (chat_id, user_id, role) VALUES (?, ?, ?)`,
          [m.chat_id, m.user_id, m.role]
        );
      }
    }

    // 4. Seed Messages demonstrating all 3 core scenarios:
    // Scenario 1: Code sharing with line-by-line review
    // Scenario 2: Burn-after-reading .env vault
    // Scenario 3: Repo-linked interactive GitHub PR card
    const sampleMessages: MessageRow[] = [
      {
        id: 'msg_dan_1',
        chat_id: 'chat_dm_dan',
        sender_id: 'usr_dan_fe',
        content: 'Hey Alex, check out our SQLite connection logic in `op-sqlite`. Can you review line 8?',
        message_type: 'text',
        status: 'read',
        quoted_message_id: null,
        metadata: null,
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'msg_dan_code_snippet',
        chat_id: 'chat_dm_dan',
        sender_id: 'usr_dan_fe',
        content: `import { open } from '@op-engineering/op-sqlite';

export const db = open({ name: 'ack_messenger.db' });

export function executeBatchQueries(statements: string[]) {
  db.transaction((tx) => {
    for (const sql of statements) {
      tx.execute(sql);
    }
  });
}

// 100k+ messages benchmark test
export function benchmarkFetch(chatId: string) {
  const start = performance.now();
  const res = db.executeSync(
    'SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at DESC LIMIT 50',
    [chatId]
  );
  console.log(\`Fetched in \${performance.now() - start}ms\`);
  return res.rows;
}`,
        message_type: 'code',
        status: 'read',
        quoted_message_id: null,
        metadata: JSON.stringify({
          language: 'typescript',
          filename: 'db/batchQuery.ts',
          lineCount: 22,
        }),
        created_at: new Date(Date.now() - 3600000 * 2 + 60000).toISOString(),
      },
      {
        id: 'msg_my_code_reply',
        chat_id: 'chat_dm_dan',
        sender_id: CURRENT_USER_ID,
        content: 'On line 8, wrapping in an explicit batch transaction prevents disk sync thrashing. Looks super clean!',
        message_type: 'text',
        status: 'read',
        quoted_message_id: 'msg_dan_code_snippet',
        metadata: JSON.stringify({ targetLine: 8 }),
        created_at: new Date(Date.now() - 3600000 * 2 + 120000).toISOString(),
      },
      {
        id: 'msg_env_vault_test',
        chat_id: 'chat_dm_dan',
        sender_id: 'usr_dan_fe',
        content: `SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.s7f83ksd92837
DATABASE_URL=postgres://ack_admin:s3cr3t_p4ss@db.ack.internal:5432/ack_prod
AES_GCM_SECRET=4f8a9e2c6b1d0e5a9f3c7e1b8a5d2e0f`,
        message_type: 'env_secret',
        status: 'read',
        quoted_message_id: null,
        metadata: JSON.stringify({
          readTimerSeconds: 60,
          isBurned: false,
        }),
        created_at: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: 'msg_repo_pr_card',
        chat_id: 'chat_channel_repo',
        sender_id: 'usr_bot_github',
        content: 'Pull Request #142 opened by @octocat_dev',
        message_type: 'system',
        status: 'read',
        quoted_message_id: null,
        metadata: JSON.stringify({
          repoName: 'ack-messenger/core',
          prNumber: 142,
          prTitle: 'feat: op-sqlite C++ migration & line-by-line review',
          prStatus: 'open',
          actionUrl: 'https://github.com/ack-messenger/core/pull/142',
        }),
        created_at: new Date(Date.now() - 900000).toISOString(),
      },
    ];

    for (const msg of sampleMessages) {
      this.memoryStore.messages.set(msg.id, msg);
      if (this.isNative && this.nativeDb) {
        this.execute(
          `INSERT OR IGNORE INTO messages (id, chat_id, sender_id, content, message_type, status, quoted_message_id, metadata, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            msg.id,
            msg.chat_id,
            msg.sender_id,
            msg.content,
            msg.message_type,
            msg.status,
            msg.quoted_message_id,
            msg.metadata,
            msg.created_at,
          ]
        );
      }
    }

    // 5. Seed Status Posts (24h Ship Logs)
    const sampleShipLogs: StatusPostRow[] = [
      {
        id: 'ship_dan_1',
        user_id: 'usr_dan_fe',
        media_url: null,
        caption: '🚀 Shipped PR #142: Zero-latency op-sqlite bridge with 60fps scrolling on Android!',
        preview_url: 'https://github.com/ack-messenger/core/releases/tag/v2.4.0',
        expires_at: new Date(Date.now() + 3600000 * 20).toISOString(),
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: 'ship_sarah_1',
        user_id: 'usr_sarah_infra',
        media_url: null,
        caption: '🛡️ Automated ephemeral relay cleanup: Supabase messages wipe within 50ms of ACK',
        preview_url: 'https://grafana.ack.internal/d/relay-latency',
        expires_at: new Date(Date.now() + 3600000 * 16).toISOString(),
        created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
      },
      {
        id: 'ship_alex_1',
        user_id: CURRENT_USER_ID,
        media_url: null,
        caption: '✨ Obsidian & Cyber-Emerald color system integrated across all navigation tabs',
        preview_url: 'https://figma.com/@projectack/design-system',
        expires_at: new Date(Date.now() + 3600000 * 23).toISOString(),
        created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
      },
    ];

    for (const post of sampleShipLogs) {
      this.memoryStore.status_posts.set(post.id, post);
      if (this.isNative && this.nativeDb) {
        this.execute(
          `INSERT OR IGNORE INTO status_posts (id, user_id, media_url, caption, preview_url, expires_at, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [post.id, post.user_id, post.media_url, post.caption, post.preview_url, post.expires_at, post.created_at]
        );
      }
    }

    console.log('[ACK DB] Seeding completed successfully.');
  }
}

export const dbManager = new DatabaseManager();
export default dbManager;
