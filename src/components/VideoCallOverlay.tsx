import React, { useState, useEffect } from 'react';
import { Chat } from '../web-db/store';
import { VideoCallScreen } from './calls/VideoCallScreen';
import { VoiceSessionScreen } from './calls/VoiceSessionScreen';
import { DesktopPairScreen } from './calls/DesktopPairScreen';
import { DesktopOnlyNoticeModal } from './calls/DesktopOnlyNoticeModal';
import { FEATURES, isCallingEnabled } from '../config/features';

export interface VideoCallOverlayProps {
  isOpen: boolean;
  chat: Chat | null;
  callType: 'audio' | 'video' | 'pair';
  onClose: () => void;
}

export const VideoCallOverlay: React.FC<VideoCallOverlayProps> = ({
  isOpen,
  chat,
  callType,
  onClose,
}) => {
  if (!isCallingEnabled()) return null;
  if (callType === 'pair' && !FEATURES.pairProgramming) return null;
  if ((callType === 'video' || callType === 'audio') && !FEATURES.calls) return null;

  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  );
  const [showDesktopNotice, setShowDesktopNotice] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // When callType === 'pair' on mobile, immediately intercept with DesktopOnlyNoticeModal
  useEffect(() => {
    if (isOpen && callType === 'pair' && !isDesktop) {
      setShowDesktopNotice(true);
    } else {
      setShowDesktopNotice(false);
    }
  }, [isOpen, callType, isDesktop]);

  if (!isOpen || !chat) {
    if (showDesktopNotice) {
      return (
        <DesktopOnlyNoticeModal
          isOpen={true}
          chatId={chat?.id}
          onClose={() => setShowDesktopNotice(false)}
        />
      );
    }
    return null;
  }

  // Mobile pair programming gate
  if (callType === 'pair' && !isDesktop) {
    return (
      <DesktopOnlyNoticeModal
        isOpen={true}
        chatId={chat.id}
        onClose={() => {
          setShowDesktopNotice(false);
          onClose();
        }}
      />
    );
  }

  // 1. Desktop Pair Programming Mode
  if (callType === 'pair') {
    return (
      <DesktopPairScreen
        chat={chat}
        onEndSession={onClose}
      />
    );
  }

  // 2. Video Call Screen
  if (callType === 'video') {
    return (
      <VideoCallScreen
        chat={chat}
        onEndCall={onClose}
        onMinimize={onClose}
      />
    );
  }

  // 3. Voice Session Screen
  return (
    <VoiceSessionScreen
      chat={chat}
      onEndCall={onClose}
      onMinimize={onClose}
    />
  );
};
