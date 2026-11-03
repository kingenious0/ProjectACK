/**
 * ACK. (CHAT4DEVS) Web Reactive Store
 * Developer Messenger Store
 */

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
  accentColor?: string; // Snapchat signature vertical line color
  audioDuration?: string;
  waveform?: number[];
  audioUrl?: string;
  imageUrl?: string;
  imageCaption?: string;
  docName?: string;
  docSize?: string;
  docType?: string;
  docUrl?: string;
  reactions?: Record<string, string[]>;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  type: 'text' | 'code' | 'env_secret' | 'pr_card' | 'audio_note' | 'system' | 'image' | 'document';
  status: 'sent' | 'delivered' | 'read';
  timestamp: string;
  metadata?: MessageMetadata;
}

export interface Chat {
  id: string;
  name: string;
  username: string;
  type: 'dm' | 'group' | 'repo' | 'ai';
  avatar: string;
  statusIconType: 'chat' | 'code' | 'vault' | 'record';
  statusText: string;
  statusTime: string;
  unreadCount: number;
  isOnline?: boolean;
  isPinned?: boolean;
  repoTag?: string;
}

export interface SuggestedDev {
  id: string;
  name: string;
  username: string;
  avatar: string;
  tag: string;
  mutualCount: number;
  isOnline: boolean;
}

export interface ShipLog {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  tags: string[];
  author?: string;
  authorAvatar?: string;
}

export const CURRENT_USER = {
  id: 'usr_me',
  name: 'Dev ACK (You)',
  username: 'kinge_dev',
  handle: '@kinge',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

// Initial Snapchat-style Chat List
const INITIAL_CHATS: Chat[] = [
  {
    id: 'chat_my_ai',
    name: 'My AI Copilot',
    username: 'ack_ai_bot',
    type: 'ai',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    statusIconType: 'chat',
    statusText: 'New Chat',
    statusTime: '25m',
    unreadCount: 1,
    isOnline: true,
    isPinned: true,
  },
  {
    id: 'chat_robert_jonas',
    name: 'Robert Jonas',
    username: 'robertpageflows',
    type: 'dm',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    statusIconType: 'record',
    statusText: 'Screen recording',
    statusTime: '9m',
    unreadCount: 0,
    isOnline: true,
    isPinned: true,
  },
  {
    id: 'chat_torvalds_repo',
    name: 'linux-kernel / net-core',
    username: 'torvalds_linux',
    type: 'repo',
    avatar: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=150&auto=format&fit=crop&q=80',
    statusIconType: 'code',
    statusText: 'New PR Diff and Review',
    statusTime: '25m',
    unreadCount: 2,
    isOnline: true,
    isPinned: true,
    repoTag: 'torvalds/linux#v6.12-rc',
  },
  {
    id: 'chat_sarah_devops',
    name: 'Sarah Connor',
    username: 'sarah_infra',
    type: 'dm',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    statusIconType: 'vault',
    statusText: 'Burn-After-Reading .env Vault',
    statusTime: '1h',
    unreadCount: 1,
    isOnline: true,
    isPinned: false,
  },
  {
    id: 'chat_hardik',
    name: 'Hardik',
    username: 'hkothari1510',
    type: 'dm',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    statusIconType: 'chat',
    statusText: 'Opened chat',
    statusTime: '3h',
    unreadCount: 0,
    isOnline: true,
    isPinned: false,
  },
  {
    id: 'chat_project_ack',
    name: 'kingenious0 / ProjectACK',
    username: 'project_ack_repo',
    type: 'repo',
    avatar: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=150&auto=format&fit=crop&q=80',
    statusIconType: 'code',
    statusText: 'Release v2.0-rc live on main',
    statusTime: '4m',
    unreadCount: 3,
    isOnline: true,
    isPinned: true,
    repoTag: 'kingenious0/ProjectACK#main',
  },
  {
    id: 'chat_webhook_ci',
    name: '⚡ CI/CD Webhook Stream',
    username: 'webhook_dispatch',
    type: 'group',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    statusIconType: 'record',
    statusText: 'Vercel build: SUCCESS (2843376)',
    statusTime: 'Just now',
    unreadCount: 1,
    isOnline: true,
    isPinned: false,
  },
];

// Initial Quick Add Contacts (Matches Screenshots 4 & 5)
const INITIAL_SUGGESTIONS: SuggestedDev[] = [
  {
    id: 'dev_hardik',
    name: 'Hardik',
    username: 'hkothari1510',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    tag: 'Rust / Kernel',
    mutualCount: 14,
    isOnline: true,
  },
  {
    id: 'dev_mohit',
    name: 'Môhïț 🇬🇧',
    username: 'chhipa231044',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    tag: 'TypeScript / React',
    mutualCount: 8,
    isOnline: true,
  },
  {
    id: 'dev_rey',
    name: 'Rey Patel',
    username: 'rey_patel3277',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    tag: 'DevOps / Go',
    mutualCount: 23,
    isOnline: true,
  },
  {
    id: 'dev_aman',
    name: 'Aman 💤',
    username: 'a-kay126',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    tag: 'Fullstack',
    mutualCount: 5,
    isOnline: false,
  },
  {
    id: 'dev_rohan',
    name: 'Rohan 🔱',
    username: 'rohanbhonsle12',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    tag: 'AI / Python',
    mutualCount: 19,
    isOnline: true,
  },
  {
    id: 'dev_prince',
    name: 'PRINCE RRAI !!',
    username: 'princerrai',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    tag: 'Security / PGP',
    mutualCount: 12,
    isOnline: true,
  },
];

// Ephemeral Messages
const INITIAL_MESSAGES: Record<string, Message[]> = {
  chat_robert_jonas: [
    {
      id: 'm_rob_1',
      chatId: 'chat_robert_jonas',
      senderId: 'usr_me',
      senderName: 'ME',
      senderAvatar: CURRENT_USER.avatar,
      content: 'hi bob',
      type: 'text',
      status: 'read',
      timestamp: '9:41 AM',
      metadata: { accentColor: '#E91E63' }, // Snapchat Magenta vertical bar
    },
    {
      id: 'm_rob_2',
      chatId: 'chat_robert_jonas',
      senderId: 'usr_robert',
      senderName: 'ROBERT JONAS',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      content: 'Hey! Did you check out the zero-trust .env vault for staging?',
      type: 'text',
      status: 'read',
      timestamp: '9:42 AM',
      metadata: { accentColor: '#00A884' },
    },
    {
      id: 'm_rob_3',
      chatId: 'chat_robert_jonas',
      senderId: 'usr_robert',
      senderName: 'ROBERT JONAS',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      content: 'Voice note (0:18)',
      type: 'audio_note',
      status: 'read',
      timestamp: '9:43 AM',
      metadata: {
        accentColor: '#00A884',
        audioDuration: '0:18',
        waveform: [25, 45, 70, 90, 60, 40, 85, 100, 75, 50, 65, 80, 45, 90, 70, 35, 55, 85, 95, 60, 40, 30],
        reactions: { '👍': ['usr_me'] },
      },
    },
    {
      id: 'm_rob_4',
      chatId: 'chat_robert_jonas',
      senderId: 'usr_me',
      senderName: 'ME',
      senderAvatar: CURRENT_USER.avatar,
      content: 'Here is the staging UI architecture diagram we discussed!',
      type: 'image',
      status: 'read',
      timestamp: '9:45 AM',
      metadata: {
        accentColor: '#E91E63',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        imageCaption: 'Staging UI cluster & websocket gateway architecture 🚀',
        reactions: { '🔥': ['usr_robert'], '❤️': ['usr_me'] },
      },
    },
    {
      id: 'm_rob_5',
      chatId: 'chat_robert_jonas',
      senderId: 'usr_robert',
      senderName: 'ROBERT JONAS',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      content: 'Architecture-Specification-v2.pdf',
      type: 'document',
      status: 'read',
      timestamp: '9:46 AM',
      metadata: {
        accentColor: '#00A884',
        docName: 'Architecture-Specification-v2.pdf',
        docSize: '2.4 MB',
        docType: 'PDF',
        docUrl: '#',
        reactions: { '👏': ['usr_me'] },
      },
    },
  ],
  chat_my_ai: [
    {
      id: 'm_ai_1',
      chatId: 'chat_my_ai',
      senderId: 'usr_ai',
      senderName: 'MY AI',
      senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      content: 'Hello! I am your developer copilot. Ask me to generate regex, review git diffs, or encrypt secrets.',
      type: 'text',
      status: 'read',
      timestamp: '25m ago',
      metadata: { accentColor: '#5865F2' },
    },
  ],
  chat_torvalds_repo: [
    {
      id: 'm_101',
      chatId: 'chat_torvalds_repo',
      senderId: 'usr_linus',
      senderName: 'LINUS TORVALDS',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      content: 'We refactored the socket poll descriptor table to avoid redundant mutex contention under high QPS. Check the snippet:',
      type: 'text',
      status: 'read',
      timestamp: '10:35 AM',
      metadata: { accentColor: '#00FF66' },
    },
    {
      id: 'm_102',
      chatId: 'chat_torvalds_repo',
      senderId: 'usr_linus',
      senderName: 'LINUS TORVALDS',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      content: 'Kernel Ring Buffer Implementation',
      type: 'code',
      status: 'read',
      timestamp: '10:36 AM',
      metadata: {
        accentColor: '#00FF66',
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
      senderName: 'GITHUB WEBHOOK [PR #142]',
      senderAvatar: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=150&auto=format&fit=crop&q=80',
      content: 'New Pull Request opened on torvalds/linux#v6.12-rc',
      type: 'pr_card',
      status: 'read',
      timestamp: '10:42 AM',
      metadata: {
        accentColor: '#A371F7',
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
      senderName: 'SARAH CONNOR',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      content: 'Hey! I rotated the Postgres DB credentials for staging. Sharing the connection string via our Burn-After-Reading Vault:',
      type: 'text',
      status: 'read',
      timestamp: '10:14 AM',
      metadata: { accentColor: '#FFB800' },
    },
    {
      id: 'm_202',
      chatId: 'chat_sarah_devops',
      senderId: 'usr_sarah',
      senderName: 'SARAH CONNOR',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      content: 'Staging Database Connection Secrets',
      type: 'env_secret',
      status: 'read',
      timestamp: '10:15 AM',
      metadata: {
        accentColor: '#FFB800',
        secretMasked: 'DATABASE_URL="postgres://postgres:k9#Xm$88Pz@db.ack-staging.supabase.co:5432/postgres"\nJWT_SECRET="super-secret-jwt-key-2026-xyz"\nREDIS_CACHE_URL="rediss://default:p33r@redis.ack.internal:6379"',
        ttlSeconds: 60,
        isBurned: false,
      },
    },
  ],
  chat_project_ack: [
    {
      id: 'm_ack_1',
      chatId: 'chat_project_ack',
      senderId: 'usr_me',
      senderName: 'ME',
      senderAvatar: CURRENT_USER.avatar,
      content: 'Pushed commit 2843376 to origin main: Clean React 19 build & Cyberpunk tokens implemented.',
      type: 'text',
      status: 'read',
      timestamp: '11:15 AM',
      metadata: { accentColor: '#00FFCC' },
    },
    {
      id: 'm_ack_2',
      chatId: 'chat_project_ack',
      senderId: 'usr_github_bot',
      senderName: 'GITHUB CI/CD',
      senderAvatar: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=150&auto=format&fit=crop&q=80',
      content: 'Vercel Deployment: ProjectACK v2.0-rc',
      type: 'pr_card',
      status: 'read',
      timestamp: '11:16 AM',
      metadata: {
        accentColor: '#00E5FF',
        prNumber: 28,
        prTitle: 'Dev Control Center: Mobile-First Layout Architecture',
        prBranch: 'main',
        prAdditions: 340,
        prDeletions: 48,
        diffFiles: [
          {
            filename: 'src/components/whatsapp/WorkspaceDock.tsx',
            additions: 180,
            deletions: 0,
            lines: [
              { type: 'add', content: '+ export const WorkspaceDock: React.FC = () => {', newNo: 1 },
              { type: 'add', content: '+   return <nav className="wa-workspace-dock">...', newNo: 2 },
            ],
          },
        ],
      },
    },
  ],
  chat_webhook_ci: [
    {
      id: 'm_wh_1',
      chatId: 'chat_webhook_ci',
      senderId: 'usr_github_bot',
      senderName: 'VERCEL WEBHOOK [BUILD READY]',
      senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      content: '📦 Build succeeded in Washington, D.C., USA (East) – iad1 in 1.197s. Zero TypeScript errors. Live at https://ack-chat4devs.vercel.app',
      type: 'text',
      status: 'read',
      timestamp: 'Just now',
      metadata: { accentColor: '#00FFCC' },
    },
  ],
};

class WebStore {
  private chats: Chat[] = [];
  private messages: Record<string, Message[]> = {};
  private suggestions: SuggestedDev[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const savedChats = localStorage.getItem('ack_chats') || localStorage.getItem('whatsdev_snap_chats');
      const savedMessages = localStorage.getItem('ack_messages') || localStorage.getItem('whatsdev_snap_messages');
      const savedSuggestions = localStorage.getItem('ack_suggestions') || localStorage.getItem('whatsdev_snap_suggestions');

      if (savedChats) {
        const loaded: Chat[] = JSON.parse(savedChats);
        const missing = INITIAL_CHATS.filter((ic) => !loaded.some((lc) => lc.id === ic.id));
        this.chats = [...loaded, ...missing];
      } else {
        this.chats = INITIAL_CHATS;
      }

      if (savedMessages) {
        const loadedMsgs = JSON.parse(savedMessages);
        this.messages = { ...INITIAL_MESSAGES, ...loadedMsgs };
      } else {
        this.messages = INITIAL_MESSAGES;
      }

      this.suggestions = savedSuggestions ? JSON.parse(savedSuggestions) : INITIAL_SUGGESTIONS;

      // Ensure rich media demonstration messages are populated
      if (this.messages['chat_robert_jonas'] && !this.messages['chat_robert_jonas'].some((m: Message) => m.type === 'image')) {
        this.messages['chat_robert_jonas'] = INITIAL_MESSAGES.chat_robert_jonas;
      }
    } catch (e) {
      this.chats = INITIAL_CHATS;
      this.messages = INITIAL_MESSAGES;
      this.suggestions = INITIAL_SUGGESTIONS;
    }
  }

  private persist() {
    try {
      localStorage.setItem('ack_chats', JSON.stringify(this.chats));
      localStorage.setItem('ack_messages', JSON.stringify(this.messages));
      localStorage.setItem('ack_suggestions', JSON.stringify(this.suggestions));
    } catch (e) {
      console.warn('Storage persist failed', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
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

  public getSuggestions(): SuggestedDev[] {
    return this.suggestions;
  }

  // Actions
  public sendMessage(chatId: string, content: string, type: Message['type'] = 'text', metadata?: MessageMetadata) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: Message = {
      id: 'm_' + Date.now(),
      chatId,
      senderId: CURRENT_USER.id,
      senderName: 'ME',
      senderAvatar: CURRENT_USER.avatar,
      content,
      type,
      status: 'read',
      timestamp: timeStr,
      metadata: {
        accentColor: '#E91E63', // Snapchat signature magenta for current user
        ...metadata,
      },
    };

    if (!this.messages[chatId]) {
      this.messages[chatId] = [];
    }
    this.messages[chatId].push(newMsg);

    // Update Chat last message
    const chat = this.chats.find((c) => c.id === chatId);
    if (chat) {
      chat.statusText = type === 'code' ? 'Code snippet shared' : type === 'env_secret' ? 'Secret vault shared' : content;
      chat.statusTime = 'Just now';
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

  public addFriend(dev: SuggestedDev): Chat {
    // Check if chat already exists
    let chat = this.chats.find((c) => c.username === dev.username);
    if (!chat) {
      chat = {
        id: 'chat_' + dev.id,
        name: dev.name,
        username: dev.username,
        type: 'dm',
        avatar: dev.avatar,
        statusIconType: 'chat',
        statusText: 'New Collab Added',
        statusTime: 'Just now',
        unreadCount: 0,
        isOnline: dev.isOnline,
      };
      this.chats.unshift(chat);

      // Add welcome message
      this.messages[chat.id] = [
        {
          id: 'm_welcome_' + Date.now(),
          chatId: chat.id,
          senderId: dev.id,
          senderName: dev.name.toUpperCase(),
          senderAvatar: dev.avatar,
          content: `Hey @${CURRENT_USER.username}! Connected on ACK. (CHAT4DEVS). Ready to hack on ${dev.tag}?`,
          type: 'text',
          status: 'read',
          timestamp: 'Just now',
          metadata: { accentColor: '#00A884' },
        },
      ];
    }

    // Remove from suggestions
    this.suggestions = this.suggestions.filter((s) => s.id !== dev.id);
    this.persist();
    return chat;
  }

  public dismissSuggestion(devId: string) {
    this.suggestions = this.suggestions.filter((s) => s.id !== devId);
    this.persist();
  }

  public addReaction(chatId: string, messageId: string, emoji: string) {
    const list = this.messages[chatId];
    if (!list) return;
    const msg = list.find((m) => m.id === messageId);
    if (!msg) return;

    if (!msg.metadata) msg.metadata = {};
    if (!msg.metadata.reactions) msg.metadata.reactions = {};

    const users = msg.metadata.reactions[emoji] || [];
    const userIndex = users.indexOf(CURRENT_USER.id);

    if (userIndex > -1) {
      // Toggle off if already reacted
      users.splice(userIndex, 1);
      if (users.length === 0) {
        delete msg.metadata.reactions[emoji];
      } else {
        msg.metadata.reactions[emoji] = users;
      }
    } else {
      // Add reaction
      msg.metadata.reactions[emoji] = [...users, CURRENT_USER.id];
    }

    this.persist();
  }

  public deleteMessage(chatId: string, messageId: string) {
    const list = this.messages[chatId];
    if (!list) return;
    this.messages[chatId] = list.filter((m) => m.id !== messageId);
    this.persist();
  }

  public addShipLog(_title: string, _desc: string, _tags: string[]) {
    this.notify();
  }
}

export const webStore = new WebStore();
