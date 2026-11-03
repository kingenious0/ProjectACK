import React, { useState, useEffect } from 'react';
import { webStore, Chat, Message } from './web-db/store';
import { WorkspaceDock, WorkspaceCategory } from './components/whatsapp/WorkspaceDock';
import { WhatsAppSidebar } from './components/whatsapp/WhatsAppSidebar';
import { WhatsAppChatArea } from './components/whatsapp/WhatsAppChatArea';
import { CodeReviewPayload } from './components/whatsapp/CodeReviewDrawer';
import { AddFriendsModal } from './components/AddFriendsModal';
import { CreateVaultModal } from './components/CreateVaultModal';
import { CreateCodeModal } from './components/CreateCodeModal';
import { VideoCallOverlay } from './components/VideoCallOverlay';
import './theme/whatsapp.css';

export const App: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>(webStore.getChats());
  const [activeChatId, setActiveChatId] = useState<string | null>('chat_torvalds_repo');
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<WorkspaceCategory>('relays');
  const [activeReviewPayload, setActiveReviewPayload] = useState<CodeReviewPayload | null>(null);

  // Modals & Overlays
  const [isAddFriendsOpen, setIsAddFriendsOpen] = useState(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video'>('video');

  // Reactive subscription
  useEffect(() => {
    const unsubscribe = webStore.subscribe(() => {
      setChats([...webStore.getChats()]);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const activeChat = chats.find((c) => c.id === activeChatId) || null;
  const activeMessages: Message[] = activeChatId ? webStore.getMessages(activeChatId) : [];
  const totalUnread = chats.reduce((acc, c) => acc + c.unreadCount, 0);

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

  const handleOpenCall = (type: 'audio' | 'video') => {
    setCallType(type);
    setIsCallOpen(true);
  };

  return (
    <div className="wa-app-root" id="whatsapp-root">
      <div className="wa-desktop-window">
        {/* Extreme Left Workspace Selector Dock (Desktop) */}
        <WorkspaceDock
          activeCategory={activeCategory}
          onSelectCategory={(cat) => {
            setActiveCategory(cat);
            // If selecting repos on desktop, can highlight or switch to first repo
            if (cat === 'repos') {
              const firstRepo = chats.find((c) => c.type === 'repo');
              if (firstRepo) setActiveChatId(firstRepo.id);
            } else if (cat === 'webhooks') {
              const whChat = chats.find((c) => c.id === 'chat_webhook_ci');
              if (whChat) setActiveChatId(whChat.id);
            }
          }}
          unreadCount={totalUnread}
          onOpenSettings={() => alert('ACK. — CHAT4DEVS Dev Control Center\nActive Environment: Staging\nGit: kingenious0/ProjectACK')}
        />

        {/* Workspace Hub Panel (IDE Collapsible Repository Tree) */}
        <WhatsAppSidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onOpenNewChat={() => setIsAddFriendsOpen(true)}
          onOpenCreateVault={() => setIsVaultModalOpen(true)}
          onOpenCreateCode={() => setIsCodeModalOpen(true)}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          isMobileHidden={isMobileChatOpen}
        />

        {/* Main Action Canvas (Split View: Chat Stream / Monospace Code Review Canvas) */}
        <WhatsAppChatArea
          chat={activeChat}
          messages={activeMessages}
          onSendMessage={handleSendMessage}
          onSendCode={() => setIsCodeModalOpen(true)}
          onSendVault={() => setIsVaultModalOpen(true)}
          onBackToSidebar={() => {
            setIsMobileChatOpen(false);
            setActiveReviewPayload(null);
          }}
          onOpenCall={handleOpenCall}
          isMobileActive={isMobileChatOpen}
          activeReviewPayload={activeReviewPayload}
          onOpenReview={setActiveReviewPayload}
          onCloseReview={() => setActiveReviewPayload(null)}
          onSendReviewComment={handleSendMessage}
        />
      </div>

      {/* Developer Tooling Modals */}
      <AddFriendsModal
        isOpen={isAddFriendsOpen}
        onClose={() => setIsAddFriendsOpen(false)}
        onSelectNewChat={handleSelectChat}
      />

      <CreateCodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        onSendCode={handleSendCode}
      />

      <CreateVaultModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
        onSendVault={handleSendVault}
      />

      <VideoCallOverlay
        isOpen={isCallOpen}
        chat={activeChat}
        callType={callType}
        onClose={() => setIsCallOpen(false)}
      />
    </div>
  );
};

export default App;
