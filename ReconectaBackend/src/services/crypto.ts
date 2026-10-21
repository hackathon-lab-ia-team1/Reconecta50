import crypto from 'node:crypto';

/** Hash simples para hackathon (SHA-256). Em produção use bcrypt/argon2. */
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function generateSessionId(): string {
  return crypto.randomUUID();
}
