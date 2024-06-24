import * as CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_CDAS_ENCRYPT_SECRET;
export const encrypt = (plainText) => CryptoJS.AES.encrypt(plainText, SECRET_KEY).toString();

export const decrypt = (cipherText) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};
