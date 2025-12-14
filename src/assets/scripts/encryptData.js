import CryptoJS from 'crypto-js';

/**
 * AES-CBC-PKCS7 encryption compatible with Computop (hex output).
 * Data format: ivHex-cipherHex
 */
export function encryptData(plainKvp, password) {
  const iv = CryptoJS.lib.WordArray.random(16);
  const key = CryptoJS.enc.Utf8.parse(password);

  const encrypted = CryptoJS.AES.encrypt(plainKvp, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  const ivHex = iv.toString(CryptoJS.enc.Hex);
  const cipherHex = encrypted.ciphertext.toString(CryptoJS.enc.Hex);

  return {
    Data: `${ivHex}-${cipherHex}`,
    Len: plainKvp.length
  };
}
