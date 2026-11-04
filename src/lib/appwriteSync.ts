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
          if (response.events.some((e) => e.endsWith('.create'))) {
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
}

export const appwriteSync = new AppwriteSyncManager();
export default appwriteSync;
