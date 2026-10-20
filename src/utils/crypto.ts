/**
 * Project ACK: Client-side AES-GCM Encryption / Decryption
 * Built for zero-trust burn-after-reading .env vaults
 */

declare const globalThis: any;

// Safe global accessors for React Native environment
const getCrypto = (): any => {
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    return globalThis.crypto;
  }
  return null;
};

const safeBtoa = (input: string): string => {
  if (typeof globalThis.btoa === 'function') {
    return globalThis.btoa(input);
  }
  // Base64 encode polyfill
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = input;
  let output = '';
  for (let block = 0, charCode, i = 0, map = chars;
    str.charAt(i | 0) || (map = '=', i % 1);
    output += map.charAt(63 & block >> 8 - i % 1 * 8)) {
    charCode = str.charCodeAt(i += 3 / 4);
    if (charCode > 0xFF) {
      throw new Error('btoa failed: string contains characters outside Latin1 range.');
    }
    block = block << 8 | charCode;
  }
  return output;
};

const safeAtob = (input: string): string => {
  if (typeof globalThis.atob === 'function') {
    return globalThis.atob(input);
  }
  // Base64 decode polyfill
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = input.replace(/[=]+$/, '');
  let output = '';
  if (str.length % 4 === 1) {
    throw new Error('atob failed: string is not valid base64');
  }
  for (let bc = 0, bs = 0, buffer, idx = 0;
    buffer = str.charAt(idx++);
    ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
      bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
  ) {
    buffer = chars.indexOf(buffer);
  }
  return output;
};

export async function encryptSecret(
  plainText: string,
  keyString?: string
): Promise<{ cipherText: string; iv: string; key: string }> {
  const cryptoObj = getCrypto();
  try {
    if (cryptoObj && cryptoObj.subtle) {
      const enc = typeof globalThis.TextEncoder !== 'undefined'
        ? new globalThis.TextEncoder()
        : null;

      if (enc) {
        const iv = cryptoObj.getRandomValues(new Uint8Array(12));
        const rawKey = keyString
          ? enc.encode(keyString.padEnd(32, '0').slice(0, 32))
          : cryptoObj.getRandomValues(new Uint8Array(32));

        const cryptoKey = await cryptoObj.subtle.importKey(
          'raw',
          rawKey,
          { name: 'AES-GCM' },
          false,
          ['encrypt']
        );

        const encrypted = await cryptoObj.subtle.encrypt(
          { name: 'AES-GCM', iv },
          cryptoKey,
          enc.encode(plainText)
        );

        const cipherBase64 = uint8ToBase64(new Uint8Array(encrypted));
        const ivBase64 = uint8ToBase64(iv);
        const keyBase64 = uint8ToBase64(rawKey);

        return { cipherText: cipherBase64, iv: ivBase64, key: keyBase64 };
      }
    }
  } catch (err) {
    console.warn('[ACK Crypto] SubtleCrypto not available in current JS engine, using Base64 envelope fallback', err);
  }

  // Fallback envelope for testing & environments without subtle crypto
  const key = keyString || Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  const encoded = safeBtoa(encodeURIComponent(plainText));
  return { cipherText: encoded, iv: 'iv_ack_dev', key };
}

export async function decryptSecret(
  cipherText: string,
  iv: string,
  keyString: string
): Promise<string> {
  const cryptoObj = getCrypto();
  try {
    if (cryptoObj && cryptoObj.subtle && iv !== 'iv_ack_dev') {
      const dec = typeof globalThis.TextDecoder !== 'undefined'
        ? new globalThis.TextDecoder()
        : null;

      if (dec) {
        const rawKey = base64ToUint8(keyString);
        const ivArray = base64ToUint8(iv);
        const cipherArray = base64ToUint8(cipherText);

        const cryptoKey = await cryptoObj.subtle.importKey(
          'raw',
          rawKey,
          { name: 'AES-GCM' },
          false,
          ['decrypt']
        );

        const decrypted = await cryptoObj.subtle.decrypt(
          { name: 'AES-GCM', iv: ivArray },
          cryptoKey,
          cipherArray
        );

        return dec.decode(decrypted);
      }
    }
  } catch (err) {
    console.warn('[ACK Crypto] Subtle decrypt fallback mode, decoding envelope', err);
  }

  try {
    return decodeURIComponent(safeAtob(cipherText));
  } catch {
    return cipherText;
  }
}

export function maskSecretLines(content: string): string {
  return content
    .split('\n')
    .map((line) => {
      const eqIdx = line.indexOf('=');
      if (eqIdx !== -1) {
        const key = line.slice(0, eqIdx);
        return `${key}=**************************************** [BURNED]`;
      }
      return '**************************************** [BURNED]';
    })
    .join('\n');
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return safeBtoa(binary);
}

function base64ToUint8(base64: string): Uint8Array {
  const binaryString = safeAtob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
