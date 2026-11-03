import React, { useState, useEffect } from 'react';

export interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  // Phase 1: Sent (echo fades in)
  // Phase 2: Delivered (check draws in)
  // Phase 3: Acknowledged (wordmark & tagline appear)
  // Phase 4: Exit fade out
  const [stage, setStage] = useState<'sent' | 'delivered' | 'acknowledged' | 'exit'>('sent');

  useEffect(() => {
    // Stage 1: 0 - 300ms
    const t1 = setTimeout(() => {
      setStage('delivered');
    }, 320);

    // Stage 2: 300 - 650ms
    const t2 = setTimeout(() => {
      setStage('acknowledged');
    }, 680);

    // Stage 3: 650 - 1100ms, then exit fade
    const t3 = setTimeout(() => {
      setStage('exit');
    }, 1150);

    // Hand off to app at 1350ms
    const t4 = setTimeout(() => {
      onComplete();
    }, 1350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div
      id="ack-splash-screen"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#0B0B0D',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        opacity: stage === 'exit' ? 0 : 1,
        transition: 'opacity 220ms ease-out',
        pointerEvents: stage === 'exit' ? 'none' : 'auto',
      }}
    >
      {/* Centered Logo & Wordmark Container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
        }}
      >
        {/* Animated Check & Echo SVG */}
        <div
          style={{
            position: 'relative',
            width: '120px',
            height: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            viewBox="0 0 160 160"
            width="120"
            height="120"
            style={{ overflow: 'visible' }}
          >
            {/* 1. Echo Check (Sent - 0 to 300ms) */}
            <path
              d="M 60 76 L 80 96 L 120 54"
              fill="none"
              stroke="#4E4485"
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                opacity: stage === 'sent' ? 0.7 : 1,
                transform: stage === 'sent' ? 'scale(0.95)' : 'scale(1)',
                transformOrigin: '80px 80px',
                transition: 'opacity 300ms ease, transform 300ms ease',
              }}
            />

            {/* 2. Main Check (Delivered - 300 to 600ms) */}
            <path
              d="M 50 86 L 70 106 L 110 64"
              fill="none"
              stroke="#8B7CFF"
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="140"
              strokeDashoffset={stage === 'sent' ? '140' : '0'}
              style={{
                opacity: stage === 'sent' ? 0 : 1,
                transition: 'stroke-dashoffset 380ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease',
              }}
            />
          </svg>
        </div>

        {/* 3. Wordmark "Ack" (Acknowledged - 600ms onwards) */}
        <div
          style={{
            opacity: stage === 'acknowledged' || stage === 'exit' ? 1 : 0,
            transform:
              stage === 'acknowledged' || stage === 'exit'
                ? 'translateY(0)'
                : 'translateY(8px)',
            transition: 'opacity 250ms ease, transform 250ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <span
            style={{
              fontSize: '36px',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.03em',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            }}
          >
            Ack
          </span>
        </div>
      </div>

      {/* Bottom Tagline: "Got it." */}
      <div
        style={{
          position: 'absolute',
          bottom: 'calc(env(safe-area-inset-bottom, 24px) + 32px)',
          opacity: stage === 'acknowledged' || stage === 'exit' ? 0.6 : 0,
          transition: 'opacity 300ms ease',
        }}
      >
        <span
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: '#A99DFF',
            letterSpacing: '0.02em',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          }}
        >
          Got it.
        </span>
      </div>
    </div>
  );
};
