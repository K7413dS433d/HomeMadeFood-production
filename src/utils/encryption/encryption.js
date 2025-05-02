import crypto from "crypto-js";

export const encrypt = ({ data, key = process.env.ENCRYPT_KEY }) =>
  crypto.AES.encrypt(data, key).toString();

export const decrypt = ({ cipher_text, key = process.env.ENCRYPT_KEY }) =>
  crypto.AES.decrypt(cipher_text, key).toString(crypto.enc.Utf8);
