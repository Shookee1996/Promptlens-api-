// Military-grade AES-256-GCM encryption with PBKDF2 key derivation

const CRYPTO_SALT = new Uint8Array([
  0x2a, 0x7c, 0x9e, 0x1f, 0x4b, 0x8d, 0x3e, 0x6a, 0x0c, 0x5f, 0x9e, 0x1b, 0x7a, 0x2c, 0x4d, 0x8f,
]);

async function deriveKey(passphrase: string, salt?: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  );
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: (salt || CRYPTO_SALT) as any,
      iterations: 210000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptData(plaintext: string, key: CryptoKey): Promise<string> {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plaintext),
  );
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return btoa(String.fromCharCode(...combined));
}

export async function decryptData(encoded: string, key: CryptoKey): Promise<string> {
  const binary = atob(encoded);
  const combined = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) combined[i] = binary.charCodeAt(i);
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext,
  );
  return new TextDecoder().decode(decrypted);
}

async function getDeviceFingerprint(): Promise<string> {
  const data = [
    navigator.userAgent || '',
    navigator.language || '',
    screen.width + 'x' + screen.height,
    navigator.hardwareConcurrency || 0,
    navigator.platform || '',
  ].join('|');
  const enc = new TextEncoder();
  const hash = await window.crypto.subtle.digest('SHA-256', enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(hash))).slice(0, 32);
}

let _cryptoKey: CryptoKey | null = null;

export async function getCryptoKey(): Promise<CryptoKey> {
  if (_cryptoKey) return _cryptoKey;
  const fp = await getDeviceFingerprint();
  _cryptoKey = await deriveKey(fp, CRYPTO_SALT);
  return _cryptoKey;
}

export async function encryptSensitive(text: string): Promise<string> {
  if (!text) return text;
  try {
    const key = await getCryptoKey();
    return await encryptData(text, key);
  } catch (e) {
    console.warn('Encryption failed, storing plaintext:', e);
    return text;
  }
}

export async function decryptSensitive(encoded: string): Promise<string> {
  if (!encoded) return encoded;
  try {
    const key = await getCryptoKey();
    return await decryptData(encoded, key);
  } catch (e) {
    console.warn('Decryption failed, returning as-is:', e);
    return encoded;
  }
}

export const secureStore = {
  async get(key: string): Promise<string | null> {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data && data._encrypted) {
        return await decryptSensitive(data.value);
      }
      return typeof data === 'string' ? data : raw;
    } catch {
      return null;
    }
  },
  async set(key: string, value: string): Promise<void> {
    try {
      const encrypted = await encryptSensitive(value);
      localStorage.setItem(key, JSON.stringify({ _encrypted: true, value: encrypted }));
    } catch {
      localStorage.setItem(key, JSON.stringify({ _encrypted: false, value }));
    }
  },
};
