import type { UserRecord } from '../../types/auth.types.js';
import { hashPassword } from '../../services/crypto.js';

// ─── Store em memória para o hackathon ───
// Em produção seria um banco de dados real.

const users: UserRecord[] = [];

/** Inicializa com um usuário demo para testes */
export function seedDemoUser(): void {
  if (users.length > 0) return;
  users.push({
    id: 'demo-001',
    fullName: 'Maria da Silva',
    phone: '11999999999',
    cpf: '52998224725',         // CPF válido de teste
    birthDate: '1970-05-15',
    address: 'Rua das Flores, 123 - São Paulo, SP',
    passwordHash: hashPassword('senha1234'),
    createdAt: new Date().toISOString(),
  });
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
}

export function getAllUsers(): readonly UserRecord[] {
  return users;
}
