import crypto from 'node:crypto';
import type { LoginRequest, RegisterRequest, SessionUser, UserRecord } from '../types/auth.types.js';
import { findUserByIdentifier, findUserById, cpfExists, phoneExists, addUser } from '../data/mocks/users.mock.js';
import { hashPassword, generateSessionId } from './crypto.js';

// ─── Sessões em memória ───
// Map<sessionId, userId>
const sessions = new Map<string, string>();

// ─── Login ───

export interface LoginResult {
  success: true;
  sessionId: string;
  user: SessionUser;
}

export function loginUser(req: LoginRequest): LoginResult {
  const user = findUserByIdentifier(req.identifier);
  if (!user) {
    throw new AuthError('Não foi possível entrar. Confira seus dados e tente novamente.', 401);
  }
  if (user.passwordHash !== hashPassword(req.password)) {
    throw new AuthError('Não foi possível entrar. Confira seus dados e tente novamente.', 401);
  }
  const sessionId = generateSessionId();
  sessions.set(sessionId, user.id);
  return { success: true, sessionId, user: toSessionUser(user) };
}

// ─── Registro ───

export function registerUser(req: RegisterRequest): LoginResult {
  if (cpfExists(req.cpf)) {
    throw new AuthError('Já existe uma conta com este CPF.', 409);
  }
  if (phoneExists(req.phone)) {
    throw new AuthError('Já existe uma conta com este telefone.', 409);
  }

  const newUser: UserRecord = {
    id: crypto.randomUUID(),
    fullName: req.fullName,
    phone: req.phone,
    cpf: req.cpf,
    birthDate: req.birthDate,
    address: req.address,
    passwordHash: hashPassword(req.password),
    createdAt: new Date().toISOString(),
  };
  addUser(newUser);

  // Já loga automaticamente após registro
  const sessionId = generateSessionId();
  sessions.set(sessionId, newUser.id);
  return { success: true, sessionId, user: toSessionUser(newUser) };
}

// ─── Sessão ───

export function getUserBySession(sessionId: string): SessionUser | null {
  const userId = sessions.get(sessionId);
  if (!userId) return null;
  const user = findUserById(userId);
  return user ? toSessionUser(user) : null;
}

export function destroySession(sessionId: string): void {
  sessions.delete(sessionId);
}

// ─── Helpers ───

function toSessionUser(u: UserRecord): SessionUser {
  return {
    id: u.id,
    fullName: u.fullName,
    phone: u.phone,
    cpf: u.cpf,
    birthDate: u.birthDate,
    address: u.address,
  };
}

export class AuthError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = 'AuthError';
  }
}
