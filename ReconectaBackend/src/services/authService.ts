import crypto from 'node:crypto';
import type { LoginRequest, RegisterRequest, PublicUser, SessionUser, UserRecord } from '../types/auth.types.js';
import { findUserByIdentifier, findUserById, cpfExists, phoneExists, addUser } from '../data/mocks/users.mock.js';
import { createSession, getSessionUserId, deleteSession } from '../data/sessionStore.js';
import { hashPassword, verifyPassword, generateSessionId } from './crypto.js';

export interface LoginResult {
  success: true;
  sessionId: string;
  user: PublicUser;
}

export async function loginUser(req: LoginRequest): Promise<LoginResult> {
  const user = findUserByIdentifier(req.identifier);
  if (!user) {
    throw new AuthError('Não foi possível entrar. Confira seus dados e tente novamente.', 401);
  }

  const passwordValid = await verifyPassword(req.password, user.passwordHash);
  if (!passwordValid) {
    throw new AuthError('Não foi possível entrar. Confira seus dados e tente novamente.', 401);
  }

  const sessionId = generateSessionId();
  createSession(sessionId, user.id);
  return { success: true, sessionId, user: toPublicUser(user) };
}

export async function registerUser(req: RegisterRequest): Promise<LoginResult> {
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
    passwordHash: await hashPassword(req.password),
    createdAt: new Date().toISOString(),
  };
  addUser(newUser);

  const sessionId = generateSessionId();
  createSession(sessionId, newUser.id);
  return { success: true, sessionId, user: toPublicUser(newUser) };
}

export function getUserBySession(sessionId: string): SessionUser | null {
  const userId = getSessionUserId(sessionId);
  if (!userId) return null;
  const user = findUserById(userId);
  return user ? toSessionUser(user) : null;
}

export function getPublicUserBySession(sessionId: string): PublicUser | null {
  const userId = getSessionUserId(sessionId);
  if (!userId) return null;
  const user = findUserById(userId);
  return user ? toPublicUser(user) : null;
}

export function destroySession(sessionId: string): void {
  deleteSession(sessionId);
}

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

function toPublicUser(u: UserRecord): PublicUser {
  return {
    id: u.id,
    fullName: u.fullName,
  };
}

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
