import React, { useState, useEffect } from 'react';
import { getCurrentUser, logoutUser, handleOAuthCallback, resolveInviteCode } from './lib/appwrite';
import { webStore, Chat, Message, setCurrentUser, CURRENT_USER } from './web-db/store';
import { ChatList } from './components/chat/ChatList';
import { InviteLandingView } from './components/chat/InviteLandingView';


import { ChatView } from './components/chat/ChatView';
import { CodeReviewPayload } from './components/chat/CodeReviewDrawer';
import { AddFriendsModal } from './components/AddFriendsModal';
import { CreateVaultModal } from './components/CreateVaultModal';
import { CreateCodeModal } from './components/CreateCodeModal';
import { VideoCallOverlay } from './components/VideoCallOverlay';
import { StartCallSheet, CallChoice } from './components/calls/StartCallSheet';
import { SettingsModal } from './components/chat/SettingsModal';
import { SignInModal } from './components/chat/SignInModal';
import { NotificationsModal } from './components/chat/NotificationsModal';
import { SearchModal } from './components/chat/SearchModal';
import { CreateGroupModal } from './components/chat/CreateGroupModal';
import { GroupInfoModal } from './components/chat/GroupInfoModal';
import { BurnedSecretModal } from './components/chat/BurnedSecretModal';
import { SplashScreen } from './components/SplashScreen';
import { FEATURES, isCallingEnabled } from './config/features';
import './theme/ack.css';

export const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [chats, setChats] = useState<Chat[]>(webStore.getChats());
  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ack_active_chat_id');
      if (saved) return saved;
    }
    const initialChats = webStore.getChats();
    return initialChats[0]?.id || null;
  });
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [activeReviewPayload, setActiveReviewPayload] = useState<CodeReviewPayload | null>(null);

  // Invite landing overlay states (Screen 3)
  const [pendingInviteData, setPendingInviteData] = useState<{
    inviterUsername: string;
    inviteCode: string;
  } | null>(null);
  const [showInviteLanding, setShowInviteLanding] = useState(false);

  // Modals & Overlays
  const [isAddFriendsOpen, setIsAddFriendsOpen] = useState(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [isStartCallSheetOpen, setIsStartCallSheetOpen] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video' | 'pair'>('video');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [groupInfoChat, setGroupInfoChat] = useState<Chat | null>(null);
  const [burnedSecretData, setBurnedSecretData] = useState<{
    senderName: string;
    title?: string;
    copiedAt?: string;
  } | null>(null);

  const [, setStoreRevision] = useState(0);

  // Persist active chat ID across reloads
  useEffect(() => {
    if (activeChatId && typeof window !== 'undefined') {
      localStorage.setItem('ack_active_chat_id', activeChatId);
    }
  }, [activeChatId]);

  // Reactive subscription
  useEffect(() => {
    const unsubscribe = webStore.subscribe(() => {
      setChats([...webStore.getChats()]);
      setStoreRevision((r) => r + 1);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Hydrate user profile if signed in via Appwrite GitHub OAuth (or handle OAuth token exchange)
  useEffect(() => {
    handleOAuthCallback().then((u) => {
      if (u && u.username) {
        setCurrentUser({
          id: u.id,
          githubId: u.githubId,
          name: u.name,
          username: u.username,
          avatar: u.avatar,
          isLoggedIn: true,
          searchable: u.searchable ?? true,
          inviteCode: u.inviteCode,
        });
        setChats([...webStore.getChats()]);
        setStoreRevision((r) => r + 1);
      }
    });
  }, []);

  // Screen 3: Check for ?invite=<codeOrUsername> and resolve inviter
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const inviteParam = params.get('invite');
    if (inviteParam) {
      const codeOrHandle = inviteParam.trim().replace(/^@/, '');
      localStorage.setItem('ack_pending_invite', codeOrHandle);
      resolveInviteCode(codeOrHandle).then((profile) => {
        if (profile) {
          setPendingInviteData({
            inviterUsername: profile.username,
            inviteCode: profile.inviteCode || codeOrHandle,
          });
        } else {
          setPendingInviteData({
            inviterUsername: codeOrHandle,
            inviteCode: codeOrHandle,
          });
        }
        if (!CURRENT_USER.isLoggedIn) {
          setShowInviteLanding(true);
        }
      });
    }
  }, []);

  // Auto-connect newcomer with inviter upon sign-in
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const pendingInvite = localStorage.getItem('ack_pending_invite');
    if (pendingInvite && CURRENT_USER.isLoggedIn && CURRENT_USER.username) {
      resolveInviteCode(pendingInvite).then((prof) => {
        const inviter = prof?.username || pendingInvite;
        if (inviter.toLowerCase() !== CURRENT_USER.username.toLowerCase()) {
          const newChat = webStore.addFriend({
            id: prof?.githubId ? `gh_${prof.githubId}` : `gh_${inviter}`,
            name: prof?.name || inviter,
            username: inviter,
            avatar: prof?.avatar || `https://github.com/${inviter}.png`,
            tag: 'Invited You to Ack',
            mutualCount: 1,
            isOnline: true,
          });
          setActiveChatId(newChat.id);
          localStorage.setItem('ack_active_chat_id', newChat.id);
          setChats([...webStore.getChats()]);
          setIsMobileChatOpen(true);
        }
        localStorage.removeItem('ack_pending_invite');
        setShowInviteLanding(false);
      });
    }
  }, [CURRENT_USER.isLoggedIn, CURRENT_USER.username]);



  const activeChat =
    chats.find((c) => c.id === activeChatId) ||
    webStore.getChats().find((c) => c.id === activeChatId) ||
    null;
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

  const handleOpenCall = (type: 'audio' | 'video' | 'pair') => {
    if (type === 'pair' && !FEATURES.pairProgramming) return;
    if ((type === 'video' || type === 'audio') && !FEATURES.calls) return;
    setCallType(type);
    setIsCallOpen(true);
  };

  const handleSelectCallChoice = (choice: CallChoice) => {
    setIsStartCallSheetOpen(false);
    if (choice === 'voice' && FEATURES.calls) {
      handleOpenCall('audio');
    } else if (choice === 'video' && FEATURES.calls) {
      handleOpenCall('video');
    } else if (choice === 'pair' && FEATURES.pairProgramming) {
      handleOpenCall('pair');
    }
  };

  return (
    <div className="ack-app-root" id="ack-root">
      <div className="ack-shell">
        {/* Left / Home Pane: ChatList + BottomNav */}
        <div className={`ack-sidebar-pane ${isMobileChatOpen ? 'ack-mobile-hidden' : ''}`}>
          <ChatList
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={handleSelectChat}
            onOpenNewChat={() => setIsAddFriendsOpen(true)}
            onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenCreateVault={() => setIsVaultModalOpen(true)}
            onOpenCreateCode={() => setIsCodeModalOpen(true)}
            unreadNotificationsCount={webStore.getNotifications().filter((n) => !n.isRead).length}
          />
        </div>

        {/* Right / Conversation Pane: ChatView */}
        <div className={`ack-chat-pane ${!isMobileChatOpen ? 'ack-mobile-hidden' : ''}`}>
          <ChatView
            chat={activeChat}
            messages={activeMessages}
            onSendMessage={handleSendMessage}
            onSendCode={() => setIsCodeModalOpen(true)}
            onSendVault={() => setIsVaultModalOpen(true)}
            onBackToSidebar={() => {
              setIsMobileChatOpen(false);
              setActiveReviewPayload(null);
            }}
            onOpenCall={isCallingEnabled() ? handleOpenCall : undefined}
            onOpenStartCallSheet={FEATURES.calls ? () => setIsStartCallSheetOpen(true) : undefined}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenGroupInfo={(grpChat) => setGroupInfoChat(grpChat)}
            onOpenBurnedSecret={(senderName, title, copiedAt) =>
              setBurnedSecretData({ senderName, title, copiedAt })
            }
            isMobileActive={isMobileChatOpen}
            activeReviewPayload={activeReviewPayload}
            onOpenReview={setActiveReviewPayload}
            onCloseReview={() => setActiveReviewPayload(null)}
            onSendReviewComment={handleSendMessage}
          />
        </div>
      </div>

      {/* Developer Tooling Modals */}
      <AddFriendsModal
        isOpen={isAddFriendsOpen}
        onClose={() => setIsAddFriendsOpen(false)}
        onSelectNewChat={handleSelectChat}
        onOpenCreateGroup={() => {
          setIsAddFriendsOpen(false);
          setIsCreateGroupOpen(true);
        }}
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

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSignOut={async () => {
          setIsSettingsOpen(false);
          await logoutUser();
          setCurrentUser({
            id: 'dev_user_self',
            name: 'Dev ACK (You)',
            username: 'kinge_dev',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            isLoggedIn: false,
          });
          setChats([...webStore.getChats()]);
          setStoreRevision((r) => r + 1);
          setIsSignInOpen(true);
        }}
      />


      <SignInModal
        isOpen={isSignInOpen}
        onSuccess={(_user) => {
          setIsSignInOpen(false);
        }}
        onClose={() => setIsSignInOpen(false)}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={webStore.getNotifications()}
        onMarkAllRead={() => {
          webStore.markAllNotificationsRead();
          setChats([...webStore.getChats()]);
        }}
        onSelectNotification={(n) => {
          if (n.chatId) {
            handleSelectChat(n.chatId);
          }
        }}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        chats={chats}
        messages={webStore['messages']}
        onSelectChat={(chatId) => {
          handleSelectChat(chatId);
        }}
      />

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        availableDevs={webStore.getSuggestions()}
        onCreateGroup={(name, members, repo, avatar) => {
          const newGrp = webStore.createGroup(name, members, repo, avatar);
          const allChats = [...webStore.getChats()];
          setChats(allChats);
          setActiveChatId(newGrp.id);
          setIsMobileChatOpen(true);
          setIsCreateGroupOpen(false);
        }}
      />

      {/* Group Info Modal */}
      {groupInfoChat && (
        <GroupInfoModal
          isOpen={!!groupInfoChat}
          onClose={() => setGroupInfoChat(null)}
          chat={groupInfoChat}
          onLeaveGroup={(chatId) => {
            webStore.leaveGroup(chatId);
            setGroupInfoChat(null);
            if (activeChatId === chatId) {
              setActiveChatId(null);
              setIsMobileChatOpen(false);
            }
          }}
        />
      )}

      {/* Burned Secret Screen / Modal */}
      {burnedSecretData && (
        <BurnedSecretModal
          isOpen={!!burnedSecretData}
          onClose={() => setBurnedSecretData(null)}
          senderName={burnedSecretData.senderName}
          secretTitle={burnedSecretData.title}
          copiedAt={burnedSecretData.copiedAt}
          onAskNewSecret={(sender) => {
            if (activeChatId) {
              webStore.sendMessage(
                activeChatId,
                `Hey @${sender}, could you share a fresh secret? The previous one was burned.`
              );
            }
          }}
        />
      )}

      {/* Start Call Bottom Sheet */}
      {FEATURES.calls && (
        <StartCallSheet
          isOpen={isStartCallSheetOpen}
          chat={activeChat}
          onClose={() => setIsStartCallSheetOpen(false)}
          onSelectOption={handleSelectCallChoice}
        />
      )}

      {/* Active Call / Video / Voice / Pair Overlay */}
      {isCallingEnabled() && (
        <VideoCallOverlay
          isOpen={isCallOpen}
          chat={activeChat}
          callType={callType}
          onClose={() => setIsCallOpen(false)}
        />
      )}

      {/* Screen 3: Friend's view when opening an invite link */}
      {showInviteLanding && !CURRENT_USER.isLoggedIn && (
        <InviteLandingView
          inviterUsername={pendingInviteData?.inviterUsername || 'kingenious0'}
          inviteCode={pendingInviteData?.inviteCode}
          onDismiss={() => setShowInviteLanding(false)}
        />
      )}

      {/* Animated Ack Splash Screen on Startup */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
    </div>
  );
};

export default App;
