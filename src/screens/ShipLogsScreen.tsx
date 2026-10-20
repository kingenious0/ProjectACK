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
import { COLORS } from '../theme/colors';
import dbManager from '../db/client';
import { StatusPostRow, UserRow } from '../db/types';

export const ShipLogsScreen: React.FC = () => {
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
        {/* User Info Header */}
        <View style={styles.cardHeader}>
          <View style={styles.userRow}>
            {user?.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarLetter}>{user?.display_name?.charAt(0) || 'U'}</Text>
              </View>
            )}
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
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>SHIP LOGS (24H STATUS)</Text>
          <Text style={styles.headerSubtitle}>Teammate release pulses & active builds</Text>
        </View>

        <TouchableOpacity style={styles.postBtn} onPress={handlePostShipLog}>
          <Text style={styles.postBtnText}>+ SHIP LOG</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
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
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    fontSize: 10,
    marginTop: 2,
  },
  postBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
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
