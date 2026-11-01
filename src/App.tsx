import React, { useState, useEffect } from 'react';
import { webStore, Chat, Message } from './web-db/store';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { AddFriendsModal } from './components/AddFriendsModal';
import { PrDiffModal } from './components/PrDiffModal';
import { CreateVaultModal } from './components/CreateVaultModal';
import { CreateCodeModal } from './components/CreateCodeModal';
import { VideoCallOverlay } from './components/VideoCallOverlay';
import { PinSecurityModal } from './components/PinSecurityModal';
import { ProtectedChatDrawer } from './components/ProtectedChatDrawer';

export const App: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>(webStore.getChats());
  const [activeChatId, setActiveChatId] = useState<string | null>('chat_robert_jonas');
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  // E-Chat & Snapcord Experiences
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video'>('video');
  const [isPinSecurityOpen, setIsPinSecurityOpen] = useState(false);
  const [isProtectedDrawerOpen, setIsProtectedDrawerOpen] = useState(false);

  // Modals
  const [isAddFriendsOpen, setIsAddFriendsOpen] = useState(false);
  const [isPrModalOpen, setIsPrModalOpen] = useState(false);
  const [activePrData, setActivePrData] = useState<any>(null);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

  // Subscribe to web store reactive updates
  useEffect(() => {
    const unsubscribe = webStore.subscribe(() => {
      setChats([...webStore.getChats()]);
    });
    return unsubscribe;
  }, []);

  const activeChat = chats.find((c) => c.id === activeChatId) || null;
  const activeMessages: Message[] = activeChatId ? webStore.getMessages(activeChatId) : [];

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setIsMobileChatOpen(true);
  };

  const handleSendMessage = (text: string) => {
    if (!activeChatId) return;
    webStore.sendMessage(activeChatId, text, 'text');
  };

  const handleSendAudioNote = (duration: string, waveform: number[]) => {
    if (!activeChatId) return;
    webStore.sendMessage(activeChatId, `Voice note (${duration})`, 'audio_note', {
      audioDuration: duration,
      waveform,
    });
  };

  const handleSendVault = (title: string, rawSecret: string, ttlSeconds: number) => {
    if (!activeChatId) return;
    webStore.sendMessage(activeChatId, title, 'env_secret', {
      secretMasked: rawSecret,
      ttlSeconds,
      isBurned: false,
    });
  };

  const handleSendCode = (code: string, language: string, title: string) => {
    if (!activeChatId) return;
    webStore.sendMessage(activeChatId, title, 'code', {
      language,
      codeSnippet: code,
    });
  };

  const handleOpenPrModal = (msgMetadata?: any) => {
    if (msgMetadata) {
      setActivePrData(msgMetadata);
    } else {
      const torvaldsMsg = webStore.getMessages('chat_torvalds_repo').find((m) => m.type === 'pr_card');
      setActivePrData(torvaldsMsg?.metadata);
    }
    setIsPrModalOpen(true);
  };

  const handlePrCommentSubmit = (comment: string) => {
    if (!activeChatId) return;
    webStore.sendMessage(activeChatId, comment, 'text');
  };

  const handleOpenCall = (type: 'audio' | 'video') => {
    setCallType(type);
    setIsCallOpen(true);
  };

  const handlePinSuccess = () => {
    setIsVaultModalOpen(true);
  };

  return (
    <div className="snapcord-app" id="snapcord-root">
      <div className="snapcord-viewport">
        {/* Screen 1: E-Chat & Snapchat Hybrid Sidebar with Category Filters */}
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onOpenAddFriends={() => setIsAddFriendsOpen(true)}
          onOpenCreateVault={() => setIsVaultModalOpen(true)}
          onOpenCreateCode={() => setIsCodeModalOpen(true)}
          onOpenPinSecurity={() => setIsPinSecurityOpen(true)}
          isMobileViewHidden={isMobileChatOpen}
        />

        {/* Screen 2: Ephemeral Stream + E-Chat Waveform Voice Notes + Discord Code Embeds */}
        <ChatView
          chat={activeChat}
          messages={activeMessages}
          onSendMessage={handleSendMessage}
          onSendAudioNote={handleSendAudioNote}
          onOpenCodeModal={() => setIsCodeModalOpen(true)}
          onOpenVaultModal={() => setIsVaultModalOpen(true)}
          onOpenPrModal={handleOpenPrModal}
          onBackToSidebar={() => setIsMobileChatOpen(false)}
          onOpenCall={handleOpenCall}
          onOpenProtectedDrawer={() => setIsProtectedDrawerOpen(true)}
          isMobileActive={isMobileChatOpen}
        />
      </div>

      {/* Screen 3: E-Chat Fullscreen Video / Audio Call Overlay */}
      <VideoCallOverlay
        isOpen={isCallOpen}
        chat={activeChat}
        callType={callType}
        onClose={() => setIsCallOpen(false)}
      />

      {/* Screen 4: E-Chat PIN & Biometric Security Keypad Modal */}
      <PinSecurityModal
        isOpen={isPinSecurityOpen}
        onClose={() => setIsPinSecurityOpen(false)}
        onSuccess={handlePinSuccess}
      />

      {/* Screen 5: Protected Chat & Collab Room Settings Drawer */}
      <ProtectedChatDrawer
        isOpen={isProtectedDrawerOpen}
        chat={activeChat}
        onClose={() => setIsProtectedDrawerOpen(false)}
        onOpenVault={() => setIsVaultModalOpen(true)}
        onOpenCode={() => setIsCodeModalOpen(true)}
      />

      {/* Screen 6: Add Friends & Quick Add Developer Modal */}
      <AddFriendsModal
        isOpen={isAddFriendsOpen}
        onClose={() => setIsAddFriendsOpen(false)}
        onSelectNewChat={handleSelectChat}
      />

      {/* Developer Tooling Modals */}
      <PrDiffModal
        isOpen={isPrModalOpen}
        onClose={() => setIsPrModalOpen(false)}
        prNumber={activePrData?.prNumber}
        prTitle={activePrData?.prTitle}
        prBranch={activePrData?.prBranch}
        diffFiles={activePrData?.diffFiles}
        onCommentSubmit={handlePrCommentSubmit}
      />

      <CreateVaultModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
        onSendVault={handleSendVault}
      />

      <CreateCodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        onSendCode={handleSendCode}
      />
    </div>
  );
};

export default App;
