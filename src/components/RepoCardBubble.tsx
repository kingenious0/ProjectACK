import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '../theme/colors';

interface Props {
  repoName?: string;
  prNumber?: number;
  prTitle?: string;
  prStatus?: 'open' | 'merged' | 'closed' | 'checks_failing';
  actionUrl?: string;
}

export const RepoCardBubble: React.FC<Props> = ({
  repoName = 'ack-messenger/core',
  prNumber = 142,
  prTitle = 'feat: op-sqlite C++ migration & line-by-line review',
  prStatus = 'open',
  actionUrl,
}) => {
  const [rebuilding, setRebuilding] = useState<boolean>(false);
  const [buildStatus, setBuildStatus] = useState<string | null>(null);

  const handleTriggerRebuild = () => {
    setRebuilding(true);
    setBuildStatus('Dispatching GitHub Actions workflow...');
    setTimeout(() => {
      setRebuilding(false);
      setBuildStatus('✓ Workflow dispatched: run #8821 in progress');
    }, 1200);
  };

  const handleViewPr = () => {
    Alert.alert(
      `GitHub PR #${prNumber}`,
      `${prTitle}\n\nRepository: ${repoName}\nStatus: ${prStatus.toUpperCase()}`
    );
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.gitIcon}>🐙</Text>
          <Text style={styles.repoName}>{repoName}</Text>
        </View>
        <View style={[styles.statusBadge, prStatus === 'open' ? styles.openBadge : styles.failBadge]}>
          <Text style={[styles.statusText, prStatus === 'open' ? styles.openText : styles.failText]}>
            {prStatus.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.prNumber}>PR #{prNumber}</Text>
        <Text style={styles.prTitle}>{prTitle}</Text>
        <View style={styles.checksRow}>
          <Text style={styles.checksText}>✓ 14 passing checks</Text>
          <Text style={styles.checksTime}>• 2m ago</Text>
        </View>
      </View>

      {/* Action Buttons: [View PR], [Trigger Rebuild] */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.viewBtn} onPress={handleViewPr}>
          <Text style={styles.viewBtnText}>VIEW PR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={rebuilding}
          style={[styles.rebuildBtn, rebuilding && styles.rebuildingBtn]}
          onPress={handleTriggerRebuild}
        >
          <Text style={styles.rebuildBtnText}>
            {rebuilding ? 'TRIGGERING...' : 'TRIGGER REBUILD'}
          </Text>
        </TouchableOpacity>
      </View>

      {buildStatus && (
        <View style={styles.buildNotice}>
          <Text style={styles.buildNoticeText}>{buildStatus}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F161E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#263342',
    overflow: 'hidden',
    marginVertical: 4,
    minWidth: 270,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#16202A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#263342',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gitIcon: {
    fontSize: 14,
  },
  repoName: {
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  openBadge: {
    backgroundColor: 'rgba(35, 134, 54, 0.25)',
    borderWidth: 1,
    borderColor: '#238636',
  },
  failBadge: {
    backgroundColor: 'rgba(218, 54, 51, 0.25)',
    borderWidth: 1,
    borderColor: '#DA3633',
  },
  statusText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  openText: {
    color: '#3FB950',
  },
  failText: {
    color: '#F85149',
  },
  body: {
    padding: 10,
  },
  prNumber: {
    color: COLORS.primary,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  prTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  checksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  checksText: {
    color: '#3FB950',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  checksTime: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    padding: 8,
    gap: 8,
    backgroundColor: '#131A22',
    borderTopWidth: 1,
    borderTopColor: '#202A36',
  },
  viewBtn: {
    flex: 1,
    backgroundColor: '#1F2A38',
    paddingVertical: 6,
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#303E50',
  },
  viewBtnText: {
    color: COLORS.textPrimary,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  rebuildBtn: {
    flex: 1,
    backgroundColor: 'rgba(0, 255, 102, 0.12)',
    paddingVertical: 6,
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.4)',
  },
  rebuildingBtn: {
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    borderColor: COLORS.warning,
  },
  rebuildBtnText: {
    color: COLORS.primary,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '800',
  },
  buildNotice: {
    backgroundColor: '#0A0E12',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  buildNoticeText: {
    color: COLORS.primary,
    fontFamily: 'monospace',
    fontSize: 9,
    textAlign: 'center',
  },
});

export default RepoCardBubble;
