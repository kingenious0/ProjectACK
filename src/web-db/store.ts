/**
 * WhatsDev (Project ACK) Web Reactive Store
 * Local-First Message Store with persistent LocalStorage/IndexedDB backup
 */

import { encryptEnvSecret } from '../utils/crypto';

export interface DiffLine {
  type: 'normal' | 'add' | 'del';
  content: string;
  oldNo?: number;
  newNo?: number;
}

export interface DiffFile {
  filename: string;
  additions: number;
  deletions: number;
  lines: DiffLine[];
}

export interface MessageMetadata {
  language?: string;
  codeSnippet?: string;
  secretPayload?: any;
  secretMasked?: string;
  ttlSeconds?: number;
  isBurned?: boolean;
  prNumber?: number;
  prTitle?: string;
  prBranch?: string;
  prAdditions?: number;
  prDeletions?: number;
  diffFiles?: DiffFile[];
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  type: 'text' | 'code' | 'env_secret' | 'pr_card' | 'system';
  status: 'sent' | 'delivered' | 'read';
  timestamp: string;
  metadata?: MessageMetadata;
}

export interface Chat {
  id: string;
  name: string;
  type: 'dm' | 'group' | 'repo' | 'channel';
  avatar: string;
  repoTag?: string;
  isOnline?: boolean;
  unreadCount: number;
  lastMessage: string;
  lastTimestamp: string;
  isPinned?: boolean;
}

export interface ShipLog {
  id: string;
  author: string;
  authorAvatar: string;
  title: string;
  description: string;
  timestamp: string;
  tags: string[];
}

export const CURRENT_USER = {
  id: 'usr_me',
  name: 'Dev ACK (You)',
  handle: '@kinge',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

// Initial Seed Data
const INITIAL_CHATS: Chat[] = [
  {
    id: 'chat_torvalds_repo',
    name: 'linux-kernel / net-core',
    type: 'repo',
    avatar: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=150&auto=format&fit=crop&q=80',
    repoTag: 'torvalds/linux#v6.12-rc',
    isOnline: true,
    unreadCount: 2,
    lastMessage: 'PR #142: Zero-copy socket ring buffer ready for review',
    lastTimestamp: '10:42 AM',
    isPinned: true,
  },
  {
    id: 'chat_sarah_devops',
    name: 'Sarah Connor [Infra / SRE]',
    type: 'dm',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    repoTag: 'supabase-staging',
    isOnline: true,
    unreadCount: 1,
    lastMessage: '🔒 [Burn-After-Reading .env Vault] Staging DB credentials',
    lastTimestamp: '10:15 AM',
    isPinned: true,
  },
  {
    id: 'chat_core_team',
    name: 'Project ACK Core Team',
    type: 'group',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
    repoTag: 'project-ack/web',
    isOnline: true,
    unreadCount: 0,
    lastMessage: 'Vite PWA web build is running with 0ms cold starts!',
    lastTimestamp: 'Yesterday',
    isPinned: false,
  },
  {
    id: 'chat_indie_hackers',
    name: 'Indie Hackers Syndicate',
    type: 'channel',
    avatar: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=150&auto=format&fit=crop&q=80',
    repoTag: 'ship-everyday',
    isOnline: false,
    unreadCount: 0,
    lastMessage: 'Launched on Product Hunt: $2.4k MRR in 48 hours!',
    lastTimestamp: 'Wednesday',
    isPinned: false,
  },
  {
    id: 'chat_elena_secops',
    name: 'Elena Rostova [SecOps]',
    type: 'dm',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    repoTag: 'zero-trust',
    isOnline: false,
    unreadCount: 0,
    lastMessage: 'WebCrypto PBKDF2 salt verified against replay vectors.',
    lastTimestamp: 'Monday',
    isPinned: false,
  },
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
  chat_torvalds_repo: [
    {
      id: 'm_101',
      chatId: 'chat_torvalds_repo',
      senderId: 'usr_linus',
      senderName: 'Linus Torvalds',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      content: 'We refactored the socket poll descriptor table to avoid redundant mutex contention under high QPS. Check the snippet:',
      type: 'text',
      status: 'read',
      timestamp: '10:35 AM',
    },
    {
      id: 'm_102',
      chatId: 'chat_torvalds_repo',
      senderId: 'usr_linus',
      senderName: 'Linus Torvalds',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      content: 'Kernel Ring Buffer Implementation',
      type: 'code',
      status: 'read',
      timestamp: '10:36 AM',
      metadata: {
        language: 'rust',
        codeSnippet: `pub struct SocketRingBuffer<T, const CAP: usize> {
    head: AtomicUsize,
    tail: AtomicUsize,
    buffer: [UnsafeCell<MaybeUninit<T>>; CAP],
}

impl<T, const CAP: usize> SocketRingBuffer<T, CAP> {
    #[inline(always)]
    pub fn push_zero_copy(&self, item: T) -> Result<(), &'static str> {
        let head = self.head.load(Ordering::Acquire);
        let tail = self.tail.load(Ordering::Relaxed);
        if head.wrapping_sub(tail) >= CAP {
            return Err("E_RING_FULL");
        }
        unsafe {
            let slot = &mut *self.buffer[head % CAP].get();
            slot.write(item);
        }
        self.head.store(head.wrapping_add(1), Ordering::Release);
        Ok(())
    }
}`,
      },
    },
    {
      id: 'm_103',
      chatId: 'chat_torvalds_repo',
      senderId: 'usr_github_bot',
      senderName: 'GitHub Webhook [PR #142]',
      senderAvatar: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=150&auto=format&fit=crop&q=80',
      content: 'New Pull Request opened on torvalds/linux#v6.12-rc',
      type: 'pr_card',
      status: 'read',
      timestamp: '10:42 AM',
      metadata: {
        prNumber: 142,
        prTitle: 'net: Introduce Zero-Copy Socket Ring Buffer',
        prBranch: 'feat/ring-buffer-v2',
        prAdditions: 84,
        prDeletions: 12,
        diffFiles: [
          {
            filename: 'net/core/socket_ring.rs',
            additions: 46,
            deletions: 8,
            lines: [
              { type: 'normal', content: ' // net/core socket ring allocation', oldNo: 1, newNo: 1 },
              { type: 'del', content: '- let lock = self.global_mutex.lock();', oldNo: 2 },
              { type: 'add', content: '+ let head = self.head.load(Ordering::Acquire);', newNo: 2 },
              { type: 'add', content: '+ let tail = self.tail.load(Ordering::Relaxed);', newNo: 3 },
              { type: 'normal', content: ' if head.wrapping_sub(tail) >= CAP {', oldNo: 3, newNo: 4 },
              { type: 'normal', content: '     return Err("E_RING_FULL");', oldNo: 4, newNo: 5 },
              { type: 'normal', content: ' }', oldNo: 5, newNo: 6 },
            ],
          },
        ],
      },
    },
  ],
  chat_sarah_devops: [
    {
      id: 'm_201',
      chatId: 'chat_sarah_devops',
      senderId: 'usr_sarah',
      senderName: 'Sarah Connor',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      content: 'Hey! I rotated the Postgres DB credentials for staging. Sharing the connection string via our Burn-After-Reading Vault:',
      type: 'text',
      status: 'read',
      timestamp: '10:14 AM',
    },
    {
      id: 'm_202',
      chatId: 'chat_sarah_devops',
      senderId: 'usr_sarah',
      senderName: 'Sarah Connor',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      content: 'Staging Database Connection Secrets',
      type: 'env_secret',
      status: 'read',
      timestamp: '10:15 AM',
      metadata: {
        secretMasked: 'DATABASE_URL="postgres://postgres:k9#Xm$88Pz@db.ack-staging.supabase.co:5432/postgres"\nJWT_SECRET="super-secret-jwt-key-2026-xyz"\nREDIS_CACHE_URL="rediss://default:p33r@redis.ack.internal:6379"',
        ttlSeconds: 60,
        isBurned: false,
      },
    },
  ],
  chat_core_team: [
    {
      id: 'm_301',
      chatId: 'chat_core_team',
      senderId: 'usr_me',
      senderName: 'Dev ACK (You)',
      senderAvatar: CURRENT_USER.avatar,
      content: 'Pivoted our mobile app to a responsive WhatsApp Web PWA! Desktop has full multi-column layout, and mobile feels 100% native.',
      type: 'text',
      status: 'read',
      timestamp: 'Yesterday',
    },
  ],
};

const INITIAL_SHIP_LOGS: ShipLog[] = [
  {
    id: 'ship_1',
    author: 'Sarah Connor',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    title: 'Zero-Downtime DB Migration Complete',
    description: 'Swapped staging cluster to dedicated NVMe storage with 3x IOPS.',
    timestamp: '2h ago',
    tags: ['infra', 'supabase', 'postgres'],
  },
  {
    id: 'ship_2',
    author: 'Linus Torvalds',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'Merged v6.12 Socket Patch',
    description: 'Socket polling throughput increased by 28% across 100k persistent web connections.',
    timestamp: '5h ago',
    tags: ['kernel', 'rust', 'networking'],
  },
  {
    id: 'ship_3',
    author: 'Dev ACK (You)',
    authorAvatar: CURRENT_USER.avatar,
    title: 'WhatsDev Web App & PWA Launched',
    description: 'WhatsApp Web + Mobile PWA with Burn-After-Reading .env vaults and line-by-line PR reviews.',
    timestamp: 'Just now',
    tags: ['vite', 'react', 'pwa', 'cyber-emerald'],
  },
];

class WebStore {
  private chats: Chat[] = [];
  private messages: Record<string, Message[]> = {};
  private shipLogs: ShipLog[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const savedChats = localStorage.getItem('whatsdev_chats');
      const savedMessages = localStorage.getItem('whatsdev_messages');
      const savedShipLogs = localStorage.getItem('whatsdev_shiplogs');

      this.chats = savedChats ? JSON.parse(savedChats) : INITIAL_CHATS;
      this.messages = savedMessages ? JSON.parse(savedMessages) : INITIAL_MESSAGES;
      this.shipLogs = savedShipLogs ? JSON.parse(savedShipLogs) : INITIAL_SHIP_LOGS;
    } catch (e) {
      this.chats = INITIAL_CHATS;
      this.messages = INITIAL_MESSAGES;
      this.shipLogs = INITIAL_SHIP_LOGS;
    }
  }

  private persist() {
    try {
      localStorage.setItem('whatsdev_chats', JSON.stringify(this.chats));
      localStorage.setItem('whatsdev_messages', JSON.stringify(this.messages));
      localStorage.setItem('whatsdev_shiplogs', JSON.stringify(this.shipLogs));
    } catch (e) {
      console.warn('Storage persist failed', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // Getters
  public getChats(): Chat[] {
    return this.chats;
  }

  public getMessages(chatId: string): Message[] {
    return this.messages[chatId] || [];
  }

  public getShipLogs(): ShipLog[] {
    return this.shipLogs;
  }

  // Actions
  public sendMessage(chatId: string, content: string, type: Message['type'] = 'text', metadata?: MessageMetadata) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: Message = {
      id: 'm_' + Date.now(),
      chatId,
      senderId: CURRENT_USER.id,
      senderName: CURRENT_USER.name,
      senderAvatar: CURRENT_USER.avatar,
      content,
      type,
      status: 'read',
      timestamp: timeStr,
      metadata,
    };

    if (!this.messages[chatId]) {
      this.messages[chatId] = [];
    }
    this.messages[chatId].push(newMsg);

    // Update Chat last message
    const chat = this.chats.find((c) => c.id === chatId);
    if (chat) {
      chat.lastMessage = type === 'code' ? '💻 [Code Snippet]' : type === 'env_secret' ? '🔒 [Burn-After-Reading Vault]' : content;
      chat.lastTimestamp = timeStr;
    }

    this.persist();
    return newMsg;
  }

  public burnSecret(chatId: string, messageId: string) {
    const list = this.messages[chatId];
    if (!list) return;

    const msg = list.find((m) => m.id === messageId);
    if (msg && msg.metadata) {
      msg.metadata.isBurned = true;
      msg.metadata.secretMasked = '💥 [SECRET PERMANENTLY PURGED & BURNED FROM VAULT]';
      this.persist();
    }
  }

  public addShipLog(title: string, description: string, tags: string[]) {
    const newLog: ShipLog = {
      id: 'ship_' + Date.now(),
      author: CURRENT_USER.name,
      authorAvatar: CURRENT_USER.avatar,
      title,
      description,
      timestamp: 'Just now',
      tags,
    };
    this.shipLogs.unshift(newLog);
    this.persist();
  }
}

export const webStore = new WebStore();
