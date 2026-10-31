import React, { useState, useEffect } from 'react';
import { webStore, Chat, Message, ShipLog } from './web-db/store';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { PrDiffModal } from './components/PrDiffModal';
import { CreateVaultModal } from './components/CreateVaultModal';
import { CreateCodeModal } from './components/CreateCodeModal';
import { ShipLogsModal } from './components/ShipLogsModal';

export const App: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>(webStore.getChats());
  const [activeChatId, setActiveChatId] = useState<string | null>('chat_torvalds_repo');
  const [shipLogs, setShipLogs] = useState<ShipLog[]>(webStore.getShipLogs());
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  // Modals
  const [isPrModalOpen, setIsPrModalOpen] = useState(false);
  const [activePrData, setActivePrData] = useState<any>(null);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isShipLogsOpen, setIsShipLogsOpen] = useState(false);

  // PWA Install Prompt State
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [canInstallPwa, setCanInstallPwa] = useState(false);

  // Subscribe to web store reactive updates
  useEffect(() => {
    const unsubscribe = webStore.subscribe(() => {
      setChats([...webStore.getChats()]);
      setShipLogs([...webStore.getShipLogs()]);
    });
    return unsubscribe;
  }, []);

  // Listen for PWA BeforeInstallPrompt
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
      setCanInstallPwa(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredInstallPrompt) {
      alert('To install WhatsDev PWA:\n• On Chrome/Edge Desktop: Click the Install icon in the address bar.\n• On iOS Safari: Tap Share -> "Add to Home Screen".\n• On Android: Tap Chrome menu -> "Install App".');
      return;
    }
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstallPwa(false);
    }
  };

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
      // Default to Torvalds PR #142 metadata
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
    <div className="app-container" id="whatsdev-root">
      <div className="desktop-accent-strip" />

      <div className="whatsapp-web-frame">
        {/* Left Sidebar */}
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onOpenShipLogs={() => setIsShipLogsOpen(true)}
          onOpenCreateVault={() => setIsVaultModalOpen(true)}
          onOpenCreateCode={() => setIsCodeModalOpen(true)}
          isMobileViewHidden={isMobileChatOpen}
          canInstallPwa={canInstallPwa || true}
          onInstallPwa={handleInstallPwa}
        />

        {/* Right Chat Panel */}
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

      {/* Interactive Modals */}
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

      <ShipLogsModal
        isOpen={isShipLogsOpen}
        onClose={() => setIsShipLogsOpen(false)}
        shipLogs={shipLogs}
      />
    </div>
  );
};

export default App;
