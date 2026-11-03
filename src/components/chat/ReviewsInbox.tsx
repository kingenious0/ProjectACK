import React, { useState } from 'react';
import { GitPullRequest, GitMerge, CheckCircle2, XCircle, Clock, Plus, Minus, ArrowUpRight } from 'lucide-react';
import { ReviewPR } from '../../web-db/store';

interface ReviewsInboxProps {
  reviews: ReviewPR[];
  onSelectPR?: (pr: ReviewPR) => void;
}

export const ReviewsInbox: React.FC<ReviewsInboxProps> = ({ reviews, onSelectPR }) => {
  const [filter, setFilter] = useState<'waiting_on_me' | 'mine' | 'merged'>('waiting_on_me');

  const filteredReviews = reviews.filter((r) => r.category === filter);

  const waitingCount = reviews.filter((r) => r.category === 'waiting_on_me').length;
  const mineCount = reviews.filter((r) => r.category === 'mine').length;
  const mergedCount = reviews.filter((r) => r.category === 'merged').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#0B0B0D' }}>
      {/* Header Segmented Filter */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #26262B', backgroundColor: '#131316' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GitPullRequest size={20} color="#8B7CFF" />
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#F4F4F5', margin: 0 }}>Reviews</h2>
          </div>
          <span style={{ fontSize: '12px', color: '#71717A' }}>
            {reviews.length} total pull requests
          </span>
        </div>

        {/* Segmented Control */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#18181C',
            borderRadius: '10px',
            padding: '3px',
            border: '1px solid #26262B',
          }}
        >
          {(
            [
              { id: 'waiting_on_me', label: 'Waiting on me', count: waitingCount },
              { id: 'mine', label: 'Mine', count: mineCount },
              { id: 'merged', label: 'Merged', count: mergedCount },
            ] as const
          ).map((seg) => {
            const active = filter === seg.id;
            return (
              <button
                key={seg.id}
                onClick={() => setFilter(seg.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: active ? '#8B7CFF' : 'transparent',
                  color: active ? '#0B0B0D' : '#A1A1AA',
                  fontSize: '12px',
                  fontWeight: active ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{seg.label}</span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: '8px',
                    backgroundColor: active ? 'rgba(11, 11, 13, 0.2)' : '#26262B',
                    color: active ? '#0B0B0D' : '#71717A',
                  }}
                >
                  {seg.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* PR Cards List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredReviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#71717A' }}>
            <GitMerge size={32} color="#27272A" style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '14px', margin: 0 }}>No pull requests in this view</p>
          </div>
        ) : (
          filteredReviews.map((pr) => {
            const isPassing = pr.ciStatus === 'passing';
            const isFailing = pr.ciStatus === 'failing';
            const isRunning = pr.ciStatus === 'running';

            return (
              <div
                key={pr.id}
                onClick={() => onSelectPR && onSelectPR(pr)}
                style={{
                  backgroundColor: '#131316',
                  border: '1px solid #26262B',
                  borderRadius: '14px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease, transform 0.15s ease',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3F3F46';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#26262B';
                }}
              >
                {/* Top Row: Repo Pill & Timestamp */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#A99DFF',
                        backgroundColor: 'rgba(139, 124, 255, 0.12)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(139, 124, 255, 0.2)',
                      }}
                    >
                      {pr.repo}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#71717A' }}>
                      #{pr.prNumber}
                    </span>
                  </div>

                  <span style={{ fontSize: '11px', color: '#71717A' }}>{pr.updatedAt}</span>
                </div>

                {/* PR Title */}
                <h3
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#F4F4F5',
                    margin: '0 0 12px 0',
                    lineHeight: '1.4',
                  }}
                >
                  {pr.title}
                </h3>

                {/* Bottom Row: Author, +/- Lines, CI Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#A1A1AA' }}>by @{pr.author}</span>

                    {/* Diff stats (+ / -) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'monospace', fontSize: '11px' }}>
                      <span style={{ color: '#4ADE80', display: 'flex', alignItems: 'center' }}>
                        +{pr.additions}
                      </span>
                      <span style={{ color: '#F87171', display: 'flex', alignItems: 'center' }}>
                        -{pr.deletions}
                      </span>
                    </div>
                  </div>

                  {/* CI Status Dot & Label */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '11px',
                      fontWeight: 500,
                      color: isPassing ? '#4ADE80' : isFailing ? '#F87171' : '#A1A1AA',
                      backgroundColor: isPassing
                        ? 'rgba(74, 222, 128, 0.1)'
                        : isFailing
                        ? 'rgba(248, 113, 113, 0.1)'
                        : 'rgba(255, 255, 255, 0.05)',
                      padding: '3px 8px',
                      borderRadius: '12px',
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: isPassing ? '#4ADE80' : isFailing ? '#F87171' : '#71717A',
                      }}
                    />
                    <span style={{ textTransform: 'capitalize' }}>{pr.ciStatus}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
