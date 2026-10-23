import fs from 'node:fs';
import path from 'node:path';
import type { UserRecord } from '../../types/auth.types.js';

const DEFAULT_DATA_DIR = path.resolve(process.cwd(), 'node_modules', '.cache', 'reconecta-data');
const DATA_DIR = process.env.DATA_DIR || DEFAULT_DATA_DIR;
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Usuário padrão de demonstração para testes imediatos
const DEMO_USER: UserRecord = {
  id: 'demo-user-001',
  fullName: 'Maria da Silva',
  phone: '11999999999',
  cpf: '52998224725',
  birthDate: '1970-05-15',
  address: 'São Paulo - SP',
  passwordHash: '$2b$10$6oafC.ge4W7xS2Z9YFrfCOr5YIVIoEfpOvuo0Ahf1.hC9uJZA4oKW', // senha1234
  createdAt: '2026-01-01T00:00:00.000Z',
};

let users: UserRecord[] = [];

export function loadUsers(): void {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        users = parsed;
        return;
      }
    }
  } catch (err) {
    console.error('[userStore] Erro ao carregar users.json:', err);
  }

  // Se estiver vazio, inicializa com o usuário demo
  users = [DEMO_USER];
  persist();
}

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
  return users.find((u) => u.cpf === digits || u.phone === digits);
}

export function findUserById(id: string): UserRecord | undefined {
  return users.find((u) => u.id === id);
}

export function cpfExists(cpf: string): boolean {
  return users.some((u) => u.cpf === cpf);
}

export function phoneExists(phone: string): boolean {
  return users.some((u) => u.phone === phone);
}

export function addUser(user: UserRecord): void {
  users.push(user);
  persist();
}

export function getUserCount(): number {
  return users.length;
}
