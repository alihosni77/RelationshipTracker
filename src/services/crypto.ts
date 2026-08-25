import { getRandomBytesAsync } from 'expo-crypto';
import nacl from 'tweetnacl';
import { deriveKey } from '@stablelib/pbkdf2';
import { SHA256 } from '@stablelib/sha256';

function bytesToBase64(bytes: Uint8Array) { return btoa(String.fromCharCode(...bytes)); }
function base64ToBytes(value: string) { return Uint8Array.from(atob(value), c => c.charCodeAt(0)); }

export async function encryptWithPassphrase(plaintext: string, passphrase: string) {
  const salt = await getRandomBytesAsync(16);
  const nonce = await getRandomBytesAsync(nacl.secretbox.nonceLength);
  const key = deriveKey(new TextEncoder().encode(passphrase), salt, 120000, nacl.secretbox.keyLength, SHA256);
  const sealed = nacl.secretbox(new TextEncoder().encode(plaintext), nonce, key);
  return { ciphertext: bytesToBase64(sealed), keyEnvelope: JSON.stringify({ salt: bytesToBase64(salt), nonce: bytesToBase64(nonce), kdf: 'PBKDF2-SHA256-120000', v: 1 }) };
}

export function decryptWithPassphrase(ciphertext: string, keyEnvelope: string, passphrase: string) {
  const envelope = JSON.parse(keyEnvelope) as { salt: string; nonce: string };
  const salt = base64ToBytes(envelope.salt);
  const nonce = base64ToBytes(envelope.nonce);
  const key = deriveKey(new TextEncoder().encode(passphrase), salt, 120000, nacl.secretbox.keyLength, SHA256);
  const opened = nacl.secretbox.open(base64ToBytes(ciphertext), nonce, key);
  if (!opened) throw new Error('invalid_message_password');
  return new TextDecoder().decode(opened);
}
