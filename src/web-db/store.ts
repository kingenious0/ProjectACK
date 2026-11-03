/**
 * ACK. (CHAT4DEVS) Web Reactive Store
 * Developer Messenger Store
 */

export interface ReviewComment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  timestamp: string;
  content: string;
}

export interface DiffLine {
  type: 'normal' | 'add' | 'del';
  content: string;
  oldNo?: number;
  newNo?: number;
  comments?: ReviewComment[];
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
  filesChanged?: number;
  ciStatus?: 'passing' | 'failing' | 'running' | string;
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
  repliesCount?: number;
  isFailed?: boolean;
  burnedAt?: string;
  burnedBy?: string;
  copiedAt?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  type: 'text' | 'code' | 'env_secret' | 'pr_card' | 'audio_note' | 'system' | 'image' | 'document';
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'queued';
  timestamp: string;
  metadata?: MessageMetadata;
}

export interface GroupMember {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role: 'admin' | 'member';
  isOnline: boolean;
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
  statusDot?: 'success' | 'warning' | null;
  members?: GroupMember[];
  description?: string;
  linkedRepo?: string;
}

export interface ReviewPR {
  id: string;
  repo: string;
  title: string;
  prNumber: number;
  author: string;
  authorAvatar?: string;
  additions: number;
  deletions: number;
  ciStatus: 'passing' | 'failing' | 'running';
  category: 'waiting_on_me' | 'mine' | 'merged';
  updatedAt: string;
}

export interface AckNotification {
  id: string;
  type: 'mention' | 'review' | 'vault' | 'ci_failure';
  title: string;
  description: string;
  timestamp: string;
  timeGroup: 'today' | 'earlier';
  isRead: boolean;
  chatId?: string;
  prNumber?: number;
  buildLogs?: string[];
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

// Initial Chat List (Matches Home@1x.png and Group chat mockups)
const INITIAL_CHATS: Chat[] = [
  {
    id: 'chat_project_ack',
    name: 'ProjectACK Core',
    username: 'project_ack_core',
    type: 'group',
    avatar: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=150&auto=format&fit=crop&q=80',
    statusIconType: 'code',
    statusText: 'Sarah: Looks good. Checking...',
    statusTime: '4m',
    unreadCount: 3,
    isOnline: true,
    isPinned: true,
    repoTag: 'kingenious0/ProjectACK#main',
    linkedRepo: 'kingenious0/ProjectACK',
    description: 'Core developer discussions, PR reviews, and architectural sync for Ack.',
    members: [
      {
        id: 'usr_sarah',
        name: 'Sarah Connor',
        username: 'sarah_infra',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        role: 'admin',
        isOnline: true,
      },
      {
        id: 'usr_me',
        name: 'kinge_dev (You)',
        username: 'kinge_dev',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'admin',
        isOnline: true,
      },
      {
        id: 'dev_hardik',
        name: 'Hardik',
        username: 'hkothari1510',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        role: 'member',
        isOnline: true,
      },
      {
        id: 'dev_mohit',
        name: 'Mohit',
        username: 'chhipa231044',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        role: 'member',
        isOnline: true,
      },
      {
        id: 'dev_rey',
        name: 'Rey Patel',
        username: 'rey_patel3277',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
        role: 'member',
        isOnline: false,
      },
    ],
  },
  {
    id: 'chat_sarah_devops',
    name: 'Sarah Connor',
    username: 'sarah_infra',
    type: 'dm',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    statusIconType: 'vault',
    statusText: 'Secret shared · burns after reading',
    statusTime: '1h',
    unreadCount: 0,
    statusDot: 'warning',
    isOnline: true,
    isPinned: false,
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
    id: 'chat_webhook_ci',
    name: 'Vercel builds',
    username: 'vercel_builds',
    type: 'group',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    statusIconType: 'code',
    statusText: 'Build 2843376 succeeded',
    statusTime: 'now',
    unreadCount: 0,
    statusDot: 'success',
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
    statusText: 'Can you look at the diff?',
    statusTime: '3h',
    unreadCount: 0,
    isOnline: true,
    isPinned: false,
  },
  {
    id: 'chat_my_ai',
    name: 'Copilot',
    username: 'copilot',
    type: 'ai',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    statusIconType: 'chat',
    statusText: 'New chat',
    statusTime: '25m',
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
    unreadCount: 0,
    isOnline: true,
    isPinned: false,
    repoTag: 'torvalds/linux#v6.12-rc',
  },
];

export const INITIAL_REVIEWS: ReviewPR[] = [
  {
    id: 'pr_28',
    repo: 'ProjectACK',
    title: 'Dev control center: mobile-first layout architecture',
    prNumber: 28,
    author: 'kinge_dev',
    additions: 340,
    deletions: 48,
    ciStatus: 'passing',
    category: 'waiting_on_me',
    updatedAt: '4m ago',
  },
  {
    id: 'pr_142',
    repo: 'linux-kernel',
    title: 'net: Introduce Zero-Copy Socket Ring Buffer',
    prNumber: 142,
    author: 'torvalds',
    additions: 84,
    deletions: 12,
    ciStatus: 'passing',
    category: 'waiting_on_me',
    updatedAt: '25m ago',
  },
  {
    id: 'pr_99',
    repo: 'infra/k8s',
    title: 'Add Redis sentinel cluster config for staging failover',
    prNumber: 99,
    author: 'sarah_infra',
    additions: 64,
    deletions: 91,
    ciStatus: 'failing',
    category: 'waiting_on_me',
    updatedAt: '1h ago',
  },
  {
    id: 'pr_29',
    repo: 'ProjectACK',
    title: 'feat: Client-side AES-GCM vault burn countdown timer',
    prNumber: 29,
    author: 'kinge_dev',
    additions: 210,
    deletions: 15,
    ciStatus: 'running',
    category: 'mine',
    updatedAt: '2h ago',
  },
  {
    id: 'pr_25',
    repo: 'ProjectACK',
    title: 'chore: Migrate to React 19 and Vite 8 bundler',
    prNumber: 25,
    author: 'kinge_dev',
    additions: 450,
    deletions: 320,
    ciStatus: 'passing',
    category: 'merged',
    updatedAt: 'Yesterday',
  },
];

export const INITIAL_NOTIFICATIONS: AckNotification[] = [
  {
    id: 'notif_1',
    type: 'mention',
    title: 'Sarah Connor mentioned you',
    description: '@kinge_dev could you check if the service worker caches the offline shell?',
    timestamp: '5m ago',
    timeGroup: 'today',
    isRead: false,
    chatId: 'chat_project_ack',
  },
  {
    id: 'notif_2',
    type: 'review',
    title: 'Review requested on PR #28',
    description: 'Sarah Connor requested review on "Dev control center: mobile-first layout architecture"',
    timestamp: '18m ago',
    timeGroup: 'today',
    isRead: false,
    chatId: 'chat_project_ack',
    prNumber: 28,
  },
  {
    id: 'notif_3',
    type: 'vault',
    title: 'Vault secret burned',
    description: 'Production keys was viewed and permanently burned from memory by Sarah Connor',
    timestamp: '1h ago',
    timeGroup: 'today',
    isRead: true,
    chatId: 'chat_sarah_devops',
  },
  {
    id: 'notif_4',
    type: 'ci_failure',
    title: 'CI build failed on PR #99',
    description: 'Check "lint-and-typecheck" failed in staging workflow on branch infra/sentinel',
    timestamp: '2h ago',
    timeGroup: 'today',
    isRead: false,
    prNumber: 99,
    buildLogs: [
      'Run npm run lint',
      'error TS2322: Type "number" is not assignable to type "string".',
      '  at src/config/sentinel.ts:42:15',
      'Process completed with exit code 1.',
    ],
  },
  {
    id: 'notif_5',
    type: 'review',
    title: 'PR #25 merged to main',
    description: 'Migrate to React 19 and Vite 8 bundler was merged by kinge_dev',
    timestamp: 'Yesterday',
    timeGroup: 'earlier',
    isRead: true,
    chatId: 'chat_project_ack',
    prNumber: 25,
  },
];

// Initial Quick Add Contacts (Matches Screenshots 4 & 5)
export const INITIAL_SUGGESTIONS: SuggestedDev[] = [
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
      senderName: 'Sarah Connor',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      content: 'Hey! Sharing the production keys via our encrypted vault. Tap to reveal:',
      type: 'text',
      status: 'read',
      timestamp: '1h ago',
    },
    {
      id: 'm_202',
      chatId: 'chat_sarah_devops',
      senderId: 'usr_sarah',
      senderName: 'Sarah Connor',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      content: 'Production keys',
      type: 'env_secret',
      status: 'read',
      timestamp: '1h ago',
      metadata: {
        secretMasked: 'DATABASE_URL="postgres://user:••••@host:5432/db"\nSTRIPE_SECRET_KEY="sk_live_••••"\nJWT_SECRET="••••"',
        ttlSeconds: 60,
        isBurned: false,
      },
    },
    {
      id: 'm_203_burned',
      chatId: 'chat_sarah_devops',
      senderId: 'usr_sarah',
      senderName: 'Sarah Connor',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      content: 'Staging AWS credentials',
      type: 'env_secret',
      status: 'read',
      timestamp: '1h ago',
      metadata: {
        secretMasked: '💥 [SECRET PERMANENTLY PURGED & BURNED FROM VAULT]',
        isBurned: true,
        burnedAt: '1h ago',
        copiedAt: '1h ago',
        burnedBy: 'Sarah Connor',
      },
    },
  ],
  chat_project_ack: [
    {
      id: 'm_ack_1',
      chatId: 'chat_project_ack',
      senderId: 'usr_me',
      senderName: 'You',
      senderAvatar: CURRENT_USER.avatar,
      content: 'Pushed 2843376 to main: React 19 build and the new design tokens.',
      type: 'text',
      status: 'read',
      timestamp: '11:15 AM',
    },
    {
      id: 'm_ack_2',
      chatId: 'chat_project_ack',
      senderId: 'usr_github_bot',
      senderName: 'CI / CD Bot',
      senderAvatar: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=150&auto=format&fit=crop&q=80',
      content: 'Dev control center: mobile-first layout architecture',
      type: 'pr_card',
      status: 'read',
      timestamp: '11:15 AM',
      metadata: {
        prNumber: 28,
        prTitle: 'Dev control center: mobile-first layout architecture',
        prBranch: 'main',
        prAdditions: 340,
        prDeletions: 48,
        filesChanged: 3,
        ciStatus: 'passing',
        diffFiles: [
          {
            filename: 'WorkspaceDock.tsx',
            additions: 180,
            deletions: 0,
            lines: [
              { type: 'add', content: 'export const WorkspaceDock = () => {', newNo: 1 },
              { type: 'add', content: 'return <nav className="dock">', newNo: 2 },
              {
                type: 'add',
                content: '<DockItem icon="chat" />',
                newNo: 3,
                comments: [
                  {
                    id: 'comm_1',
                    authorName: 'Sarah Connor',
                    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
                    timestamp: '2m',
                    content: 'Could this be pulled into a useDockItems hook?',
                  },
                ],
              },
              { type: 'add', content: '</nav>', newNo: 4 },
              { type: 'add', content: '}', newNo: 5 },
            ],
          },
          {
            filename: 'src/components/chat/ChatList.tsx',
            additions: 120,
            deletions: 24,
            lines: [
              { type: 'normal', content: '  // Master navigation list', oldNo: 1, newNo: 1 },
              { type: 'del', content: '- export const WhatsAppSidebar: React.FC = () => {', oldNo: 2 },
              { type: 'add', content: '+ export const ChatList: React.FC<ChatListProps> = ({', newNo: 2 },
              { type: 'add', content: '+   chats, activeChatId, onSelectChat', newNo: 3 },
            ],
          },
          {
            filename: 'src/theme/ack.css',
            additions: 40,
            deletions: 24,
            lines: [
              { type: 'add', content: '+ --ack-bg: #0B0B0D;', newNo: 1 },
              { type: 'add', content: '+ --ack-accent: #8B7CFF;', newNo: 2 },
              { type: 'del', content: '- --wa-accent-green: #00FFCC;', oldNo: 1 },
            ],
          },
        ],
      },
    },
    {
      id: 'm_ack_3',
      chatId: 'chat_project_ack',
      senderId: 'usr_sarah',
      senderName: 'Sarah Connor',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      content: 'Looks good. Checking the dock component now.',
      type: 'text',
      status: 'read',
      timestamp: '11:16 AM',
    },
    {
      id: 'm_ack_4',
      chatId: 'chat_project_ack',
      senderId: 'usr_sarah',
      senderName: 'Sarah Connor',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      content: '@kinge_dev could you check if the service worker caches the offline shell properly?',
      type: 'text',
      status: 'read',
      timestamp: '11:18 AM',
      metadata: {
        repliesCount: 3,
      },
    },
    {
      id: 'm_ack_5_failed',
      chatId: 'chat_project_ack',
      senderId: 'usr_me',
      senderName: 'You',
      senderAvatar: CURRENT_USER.avatar,
      content: 'Deploying the staging worker fix now with asset precaching',
      type: 'text',
      status: 'failed',
      timestamp: '11:20 AM',
      metadata: {
        isFailed: true,
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
  private suggestions: SuggestedDev[] = INITIAL_SUGGESTIONS;
  private reviews: ReviewPR[] = INITIAL_REVIEWS;
  private notifications: AckNotification[] = INITIAL_NOTIFICATIONS;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const savedChats = localStorage.getItem('ack_chats') || localStorage.getItem('whatsdev_snap_chats');
      const savedMessages = localStorage.getItem('ack_messages') || localStorage.getItem('whatsdev_snap_messages');
      const savedSuggestions = localStorage.getItem('ack_suggestions') || localStorage.getItem('whatsdev_snap_suggestions');
      const savedReviews = localStorage.getItem('ack_reviews');
      const savedNotifs = localStorage.getItem('ack_notifications');

      if (savedChats) {
        const loaded: Chat[] = JSON.parse(savedChats);
        this.chats = loaded.map((c) => {
          const init = INITIAL_CHATS.find((ic) => ic.id === c.id);
          if (init) {
            return {
              ...c,
              name: init.name,
              statusDot: init.statusDot,
              statusText: init.statusText || c.statusText,
              statusTime: init.statusTime || c.statusTime,
              unreadCount: init.unreadCount !== undefined ? init.unreadCount : c.unreadCount,
            };
          }
          return c;
        });
        const missing = INITIAL_CHATS.filter((ic) => !this.chats.some((lc) => lc.id === ic.id));
        this.chats = [...this.chats, ...missing];
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
      this.reviews = savedReviews ? JSON.parse(savedReviews) : INITIAL_REVIEWS;
      this.notifications = savedNotifs ? JSON.parse(savedNotifs) : INITIAL_NOTIFICATIONS;

      if (!this.suggestions || this.suggestions.length === 0) {
        this.suggestions = INITIAL_SUGGESTIONS;
      }

      // Ensure rich demonstration messages are populated
      if (!this.messages['chat_project_ack'] || this.messages['chat_project_ack'].length < 3) {
        this.messages['chat_project_ack'] = INITIAL_MESSAGES.chat_project_ack;
      }
      if (this.messages['chat_robert_jonas'] && !this.messages['chat_robert_jonas'].some((m: Message) => m.type === 'image')) {
        this.messages['chat_robert_jonas'] = INITIAL_MESSAGES.chat_robert_jonas;
      }
    } catch (e) {
      this.chats = INITIAL_CHATS;
      this.messages = INITIAL_MESSAGES;
      this.suggestions = INITIAL_SUGGESTIONS;
      this.reviews = INITIAL_REVIEWS;
      this.notifications = INITIAL_NOTIFICATIONS;
    }
  }

  private persist() {
    try {
      localStorage.setItem('ack_chats', JSON.stringify(this.chats));
      localStorage.setItem('ack_messages', JSON.stringify(this.messages));
      localStorage.setItem('ack_suggestions', JSON.stringify(this.suggestions));
      localStorage.setItem('ack_reviews', JSON.stringify(this.reviews));
      localStorage.setItem('ack_notifications', JSON.stringify(this.notifications));
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
    if (!this.suggestions || this.suggestions.length === 0) {
      this.suggestions = INITIAL_SUGGESTIONS;
    }
    return this.suggestions;
  }

  public getReviews(): ReviewPR[] {
    return this.reviews;
  }

  public getNotifications(): AckNotification[] {
    return this.notifications;
  }

  public markAllNotificationsRead(): void {
    this.notifications = this.notifications.map((n) => ({ ...n, isRead: true }));
    this.persist();
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

  public resendFailedMessage(chatId: string, messageId: string) {
    const list = this.messages[chatId];
    if (!list) return;
    const msg = list.find((m) => m.id === messageId);
    if (msg) {
      msg.status = 'read';
      if (msg.metadata) {
        msg.metadata.isFailed = false;
      }
      const now = new Date();
      msg.timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      this.persist();
    }
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

  public createGroupChat(name: string, _memberIds?: string[]): Chat {
    const groupId = 'group_' + Date.now();
    const groupChat: Chat = {
      id: groupId,
      name,
      username: name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      type: 'repo',
      avatar: '',
      statusIconType: 'chat',
      statusText: 'Group created',
      statusTime: 'Just now',
      unreadCount: 0,
      isOnline: true,
    };
    this.chats.unshift(groupChat);
    this.messages[groupId] = [
      {
        id: 'm_' + Date.now(),
        chatId: groupId,
        senderId: 'usr_me',
        senderName: CURRENT_USER.name,
        senderAvatar: CURRENT_USER.avatar,
        content: `Created group ${name}`,
        type: 'text',
        status: 'read',
        timestamp: 'Just now',
        metadata: {},
      },
    ];
    this.persist();
    return groupChat;
  }

  public createGroup(name: string, members: SuggestedDev[], repoLink?: string, avatarUrl?: string): Chat {
    const groupId = 'group_' + Date.now();
    const groupMembers: GroupMember[] = [
      {
        id: CURRENT_USER.id,
        name: CURRENT_USER.name,
        username: CURRENT_USER.username,
        avatar: CURRENT_USER.avatar,
        role: 'admin',
        isOnline: true,
      },
      ...members.map((m) => ({
        id: m.id,
        name: m.name,
        username: m.username,
        avatar: m.avatar,
        role: 'member' as const,
        isOnline: m.isOnline,
      })),
    ];

    const groupChat: Chat = {
      id: groupId,
      name,
      username: name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      type: 'group',
      avatar: avatarUrl || 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=150&auto=format&fit=crop&q=80',
      statusIconType: 'chat',
      statusText: `Created group with ${members.length + 1} members`,
      statusTime: 'Just now',
      unreadCount: 0,
      isOnline: true,
      isPinned: false,
      members: groupMembers,
      linkedRepo: repoLink || undefined,
      repoTag: repoLink ? `${repoLink}#main` : undefined,
      description: `Discussion for ${name}`,
    };

    this.chats.unshift(groupChat);
    this.messages[groupId] = [
      {
        id: 'm_' + Date.now(),
        chatId: groupId,
        senderId: CURRENT_USER.id,
        senderName: CURRENT_USER.name,
        senderAvatar: CURRENT_USER.avatar,
        content: `Group created. Welcome ${members.map((m) => '@' + m.username).join(', ')}!`,
        type: 'text',
        status: 'read',
        timestamp: 'Just now',
        metadata: {},
      },
    ];

    this.persist();
    return groupChat;
  }

  public leaveGroup(chatId: string) {
    this.chats = this.chats.filter((c) => c.id !== chatId);
    delete this.messages[chatId];
    this.persist();
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
