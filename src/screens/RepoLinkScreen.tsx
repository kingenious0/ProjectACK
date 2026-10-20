import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { COLORS } from '../theme/colors';

interface RepoLink {
  id: string;
  repo: string;
  chatTarget: string;
  secret: string;
  active: boolean;
  events: string[];
}

export const RepoLinkScreen: React.FC = () => {
  const [links, setLinks] = useState<RepoLink[]>([
    {
      id: 'link_1',
      repo: 'ack-messenger/core',
      chatTarget: '#general-infra',
      secret: 'whsec_9876543210',
      active: true,
      events: ['pull_request', 'workflow_run', 'deployment'],
    },
    {
      id: 'link_2',
      repo: 'ack-messenger/mobile-app',
      chatTarget: 'github: ack-messenger/core',
      secret: 'whsec_github_repo_webhook_secret',
      active: true,
      events: ['pull_request', 'release'],
    },
  ]);

  const [newRepo, setNewRepo] = useState<string>('');
  const [newChat, setNewChat] = useState<string>('#general-infra');

  const handleCreateWebhook = () => {
    if (!newRepo.trim()) {
      Alert.alert('Missing Repository', 'Please enter a GitHub repository (e.g. org/repo).');
      return;
    }

    const secret = `whsec_${Math.random().toString(36).substring(2, 12)}`;
    const newEntry: RepoLink = {
      id: `link_${Date.now()}`,
      repo: newRepo.trim(),
      chatTarget: newChat,
      secret,
      active: true,
      events: ['pull_request', 'check_suite'],
    };

    setLinks([newEntry, ...links]);
    setNewRepo('');
    Alert.alert(
      'Webhook Endpoint Generated',
      `Endpoint: https://ack.internal/api/hook/${newEntry.id}\nSecret: ${secret}\n\nAdd this to your GitHub Repository Webhooks settings.`
    );
  };

  const handleCopySecret = (secret: string) => {
    Alert.alert('Webhook Secret Copied', secret);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>REPO-LINKED TEAM CHATS</Text>
        <Text style={styles.headerSubtitle}>
          Real-time GitHub Webhook dispatch & interactive PR controls
        </Text>
      </View>

      {/* Link New Repo Card */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>LINK GITHUB REPOSITORY</Text>

        <Text style={styles.fieldLabel}>Repository Name (org/repo)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. facebook/react-native"
          placeholderTextColor={COLORS.textMuted}
          value={newRepo}
          onChangeText={setNewRepo}
          autoCapitalize="none"
        />

        <Text style={styles.fieldLabel}>Dispatch Events to Chat:</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. #prod-cluster-infra"
          placeholderTextColor={COLORS.textMuted}
          value={newChat}
          onChangeText={setNewChat}
        />

        <TouchableOpacity style={styles.linkBtn} onPress={handleCreateWebhook}>
          <Text style={styles.linkBtnText}>+ GENERATE WEBHOOK ENDPOINT</Text>
        </TouchableOpacity>
      </View>

      {/* Active Repos List */}
      <View style={styles.listSection}>
        <Text style={styles.sectionHeader}>ACTIVE LINKED REPOSITORIES ({links.length})</Text>

        {links.map((link) => (
          <View key={link.id} style={styles.repoItem}>
            <View style={styles.repoItemHeader}>
              <View style={styles.repoTitleRow}>
                <Text style={styles.repoIcon}>🐙</Text>
                <Text style={styles.repoName}>{link.repo}</Text>
              </View>
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>CONNECTED</Text>
              </View>
            </View>

            <Text style={styles.targetLabel}>
              Routes to: <Text style={{ color: COLORS.primary }}>{link.chatTarget}</Text>
            </Text>

            <View style={styles.endpointBox}>
              <Text style={styles.endpointText}>
                POST /api/hook/{link.id}
              </Text>
              <TouchableOpacity
                style={styles.copySecretBtn}
                onPress={() => handleCopySecret(link.secret)}
              >
                <Text style={styles.copySecretText}>KEY</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.eventsRow}>
              {link.events.map((ev) => (
                <View key={ev} style={styles.eventBadge}>
                  <Text style={styles.eventText}>• {ev}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
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
  card: {
    backgroundColor: COLORS.surface,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    padding: 14,
  },
  cardSectionTitle: {
    color: COLORS.primary,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 10,
  },
  fieldLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    color: COLORS.textPrimary,
    fontFamily: 'monospace',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 10,
  },
  linkBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  linkBtnText: {
    color: '#0B0F12',
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '900',
  },
  listSection: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  sectionHeader: {
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 10,
  },
  repoItem: {
    backgroundColor: '#101720',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#212D3B',
    padding: 12,
    marginBottom: 12,
  },
  repoItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  repoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  repoIcon: {
    fontSize: 14,
  },
  repoName: {
    color: COLORS.textPrimary,
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '700',
  },
  activePill: {
    backgroundColor: 'rgba(0, 255, 102, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activePillText: {
    color: COLORS.primary,
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  targetLabel: {
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    fontSize: 11,
    marginBottom: 6,
  },
  endpointBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#090D11',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#1D2733',
    marginBottom: 8,
  },
  endpointText: {
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    fontSize: 10,
  },
  copySecretBtn: {
    backgroundColor: '#1E2B3A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  copySecretText: {
    color: COLORS.warning,
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  eventsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  eventBadge: {
    backgroundColor: '#141D26',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  eventText: {
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    fontSize: 10,
  },
});

export default RepoLinkScreen;
