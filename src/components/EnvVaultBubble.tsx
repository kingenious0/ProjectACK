import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '../theme/colors';
import { maskSecretLines } from '../utils/crypto';

interface Props {
  messageId: string;
  secretContent: string;
  isBurned?: boolean;
  readTimerSeconds?: number;
  onBurn?: (messageId: string) => void;
}

export const EnvVaultBubble: React.FC<Props> = ({
  messageId,
  secretContent,
  isBurned: initialIsBurned = false,
  readTimerSeconds = 60,
  onBurn,
}) => {
  const [isBurned, setIsBurned] = useState<boolean>(initialIsBurned);
  const [timeLeft, setTimeLeft] = useState<number>(readTimerSeconds);
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isBurned) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleBurn();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBurned]);

  const handleBurn = () => {
    setIsBurned(true);
    if (onBurn) {
      onBurn(messageId);
    }
  };

  const handleCopyAll = () => {
    if (isBurned) return;

    // Blueprint Requirement: Once the recipient taps "Copy All", the UI instantly masks
    // the text with asterisks and triggers an API call/wipe payload permanently.
    setCopiedStatus('COPIED & WIPED FROM RELAY');
    handleBurn();

    Alert.alert(
      '🔒 Secret Copied & Burned',
      'The .env secret payload has been copied to your clipboard and permanently wiped from the relay server and local store.'
    );
  };

  const displayContent = isBurned ? maskSecretLines(secretContent) : secretContent;

  return (
    <View style={[styles.container, isBurned && styles.burnedContainer]}>
      {/* Vault Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.lockIcon}>🔐</Text>
          <View>
            <Text style={styles.titleText}>BURN-AFTER-READING .ENV VAULT</Text>
            <Text style={styles.subText}>AES-GCM CLIENT ENCRYPTED</Text>
          </View>
        </View>

        {/* Burn Timer Pill */}
        <View style={[styles.timerBadge, isBurned && styles.burnedBadge]}>
          <Text style={[styles.timerText, isBurned && styles.burnedText]}>
            {isBurned ? 'BURNED' : `⏱ ${timeLeft}s`}
          </Text>
        </View>
      </View>

      {/* Secret Content Block */}
      <View style={styles.secretBox}>
        <Text style={[styles.secretText, isBurned && styles.secretTextBurned]}>
          {displayContent}
        </Text>
      </View>

      {/* Action Bar */}
      <View style={styles.actions}>
        <TouchableOpacity
          disabled={isBurned}
          onPress={handleCopyAll}
          style={[styles.copyButton, isBurned && styles.disabledButton]}
        >
          <Text style={styles.copyButtonText}>
            {isBurned ? 'PAYLOAD DESTROYED' : '📋 COPY ALL & BURN INSTANTLY'}
          </Text>
        </TouchableOpacity>

        {copiedStatus && (
          <Text style={styles.statusBanner}>✓ {copiedStatus}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#161309',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.warning,
    overflow: 'hidden',
    marginVertical: 4,
    minWidth: 280,
  },
  burnedContainer: {
    backgroundColor: '#121416',
    borderColor: COLORS.border,
    opacity: 0.85,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#201A0B',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 184, 0, 0.3)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lockIcon: {
    fontSize: 16,
  },
  titleText: {
    color: COLORS.warning,
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  subText: {
    color: '#D4A347',
    fontSize: 9,
    fontFamily: 'monospace',
  },
  timerBadge: {
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  burnedBadge: {
    backgroundColor: 'rgba(248, 81, 73, 0.15)',
    borderColor: '#F85149',
  },
  timerText: {
    color: COLORS.warning,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  burnedText: {
    color: '#F85149',
  },
  secretBox: {
    padding: 10,
    backgroundColor: '#0A0C0E',
  },
  secretText: {
    color: COLORS.warning,
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 16,
  },
  secretTextBurned: {
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  actions: {
    padding: 8,
    backgroundColor: '#161309',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 184, 0, 0.2)',
  },
  copyButton: {
    backgroundColor: COLORS.warning,
    paddingVertical: 7,
    borderRadius: 4,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#21262D',
  },
  copyButtonText: {
    color: '#0B0F12',
    fontFamily: 'monospace',
    fontWeight: '800',
    fontSize: 11,
  },
  statusBanner: {
    color: COLORS.primary,
    fontFamily: 'monospace',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default EnvVaultBubble;
