import React, { useState } from 'react';
import { Rocket, X, Plus, Tag } from 'lucide-react';
import { ShipLog, webStore } from '../web-db/store';

interface ShipLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipLogs: ShipLog[];
}

export const ShipLogsModal: React.FC<ShipLogsModalProps> = ({
  isOpen,
  onClose,
  shipLogs,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [tagInput, setTagInput] = useState('web, pwa, shipping');

  if (!isOpen) return null;

  const handleAddShip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagInput.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
    webStore.addShipLog(title, desc, tags);
    setTitle('');
    setDesc('');
    setShowAddForm(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} id="ship-logs-backdrop">
      <div className="modal-window" onClick={(e) => e.stopPropagation()} id="ship-logs-modal">
        <div className="modal-header">
          <div className="modal-title">
            <Rocket size={18} color="#00FF66" />
            <span>Ship Logs &amp; Status (24h Ephemeral Stories)</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="action-pill-btn"
              onClick={() => setShowAddForm(!showAddForm)}
              id="btn-toggle-add-ship"
            >
              <Plus size={14} /> Post Log
            </button>
            <button className="icon-btn" onClick={onClose} id="btn-close-ship-modal">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {showAddForm && (
            <form
              onSubmit={handleAddShip}
              style={{
                background: '#161F26',
                border: '1px solid #00A884',
                padding: '14px',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
              id="form-add-ship"
            >
              <div className="form-field">
                <label className="form-label">What did you ship today?</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Added WebCrypto zero-trust .env encryption"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  id="input-ship-title"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Details / Changelog</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Brief changelog notes or impact..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  id="input-ship-desc"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Tags (comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="react, pwa, perf"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  id="input-ship-tags"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-btn" id="btn-submit-ship">
                  Publish Ship Log
                </button>
              </div>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {shipLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  background: '#151D24',
                  border: '1px solid #2A3942',
                  borderRadius: '8px',
                  padding: '14px',
                  display: 'flex',
                  gap: '12px',
                }}
                className="ship-log-card"
              >
                <img
                  src={log.authorAvatar}
                  alt={log.author}
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    border: '2px solid #00FF66',
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#E9EDEF' }}>
                      {log.author}
                    </span>
                    <span style={{ fontSize: '11px', color: '#8696A0', fontFamily: 'var(--font-mono)' }}>
                      {log.timestamp}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#00FF66' }}>
                    {log.title}
                  </h4>
                  {log.description && (
                    <p style={{ fontSize: '12.5px', color: '#D1D7DB', lineHeight: '1.4' }}>
                      {log.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {log.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        style={{
                          fontSize: '10px',
                          fontFamily: 'var(--font-mono)',
                          background: 'rgba(0, 168, 132, 0.15)',
                          color: '#00A884',
                          border: '1px solid rgba(0, 168, 132, 0.3)',
                          padding: '1px 6px',
                          borderRadius: '10px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <Tag size={9} /> #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
