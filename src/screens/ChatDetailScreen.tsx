import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { COLORS } from '../theme/colors';
import dbManager, { CURRENT_USER_ID } from '../db/client';
import { HydratedMessage } from '../db/types';
import CodeSnippetBubble from '../components/CodeSnippetBubble';
import EnvVaultBubble from '../components/EnvVaultBubble';
import RepoCardBubble from '../components/RepoCardBubble';
import MessageStatusTicks from '../components/MessageStatusTicks';

export const ChatDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { chatId, chatTitle } = route.params || { chatId: 'chat_dm_dan', chatTitle: 'Dan (Frontend Lead)' };

  const [messages, setMessages] = useState<HydratedMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [replyingLine, setReplyingLine] = useState<{ line: number; text: string; msgId?: string } | null>(null);

  // Modals for Code Composer and .env Vault Composer
  const [codeModalVisible, setCodeModalVisible] = useState<boolean>(false);
  const [codeDraft, setCodeDraft] = useState<string>('');
  const [codeLang, setCodeLang] = useState<string>('typescript');

  const [envModalVisible, setEnvModalVisible] = useState<boolean>(false);
  const [envDraft, setEnvDraft] = useState<string>('');
  const [envTimer, setEnvTimer] = useState<number>(60);

  const flatListRef = useRef<FlatList>(null);

  const loadMessages = useCallback(async () => {
    const data = await dbManager.getMessages(chatId);
    setMessages(data);
  }, [chatId]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 1000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  const handleSendTextMessage = async () => {
    if (!inputText.trim()) return;
    const content = inputText.trim();
    setInputText('');

    const metadata = replyingLine
      ? { targetLine: replyingLine.line, targetSnippet: replyingLine.text }
      : undefined;

    const quotedMessageId = replyingLine?.msgId;
    setReplyingLine(null);

    await dbManager.sendMessage({
      chatId,
      senderId: CURRENT_USER_ID,
      content,
      messageType: 'text',
      metadata,
      quotedMessageId,
    });

    await loadMessages();
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleSendCodeSnippet = async () => {
    if (!codeDraft.trim()) return;
    const code = codeDraft.trim();
    setCodeModalVisible(false);
    setCodeDraft('');

    await dbManager.sendMessage({
      chatId,
      senderId: CURRENT_USER_ID,
      content: code,
      messageType: 'code',
      metadata: {
        language: codeLang,
        lineCount: code.split('\n').length,
      },
    });

    await loadMessages();
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleSendEnvSecret = async () => {
    if (!envDraft.trim()) return;
    const secret = envDraft.trim();
    setEnvModalVisible(false);
    setEnvDraft('');

    await dbManager.sendMessage({
      chatId,
      senderId: CURRENT_USER_ID,
      content: secret,
      messageType: 'env_secret',
      metadata: {
        readTimerSeconds: envTimer,
        isBurned: false,
      },
    });

    await loadMessages();
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleBurnSecret = (messageId: string) => {
    dbManager.burnEnvSecret(messageId);
    loadMessages();
  };

  const handleSelectLineForReview = (lineNumber: number, lineText: string, messageId: string) => {
    setReplyingLine({
      line: lineNumber,
      text: lineText,
      msgId: messageId,
    });
  };

  const renderMessageItem = ({ item }: { item: HydratedMessage }) => {
    const isSentByMe = item.sender_id === CURRENT_USER_ID;

    return (
      <View style={[styles.messageRow, isSentByMe ? styles.sentRow : styles.receivedRow]}>
        <View
          style={[
            styles.bubble,
            isSentByMe ? styles.bubbleSent : styles.bubbleReceived,
          ]}
        >
          {/* Sender label for group/received messages */}
          {!isSentByMe && item.sender && (
            <Text style={styles.senderName}>{item.sender.display_name}</Text>
          )}

          {/* Line review quote banner if this message quotes a specific line */}
          {item.metadataParsed?.targetLine && (
            <View style={styles.lineQuoteBanner}>
              <Text style={styles.lineQuoteHeader}>
                ↳ Replying to line {item.metadataParsed.targetLine}
              </Text>
              {item.metadataParsed.targetSnippet ? (
                <Text style={styles.lineQuoteSnippet} numberOfLines={1}>
                  {item.metadataParsed.targetSnippet}
                </Text>
              ) : null}
            </View>
          )}

          {/* Core Content based on message_type */}
          {item.message_type === 'code' ? (
            <CodeSnippetBubble
              code={item.content}
              language={item.metadataParsed?.language}
              filename={item.metadataParsed?.filename}
              targetLine={item.metadataParsed?.targetLine}
              onSelectLine={(lineNum, lineTxt) =>
                handleSelectLineForReview(lineNum, lineTxt, item.id)
              }
            />
          ) : item.message_type === 'env_secret' ? (
            <EnvVaultBubble
              messageId={item.id}
              secretContent={item.content}
              isBurned={item.metadataParsed?.isBurned}
              readTimerSeconds={item.metadataParsed?.readTimerSeconds || 60}
              onBurn={handleBurnSecret}
            />
          ) : item.message_type === 'system' && item.metadataParsed?.prNumber ? (
            <RepoCardBubble
              repoName={item.metadataParsed.repoName}
              prNumber={item.metadataParsed.prNumber}
              prTitle={item.metadataParsed.prTitle}
              prStatus={item.metadataParsed.prStatus}
              actionUrl={item.metadataParsed.actionUrl}
            />
          ) : (
            <Text style={styles.textMessageContent}>{item.content}</Text>
          )}

          {/* Delivery ACK Ticks (Pending, Sent, Delivered, Read) */}
          <MessageStatusTicks
            status={item.status}
            timestamp={item.created_at}
            isSentByMe={isSentByMe}
          />
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle} numberOfLines={1}>{chatTitle}</Text>
          <View style={styles.headerSubtitleRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.headerSubtitle}>e2e ephemeral relay active</Text>
          </View>
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => setEnvModalVisible(true)}
          >
            <Text style={styles.lockHeaderIcon}>🔐</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages Feed */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Replying Line Banner */}
      {replyingLine && (
        <View style={styles.replyBanner}>
          <View style={styles.replyBannerLeft}>
            <Text style={styles.replyBannerTitle}>Replying to Line {replyingLine.line}:</Text>
            <Text style={styles.replyBannerSnippet} numberOfLines={1}>
              {replyingLine.text}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setReplyingLine(null)}>
            <Text style={styles.replyBannerClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Input Bar */}
      <View style={styles.inputBar}>
        {/* Code Snippet Button </> */}
        <TouchableOpacity
          style={styles.toolbarBtn}
          onPress={() => setCodeModalVisible(true)}
        >
          <Text style={styles.codeToolbarText}>&lt;/&gt;</Text>
        </TouchableOpacity>

        {/* Lock (.env Vault) Button */}
        <TouchableOpacity
          style={styles.toolbarBtn}
          onPress={() => setEnvModalVisible(true)}
        >
          <Text style={styles.lockToolbarText}>🔐</Text>
        </TouchableOpacity>

        {/* Text Input */}
        <TextInput
          style={styles.textInput}
          placeholder="Message or paste snippet..."
          placeholderTextColor={COLORS.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />

        {/* Send Button */}
        <TouchableOpacity
          style={[styles.sendBtn, inputText.trim().length > 0 && styles.sendBtnActive]}
          onPress={handleSendTextMessage}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendBtnText}>ACK</Text>
        </TouchableOpacity>
      </View>

      {/* Code Composer Modal */}
      <Modal visible={codeModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>&lt;/&gt; SHARE CODE SNIPPET</Text>
              <TouchableOpacity onPress={() => setCodeModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.langSelectorRow}>
              {['typescript', 'python', 'go', 'rust', 'sql', 'bash'].map((lang) => (
                <TouchableOpacity
                  key={lang}
                  onPress={() => setCodeLang(lang)}
                  style={[styles.langBadge, codeLang === lang && styles.langBadgeActive]}
                >
                  <Text style={[styles.langText, codeLang === lang && styles.langTextActive]}>
                    {lang}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.codeModalInput}
              placeholder="// Paste your code or git diff here..."
              placeholderTextColor={COLORS.textMuted}
              value={codeDraft}
              onChangeText={setCodeDraft}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setCodeModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>CANCEL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.postCodeBtn}
                onPress={handleSendCodeSnippet}
              >
                <Text style={styles.postCodeBtnText}>POST SNIPPET</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Burn-After-Reading .env Vault Composer Modal */}
      <Modal visible={envModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { borderColor: COLORS.warning }]}>
            <View style={[styles.modalHeader, { backgroundColor: '#201A0B' }]}>
              <Text style={[styles.modalTitle, { color: COLORS.warning }]}>
                🔐 CREATE BURN-AFTER-READING .ENV VAULT
              </Text>
              <TouchableOpacity onPress={() => setEnvModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.timerSelectorRow}>
              <Text style={styles.timerLabel}>Self-Destruct Timer:</Text>
              {[30, 60, 300, 600].map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setEnvTimer(t)}
                  style={[styles.timerPill, envTimer === t && styles.timerPillActive]}
                >
                  <Text style={[styles.timerPillText, envTimer === t && styles.timerPillTextActive]}>
                    {t >= 60 ? `${t / 60}m` : `${t}s`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.codeModalInput, { borderColor: 'rgba(255, 184, 0, 0.4)' }]}
              placeholder={`# Paste secret environment variables:\nAPI_KEY=sk_live_...\nDATABASE_URL=postgres://...`}
              placeholderTextColor={COLORS.textMuted}
              value={envDraft}
              onChangeText={setEnvDraft}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEnvModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>CANCEL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.postCodeBtn, { backgroundColor: COLORS.warning }]}
                onPress={handleSendEnvSecret}
              >
                <Text style={[styles.postCodeBtnText, { color: '#0B0F12' }]}>
                  ENCRYPT & SEND
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10161D',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    paddingRight: 10,
    paddingLeft: 4,
  },
  backBtnText: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 28,
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '700',
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  headerSubtitle: {
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    fontSize: 10,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  headerIconBtn: {
    padding: 6,
  },
  lockHeaderIcon: {
    fontSize: 18,
  },
  messagesList: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  messageRow: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  sentRow: {
    justifyContent: 'flex-end',
  },
  receivedRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '88%',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  bubbleSent: {
    backgroundColor: COLORS.bubbleSent,
    borderWidth: 1,
    borderColor: COLORS.bubbleSentBorder,
  },
  bubbleReceived: {
    backgroundColor: COLORS.bubbleReceived,
    borderWidth: 1,
    borderColor: COLORS.bubbleReceivedBorder,
  },
  senderName: {
    color: COLORS.primary,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  textMessageContent: {
    color: COLORS.textPrimary,
    fontSize: 13,
    lineHeight: 18,
  },
  lineQuoteBanner: {
    backgroundColor: 'rgba(0, 255, 102, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    paddingLeft: 8,
    paddingVertical: 4,
    marginBottom: 6,
    borderRadius: 2,
  },
  lineQuoteHeader: {
    color: COLORS.primary,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  lineQuoteSnippet: {
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    fontSize: 10,
  },
  replyBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#101720',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.primary,
  },
  replyBannerLeft: {
    flex: 1,
  },
  replyBannerTitle: {
    color: COLORS.primary,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
  },
  replyBannerSnippet: {
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    fontSize: 11,
  },
  replyBannerClose: {
    color: COLORS.textMuted,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 6,
  },
  toolbarBtn: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: '#0E141B',
    borderWidth: 1,
    borderColor: '#212C38',
  },
  codeToolbarText: {
    color: COLORS.primary,
    fontFamily: 'monospace',
    fontWeight: '800',
    fontSize: 12,
  },
  lockToolbarText: {
    fontSize: 14,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    color: COLORS.textPrimary,
    fontFamily: 'monospace',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: '#1C2632',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  sendBtnActive: {
    backgroundColor: COLORS.primary,
  },
  sendBtnText: {
    color: '#0B0F12',
    fontFamily: 'monospace',
    fontWeight: '900',
    fontSize: 11,
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#0F161E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#16202A',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modalTitle: {
    color: COLORS.primary,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '800',
  },
  modalClose: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontFamily: 'monospace',
  },
  langSelectorRow: {
    flexDirection: 'row',
    padding: 8,
    gap: 6,
    flexWrap: 'wrap',
  },
  langBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#141E28',
    borderWidth: 1,
    borderColor: '#263444',
  },
  langBadgeActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0, 255, 102, 0.15)',
  },
  langText: {
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    fontSize: 10,
  },
  langTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  timerSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 8,
  },
  timerLabel: {
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    fontSize: 10,
  },
  timerPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#201A0B',
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.4)',
  },
  timerPillActive: {
    backgroundColor: COLORS.warning,
  },
  timerPillText: {
    color: COLORS.warning,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  timerPillTextActive: {
    color: '#0B0F12',
  },
  codeModalInput: {
    height: 180,
    backgroundColor: '#090D11',
    margin: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#202A36',
    color: COLORS.textPrimary,
    fontFamily: 'monospace',
    fontSize: 12,
    padding: 10,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 8,
    gap: 8,
    backgroundColor: '#121922',
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  cancelBtnText: {
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    fontSize: 11,
  },
  postCodeBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 4,
  },
  postCodeBtnText: {
    color: '#0B0F12',
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '800',
  },
});

export default ChatDetailScreen;
