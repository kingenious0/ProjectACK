import React, { useState } from 'react';
import { X, CheckCheck, Terminal, ShieldAlert, GitPullRequest, AtSign, ArrowRight } from 'lucide-react';
import { AckNotification } from '../../web-db/store';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AckNotification[];
  onMarkAllRead: () => void;
  onSelectNotification?: (notification: AckNotification) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onSelectNotification,
}) => {
  const [filter, setFilter] = useState<'all' | 'mention' | 'review'>('all');
  const [selectedLogNotif, setSelectedLogNotif] = useState<AckNotification | null>(null);

  if (!isOpen) return null;

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'mention') return n.type === 'mention';
    if (filter === 'review') return n.type === 'review';
    return true;
  });

  const todayNotifs = filteredNotifs.filter((n) => n.timeGroup === 'today');
  const earlierNotifs = filteredNotifs.filter((n) => n.timeGroup === 'earlier');

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const renderNotifItem = (item: AckNotification) => {
    return (
      <div
        key={item.id}
        style={{
          display: 'flex',
          gap: '12px',
          padding: '12px 14px',
          borderRadius: '12px',
          backgroundColor: item.isRead ? 'transparent' : 'rgba(139, 124, 255, 0.04)',
          border: item.isRead ? '1px solid transparent' : '1px solid rgba(139, 124, 255, 0.15)',
          marginBottom: '8px',
          transition: 'background-color 0.15s ease',
          cursor: 'pointer',
        }}
        onClick={() => {
          if (item.type === 'ci_failure' && item.buildLogs) {
            setSelectedLogNotif(item);
          } else if (onSelectNotification) {
            onSelectNotification(item);
            onClose();
          }
        }}
      >
        {/* Type Icon Badge */}
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor:
              item.type === 'vault'
                ? 'rgba(245, 181, 68, 0.15)'
                : item.type === 'ci_failure'
                ? 'rgba(248, 113, 113, 0.15)'
                : item.type === 'review'
                ? 'rgba(139, 124, 255, 0.15)'
                : 'rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px',
          }}
        >
          {item.type === 'vault' && <ShieldAlert size={18} color="#F5B544" />}
          {item.type === 'ci_failure' && <Terminal size={18} color="#F87171" />}
          {item.type === 'review' && <GitPullRequest size={18} color="#8B7CFF" />}
          {item.type === 'mention' && <AtSign size={18} color="#8B7CFF" />}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#F4F4F5' }}>{item.title}</span>
              {/* Dots */}
              {!item.isRead && (
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#8B7CFF',
                  }}
                  title="Unread"
                />
              )}
              {item.type === 'vault' && (
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#F5B544',
                  }}
                  title="Vault event"
                />
              )}
            </div>
            <span style={{ fontSize: '11px', color: '#71717A', flexShrink: 0 }}>{item.timestamp}</span>
          </div>

          <p style={{ fontSize: '12px', color: '#A1A1AA', margin: '0 0 6px 0', lineHeight: '1.4' }}>
            {item.description}
          </p>

          {/* Action Row */}
          {item.type === 'ci_failure' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedLogNotif(item);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 8px',
                borderRadius: '6px',
                backgroundColor: 'rgba(248, 113, 113, 0.12)',
                border: '1px solid rgba(248, 113, 113, 0.25)',
                color: '#F87171',
                fontSize: '11px',
                fontFamily: 'monospace',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Terminal size={12} />
              <span>View logs</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(11, 11, 13, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          maxHeight: '85vh',
          backgroundColor: '#131316',
          border: '1px solid #26262B',
          borderRadius: '18px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #26262B',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#F4F4F5', margin: 0 }}>Notifications</h2>
            {unreadCount > 0 && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#8B7CFF',
                  backgroundColor: 'rgba(139, 124, 255, 0.15)',
                  padding: '2px 7px',
                  borderRadius: '10px',
                }}
              >
                {unreadCount}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={onMarkAllRead}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'none',
                border: 'none',
                color: '#8B7CFF',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                padding: '4px 6px',
              }}
            >
              <CheckCheck size={14} />
              <span>Mark all read</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#71717A',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '12px 20px',
            borderBottom: '1px solid #1E1E22',
            backgroundColor: '#0F0F12',
          }}
        >
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'mention', label: 'Mentions' },
              { id: 'review', label: 'Reviews' },
            ] as const
          ).map((c) => {
            const active = filter === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setFilter(c.id)}
                style={{
                  padding: '5px 12px',
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
                {c.label}
              </button>
            );
          })}
        </div>

        {/* List Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
          }}
        >
          {filteredNotifs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#71717A', fontSize: '13px' }}>
              No notifications in this filter
            </div>
          ) : (
            <>
              {todayNotifs.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#71717A',
                      marginBottom: '10px',
                    }}
                  >
                    Today
                  </div>
                  {todayNotifs.map(renderNotifItem)}
                </div>
              )}

              {earlierNotifs.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#71717A',
                      marginBottom: '10px',
                    }}
                  >
                    Earlier
                  </div>
                  {earlierNotifs.map(renderNotifItem)}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* View Logs Modal */}
      {selectedLogNotif && selectedLogNotif.buildLogs && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedLogNotif(null);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '540px',
              backgroundColor: '#0D0D10',
              border: '1px solid #F87171',
              borderRadius: '14px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid #26262B',
                backgroundColor: '#15151A',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={16} color="#F87171" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#F4F4F5' }}>
                  Build failure logs · PR #{selectedLogNotif.prNumber}
                </span>
              </div>
              <button
                onClick={() => setSelectedLogNotif(null)}
                style={{ background: 'none', border: 'none', color: '#71717A', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
            <pre
              style={{
                margin: 0,
                padding: '16px',
                fontFamily: 'monospace',
                fontSize: '12px',
                lineHeight: '1.6',
                color: '#F87171',
                backgroundColor: '#09090B',
                overflowX: 'auto',
                maxHeight: '300px',
              }}
            >
              {selectedLogNotif.buildLogs.join('\n')}
            </pre>
            <div
              style={{
                padding: '12px 16px',
                borderTop: '1px solid #26262B',
                display: 'flex',
                justifyContent: 'flex-end',
                backgroundColor: '#131316',
              }}
            >
              <button
                onClick={() => setSelectedLogNotif(null)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  backgroundColor: '#26262B',
                  color: '#F4F4F5',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Close logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
