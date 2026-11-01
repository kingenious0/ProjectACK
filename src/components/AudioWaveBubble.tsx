import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, CheckCheck } from 'lucide-react';

interface AudioWaveBubbleProps {
  duration?: string;
  waveform?: number[];
  accentColor?: string;
  isMe?: boolean;
  timestamp?: string;
}

export const AudioWaveBubble: React.FC<AudioWaveBubbleProps> = ({
  duration = '0:18',
  waveform = [30, 45, 60, 90, 50, 40, 75, 95, 60, 40, 55, 80, 45, 85, 65, 30, 50, 70, 85, 55, 35, 25],
  accentColor = '#00A884',
  isMe = false,
  timestamp = '9:43 AM',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setPlaybackProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 4;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const togglePlay = () => {
    if (playbackProgress >= 100) {
      setPlaybackProgress(0);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div
      className="echat-audio-bubble"
      id="audio-waveform-player"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 14px',
        borderRadius: '16px',
        background: isMe ? 'rgba(0, 163, 255, 0.12)' : 'rgba(33, 38, 45, 0.75)',
        border: `1px solid ${isMe ? 'rgba(0, 163, 255, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
        backdropFilter: 'blur(10px)',
        minWidth: '240px',
        maxWidth: '320px',
      }}
    >
      {/* Play / Pause circular action */}
      <button
        type="button"
        onClick={togglePlay}
        className="audio-play-btn"
        id="btn-toggle-audio-play"
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          border: 'none',
          background: isMe ? '#00A3FF' : accentColor,
          color: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          boxShadow: `0 4px 12px ${isMe ? 'rgba(0,163,255,0.4)' : 'rgba(0,168,132,0.4)'}`,
          transition: 'transform 0.15s ease',
        }}
      >
        {isPlaying ? <Pause size={18} fill="#000" /> : <Play size={18} fill="#000" style={{ marginLeft: 2 }} />}
      </button>

      {/* Waveform track */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div
          className="waveform-bars-container"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            height: '28px',
            overflow: 'hidden',
          }}
        >
          {waveform.map((barHeight, idx) => {
            const barPct = (idx / waveform.length) * 100;
            const isPlayed = barPct <= playbackProgress;

            return (
              <span
                key={idx}
                className="waveform-bar"
                style={{
                  width: '3px',
                  height: `${Math.max(barHeight * 0.28, 6)}px`,
                  borderRadius: '2px',
                  background: isPlayed
                    ? (isMe ? '#00A3FF' : accentColor)
                    : 'rgba(255, 255, 255, 0.25)',
                  transition: 'height 0.1s ease, background 0.15s ease',
                  transform: isPlaying && isPlayed ? 'scaleY(1.15)' : 'scaleY(1)',
                }}
              />
            );
          })}
        </div>

        {/* Footer info: Duration + Double ticks */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: '#8B949E',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          <span>{isPlaying ? `0:0${Math.floor(playbackProgress / 20)}` : duration}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>{timestamp}</span>
            <CheckCheck size={14} color="#00A3FF" />
          </div>
        </div>
      </div>
    </div>
  );
};
