import React, { useState } from 'react';
import { Shield, Lock, Fingerprint, Delete, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface PinSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  subtitle?: string;
}

export const PinSecurityModal: React.FC<PinSecurityModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Developer Vault Security',
  subtitle = 'Enter 4-digit PIN or authenticate via Biometrics to access sensitive .env keys',
}) => {
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isScanningBiometric, setIsScanningBiometric] = useState<boolean>(false);
  const [autoLockDuration, setAutoLockDuration] = useState<string>('15m');

  if (!isOpen) return null;

  const handleKeyPress = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMsg(null);

      // Auto-submit on 4th digit (demo pin: 1337 or any 4 digits)
      if (nextPin.length === 4) {
        setTimeout(() => {
          onSuccess();
          setPin('');
          onClose();
        }, 300);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleBiometricAuth = () => {
    setIsScanningBiometric(true);
    setErrorMsg(null);

    setTimeout(() => {
      setIsScanningBiometric(false);
      onSuccess();
      setPin('');
      onClose();
    }, 900);
  };

  return (
    <div
      className="echat-modal-backdrop"
      id="pin-security-modal"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 7, 10, 0.88)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        className="pin-pad-card"
        style={{
          width: '100%',
          maxWidth: '380px',
          background: 'linear-gradient(180deg, #161B22 0%, #0D1117 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '32px 24px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.7), 0 0 32px rgba(0, 255, 102, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* Close cross */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: '#8B949E',
            cursor: 'pointer',
            fontSize: '18px',
          }}
        >
          ✕
        </button>

        {/* Shield Icon Badge */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(0, 255, 102, 0.12)',
            border: '1px solid rgba(0, 255, 102, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00FF66',
            marginBottom: '16px',
          }}
        >
          <Lock size={26} />
        </div>

        <h3
          style={{
            color: '#FFF',
            fontSize: '19px',
            fontWeight: 700,
            marginBottom: '6px',
            textAlign: 'center',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            color: '#8B949E',
            fontSize: '12px',
            textAlign: 'center',
            lineHeight: 1.5,
            marginBottom: '24px',
          }}
        >
          {subtitle}
        </p>

        {/* 4 PIN Dots */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = idx < pin.length;
            return (
              <div
                key={idx}
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: isFilled ? '#00FF66' : 'rgba(255, 255, 255, 0.1)',
                  border: `2px solid ${isFilled ? '#00FF66' : 'rgba(255, 255, 255, 0.2)'}`,
                  boxShadow: isFilled ? '0 0 12px rgba(0, 255, 102, 0.6)' : 'none',
                  transition: 'all 0.15s ease',
                  transform: isFilled ? 'scale(1.15)' : 'scale(1)',
                }}
              />
            );
          })}
        </div>

        {/* Numeric Keypad (1 - 9, Bio, 0, Del) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '14px',
            width: '100%',
            maxWidth: '280px',
            marginBottom: '20px',
          }}
        >
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="keypad-digit-btn"
              id={`pin-btn-${digit}`}
              style={{
                height: '56px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(255, 255, 255, 0.04)',
                color: '#FFF',
                fontSize: '22px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {digit}
            </button>
          ))}

          {/* Biometrics Button */}
          <button
            type="button"
            onClick={handleBiometricAuth}
            className="keypad-digit-btn"
            id="pin-btn-biometric"
            title="Scan Face ID / Touch ID"
            style={{
              height: '56px',
              borderRadius: '16px',
              border: '1px solid rgba(0, 255, 102, 0.2)',
              background: 'rgba(0, 255, 102, 0.08)',
              color: '#00FF66',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            <Fingerprint size={24} className={isScanningBiometric ? 'pulse-green' : ''} />
          </button>

          {/* Zero Button */}
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="keypad-digit-btn"
            id="pin-btn-0"
            style={{
              height: '56px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(255, 255, 255, 0.04)',
              color: '#FFF',
              fontSize: '22px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            0
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={handleDelete}
            className="keypad-digit-btn"
            id="pin-btn-delete"
            title="Backspace"
            style={{
              height: '56px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(255, 255, 255, 0.04)',
              color: '#8B949E',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            <Delete size={22} />
          </button>
        </div>

        {/* Auto Lock Duration Selector (E-Chat Settings) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '10px 14px',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '11px',
            color: '#8B949E',
          }}
        >
          <span>Auto-lock Timeout:</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['1m', '15m', '1h'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setAutoLockDuration(t)}
                style={{
                  background: autoLockDuration === t ? '#00FF66' : 'transparent',
                  color: autoLockDuration === t ? '#000' : '#8B949E',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
