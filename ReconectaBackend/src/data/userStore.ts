import { db } from './db.js';
import { seedDatabase } from './seed.js';
import type { UserRecord } from '../types/auth.types.js';

interface UserRow {
  id: string;
  fullName: string;
  phone: string;
  cpf: string;
  birthDate: string | null;
  address: string | null;
  passwordHash: string;
  passwordHint: string | null;
  createdAt: string;
}

function mapRowToUser(row: UserRow | undefined): UserRecord | undefined {
  if (!row) return undefined;
  return {
    id: row.id,
    fullName: row.fullName,
    phone: row.phone,
    cpf: row.cpf,
    birthDate: row.birthDate ?? '',
    address: row.address ?? '',
    passwordHash: row.passwordHash,
    ...(row.passwordHint ? { passwordHint: row.passwordHint } : {}),
    createdAt: row.createdAt,
  };
}

export function loadUsers(): void {
  try {
    seedDatabase();
  } catch (err) {
    console.error('[userStore] Erro ao inicializar/seedar usuários no SQLite:', err);
  }
}

export function findUserByIdentifier(identifier: string): UserRecord | undefined {
  const digits = identifier.replace(/\D/g, '');
  const stmt = db.prepare('SELECT * FROM users WHERE cpf = ? OR phone = ? LIMIT 1');
  const row = stmt.get(digits, digits) as UserRow | undefined;
  return mapRowToUser(row);
}

export function findUserById(id: string): UserRecord | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
  const row = stmt.get(id) as UserRow | undefined;
  return mapRowToUser(row);
}

export function cpfExists(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  const stmt = db.prepare('SELECT 1 FROM users WHERE cpf = ? LIMIT 1');
  const row = stmt.get(digits);
  return Boolean(row);
}

export function phoneExists(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  const stmt = db.prepare('SELECT 1 FROM users WHERE phone = ? LIMIT 1');
  const row = stmt.get(digits);
  return Boolean(row);
}

export function addUser(user: UserRecord): void {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO users (
      id, fullName, phone, cpf, birthDate, address, passwordHash, passwordHint, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    user.id,
    user.fullName,
    user.phone,
    user.cpf,
    user.birthDate ?? null,
    user.address ?? null,
    user.passwordHash,
    user.passwordHint ?? null,
    user.createdAt
  );
}

export function getUserCount(): number {
  const stmt = db.prepare('SELECT COUNT(*) as total FROM users');
  const row = stmt.get() as { total: number } | undefined;
  return Number(row?.total ?? 0);
}
