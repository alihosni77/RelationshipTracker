import { getRandomBytesAsync } from 'expo-crypto';

function bytesToBase64(bytes: Uint8Array) { return btoa(String.fromCharCode(...bytes)); }
function base64ToBytes(value: string) { return Uint8Array.from(atob(value), c => c.charCodeAt(0)); }
function cryptoApi() { const cryptoApi = globalThis.crypto; if (!cryptoApi?.subtle) throw new Error('secure_crypto_unavailable'); return cryptoApi; }
function bufferSource(bytes: Uint8Array): ArrayBuffer { return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer; }

async function deriveKey(passphrase: string, salt: Uint8Array, usage: 'encrypt'|'decrypt') {
  const crypto = cryptoApi();
  const material = await crypto.subtle.importKey('raw', bufferSource(new TextEncoder().encode(passphrase)), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name:'PBKDF2', salt: bufferSource(salt), iterations:120000, hash:'SHA-256' }, material, { name:'AES-GCM', length:256 }, false, [usage]);
}

export async function encryptWithPassphrase(plaintext: string, passphrase: string) {
  const salt = await getRandomBytesAsync(16); const iv = await getRandomBytesAsync(12); const crypto = cryptoApi(); const key = await deriveKey(passphrase, salt, 'encrypt');
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv:bufferSource(iv)}, key, bufferSource(new TextEncoder().encode(plaintext))));
  return { ciphertext: bytesToBase64(encrypted), keyEnvelope: JSON.stringify({salt:bytesToBase64(salt),iv:bytesToBase64(iv),kdf:'PBKDF2-SHA256-120000',cipher:'AES-256-GCM',v:1}) };
}
export async function decryptWithPassphrase(ciphertext: string, keyEnvelope: string, passphrase: string) {
  const envelope=JSON.parse(keyEnvelope) as {salt:string;iv:string}; const crypto=cryptoApi(); const key=await deriveKey(passphrase,base64ToBytes(envelope.salt),'decrypt');
  try { const opened=await crypto.subtle.decrypt({name:'AES-GCM',iv:bufferSource(base64ToBytes(envelope.iv))},key,bufferSource(base64ToBytes(ciphertext))); return new TextDecoder().decode(opened); } catch { throw new Error('invalid_message_password'); }
}
