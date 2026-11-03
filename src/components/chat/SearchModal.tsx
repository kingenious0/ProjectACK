import React, { useState, useMemo } from 'react';
import { Search, X, MessageSquare, User, GitFork, ShieldAlert, ArrowRight } from 'lucide-react';
import { Chat, Message } from '../../web-db/store';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  chats: Chat[];
  messages: Record<string, Message[]>;
  onSelectChat: (chatId: string) => void;
}

type SearchFilter = 'all' | 'people' | 'messages' | 'repos';

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  chats,
  messages,
  onSelectChat,
}) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SearchFilter>('all');

  if (!isOpen) return null;

  // Highlight helper: wraps matched substring in accent color
  const highlightMatch = (text: string, queryStr: string) => {
    if (!queryStr.trim() || !text) return text;
    const parts = text.split(new RegExp(`(${queryStr.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === queryStr.toLowerCase() ? (
        <span key={index} style={{ color: '#A99DFF', fontWeight: 700, backgroundColor: 'rgba(139, 124, 255, 0.15)', borderRadius: '3px', padding: '0 2px' }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const cleanQuery = query.trim().toLowerCase();

  // Search People
  const matchingPeople = useMemo(() => {
    if (!cleanQuery) return [];
    return chats.filter((c) => {
      const matchName = c.name.toLowerCase().includes(cleanQuery);
      const matchUsername = c.username.toLowerCase().includes(cleanQuery);
      return matchName || matchUsername;
    });
  }, [chats, cleanQuery]);

  // Search Repos
  const matchingRepos = useMemo(() => {
    if (!cleanQuery) return [];
    return chats.filter((c) => {
      const matchRepoTag = c.repoTag && c.repoTag.toLowerCase().includes(cleanQuery);
      const matchLinkedRepo = c.linkedRepo && c.linkedRepo.toLowerCase().includes(cleanQuery);
      const matchType = c.type === 'repo' && c.name.toLowerCase().includes(cleanQuery);
      return matchRepoTag || matchLinkedRepo || matchType;
    });
  }, [chats, cleanQuery]);

  // Search Messages (SECURITY RULE: Never index vault secret contents, labels only!)
  const matchingMessages = useMemo(() => {
    if (!cleanQuery) return [];
    const results: { msg: Message; chat: Chat }[] = [];

    chats.forEach((chat) => {
      const chatMsgs = messages[chat.id] || [];
      chatMsgs.forEach((msg) => {
        let isMatch = false;

        if (msg.type === 'env_secret') {
          // Strictly search only label / title, NEVER secretMasked or secretPayload!
          isMatch = msg.content.toLowerCase().includes(cleanQuery);
        } else {
          isMatch = msg.content.toLowerCase().includes(cleanQuery);
        }

        if (isMatch) {
          results.push({ msg, chat });
        }
      });
    });

    return results;
  }, [chats, messages, cleanQuery]);

  const showPeople = (activeFilter === 'all' || activeFilter === 'people') && matchingPeople.length > 0;
  const showRepos = (activeFilter === 'all' || activeFilter === 'repos') && matchingRepos.length > 0;
  const showMessages = (activeFilter === 'all' || activeFilter === 'messages') && matchingMessages.length > 0;

  const hasResults = showPeople || showRepos || showMessages;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(11, 11, 13, 0.92)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={onClose}
    >
      {/* Top Search Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #26262B',
          backgroundColor: '#131316',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#18181C',
            border: '1px solid #26262B',
            borderRadius: '12px',
            padding: '10px 14px',
          }}
        >
          <Search size={18} color="#71717A" />
          <input
            type="text"
            placeholder="Search people, messages, and repositories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#F4F4F5',
              fontSize: '14px',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', color: '#71717A', cursor: 'pointer', padding: 0 }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#A1A1AA',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            padding: '4px 8px',
          }}
        >
          Cancel
        </button>
      </div>

      {/* Filter Chips Bar */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 20px',
          backgroundColor: '#0F0F12',
          borderBottom: '1px solid #1E1E22',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {(
          [
            { id: 'all', label: 'All' },
            { id: 'people', label: 'People' },
            { id: 'messages', label: 'Messages' },
            { id: 'repos', label: 'Repos' },
          ] as const
        ).map((chip) => {
          const active = activeFilter === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => setActiveFilter(chip.id)}
              style={{
                padding: '5px 14px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: active ? 600 : 500,
                backgroundColor: active ? '#8B7CFF' : '#18181C',
                color: active ? '#0B0B0D' : '#A1A1AA',
                border: active ? 'none' : '1px solid #26262B',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Results Container */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          maxWidth: '720px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {!cleanQuery ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#71717A' }}>
            <Search size={36} color="#27272A" style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '14px', margin: 0 }}>Type to search conversations, developers, and linked GitHub repos</p>
            <p style={{ fontSize: '12px', color: '#52525B', marginTop: '6px' }}>Vault secret contents remain encrypted and are never indexed.</p>
          </div>
        ) : !hasResults ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#71717A' }}>
            <p style={{ fontSize: '14px', margin: 0 }}>No results found for "{query}"</p>
            <p style={{ fontSize: '12px', color: '#52525B', marginTop: '6px' }}>Try searching by username, branch, or text snippet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* GROUP: PEOPLE */}
            {showPeople && (
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#71717A',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <User size={13} />
                  <span>People ({matchingPeople.length})</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {matchingPeople.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => {
                        onSelectChat(chat.id);
                        onClose();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        backgroundColor: '#18181C',
                        border: '1px solid #26262B',
                        cursor: 'pointer',
                        transition: 'border-color 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={chat.avatar}
                          alt={chat.name}
                          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#F4F4F5' }}>
                            {highlightMatch(chat.name, cleanQuery)}
                          </div>
                          <div style={{ fontSize: '12px', color: '#71717A' }}>
                            @{highlightMatch(chat.username, cleanQuery)}
                          </div>
                        </div>
                      </div>

                      <ArrowRight size={16} color="#71717A" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* GROUP: REPOSITORIES */}
            {showRepos && (
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#71717A',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <GitFork size={13} color="#8B7CFF" />
                  <span>Repositories ({matchingRepos.length})</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {matchingRepos.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => {
                        onSelectChat(chat.id);
                        onClose();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        backgroundColor: '#18181C',
                        border: '1px solid #26262B',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(139, 124, 255, 0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <GitFork size={20} color="#8B7CFF" />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#F4F4F5', fontFamily: 'monospace' }}>
                            {highlightMatch(chat.linkedRepo || chat.repoTag || chat.name, cleanQuery)}
                          </div>
                          <div style={{ fontSize: '12px', color: '#71717A' }}>
                            Chat: {chat.name}
                          </div>
                        </div>
                      </div>

                      <ArrowRight size={16} color="#71717A" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* GROUP: MESSAGES */}
            {showMessages && (
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#71717A',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <MessageSquare size={13} />
                  <span>Messages ({matchingMessages.length})</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {matchingMessages.map(({ msg, chat }) => (
                    <div
                      key={msg.id}
                      onClick={() => {
                        onSelectChat(chat.id);
                        onClose();
                      }}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        backgroundColor: '#18181C',
                        border: '1px solid #26262B',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#8B7CFF' }}>{chat.name}</span>
                          <span style={{ fontSize: '11px', color: '#52525B' }}>•</span>
                          <span style={{ fontSize: '11px', color: '#71717A' }}>{msg.senderName}</span>
                        </div>
                        <span style={{ fontSize: '11px', color: '#52525B' }}>{msg.timestamp}</span>
                      </div>

                      <div style={{ fontSize: '13px', color: '#D4D4D8', lineHeight: '1.4' }}>
                        {msg.type === 'env_secret' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F5B544' }}>
                            <ShieldAlert size={14} />
                            <span>Vault Secret: {highlightMatch(msg.content, cleanQuery)}</span>
                          </div>
                        ) : (
                          highlightMatch(msg.content, cleanQuery)
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
