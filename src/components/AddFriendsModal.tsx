import React from 'react';
import { NewChatModal } from './chat/NewChatModal';

export interface AddFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNewChat: (chatId: string) => void;
  onOpenCreateGroup?: () => void;
}

export const AddFriendsModal: React.FC<AddFriendsModalProps> = ({
  isOpen,
  onClose,
  onSelectNewChat,
  onOpenCreateGroup,
}) => {
  return (
    <NewChatModal
      isOpen={isOpen}
      onClose={onClose}
      onSelectNewChat={onSelectNewChat}
      onOpenCreateGroup={onOpenCreateGroup}
    />
  );
};
