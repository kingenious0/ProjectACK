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
  isEdited?: boolean;
  editedAt?: string;
  isDeletedForEveryone?: boolean;
  isDeletedForMe?: boolean;
  isForwarded?: boolean;
  targetMessageId?: string;
  newContent?: string;
  username?: string;
  isTyping?: boolean;
  isOnline?: boolean;
  lastSeen?: string;
  [key: string]: any;
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
      const rawDir = localStorage.getItem('ack_user_directory') || '{}';
      const dir = JSON.parse(rawDir);
      dir[user.username.toLowerCase()] = {
        id: CURRENT_USER.id,
        githubId: CURRENT_USER.githubId || CURRENT_USER.id,
        name: CURRENT_USER.name,
        username: CURRENT_USER.username,
        avatar: CURRENT_USER.avatar,
        searchable: CURRENT_USER.searchable !== false,
        inviteCode: CURRENT_USER.inviteCode,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('ack_user_directory', JSON.stringify(dir));
    }
  } catch (e) {}
}


// Formats timestamps accurately based on real message date (e.g., '19:37', 'Yesterday', 'Nov 4')
export function formatChatTimestamp(timestampOrIso?: string): string {
  if (!timestampOrIso) return '';
  const d = new Date(timestampOrIso);
  if (isNaN(d.getTime())) {
    return timestampOrIso;
  }
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();

  // If created within the last 60 seconds and diff is non-negative:
  if (diffMs >= 0 && diffMs < 60000) {
    return 'Just now';
  }

  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (isYesterday) {
    return 'Yesterday';
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export const MOCK_CHAT_IDS = new Set([
  'chat_project_ack',
  'chat_sarah_devops',
  'chat_robert_jonas',
  'chat_webhook_ci',
  'chat_hardik',
  'chat_my_ai',
  'chat_torvalds_repo',
]);

export const MOCK_USERNAMES = new Set([
  'copilot',
  'sarah_infra',
  'robertpageflows',
  'vercel_builds',
  'hkothari1510',
  'chhipa231044',
  'rey_patel3277',
  'a-kay126',
  'rohanbhonsle12',
  'princerrai',
  'torvalds_linux',
  'project_ack_core',
]);

export function isMockChat(chat: { id?: string; username?: string; name?: string; isDemo?: boolean }): boolean {
  if (chat.isDemo) return true;
  if (chat.id && (MOCK_CHAT_IDS.has(chat.id) || chat.id.includes('my_ai') || chat.id.includes('copilot') || chat.id.includes('robert') || chat.id.includes('sarah') || chat.id.includes('hardik') || chat.id.includes('webhook'))) return true;
  const uname = (chat.username || '').toLowerCase();
  if (uname && (MOCK_USERNAMES.has(uname) || uname.includes('copilot'))) return true;
  const name = (chat.name || '').toLowerCase();
  if (
    [
      'copilot',
      'rey patel',
      'hardik',
      'prince rrai !!',
      'sarah connor',
      'robert jonas',
      'vercel builds',
      'projectack core',
    ].includes(name) || name.includes('copilot')
  ) {
    return true;
  }
  return false;
}

// Zero mock chats — 100% database driven
const INITIAL_CHATS: Chat[] = [];

export const INITIAL_REVIEWS: ReviewPR[] = [];

export const INITIAL_NOTIFICATIONS: AckNotification[] = [];

export const INITIAL_SUGGESTIONS: SuggestedDev[] = [];

const INITIAL_MESSAGES: Record<string, Message[]> = {};

class WebStore {
  private chats: Chat[] = [];
  private messages: Record<string, Message[]> = {};
  private suggestions: SuggestedDev[] = INITIAL_SUGGESTIONS;
  private reviews: ReviewPR[] = INITIAL_REVIEWS;
  private notifications: AckNotification[] = INITIAL_NOTIFICATIONS;
  private listeners: Set<() => void> = new Set();
  private typingUsers: Record<string, string | null> = {};
  private typingTimeouts: Record<string, any> = {};

  public getTypingUser(chatId: string): string | null {
    return this.typingUsers[chatId] || null;
  }

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

    // 2. Handle remote message edit event
    if (row.type === 'edit_event' || row.message_type === 'edit_event') {
      const targetId = meta?.targetMessageId || row.content;
      const newText = meta?.newContent || row.content;
      const target = this.messages[chatId]?.find(
        (m) => m.id === targetId || m.metadata?.clientMsgId === targetId
      );
      if (target) {
        target.content = newText;
        if (!target.metadata) target.metadata = {};
        target.metadata.isEdited = true;
        target.metadata.editedAt = row.timestamp || new Date().toISOString();
        this.persist();
        if (shouldNotify) this.notify();
      }
      return;
    }

    // 3. Handle remote message delete for everyone event
    if (row.type === 'delete_event' || row.message_type === 'delete_event') {
      const targetId = meta?.targetMessageId || row.content;
      const target = this.messages[chatId]?.find(
        (m) => m.id === targetId || m.metadata?.clientMsgId === targetId
      );
      if (target) {
        target.content = '[DELETED]';
        if (!target.metadata) target.metadata = {};
        target.metadata.isDeletedForEveryone = true;
        this.persist();
        if (shouldNotify) this.notify();
      }
      return;
    }

    // 4. Handle realtime typing indicator
    if (row.type === 'typing_indicator' || row.message_type === 'typing_indicator') {
      const user = meta?.username || row.senderName;
      if (user && user.toLowerCase() !== (CURRENT_USER.username || '').toLowerCase()) {
        const isTyping = meta?.isTyping !== false && row.content !== 'stopped';
        this.typingUsers[chatId] = isTyping ? user : null;
        if (this.typingTimeouts[chatId]) clearTimeout(this.typingTimeouts[chatId]);
        if (isTyping) {
          this.typingTimeouts[chatId] = setTimeout(() => {
            this.typingUsers[chatId] = null;
            this.notify();
          }, 3500);
        }
        if (shouldNotify) this.notify();
      }
      return;
    }

    // 5. Handle realtime presence event
    if (row.type === 'presence_event' || row.message_type === 'presence_event') {
      const username = (meta?.username || row.senderName || '').toLowerCase();
      if (username && username !== (CURRENT_USER.username || '').toLowerCase()) {
        const isOnline = Boolean(meta?.isOnline);
        const lastSeen = meta?.lastSeen || new Date().toISOString();
        for (const c of this.chats) {
          if (c.username && c.username.toLowerCase() === username) {
            c.isOnline = isOnline;
            c.lastSeen = lastSeen;
          }
        }
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

    const msgTimestamp = row.created_at || row.timestamp;
    const formattedChatTime = formatChatTimestamp(msgTimestamp);

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
        statusTime: formattedChatTime,
        unreadCount: isMe || isCurrentlyActive || !shouldNotify ? 0 : 1,
        isOnline: shouldNotify ? true : false,
        lastSeen: msgTimestamp ? (isNaN(new Date(msgTimestamp).getTime()) ? undefined : new Date(msgTimestamp).toISOString()) : undefined,
      };
      this.chats.unshift(chat);
    } else if (chat) {
      chat.statusText =
        newMsg.type === 'code'
          ? 'Code snippet shared'
          : newMsg.type === 'env_secret'
          ? 'Secret vault shared'
          : newMsg.content;
      chat.statusTime = formattedChatTime;
      if (!isMe) {
        if (shouldNotify) {
          chat.isOnline = true;
          chat.lastSeen = new Date().toISOString();
          if (isCurrentlyActive) {
            chat.unreadCount = 0;
          } else {
            chat.unreadCount = (chat.unreadCount || 0) + 1;
          }
        } else {
          // During historical hydration, do not blindly set online or increment unread
          if (msgTimestamp && !isNaN(new Date(msgTimestamp).getTime())) {
            chat.lastSeen = new Date(msgTimestamp).toISOString();
          }
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

      if (savedChats) {
        try {
          const parsed: Chat[] = JSON.parse(savedChats);
          // Aggressively purge any mock chats (copilot, hardik, rey patel, sarah, prince, etc.)
          this.chats = parsed.filter((c) => !isMockChat(c));
          // Filter mock members out of group chats
          for (const c of this.chats) {
            if (c.members && Array.isArray(c.members)) {
              c.members = c.members.filter((m) => !MOCK_USERNAMES.has((m.username || '').toLowerCase()));
            }
          }
        } catch {
          this.chats = [];
        }
      } else {
        this.chats = [];
      }

      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages);
          for (const k of Object.keys(parsed)) {
            if (MOCK_CHAT_IDS.has(k) || isMockChat({ id: k })) {
              delete parsed[k];
            }
          }
          this.messages = parsed;
        } catch {
          this.messages = {};
        }
      } else {
        this.messages = {};
      }

      this.suggestions = [];
      this.reviews = [];
      this.notifications = [];

      // Clean local storage immediately so mock chats are permanently purged
      this.persist();
    } catch (e) {
      this.chats = [];
      this.messages = {};
      this.suggestions = [];
      this.reviews = [];
      this.notifications = [];
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
    const list = this.messages[chatId] || [];
    return list.filter((m) => !m.metadata?.isDeletedForMe);
  }

  public getRecentContacts(): SuggestedDev[] {
    const list: SuggestedDev[] = [];
    const seenUsernames = new Set<string>();
    const myHandle = (CURRENT_USER.username || '').toLowerCase();

    // 1. All real DM chat contacts
    for (const chat of this.chats) {
      if (chat.type === 'dm' && chat.username) {
        const u = chat.username.toLowerCase();
        if (u !== myHandle && !seenUsernames.has(u)) {
          seenUsernames.add(u);
          list.push({
            id: 'contact_' + u,
            name: chat.name,
            username: chat.username,
            avatar: chat.avatar || `https://github.com/${chat.username}.png`,
            tag: chat.statusText || 'Active on Ack',
            mutualCount: 1,
            isOnline: !!chat.isOnline,
          });
        }
      }
    }

    // 2. All contacts discovered through Appwrite Cloud directory
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('ack_user_directory');
        if (raw) {
          const dir = JSON.parse(raw);
          for (const key of Object.keys(dir)) {
            const prof = dir[key];
            if (prof && prof.username) {
              const u = prof.username.toLowerCase();
              if (u !== myHandle && !seenUsernames.has(u)) {
                seenUsernames.add(u);
                list.push({
                  id: 'contact_' + u,
                  name: prof.name || prof.username,
                  username: prof.username,
                  avatar: prof.avatar || `https://github.com/${prof.username}.png`,
                  tag: 'Active on Ack',
                  mutualCount: 1,
                  isOnline: false,
                });
              }
            }
          }
        }
      }
    } catch (e) {}

    return list;
  }

  public getSuggestions(): SuggestedDev[] {
    const recents = this.getRecentContacts();
    return recents;
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

  public editMessage(chatId: string, messageId: string, newContent: string): boolean {
    const chatMsgs = this.messages[chatId];
    if (!chatMsgs) return false;
    const msg = chatMsgs.find((m) => m.id === messageId || m.metadata?.clientMsgId === messageId);
    if (!msg) return false;

    msg.content = newContent;
    if (!msg.metadata) msg.metadata = {};
    msg.metadata.isEdited = true;
    msg.metadata.editedAt = new Date().toISOString();

    const chat = this.chats.find((c) => c.id === chatId);
    if (chat && chatMsgs[chatMsgs.length - 1]?.id === msg.id) {
      chat.statusText = newContent;
    }

    this.persist();
    this.notify();

    appwriteSync.editMessageInCloud(chatId, messageId, newContent);
    return true;
  }

  public deleteMessageForEveryone(chatId: string, messageId: string): boolean {
    const chatMsgs = this.messages[chatId];
    if (!chatMsgs) return false;
    const msg = chatMsgs.find((m) => m.id === messageId || m.metadata?.clientMsgId === messageId);
    if (!msg) return false;

    msg.content = '[DELETED]';
    if (!msg.metadata) msg.metadata = {};
    msg.metadata.isDeletedForEveryone = true;

    const chat = this.chats.find((c) => c.id === chatId);
    if (chat && chatMsgs[chatMsgs.length - 1]?.id === msg.id) {
      chat.statusText = '🚫 This message was deleted';
    }

    this.persist();
    this.notify();

    appwriteSync.deleteMessageForEveryoneInCloud(chatId, messageId);
    return true;
  }

  public deleteMessageForMe(chatId: string, messageId: string): boolean {
    const chatMsgs = this.messages[chatId];
    if (!chatMsgs) return false;
    const msg = chatMsgs.find((m) => m.id === messageId || m.metadata?.clientMsgId === messageId);
    if (!msg) return false;

    if (!msg.metadata) msg.metadata = {};
    msg.metadata.isDeletedForMe = true;

    this.persist();
    this.notify();
    return true;
  }

  public forwardMessage(targetChatId: string, originalMsg: Message): void {
    this.sendMessage(targetChatId, originalMsg.content, originalMsg.type, {
      ...originalMsg.metadata,
      isForwarded: true,
    });
  }

  public setTyping(chatId: string, isTyping: boolean): void {
    appwriteSync.broadcastTyping(chatId, CURRENT_USER.username, isTyping);
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
