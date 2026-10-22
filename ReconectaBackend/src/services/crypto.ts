import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

const SALT_ROUNDS = 12;

/** Hash de senha com bcrypt (custo 12). Seguro para produção. */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/** Verifica senha contra hash bcrypt. */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Gera um ID de sessão criptograficamente seguro. */
export function generateSessionId(): string {
  return crypto.randomUUID();
}
