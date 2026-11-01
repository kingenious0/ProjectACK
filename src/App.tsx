import React, { useState, useEffect } from 'react';
import { webStore, Chat, Message } from './web-db/store';
import { WhatsAppSidebar } from './components/whatsapp/WhatsAppSidebar';
import { WhatsAppChatArea } from './components/whatsapp/WhatsAppChatArea';
import { AddFriendsModal } from './components/AddFriendsModal';
import { CreateVaultModal } from './components/CreateVaultModal';
import { CreateCodeModal } from './components/CreateCodeModal';
import { VideoCallOverlay } from './components/VideoCallOverlay';
import './theme/whatsapp.css';

export const App: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>(webStore.getChats());
  const [activeChatId, setActiveChatId] = useState<string | null>('chat_robert_jonas');
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

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

  const handleOpenCall = (type: 'audio' | 'video') => {
    setCallType(type);
    setIsCallOpen(true);
  };

  return (
    <div className="wa-app-root" id="whatsapp-root">
      <div className="wa-desktop-window">
        {/* Left Column: 1:1 WhatsApp Web Sidebar */}
        <WhatsAppSidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onOpenNewChat={() => setIsAddFriendsOpen(true)}
          onOpenCreateVault={() => setIsVaultModalOpen(true)}
          onOpenCreateCode={() => setIsCodeModalOpen(true)}
          isMobileHidden={isMobileChatOpen}
        />

        {/* Right Column: 1:1 WhatsApp Web Chat Area with Code & Vault bubbles */}
        <WhatsAppChatArea
          chat={activeChat}
          messages={activeMessages}
          onSendMessage={handleSendMessage}
          onSendCode={() => setIsCodeModalOpen(true)}
          onSendVault={() => setIsVaultModalOpen(true)}
          onBackToSidebar={() => setIsMobileChatOpen(false)}
          onOpenCall={handleOpenCall}
          isMobileActive={isMobileChatOpen}
        />
      </div>

      {/* WhatsApp-Style Modals */}
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
