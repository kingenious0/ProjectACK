import React, { useState, useEffect } from 'react';
import { webStore, Chat, Message } from './web-db/store';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { AddFriendsModal } from './components/AddFriendsModal';
import { PrDiffModal } from './components/PrDiffModal';
import { CreateVaultModal } from './components/CreateVaultModal';
import { CreateCodeModal } from './components/CreateCodeModal';

export const App: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>(webStore.getChats());
  const [activeChatId, setActiveChatId] = useState<string | null>('chat_robert_jonas');
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

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

  return (
    <div className="snapcord-app" id="snapcord-root">
      <div className="snapcord-viewport">
        {/* Screen 1: Snapchat Chat List with Discord Badges */}
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onOpenAddFriends={() => setIsAddFriendsOpen(true)}
          onOpenCreateVault={() => setIsVaultModalOpen(true)}
          onOpenCreateCode={() => setIsCodeModalOpen(true)}
          isMobileViewHidden={isMobileChatOpen}
        />

        {/* Screen 2, 3 & 5: Snapchat Ephemeral Stream + Discord Code Embeds + Input Dock */}
        <ChatView
          chat={activeChat}
          messages={activeMessages}
          onSendMessage={handleSendMessage}
          onOpenCodeModal={() => setIsCodeModalOpen(true)}
          onOpenVaultModal={() => setIsVaultModalOpen(true)}
          onOpenPrModal={handleOpenPrModal}
          onBackToSidebar={() => setIsMobileChatOpen(false)}
          isMobileActive={isMobileChatOpen}
        />
      </div>

      {/* Screen 4: Add Friends & Quick Add Developer Modal */}
      <AddFriendsModal
        isOpen={isAddFriendsOpen}
        onClose={() => setIsAddFriendsOpen(false)}
        onSelectNewChat={handleSelectChat}
      />

      {/* Developer Modals */}
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
