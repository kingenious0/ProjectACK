import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';
import { MessageStatus } from '../db/types';

interface Props {
  status: MessageStatus;
  timestamp?: string;
  isSentByMe: boolean;
}

export const MessageStatusTicks: React.FC<Props> = ({ status, timestamp, isSentByMe }) => {
  const formatTime = (ts?: string) => {
    if (!ts) return '';
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return '';
    }
  };

  const renderStatus = () => {
    if (!isSentByMe) return null;

    switch (status) {
      case 'pending':
        return <Text style={[styles.statusText, { color: COLORS.statusPending }]}>⏱</Text>;
      case 'sent':
        return <Text style={[styles.statusText, { color: COLORS.statusSent }]}>✓</Text>;
      case 'delivered':
        return <Text style={[styles.statusText, { color: COLORS.statusDelivered }]}>✓✓</Text>;
      case 'read':
        return <Text style={[styles.statusText, { color: COLORS.statusRead, fontWeight: '700' }]}>✓✓</Text>;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {timestamp ? <Text style={styles.timestamp}>{formatTime(timestamp)}</Text> : null}
      {renderStatus()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  timestamp: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
  },
  statusText: {
    fontSize: 11,
    letterSpacing: -1,
  },
});

export default MessageStatusTicks;
