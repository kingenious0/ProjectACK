export type ChatType = 'dm' | 'group' | 'channel' | 'webhook';

export type MessageType = 'text' | 'code' | 'env_secret' | 'system' | 'media';

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read';

export type MemberRole = 'admin' | 'member';

export interface UserRow {
  id: string;
  github_username: string;
  phone_number: string | null;
  display_name: string;
  avatar_url: string | null;
  status_message: string | null;
  last_seen: string | null;
  created_at?: string;
}

export interface ChatRow {
  id: string;
  type: ChatType;
  title: string | null;
  avatar_url: string | null;
  repo_webhook_secret: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ChatMemberRow {
  chat_id: string;
  user_id: string;
  role: MemberRole;
}

export interface MessageMetadata {
  language?: string;
  filename?: string;
  lineCount?: number;
  diffStats?: { added: number; removed: number };
  targetLine?: number;
  readTimerSeconds?: number;
  isBurned?: boolean;
  repoName?: string;
  prNumber?: number;
  prTitle?: string;
  prStatus?: 'open' | 'merged' | 'closed' | 'checks_failing';
  actionUrl?: string;
  [key: string]: any;
}

export interface MessageRow {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  message_type: MessageType;
  status: MessageStatus;
  quoted_message_id: string | null;
  metadata: string | null; // JSON string
  created_at?: string;
}

export interface StatusPostRow {
  id: string;
  user_id: string;
  media_url: string | null;
  caption: string | null;
  preview_url: string | null;
  expires_at: string;
  created_at?: string;
}

export interface HydratedMessage extends Omit<MessageRow, 'metadata'> {
  metadataParsed?: MessageMetadata;
  sender?: UserRow;
  quotedMessage?: HydratedMessage;
}

export interface HydratedChat extends ChatRow {
  lastMessage?: HydratedMessage;
  unreadCount?: number;
  peerUser?: UserRow;
  memberCount?: number;
}
