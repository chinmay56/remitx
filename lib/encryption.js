import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.WALLET_ENCRYPTION_KEY;

export function encryptPrivateKey(privateKey) {
  return CryptoJS.AES.encrypt(privateKey, ENCRYPTION_KEY).toString();
}

export function decryptPrivateKey(encryptedKey) {
  const bytes = CryptoJS.AES.decrypt(encryptedKey, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}
