import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../theme/colors';
import dbManager from '../db/client';
import { HydratedChat, ChatType } from '../db/types';

export const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [chats, setChats] = useState<HydratedChat[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDbNative, setIsDbNative] = useState<boolean>(false);

  const loadChats = useCallback(async () => {
    await dbManager.initialize();
    setIsDbNative(dbManager.getIsNative());
    const data = await dbManager.getChats();
    setChats(data);
  }, []);

  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 3000);
    return () => clearInterval(interval);
  }, [loadChats]);

  const filteredChats = chats.filter((c) => {
    if (filterType === 'DMS' && c.type !== 'dm') return false;
    if (filterType === 'GROUPS' && c.type !== 'group') return false;
    if (filterType === 'WEBHOOKS' && c.type !== 'webhook') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = (c.title || c.peerUser?.display_name || '').toLowerCase();
      return title.includes(q);
    }
    return true;
  });

  const renderChatItem = ({ item }: { item: HydratedChat }) => {
    const isDM = item.type === 'dm';
    const title = isDM ? (item.peerUser?.display_name || item.title || 'Developer') : (item.title || 'Channel');
    const avatar = item.avatar_url || item.peerUser?.avatar_url;
    const lastMsg = item.lastMessage;

    const renderPreview = () => {
      if (!lastMsg) return 'No messages yet';
      if (lastMsg.message_type === 'code') {
        const lang = lastMsg.metadataParsed?.language || 'code';
        return `</> [${lang.toUpperCase()}] snippet shared`;
      }
      if (lastMsg.message_type === 'env_secret') {
        return `🔐 [.ENV VAULT] Burn-after-reading secret`;
      }
      if (lastMsg.message_type === 'system') {
        return `🐙 ${lastMsg.content}`;
      }
      return lastMsg.content;
    };

    const formatTimestamp = (ts?: string) => {
      if (!ts) return '';
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    return (
      <TouchableOpacity
        style={styles.chatRow}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('ChatDetail', { chatId: item.id, chatTitle: title })}
      >
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.placeholderAvatar]}>
              <Text style={styles.placeholderText}>
                {item.type === 'webhook' ? '🐙' : item.type === 'group' ? '#' : '>_'}
              </Text>
            </View>
          )}
          {isDM && <View style={styles.onlineBadge} />}
        </View>

        {/* Content */}
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <View style={styles.titleBadgeRow}>
              {item.type === 'group' && <Text style={styles.channelPrefix}>#</Text>}
              {item.type === 'webhook' && <Text style={styles.webhookPrefix}>[WH]</Text>}
              <Text style={styles.chatTitle} numberOfLines={1}>{title}</Text>
            </View>
            <Text style={styles.chatTime}>{formatTimestamp(item.updated_at || lastMsg?.created_at)}</Text>
          </View>

          <View style={styles.previewRow}>
            <Text style={[styles.chatPreview, (lastMsg?.message_type === 'code' || lastMsg?.message_type === 'env_secret') && styles.specialPreview]} numberOfLines={1}>
              {renderPreview()}
            </Text>
            {item.unreadCount ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Terminal Branding Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.terminalPrompt}>&gt;_</Text>
          <Text style={styles.brandTitle}>PROJECT ACK</Text>
          <View style={styles.activeDot} />
        </View>

        <View style={styles.engineBadge}>
          <Text style={styles.engineText}>{isDbNative ? '⚡ op-sqlite' : '💾 memory-sqlite'}</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          placeholder="Filter messages, git hashes, or peers..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {['ALL', 'DMS', 'GROUPS', 'WEBHOOKS'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setFilterType(tab)}
            style={[styles.filterTab, filterType === tab && styles.filterTabActive]}
          >
            <Text style={[styles.filterTabText, filterType === tab && styles.filterTabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chats FlatList */}
      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>&gt;_</Text>
            <Text style={styles.emptyTitle}>No chats found</Text>
            <Text style={styles.emptySubtitle}>Start a new DM or link a GitHub repository.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  terminalPrompt: {
    color: COLORS.primary,
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: '800',
  },
  brandTitle: {
    color: COLORS.textPrimary,
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  engineBadge: {
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.25)',
  },
  engineText: {
    color: COLORS.primary,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    borderRadius: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  searchIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontFamily: 'monospace',
    fontSize: 12,
    paddingVertical: 7,
  },
  clearIcon: {
    color: COLORS.textMuted,
    fontSize: 12,
    paddingHorizontal: 4,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#10161D',
    borderWidth: 1,
    borderColor: '#1F2A38',
  },
  filterTabActive: {
    backgroundColor: 'rgba(0, 255, 102, 0.15)',
    borderColor: COLORS.primary,
  },
  filterTabText: {
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  listContent: {
    paddingVertical: 8,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
  },
  placeholderAvatar: {
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: COLORS.primary,
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '700',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    borderWidth: 1.5,
    borderColor: COLORS.background,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  channelPrefix: {
    color: COLORS.primary,
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '800',
    marginRight: 4,
  },
  webhookPrefix: {
    color: COLORS.warning,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '800',
    marginRight: 4,
  },
  chatTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  chatTime: {
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    fontSize: 10,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatPreview: {
    color: COLORS.textMuted,
    fontSize: 12,
    flex: 1,
    marginRight: 8,
  },
  specialPreview: {
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  unreadText: {
    color: '#0B0F12',
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '800',
  },
  separator: {
    height: 1,
    backgroundColor: '#121A22',
    marginLeft: 72,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    color: COLORS.primary,
    marginBottom: 10,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default ChatListScreen;
