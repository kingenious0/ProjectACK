/**
 * ACK. (CHAT4DEVS) Web Reactive Store
 * Developer Messenger Store
 */
import appwriteSync from '../lib/appwriteSync';


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
  clientMsgId?: string;
  deviceId?: string;
  senderName?: string;
  senderAvatar?: string;
  burnMessageId?: string;
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
  lastSeen?: string;
  isPinned?: boolean;
  repoTag?: string;
  statusDot?: 'success' | 'warning' | null;
  members?: GroupMember[];
  description?: string;
  linkedRepo?: string;
  isDemo?: boolean;
  isInviteChat?: boolean;
  invitedBy?: string;
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

export function generateInviteCode(username?: string): string {
  const handle = (username || CURRENT_USER?.username || 'kingenious0').trim().toLowerCase().replace(/^@/, '');
  const rand = Math.random().toString(36).substring(2, 8);
  return `inv_${handle}_${rand}`;
}

export const CURRENT_USER: {
  id: string;
  githubId?: string;
  name: string;
  handle: string;
  username: string;
  avatar: string;
  isLoggedIn: boolean;
  searchable: boolean;
  inviteCode: string;
} = {
  id: 'usr_me',
  githubId: '',
  name: 'Dev ACK (You)',
  username: 'kingenious0',
  handle: '@kingenious0',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  isLoggedIn: false,
  searchable: true,
  inviteCode: generateInviteCode('kingenious0'),
};

try {
  if (typeof window !== 'undefined') {
    const savedUser = localStorage.getItem('ack_current_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      Object.assign(CURRENT_USER, parsed);
      if (!CURRENT_USER.inviteCode) {
        CURRENT_USER.inviteCode = generateInviteCode(CURRENT_USER.username);
        localStorage.setItem('ack_current_user', JSON.stringify(CURRENT_USER));
      }
    }
  }
} catch (e) {}

export function regenerateInviteCode(): string {
  const newCode = generateInviteCode(CURRENT_USER.username);
  CURRENT_USER.inviteCode = newCode;
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ack_current_user', JSON.stringify(CURRENT_USER));
    }
  } catch (e) {}
  return newCode;
}

export function setCurrentUser(user: {
  id: string;
  githubId?: string;
  name: string;
  username: string;
  avatar?: string;
  isLoggedIn?: boolean;
  searchable?: boolean;
  inviteCode?: string;
}): void {
  CURRENT_USER.id = user.id;
  if (user.githubId) CURRENT_USER.githubId = user.githubId;
  CURRENT_USER.name = user.name;
  CURRENT_USER.username = user.username;
  CURRENT_USER.handle = `@${user.username}`;
  CURRENT_USER.isLoggedIn = user.isLoggedIn !== undefined ? user.isLoggedIn : true;
  if (user.searchable !== undefined) CURRENT_USER.searchable = user.searchable;
  if (user.inviteCode) CURRENT_USER.inviteCode = user.inviteCode;
  if (!CURRENT_USER.inviteCode) CURRENT_USER.inviteCode = generateInviteCode(user.username);
  if (user.avatar) {
    CURRENT_USER.avatar = user.avatar;
  }
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ack_current_user', JSON.stringify(CURRENT_USER));
    }
  } catch (e) {}
}


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
    unreadCount: 0,
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

export const INITIAL_REVIEWS: ReviewPR[] = [];

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
    this.initCloudSync();
  }

  private getDeviceId(): string {
    if (typeof window === 'undefined') return 'server';
    try {
      let devId = sessionStorage.getItem('ack_device_id');
      if (!devId) {
        devId = 'dev_' + Math.random().toString(36).substring(2, 9);
        sessionStorage.setItem('ack_device_id', devId);
      }
      return devId;
    } catch {
      return 'dev_default';
    }
  }

  private initCloudSync() {
    if (typeof window === 'undefined') return;

    try {
      // Listen to real-time incoming messages from Appwrite Cloud
      appwriteSync.subscribeToMessages((incomingMsg) => {
        this.receiveRemoteMessage(incomingMsg);
      });

      // Hydrate existing cloud history on startup
      appwriteSync.fetchRecentMessages().then((cloudMsgs) => {
        cloudMsgs.forEach((msg) => {
          this.receiveRemoteMessage(msg, false);
        });
        this.notify();
      });

      // Hydrate reviews from cloud database
      appwriteSync.fetchCloudReviews().then((cloudReviews) => {
        if (cloudReviews && cloudReviews.length > 0) {
          this.reviews = cloudReviews;
          this.persist();
          this.notify();
        }
      });
    } catch (err) {
      console.warn('[ACK WebStore] Cloud sync setup note:', err);
    }
  }

  public receiveRemoteMessage(row: any, shouldNotify = true) {
    let meta: MessageMetadata | undefined;
    try {
      meta = row.metadata ? (typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata) : undefined;
    } catch {
      meta = undefined;
    }

    const chatId = row.chat_id || row.conversationId;
    if (!chatId) return;

    if (!this.messages[chatId]) {
      this.messages[chatId] = [];
    }

    // 1. Handle remote secret burn event
    if (row.type === 'burn_event' || row.message_type === 'burn_event') {
      const burnTargetId = meta?.burnMessageId || row.content;
      let target = this.messages[chatId]?.find(
        (m) => m.id === burnTargetId || m.metadata?.clientMsgId === burnTargetId
      );
      if (!target) {
        for (const cid of Object.keys(this.messages)) {
          target = this.messages[cid]?.find(
            (m) => m.id === burnTargetId || m.metadata?.clientMsgId === burnTargetId
          );
          if (target) break;
        }
      }
      if (target) {
        if (!target.metadata) target.metadata = {};
        target.metadata.isBurned = true;
        target.metadata.secretMasked = '💥 [SECRET PERMANENTLY PURGED & BURNED FROM VAULT]';
        target.content = '[BURNED]';
        this.persist();
        if (shouldNotify) this.notify();
      }
      return;
    }

    const clientMsgId = meta?.clientMsgId;
    const existingMsg = this.messages[chatId].find(
      (m) => m.id === row.id || (clientMsgId && m.id === clientMsgId)
    );

    // If already exists, check if burn state needs updating
    if (existingMsg) {
      if (meta?.isBurned && !existingMsg.metadata?.isBurned) {
        if (!existingMsg.metadata) existingMsg.metadata = {};
        existingMsg.metadata.isBurned = true;
        existingMsg.metadata.secretMasked = '💥 [SECRET PERMANENTLY PURGED & BURNED FROM VAULT]';
        existingMsg.content = '[BURNED]';
        this.persist();
        if (shouldNotify) this.notify();
      }
      return;
    }

    const timeStr = row.created_at
      ? new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : (row.timestamp || 'Just now');

    const isMe = row.sender_id === CURRENT_USER.id && (!meta?.deviceId || meta.deviceId === this.getDeviceId());

    const newMsg: Message = {
      id: row.id,
      chatId,
      senderId: row.sender_id || row.senderId || 'dev_peer',
      senderName: isMe ? 'ME' : (meta?.senderName || row.senderName || 'Peer Dev'),
      senderAvatar: isMe
        ? CURRENT_USER.avatar
        : (meta?.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
      content: row.content,
      type: (row.message_type || row.type || 'text') as any,
      status: 'delivered',
      timestamp: timeStr,
      metadata: {
        accentColor: isMe ? '#E91E63' : '#00A884',
        ...meta,
      },
    };

    this.messages[chatId].push(newMsg);

    const isCurrentlyActive =
      typeof window !== 'undefined' && localStorage.getItem('ack_active_chat_id') === chatId;

    // Update Chat preview or auto-create DM chat on recipient side
    let chat = this.chats.find((c) => c.id === chatId);
    if (!chat && chatId.startsWith('dm_')) {
      const parts = chatId.replace(/^dm_/, '').split('_');
      const otherHandle = parts.find((p) => p.toLowerCase() !== (CURRENT_USER.username || '').toLowerCase()) || parts[0] || 'dev';
      const senderDisplayName = !isMe ? (meta?.senderName || row.senderName || otherHandle) : otherHandle;
      chat = {
        id: chatId,
        name: senderDisplayName,
        username: otherHandle.toLowerCase(),
        type: 'dm',
        avatar: isMe ? `https://github.com/${otherHandle.toLowerCase()}.png` : (meta?.senderAvatar || `https://github.com/${otherHandle.toLowerCase()}.png`),
        statusIconType: 'chat',
        statusText: newMsg.content,
        statusTime: 'Just now',
        unreadCount: isMe || isCurrentlyActive ? 0 : 1,
        isOnline: true,
      };
      this.chats.unshift(chat);
    } else if (chat) {
      chat.statusText =
        newMsg.type === 'code'
          ? 'Code snippet shared'
          : newMsg.type === 'env_secret'
          ? 'Secret vault shared'
          : newMsg.content;
      chat.statusTime = 'Just now';
      if (!isMe) {
        chat.isOnline = true;
        chat.lastSeen = new Date().toISOString();
        if (isCurrentlyActive) {
          chat.unreadCount = 0;
        } else {
          chat.unreadCount = (chat.unreadCount || 0) + 1;
        }
      }
    }

    if (shouldNotify) {
      this.persist();
      this.notify();
    }
  }


  private loadState() {
    try {
      const savedChats = localStorage.getItem('ack_chats') || localStorage.getItem('whatsdev_snap_chats');
      const savedMessages = localStorage.getItem('ack_messages') || localStorage.getItem('whatsdev_snap_messages');
      const savedSuggestions = localStorage.getItem('ack_suggestions') || localStorage.getItem('whatsdev_snap_suggestions');
      const savedReviews = localStorage.getItem('ack_reviews');
      const savedNotifs = localStorage.getItem('ack_notifications');

      if (savedChats) {
        this.chats = JSON.parse(savedChats);
      } else {
        this.chats = INITIAL_CHATS;
      }

      if (savedMessages) {
        this.messages = JSON.parse(savedMessages);
      } else {
        this.messages = INITIAL_MESSAGES;
      }

      this.suggestions = savedSuggestions ? JSON.parse(savedSuggestions) : INITIAL_SUGGESTIONS;
      
      // Clean up mock reviews from saved state
      if (savedReviews) {
        try {
          const parsed = JSON.parse(savedReviews);
          this.reviews = Array.isArray(parsed)
            ? parsed.filter((r) => !['pr_28', 'pr_142', 'pr_99', 'pr_29', 'pr_25'].includes(r.id))
            : [];
        } catch {
          this.reviews = [];
        }
      } else {
        this.reviews = [];
      }

      this.notifications = savedNotifs ? JSON.parse(savedNotifs) : INITIAL_NOTIFICATIONS;

      if (!this.suggestions || this.suggestions.length === 0) {
        this.suggestions = INITIAL_SUGGESTIONS;
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
    if (CURRENT_USER.isLoggedIn) {
      // Real authenticated users only see their genuine chats, not mock/demo chats
      return this.chats.filter(
        (c) =>
          !c.isDemo &&
          c.id !== 'chat_project_ack' &&
          c.id !== 'chat_sarah_devops' &&
          c.id !== 'chat_robert_jonas' &&
          c.id !== 'chat_webhook_ci' &&
          c.id !== 'chat_hardik' &&
          c.id !== 'chat_torvalds_repo'
      );
    }
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

    // Broadcast to Appwrite Cloud in real time
    appwriteSync.pushMessage({
      id: newMsg.id,
      chatId,
      senderId: CURRENT_USER.id,
      senderName: CURRENT_USER.name,
      content,
      type: type as any,
      metadata: {
        ...metadata,
        clientMsgId: newMsg.id,
        deviceId: this.getDeviceId(),
        senderName: CURRENT_USER.name,
        senderAvatar: CURRENT_USER.avatar,
      },
      timestamp: now.toISOString(),
    });

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
      this.notify();
    }

    // Broadcast burn event across Appwrite Cloud Realtime so sender burns too!
    appwriteSync.burnSecretInCloud(chatId, messageId).catch((err) => {
      console.warn('[ACK WebStore] Burn cloud sync notice:', err);
    });
  }

  public markChatAsRead(chatId: string) {
    const chat = this.chats.find((c) => c.id === chatId);
    if (chat && (chat.unreadCount || 0) > 0) {
      chat.unreadCount = 0;
      this.persist();
      this.notify();
    }
  }

  public addFriend(dev: SuggestedDev): Chat {
    // Deterministic DM room ID based on both sorted GitHub usernames (WhatsApp-style)
    const myUser = (CURRENT_USER.username || 'me').toLowerCase();
    const peerUser = dev.username.toLowerCase();
    const sortedHandles = [myUser, peerUser].sort();
    const dmRoomId = `dm_${sortedHandles[0]}_${sortedHandles[1]}`;

    // Check if chat already exists
    let chat = this.chats.find((c) => c.id === dmRoomId || c.username === dev.username);
    const isFromInvite = dev.tag === 'Invited You to Ack' || dev.tag === 'Invite Connect';

    if (!chat) {
      chat = {
        id: dmRoomId,
        name: dev.name,
        username: dev.username,
        type: 'dm',
        avatar: dev.avatar || `https://github.com/${dev.username}.png`,
        statusIconType: 'chat',
        statusText: isFromInvite ? 'Connected via invite' : 'Connected on Ack',
        statusTime: 'Just now',
        unreadCount: 0,
        isOnline: dev.isOnline,
        isInviteChat: isFromInvite,
        invitedBy: isFromInvite ? dev.username : undefined,
      };
      this.chats.unshift(chat);

      if (!isFromInvite) {
        // Add standard welcome message for non-invite connects
        this.messages[chat.id] = [
          {
            id: 'm_welcome_' + Date.now(),
            chatId: chat.id,
            senderId: dev.id,
            senderName: dev.name.toUpperCase(),
            senderAvatar: dev.avatar,
            content: `Hey @${CURRENT_USER.username}! Connected on Ack. Ready to collaborate on ${dev.tag}?`,
            type: 'text',
            status: 'read',
            timestamp: 'Just now',
            metadata: { accentColor: '#00A884' },
          },
        ];
      } else {
        this.messages[chat.id] = [];
      }
    } else if (isFromInvite) {
      chat.isInviteChat = true;
      chat.invitedBy = dev.username;
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

  public addReview(pr: ReviewPR) {
    this.reviews.unshift(pr);
    this.persist();
    this.notify();
    appwriteSync.pushCloudReview(pr).catch((err) => {
      console.warn('[ACK WebStore] Cloud review sync notice:', err);
    });
  }
}

export const webStore = new WebStore();
