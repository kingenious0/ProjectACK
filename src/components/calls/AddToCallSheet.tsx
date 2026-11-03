import React, { useState } from 'react';
import { X, UserPlus, Link2, Check, PhoneCall, Loader2 } from 'lucide-react';

interface CallContact {
  id: string;
  name: string;
  username: string;
  avatar: string;
  state: 'in_call' | 'ringing' | 'available';
}

interface AddToCallSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentParticipantCount?: number;
  onAddParticipant?: (contactName: string) => void;
}

const INITIAL_CALL_CONTACTS: CallContact[] = [
  {
    id: 'usr_me',
    name: 'You (kinge_dev)',
    username: 'kinge_dev',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    state: 'in_call',
  },
  {
    id: 'usr_sarah',
    name: 'Sarah Connor',
    username: 'sarah_infra',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    state: 'in_call',
  },
  {
    id: 'dev_hardik',
    name: 'Hardik',
    username: 'hkothari1510',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    state: 'ringing',
  },
  {
    id: 'dev_mohit',
    name: 'Mohit',
    username: 'chhipa231044',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    state: 'available',
  },
  {
    id: 'dev_rey',
    name: 'Rey Patel',
    username: 'rey_patel3277',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    state: 'available',
  },
  {
    id: 'dev_robert',
    name: 'Robert Jonas',
    username: 'robertpageflows',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    state: 'available',
  },
];

export const AddToCallSheet: React.FC<AddToCallSheetProps> = ({
  isOpen,
  onClose,
  currentParticipantCount = 2,
  onAddParticipant,
}) => {
  const [contacts, setContacts] = useState<CallContact[]>(INITIAL_CALL_CONTACTS);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const inCallCount = contacts.filter((c) => c.state === 'in_call' || c.state === 'ringing').length;
  const isCapped = inCallCount >= 8;

  const handleAdd = (contactId: string) => {
    if (isCapped) return;

    setContacts((prev) =>
      prev.map((c) => {
        if (c.id === contactId) {
          return { ...c, state: 'ringing' };
        }
        return c;
      })
    );

    const target = contacts.find((c) => c.id === contactId);
    if (target && onAddParticipant) {
      onAddParticipant(target.name);
    }

    // Simulate answer after 3 seconds
    setTimeout(() => {
      setContacts((prev) =>
        prev.map((c) => {
          if (c.id === contactId) {
            return { ...c, state: 'in_call' };
          }
          return c;
        })
      );
    }, 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        backgroundColor: 'rgba(11, 11, 13, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          maxHeight: '80vh',
          backgroundColor: '#131316',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          border: '1px solid #26262B',
          borderBottom: 'none',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.7)',
          animation: 'slideUpSheet 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>
          {`
            @keyframes slideUpSheet {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
          `}
        </style>

        {/* Pull Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10px' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', backgroundColor: '#3F3F46' }} />
        </div>

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid #1E1E22',
          }}
        >
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#F4F4F5', margin: 0 }}>Add to call</h3>
            <span style={{ fontSize: '12px', color: inCallCount >= 8 ? '#F87171' : '#71717A' }}>
              {inCallCount} / 8 participants {inCallCount >= 8 ? '(Max capacity)' : ''}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#71717A',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Contact List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px', maxHeight: '340px' }}>
          {contacts.map((contact) => (
            <div
              key={contact.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '12px',
                backgroundColor: '#18181C',
                marginBottom: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#F4F4F5' }}>{contact.name}</div>
                  <div style={{ fontSize: '11px', color: '#71717A' }}>@{contact.username}</div>
                </div>
              </div>

              {/* State Button */}
              {contact.state === 'in_call' ? (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#4ADE80',
                    backgroundColor: 'rgba(74, 222, 128, 0.1)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                  }}
                >
                  <Check size={12} strokeWidth={3} />
                  <span>In call</span>
                </span>
              ) : contact.state === 'ringing' ? (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#F5B544',
                    backgroundColor: 'rgba(245, 181, 68, 0.12)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                  }}
                >
                  <Loader2 size={12} className="animate-spin" />
                  <span>Ringing...</span>
                </span>
              ) : (
                <button
                  disabled={isCapped}
                  onClick={() => handleAdd(contact.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    backgroundColor: isCapped ? '#26262B' : '#8B7CFF',
                    color: isCapped ? '#71717A' : '#0B0B0D',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: isCapped ? 'not-allowed' : 'pointer',
                  }}
                >
                  <UserPlus size={13} />
                  <span>Add</span>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Copy Invite Link Bottom Bar */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid #26262B',
            backgroundColor: '#131316',
          }}
        >
          <button
            onClick={handleCopyLink}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: '#18181C',
              border: '1px solid #26262B',
              color: copiedLink ? '#4ADE80' : '#F4F4F5',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {copiedLink ? <Check size={16} /> : <Link2 size={16} />}
            <span>{copiedLink ? 'Invite link copied to clipboard!' : 'Copy invite link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
