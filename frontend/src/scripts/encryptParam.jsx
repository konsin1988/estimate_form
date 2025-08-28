import CryptoJS from "crypto-js";

const secretKey = CryptoJS.enc.Utf8.parse("1354461985278472");
const iv = CryptoJS.enc.Utf8.parse("1294851782653736");

export function encryptParam(value) {
    const encrypted = CryptoJS.AES.encrypt(value, secretKey, {
	iv: iv,
	mode: CryptoJS.mode.CBC,
	padding: CryptoJS.pad.Pkcs7
    });
    return encodeURIComponent(encrypted.ciphertext.toString(CryptoJS.enc.Base64));
}
