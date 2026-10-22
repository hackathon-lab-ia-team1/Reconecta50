import fs from 'node:fs';
import path from 'node:path';
import type { UserRecord } from '../../types/auth.types.js';

/**
 * Store de usuários com persistência em arquivo JSON.
 *
 * - Em desenvolvimento: persiste em DATA_DIR/users.json (padrão: ./data/)
 * - O arquivo é lido na inicialização e gravado a cada mutação.
 * - Thread-safe o suficiente para um servidor single-process.
 */

const DATA_DIR = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

let users: UserRecord[] = [];

/** Carrega usuários do disco. Cria o diretório/arquivo se não existirem. */
export function loadUsers(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, 'utf-8');
      users = JSON.parse(raw);
    }
  } catch (err) {
    console.error('[userStore] Erro ao carregar users.json, iniciando vazio:', err);
    users = [];
  }
}

/** Persiste o array de usuários no disco. */
function persist(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('[userStore] Erro ao persistir users.json:', err);
  }
}

export function findUserByIdentifier(identifier: string): UserRecord | undefined {
  const digits = identifier.replace(/\D/g, '');
  return users.find(u => u.cpf === digits || u.phone === digits);
}

export function findUserById(id: string): UserRecord | undefined {
  return users.find(u => u.id === id);
}

export function cpfExists(cpf: string): boolean {
  return users.some(u => u.cpf === cpf);
}

export function phoneExists(phone: string): boolean {
  return users.some(u => u.phone === phone);
}

export function addUser(user: UserRecord): void {
  users.push(user);
  persist();
}

export function getUserCount(): number {
  return users.length;
}
