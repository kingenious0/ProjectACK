import React from 'react';

export const ChatListSkeleton: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <style>
        {`
          @keyframes ackShimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
          .ack-skeleton-bone {
            background: linear-gradient(
              90deg,
              #18181C 25%,
              #222228 37%,
              #18181C 63%
            );
            background-size: 200% 100%;
            animation: ackShimmer 1.6s ease-in-out infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .ack-skeleton-bone {
              animation: none;
              background: #18181C;
            }
          }
        `}
      </style>

      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderBottom: '1px solid rgba(38, 38, 43, 0.4)',
          }}
        >
          {/* Avatar Bone */}
          <div
            className="ack-skeleton-bone"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              flexShrink: 0,
            }}
          />

          {/* Details Bone */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                className="ack-skeleton-bone"
                style={{
                  width: i % 2 === 0 ? '120px' : '90px',
                  height: '14px',
                  borderRadius: '4px',
                }}
              />
              <div
                className="ack-skeleton-bone"
                style={{
                  width: '32px',
                  height: '10px',
                  borderRadius: '3px',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                className="ack-skeleton-bone"
                style={{
                  width: i % 2 === 0 ? '180px' : '140px',
                  height: '12px',
                  borderRadius: '4px',
                }}
              />
              {i % 3 === 0 && (
                <div
                  className="ack-skeleton-bone"
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                  }}
                />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
