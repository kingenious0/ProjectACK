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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';
import dbManager from '../db/client';
import { HydratedChat, ChatType } from '../db/types';

import {
  SearchIcon,
  CameraIcon,
  MoreVertIcon,
  ChatBubbleIcon,
} from '../components/MaterialIcons';

export const ChatListScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [chats, setChats] = useState<HydratedChat[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
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

  const filteredChats = chats.filter(c => {
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
    const title = isDM
      ? item.peerUser?.display_name || item.title || 'Developer'
      : item.title || 'Channel';
    const avatar = item.avatar_url || item.peerUser?.avatar_url;
    const lastMsg = item.lastMessage;

    const renderPreview = () => {
      if (!lastMsg) return 'No messages yet';
      if (lastMsg.message_type === 'code') {
        const lang = lastMsg.metadataParsed?.language || 'code';
        return `</> [${lang.toUpperCase()}] code snippet shared`;
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
      return d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    };

    return (
      <TouchableOpacity
        style={styles.chatRow}
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate('ChatDetail', {
            chatId: item.id,
            chatTitle: title,
          })
        }
      >
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.placeholderAvatar]}>
              <Text style={styles.placeholderText}>
                {item.type === 'webhook'
                  ? '🐙'
                  : item.type === 'group'
                  ? '#'
                  : '>_'}
              </Text>
            </View>
          )}
          {isDM && <View style={styles.onlineBadge} />}
        </View>

        {/* Content */}
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <View style={styles.titleBadgeRow}>
              {item.type === 'group' && (
                <Text style={styles.channelPrefix}>#</Text>
              )}
              {item.type === 'webhook' && (
                <Text style={styles.webhookPrefix}>[WH]</Text>
              )}
              <Text style={styles.chatTitle} numberOfLines={1}>
                {title}
              </Text>
            </View>
            <Text
              style={[
                styles.chatTime,
                item.unreadCount ? styles.chatTimeUnread : null,
              ]}
            >
              {formatTimestamp(item.updated_at || lastMsg?.created_at)}
            </Text>
          </View>

          <View style={styles.previewRow}>
            <Text
              style={[
                styles.chatPreview,
                (lastMsg?.message_type === 'code' ||
                  lastMsg?.message_type === 'env_secret') &&
                  styles.specialPreview,
              ]}
              numberOfLines={1}
            >
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

      {/* WhatsApp Main Top App Bar */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 14) }]}>
        {isSearching ? (
          <View style={styles.searchBarContainer}>
            <TextInput
              style={styles.searchBarInput}
              placeholder="Search chats, repos, snippets..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity
              onPress={() => {
                setIsSearching(false);
                setSearchQuery('');
              }}
            >
              <Text style={styles.searchCancelText}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.brandLockup}>
              <View style={styles.brandMark}>
                <Text style={styles.brandMarkText}>A</Text>
              </View>
              <View>
                <Text style={styles.brandTitle}>ACK</Text>
                <Text style={styles.brandSubtitle}>developer network</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.headerIconButton}
                activeOpacity={0.7}
              >
                <CameraIcon size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerIconButton}
                activeOpacity={0.7}
                onPress={() => setIsSearching(true)}
              >
                <SearchIcon size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerIconButton}
                activeOpacity={0.7}
              >
                <MoreVertIcon size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* WhatsApp Filter Pills (All, Unread, Groups, Repos) */}
      <View style={styles.filterTabs}>
        {['All', 'DMs', 'Groups', 'Repos'].map(tab => {
          const mapKey =
            tab === 'All'
              ? 'ALL'
              : tab === 'DMs'
              ? 'DMS'
              : tab === 'Groups'
              ? 'GROUPS'
              : 'WEBHOOKS';
          const isActive = filterType === mapKey;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setFilterType(mapKey)}
              style={[styles.filterTab, isActive && styles.filterTabActive]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterTabText,
                  isActive && styles.filterTabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Chats FlatList */}
      <FlatList
        data={filteredChats}
        keyExtractor={item => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>&gt;_</Text>
            <Text style={styles.emptyTitle}>No chats found</Text>
            <Text style={styles.emptySubtitle}>
              Start a new DM or link a GitHub repository.
            </Text>
          </View>
        }
      />

      {/* WhatsApp Floating New Chat Button (FAB) with authentic vector icon */}
      <TouchableOpacity
        style={[
          styles.newChatFab,
          { bottom: Math.max(insets.bottom + 16, 20) },
        ]}
        activeOpacity={0.8}
        onPress={() => {}}
      >
        <ChatBubbleIcon size={24} color="#0B141A" />
      </TouchableOpacity>
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    backgroundColor: COLORS.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
  },
  brandLockup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: {
    color: '#071316',
    fontSize: 19,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  brandTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  brandSubtitle: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 1,
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconButton: {
    padding: 6,
  },
  headerIconText: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: COLORS.background,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: COLORS.inputBackground,
  },
  filterTabActive: {
    backgroundColor: 'rgba(0, 168, 132, 0.2)',
  },
  filterTabText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  listContent: {
    paddingVertical: 4,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#374248',
  },
  placeholderAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A3942',
  },
  placeholderText: {
    color: '#D1D7DB',
    fontSize: 18,
    fontWeight: '600',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
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
    fontSize: 16,
    fontWeight: '600',
  },
  chatTime: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  chatTimeUnread: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  chatPreview: {
    color: COLORS.textMuted,
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  specialPreview: {
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    fontSize: 13,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  unreadText: {
    color: '#0B141A',
    fontSize: 11,
    fontWeight: '800',
  },
  separator: {
    height: 0,
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
  newChatFab: {
    position: 'absolute',
    right: 18,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 24,
    paddingHorizontal: 14,
    height: 42,
  },
  searchBarInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    paddingVertical: 0,
  },
  searchCancelText: {
    color: COLORS.textMuted,
    fontSize: 16,
    paddingHorizontal: 8,
  },
});

export default ChatListScreen;
