import { ID, Query, Permission, Role } from 'appwrite';
import { client, databases, account, APPWRITE_CONFIG } from './appwrite';
import type { MessageRow, MessageType, MessageMetadata } from '../db/types';

class AppwriteSyncManager {
  private isSubscribed = false;
  private unsubscribeFn: (() => void) | null = null;
  private messageListeners: Set<(msg: MessageRow) => void> = new Set();
  private sessionEnsured = false;

  public async ensureSession(): Promise<boolean> {
    if (this.sessionEnsured) return true;
    try {
      await account.get();
      this.sessionEnsured = true;
      return true;
    } catch {
      try {
        await account.createAnonymousSession();
        this.sessionEnsured = true;
        console.log('[Appwrite Sync] Anonymous guest session active');
        return true;
      } catch (err) {
        console.warn('[Appwrite Sync] Session init error (offline/CORS):', err);
        return false;
      }
    }
  }

  public subscribeToMessages(onNewMessage: (msg: MessageRow) => void): () => void {
    this.messageListeners.add(onNewMessage);

    if (!this.isSubscribed && typeof window !== 'undefined') {
      try {
        const channel = `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.messagesTableId}.documents`;
        this.unsubscribeFn = client.subscribe(channel, (response) => {
          if (response.events.some((e) => e.endsWith('.create') || e.endsWith('.update'))) {
            const payload = response.payload as any;
            const row: MessageRow = {
              id: payload.$id,
              chat_id: payload.conversationId,
              sender_id: payload.senderId,
              content: payload.content,
              message_type: (payload.type || 'text') as MessageType,
              status: 'delivered',
              quoted_message_id: null,
              metadata: payload.metadata || null,
              created_at: payload.timestamp || payload.$createdAt || new Date().toISOString(),
            };
            this.messageListeners.forEach((fn) => fn(row));
          }
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

  public async fetchRecentMessages(chatId?: string): Promise<MessageRow[]> {
    await this.ensureSession();
    try {
      const queries = [Query.limit(100), Query.orderAsc('$createdAt')];
      if (chatId) {
        queries.push(Query.equal('conversationId', chatId));
      }
      const res = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.messagesTableId,
        queries
      );

      return res.documents.map((doc: any) => ({
        id: doc.$id,
        chat_id: doc.conversationId,
        sender_id: doc.senderId,
        content: doc.content,
        message_type: (doc.type || 'text') as MessageType,
        status: 'delivered',
        quoted_message_id: null,
        metadata: doc.metadata || null,
        created_at: doc.timestamp || doc.$createdAt || new Date().toISOString(),
      }));
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
  }): Promise<boolean> {
    await this.ensureSession();
    try {
      const docId = ID.unique();
      const permissions =
        params.participantIds && params.participantIds.length > 0
          ? params.participantIds.flatMap((uid) => [
              Permission.read(Role.user(uid)),
              Permission.write(Role.user(uid)),
            ])
          : undefined;

      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.messagesTableId,
        docId,
        {
          conversationId: params.chatId,
          senderId: params.senderId,
          senderName: params.senderName,
          type: params.type || 'text',
          content: params.content,
          metadata: params.metadata ? JSON.stringify(params.metadata) : '',
          timestamp: params.timestamp || new Date().toISOString(),
        },
        permissions
      );
      return true;
    } catch (err) {
      console.warn('[Appwrite Sync] Push message error:', err);
      return false;
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
}

export const appwriteSync = new AppwriteSyncManager();
export default appwriteSync;
