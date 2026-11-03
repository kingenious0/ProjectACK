/**
 * ACK. (CHAT4DEVS) Web Crypto Engine
 * Zero-Trust Client-Side AES-256-GCM Encryption for Burn-After-Reading .env Vaults
 */

const ENCRYPTION_ALGORITHM = 'AES-GCM';

export interface EncryptedPayload {
  ciphertext: string; // Base64
  iv: string; // Base64
  salt: string; // Base64
  timestamp: number;
}

// Derive a cryptographic key using PBKDF2
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ENCRYPTION_ALGORITHM, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Convert ArrayBuffer to Base64
function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Convert Base64 to Uint8Array
function base64ToBuffer(base64: string): Uint8Array {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encrypt secret .env string with AES-256-GCM
 */
export async function encryptEnvSecret(plainText: string, passphrase = 'ACK_DEFAULT_VAULT_KEY'): Promise<EncryptedPayload> {
  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveKey(passphrase, salt);
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: ENCRYPTION_ALGORITHM,
      iv: iv as any,
    },
    key,
    enc.encode(plainText)
  );

  return {
    ciphertext: bufferToBase64(encrypted),
    iv: bufferToBase64(iv),
    salt: bufferToBase64(salt),
    timestamp: Date.now(),
  };
}

/**
 * Decrypt secret .env string
 */
export async function decryptEnvSecret(payload: EncryptedPayload, passphrase = 'ACK_DEFAULT_VAULT_KEY'): Promise<string> {
  const salt = base64ToBuffer(payload.salt);
  const iv = base64ToBuffer(payload.iv);
  const ciphertext = base64ToBuffer(payload.ciphertext);

  const key = await deriveKey(passphrase, salt);
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: ENCRYPTION_ALGORITHM,
      iv: iv as any,
    },
    key,
    ciphertext as any
  );

  const dec = new TextDecoder();
  return dec.decode(decrypted);
}
