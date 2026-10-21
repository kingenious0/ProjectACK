import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';
import dbManager from '../db/client';
import { StatusPostRow, UserRow } from '../db/types';

import {
  SearchIcon,
  MoreVertIcon,
  CameraIcon,
  StatusCircleIcon,
} from '../components/MaterialIcons';

export const ShipLogsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState<(StatusPostRow & { user?: UserRow })[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const data = await dbManager.getStatusPosts();
      setPosts(data);
    };
    fetchPosts();
  }, []);

  const handleOpenPreview = (url?: string | null) => {
    if (!url) return;
    Alert.alert('Live Preview URL', url);
  };

  const handlePostShipLog = () => {
    Alert.alert(
      'New Dev Ship Log',
      'Enter your commit message or PR link to post to your 24h team status.'
    );
  };

  const renderPost = ({ item }: { item: StatusPostRow & { user?: UserRow } }) => {
    const user = item.user;
    const expiresDate = new Date(item.expires_at);
    const hoursLeft = Math.max(0, Math.round((expiresDate.getTime() - Date.now()) / 3600000));

    return (
      <View style={styles.card}>
        {/* User Info Header with WhatsApp Green Status Circle Border */}
        <View style={styles.cardHeader}>
          <View style={styles.userRow}>
            <View style={styles.statusBorderRing}>
              {user?.avatar_url ? (
                <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarLetter}>{user?.display_name?.charAt(0) || 'U'}</Text>
                </View>
              )}
            </View>
            <View>
              <Text style={styles.displayName}>{user?.display_name || 'Developer'}</Text>
              <Text style={styles.githubUser}>@{user?.github_username || 'octocat'}</Text>
            </View>
          </View>

          <View style={styles.expiryBadge}>
            <Text style={styles.expiryText}>⏳ {hoursLeft}h left</Text>
          </View>
        </View>

        {/* Caption / Commit info */}
        <Text style={styles.captionText}>{item.caption}</Text>

        {/* Preview Link if present */}
        {item.preview_url && (
          <TouchableOpacity
            style={styles.previewBtn}
            onPress={() => handleOpenPreview(item.preview_url)}
          >
            <Text style={styles.previewBtnText}>🔗 PREVIEW: {item.preview_url}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* WhatsApp Updates Header with Safe Padding and Vector Icons */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 14) }]}>
        <Text style={styles.headerTitle}>Updates</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <SearchIcon size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <MoreVertIcon size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* WhatsApp Status Section Header */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.statusHeaderBlock}>
            <Text style={styles.statusSectionHeading}>Status</Text>
            {/* My Status Row */}
            <TouchableOpacity
              style={styles.myStatusRow}
              activeOpacity={0.7}
              onPress={handlePostShipLog}
            >
              <View style={styles.myStatusAvatarWrapper}>
                <View style={[styles.avatar, styles.myAvatar]}>
                  <Text style={styles.myAvatarText}>ME</Text>
                </View>
                <View style={styles.addStatusBadge}>
                  <Text style={styles.addStatusPlus}>+</Text>
                </View>
              </View>
              <View style={styles.myStatusTextCol}>
                <Text style={styles.myStatusTitle}>My status</Text>
                <Text style={styles.myStatusSubtitle}>Tap to add dev ship log update</Text>
              </View>
            </TouchableOpacity>

            <Text style={[styles.statusSectionHeading, { marginTop: 18 }]}>Recent updates</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      {/* Floating Action Button for New Status (WhatsApp camera icon) */}
      <TouchableOpacity
        style={[styles.statusFab, { bottom: Math.max(insets.bottom + 16, 24) }]}
        onPress={handlePostShipLog}
        activeOpacity={0.8}
      >
        <CameraIcon size={22} color="#0B141A" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundAlt,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingBottom: 12,
    elevation: 2,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    padding: 6,
  },
  iconBtnText: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  statusFab: {
    position: 'absolute',
    right: 18,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
  },
  statusFabText: {
    fontSize: 22,
    color: '#FFFFFF',
  },
  postBtnText: {
    color: '#0B0F12',
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '900',
  },
  listContent: {
    padding: 16,
  },
  statusHeaderBlock: {
    marginBottom: 10,
  },
  statusSectionHeading: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
  },
  myStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  myStatusAvatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  myAvatar: {
    backgroundColor: '#2A3942',
    justifyContent: 'center',
    alignItems: 'center',
  },
  myAvatarText: {
    color: '#00A884',
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  addStatusBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.backgroundAlt,
  },
  addStatusPlus: {
    color: '#0B141A',
    fontSize: 12,
    fontWeight: 'bold',
    top: -1,
  },
  myStatusTextCol: {
    flex: 1,
  },
  myStatusTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  myStatusSubtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  statusBorderRing: {
    padding: 2,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    backgroundColor: '#1E2834',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: COLORS.primary,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  displayName: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  githubUser: {
    color: COLORS.primary,
    fontFamily: 'monospace',
    fontSize: 10,
  },
  expiryBadge: {
    backgroundColor: '#121820',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#243242',
  },
  expiryText: {
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    fontSize: 9,
  },
  captionText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  previewBtn: {
    backgroundColor: '#0C1217',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.25)',
  },
  previewBtnText: {
    color: COLORS.primary,
    fontFamily: 'monospace',
    fontSize: 10,
  },
});

export default ShipLogsScreen;
