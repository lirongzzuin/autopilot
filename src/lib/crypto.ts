/**
 * AES-256-GCM 암호화/복호화 유틸리티
 * 사용자 API 키, 빌링키 등 민감 데이터 보호용
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;

function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) throw new Error('ENCRYPTION_KEY 환경변수가 설정되지 않았습니다.');
  return key;
}

async function importKey(keyHex: string): Promise<CryptoKey> {
  if (keyHex.length !== 64) {
    throw new Error(`ENCRYPTION_KEY는 32바이트(64 hex 문자)여야 합니다. 현재: ${keyHex.length}자`);
  }
  const keyBytes = Buffer.from(keyHex, 'hex');
  return crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * 문자열을 AES-256-GCM으로 암호화
 * @returns base64 인코딩된 암호화 데이터 (iv:암호화데이터 형식)
 */
export async function encrypt(plaintext: string): Promise<string> {
  const key = await importKey(getEncryptionKey());
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoded
  );

  const ivBase64 = Buffer.from(iv).toString('base64');
  const dataBase64 = Buffer.from(ciphertext).toString('base64');
  return `${ivBase64}:${dataBase64}`;
}

/**
 * AES-256-GCM으로 암호화된 문자열 복호화
 */
export async function decrypt(encryptedData: string): Promise<string> {
  const [ivBase64, dataBase64] = encryptedData.split(':');
  if (!ivBase64 || !dataBase64) throw new Error('잘못된 암호화 데이터 형식입니다.');

  const key = await importKey(getEncryptionKey());
  const iv = Buffer.from(ivBase64, 'base64');
  const ciphertext = Buffer.from(dataBase64, 'base64');

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * API 키 마스킹 처리 (화면 표시용)
 */
export function maskApiKey(key: string): string {
  if (key.length <= 8) return '****';
  return key.slice(0, 4) + '****' + key.slice(-4);
}
