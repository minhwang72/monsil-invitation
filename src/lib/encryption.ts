import crypto from 'crypto'

// 환경변수에서 키를 가져오거나 기본값 사용
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'monsil-wedding-2024-secret-key-32'
const ALGORITHM = 'aes-256-cbc'

// 키를 32바이트로 맞춤
const getKey = (): Buffer => {
  const key = ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32)
  return Buffer.from(key, 'utf8')
}

/**
 * 문자열을 암호화합니다
 */
export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(16) // 16바이트 IV 생성
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    // IV와 암호화된 데이터를 결합
    return iv.toString('hex') + ':' + encrypted
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('암호화에 실패했습니다')
  }
}

/**
 * 암호화된 문자열을 복호화합니다
 */
export function decrypt(encryptedText: string): string {
  try {
    // IV와 암호화된 데이터 분리
    const textParts = encryptedText.split(':')
    if (textParts.length !== 2) {
      throw new Error('잘못된 암호화 형식입니다')
    }
    
    const iv = Buffer.from(textParts[0], 'hex')
    const encrypted = textParts[1]
    
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('복호화에 실패했습니다')
  }
}

/**
 * 비밀번호를 해시화합니다 (단방향)
 */
export function hashPassword(password: string): string {
  try {
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
    return salt + ':' + hash
  } catch (error) {
    console.error('Password hashing error:', error)
    throw new Error('비밀번호 해시화에 실패했습니다')
  }
}

/**
 * 비밀번호를 검증합니다
 */
export function verifyPassword(password: string, hashedPassword: string): boolean {
  try {
    const parts = hashedPassword.split(':')
    if (parts.length !== 2) {
      return false
    }
    
    const salt = parts[0]
    const hash = parts[1]
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
    
    return hash === verifyHash
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
} 