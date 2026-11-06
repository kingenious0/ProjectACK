import { ID, Query, Permission, Role } from 'appwrite';
import { client, databases, account, APPWRITE_CONFIG } from './appwrite';
import type { MessageRow, MessageType, MessageMetadata } from '../db/types';
import { parseDmParticipants } from '../utils/dm';

class AppwriteSyncManager {
  private isSubscribed = false;
  private unsubscribeFn: (() => void) | null = null;
  private messageListeners: Set<(msg: MessageRow) => void> = new Set();
  private sessionEnsured = false;

  public async ensureSession(): Promise<boolean> {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
      return true;
    }
    if (this.sessionEnsured) return true;
    if (typeof window !== 'undefined' && window.location?.search) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('userId') && params.get('secret')) {
        // OAuth callback in flight: do not touch sessions
        return false;
      }
      if (params.get('error')) {
        // OAuth error in URL: do not touch sessions
        return false;
      }
    }
    try {
      await account.get();
      this.sessionEnsured = true;
      return true;
    } catch {
      // No active session. Do NOT create an anonymous session!
      // Anonymous sessions poison GitHub OAuth by triggering account-linking
      // which fails with 409 user_already_exists when the user already has an account.
      // Appwrite collection permissions with Role.any() allow unauthenticated reads/writes.
      return false;
    }
  }

  // ── PRIVACY HELPERS ──────────────────────────────────────────────

  /** Read current logged-in user info from localStorage (avoids circular import with store) */
  private getCurrentUserInfo(): { username: string; appwriteUserId: string } | null {
    try {
      if (typeof window === 'undefined') return null;
      const saved = localStorage.getItem('ack_current_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.username && parsed?.isLoggedIn) {
          return {
            username: (parsed.username || '').toLowerCase(),
            appwriteUserId: parsed.appwriteUserId || parsed.id || '',
          };
        }
      }
    } catch {}
    return null;
  }

  /** Check if a conversationId belongs to the current user */
  private isMyConversation(conversationId: string, metadata?: any): boolean {
    const user = this.getCurrentUserInfo();
    if (!user || !user.username || user.username.startsWith('guest_') || user.username === 'dev_guest') {
      // Unauthenticated or guest: strictly forbid ingesting private DMs
      if (conversationId === '__presence__' || conversationId.startsWith('repo_')) {
        return true;
      }
      return false;
    }

    const myHandle = user.username.toLowerCase().trim();

    if (conversationId.startsWith('dm_')) {
      return parseDmParticipants(conversationId, myHandle).isParticipant;
    }

    if (conversationId.startsWith('group_')) {
      if (metadata) {
        try {
          const parsed = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
          if (parsed?.members && Array.isArray(parsed.members) && parsed.members.length > 0) {
            return parsed.members.some((m: any) => (m.username || '').toLowerCase().trim() === myHandle);
          }
        } catch {}
      }
      return true;
    }

    return true;
  }

  /** Resolve a GitHub username → Appwrite account ID from the local directory cache */
  private resolveAppwriteUserId(username: string): string | null {
    try {
      if (typeof window === 'undefined') return null;
      const rawDir = localStorage.getItem('ack_user_directory') || '{}';
      const dir = JSON.parse(rawDir);
      const profile = dir[username.toLowerCase()];
      if (profile?.appwriteUserId) return profile.appwriteUserId;
      // Fallback: if id looks like an Appwrite ID (not gh_ or usr_ prefix), use it
      if (profile?.id && !profile.id.startsWith('gh_') && !profile.id.startsWith('usr_')) {
        return profile.id;
      }
    } catch {}
    return null;
  }

  /** Build Appwrite document permissions array for a DM conversation */
  private buildDmPermissions(chatId: string): string[] {
    const user = this.getCurrentUserInfo();
    if (!user?.appwriteUserId) return [];

    const { peerUsername } = parseDmParticipants(chatId, user.username);
    const peerId = this.resolveAppwriteUserId(peerUsername);

    const perms: string[] = [
      Permission.read(Role.user(user.appwriteUserId)),
      Permission.write(Role.user(user.appwriteUserId)),
    ];

    if (peerId) {
      perms.push(
        Permission.read(Role.user(peerId)),
        Permission.write(Role.user(peerId))
      );
    }

    return perms;
  }

  public subscribeToMessages(onNewMessage: (msg: MessageRow) => void): () => void {
    this.messageListeners.add(onNewMessage);
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
      return () => {
        this.messageListeners.delete(onNewMessage);
      };
    }

    if (!this.isSubscribed && typeof window !== 'undefined') {
      try {
        const channel = `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.messagesTableId}.documents`;
        this.unsubscribeFn = client.subscribe(channel, (response) => {
          const payload = response.payload as any;
          if (!payload || !payload.$id) return;

          // Check if this is a document delete event
          if (response.events?.some((e: string) => e.includes('.delete'))) {
            return;
          }

          const conversationId = payload.conversationId;

          // ── SECURITY: Drop realtime events for DMs not belonging to current user ──
          if (conversationId && !this.isMyConversation(conversationId, payload.metadata)) {
            return;
          }

          let msgType = (payload.type || 'text') as MessageType;
          if (payload.senderId === 'system_receipt') {
            msgType = 'receipt_event' as any;
          } else if (payload.senderId === 'system_typing') {
            msgType = 'typing_indicator' as any;
          } else if (payload.senderId === 'system_presence') {
            msgType = 'presence_event' as any;
          } else if (payload.senderId === 'system_burn') {
            msgType = 'burn_event' as any;
          } else if (payload.senderId === 'system_edit') {
            msgType = 'edit_event' as any;
          } else if (payload.senderId === 'system_delete') {
            msgType = 'delete_event' as any;
          }

          const row: MessageRow = {
            id: payload.$id,
            chat_id: conversationId,
            sender_id: payload.senderId,
            content: payload.content,
            message_type: msgType,
            status: 'delivered',
            quoted_message_id: null,
            metadata: payload.metadata || null,
            created_at: payload.timestamp || payload.$createdAt || new Date().toISOString(),
          };
          this.messageListeners.forEach((fn) => fn(row));
        });
        this.isSubscribed = true;
        console.log('[Appwrite Sync] Realtime listener attached to messages channel');
      } catch (err) {
        console.warn('[Appwrite Sync] Realtime subscription warning:', err);
      }
    }

    return () => {
      this.messageListeners.delete(onNewMessage);
      if (this.messageListeners.size === 0 && this.unsubscribeFn) {
        this.unsubscribeFn();
        this.unsubscribeFn = null;
        this.isSubscribed = false;
      }
    };
  }

  public unsubscribeAll(): void {
    this.messageListeners.clear();
    if (this.unsubscribeFn) {
      try {
        this.unsubscribeFn();
      } catch {}
      this.unsubscribeFn = null;
    }
    this.isSubscribed = false;
  }

  public async fetchRecentMessages(chatId?: string): Promise<MessageRow[]> {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
      return [];
    }
    await this.ensureSession();
    try {
      const queries = [
        Query.orderDesc('$createdAt'),
        Query.limit(100),
      ];
      if (chatId) {
        queries.push(Query.equal('conversationId', chatId));
      } else {
        queries.push(Query.notEqual('conversationId', '__presence__'));
      }
      const res = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.messagesTableId,
        queries
      );

      // Chronologically order results (oldest among the recent 100 first)
      const docsInOrder = [...res.documents].reverse();

      const allRows = docsInOrder.map((doc: any) => {
        let msgType = (doc.type || 'text') as MessageType;
        if (doc.senderId === 'system_receipt' || (doc.content === 'read' && doc.senderId?.startsWith('system_'))) {
          msgType = 'receipt_event' as any;
        } else if (doc.senderId === 'system_typing') {
          msgType = 'typing_indicator' as any;
        } else if (doc.senderId === 'system_presence') {
          msgType = 'presence_event' as any;
        } else if (doc.senderId === 'system_burn') {
          msgType = 'burn_event' as any;
        } else if (doc.senderId === 'system_edit') {
          msgType = 'edit_event' as any;
        } else if (doc.senderId === 'system_delete') {
          msgType = 'delete_event' as any;
        }
        return {
          id: doc.$id,
          chat_id: doc.conversationId,
          sender_id: doc.senderId,
          content: doc.content,
          message_type: msgType,
          status: 'delivered' as const,
          quoted_message_id: null,
          metadata: doc.metadata || null,
          created_at: doc.timestamp || doc.$createdAt || new Date().toISOString(),
        };
      });

      // ── SECURITY: Only return messages for conversations the current user participates in ──
      return allRows.filter((row) => this.isMyConversation(row.chat_id || '', row.metadata));
    } catch (err) {
      console.warn('[Appwrite Sync] Fetch recent messages warning:', err);
      return [];
    }
  }

  public async pushMessage(params: {
    id?: string;
    chatId: string;
    senderId: string;
    senderName: string;
    content: string;
    type?: MessageType;
    metadata?: MessageMetadata;
    timestamp?: string;
    participantIds?: string[];
  }): Promise<{ success: boolean; docId?: string }> {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
      return { success: true, docId: 'test_doc_' + Date.now() };
    }
    await this.ensureSession();
    const docId = ID.unique();
    const docPayload = {
      conversationId: params.chatId,
      senderId: params.senderId,
      senderName: params.senderName,
      type: params.type || 'text',
      content: params.content,
      metadata: params.metadata ? JSON.stringify(params.metadata) : '',
      timestamp: params.timestamp || new Date().toISOString(),
    };

    // Permissions: Role.any() works for both unauthenticated guests and authenticated users.
    // We avoid Role.users() which throws 401 on unauthenticated clients.
    const permissions = [
      Permission.read(Role.any()),
      Permission.write(Role.any()),
    ];

    try {
      const doc = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.messagesTableId,
        docId,
        docPayload,
        permissions
      );
      return { success: true, docId: doc.$id };
    } catch (err: any) {
      console.warn('[Appwrite Sync] Push message with permissions failed, retrying without perms:', err?.message || err);
      try {
        // Fallback: omit permissions parameter and rely on collection defaults
        const doc = await databases.createDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.messagesTableId,
          ID.unique(),
          docPayload
        );
        return { success: true, docId: doc.$id };
      } catch (retryErr) {
        console.error('[Appwrite Sync] Push message fatal error:', retryErr);
        return { success: false };
      }
    }
  }

  public async burnSecretInCloud(chatId: string, messageId: string): Promise<boolean> {
    await this.ensureSession();
    try {
      // 1. Send realtime burn event so peer's client burns immediately
      await this.pushMessage({
        chatId,
        senderId: 'system_burn',
        senderName: 'Vault Security',
        content: messageId,
        type: 'burn_event' as any,
        metadata: {
          burnMessageId: messageId,
          isBurned: true,
        },
      });

      // 2. Also try updating document if messageId is an Appwrite document ID
      try {
        await databases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.messagesTableId,
          messageId,
          {
            content: '[BURNED]',
            metadata: JSON.stringify({ isBurned: true, secretMasked: '💥 [SECRET PERMANENTLY PURGED & BURNED FROM VAULT]' }),
          }
        );
      } catch (e) {
        // Message ID might be client-generated ID; the burn_event covers this
      }

      return true;
    } catch (err) {
      console.warn('[Appwrite Sync] burnSecretInCloud notice:', err);
      return false;
    }
  }

  public async fetchCloudReviews(): Promise<any[]> {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
      return [];
    }
    await this.ensureSession();
    try {
      const res = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.messagesTableId,
        [Query.equal('conversationId', '__ack_reviews__'), Query.limit(50)]
      );
      return res.documents
        .map((doc: any) => {
          try {
            return typeof doc.metadata === 'string' ? JSON.parse(doc.metadata) : doc.metadata;
          } catch {
            return null;
          }
        })
        .filter(Boolean);
    } catch {
      return [];
    }
  }

  public async pushCloudReview(pr: any): Promise<boolean> {
    await this.ensureSession();
    try {
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.messagesTableId,
        ID.unique(),
        {
          conversationId: '__ack_reviews__',
          senderId: pr.author || 'dev',
          senderName: pr.author || 'Developer',
          type: 'pr_review',
          content: pr.title || 'Pull Request',
          metadata: JSON.stringify(pr),
          timestamp: new Date().toISOString(),
        }
      );
      return true;
    } catch {
      return false;
    }
  }

  public async editMessageInCloud(chatId: string, messageId: string, newContent: string): Promise<boolean> {
    await this.ensureSession();
    try {
      await this.pushMessage({
        chatId,
        senderId: 'system_edit',
        senderName: 'Edit Sync',
        content: newContent,
        type: 'edit_event' as any,
        metadata: {
          targetMessageId: messageId,
          newContent,
          isEdited: true,
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  public async deleteMessageForEveryoneInCloud(chatId: string, messageId: string): Promise<boolean> {
    await this.ensureSession();
    try {
      await this.pushMessage({
        chatId,
        senderId: 'system_delete',
        senderName: 'Delete Sync',
        content: '[DELETED]',
        type: 'delete_event' as any,
        metadata: {
          targetMessageId: messageId,
          isDeletedForEveryone: true,
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  public async broadcastTyping(chatId: string, username: string, isTyping: boolean): Promise<boolean> {
    await this.ensureSession();
    try {
      await this.pushMessage({
        chatId,
        senderId: 'system_typing',
        senderName: username,
        content: isTyping ? 'typing' : 'stopped',
        type: 'typing_indicator' as any,
        metadata: {
          username,
          isTyping,
          chatId,
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  public async broadcastPresence(username: string, isOnline: boolean): Promise<boolean> {
    await this.ensureSession();
    try {
      await this.pushMessage({
        chatId: '__presence__',
        senderId: 'system_presence',
        senderName: username,
        content: isOnline ? 'online' : 'offline',
        type: 'presence_event' as any,
        metadata: {
          username,
          isOnline,
          lastSeen: new Date().toISOString(),
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  public async broadcastReceipt(
    chatId: string,
    messageId: string,
    status: 'delivered' | 'read',
    readerUsername: string,
    extraMeta?: Record<string, any>
  ): Promise<boolean> {
    await this.ensureSession();
    try {
      const res = await this.pushMessage({
        chatId,
        senderId: 'system_receipt',
        senderName: readerUsername,
        content: status,
        type: 'receipt_event' as any,
        metadata: {
          targetMessageId: messageId,
          status,
          readerUsername,
          ...extraMeta,
        },
      });
      return res.success;
    } catch {
      return false;
    }
  }
}

export const appwriteSync = new AppwriteSyncManager();
export default appwriteSync;
