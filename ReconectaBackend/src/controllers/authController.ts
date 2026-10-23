import type { Request, Response } from 'express';
import {
  loginUser,
  registerUser,
  getPublicUserBySession,
  destroySession,
  AuthError,
} from '../services/authService.js';
import { SESSION_COOKIE } from '../middlewares/authMiddleware.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function handleLogin(req: Request, res: Response): Promise<void> {
  try {
    const { identifier, password } = req.body ?? {};

    if (!identifier || !password || typeof identifier !== 'string' || typeof password !== 'string') {
      res.status(400).json({ error: 'Informe seu CPF/telefone e senha.' });
      return;
    }

    const result = await loginUser({ identifier, password });
    res.cookie(SESSION_COOKIE, result.sessionId, COOKIE_OPTIONS);
    res.json({ success: true, user: result.user });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('[auth/login] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

export async function handleRegister(req: Request, res: Response): Promise<void> {
  try {
    const { fullName, phone, cpf, birthDate, address, password } = req.body ?? {};

    if (!fullName || !phone || !cpf || !birthDate || !address || !password) {
      res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
      return;
    }

    if (typeof password !== 'string' || password.length < 8) {
      res.status(400).json({ error: 'A senha deve ter pelo menos 8 caracteres.' });
      return;
    }

    const cpfDigits = String(cpf).replace(/\D/g, '');
    if (cpfDigits.length !== 11) {
      res.status(400).json({ error: 'CPF deve conter 11 dígitos.' });
      return;
    }

    const phoneDigits = String(phone).replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      res.status(400).json({ error: 'Telefone deve conter 10 ou 11 dígitos com DDD.' });
      return;
    }

    const result = await registerUser({
      fullName: String(fullName).trim(),
      phone: phoneDigits,
      cpf: cpfDigits,
      birthDate: String(birthDate),
      address: String(address).trim(),
      password,
    });
    res.cookie(SESSION_COOKIE, result.sessionId, COOKIE_OPTIONS);
    res.status(201).json({ success: true, user: result.user });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('[auth/register] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

export function handleMe(req: Request, res: Response): void {
  const sessionId = req.cookies?.[SESSION_COOKIE];
  if (!sessionId) {
    res.status(401).json({ authenticated: false });
    return;
  }
  const user = getPublicUserBySession(sessionId);
  if (!user) {
    res.clearCookie(SESSION_COOKIE, { path: '/' });
    res.status(401).json({ authenticated: false });
    return;
  }
  res.json({ authenticated: true, user });
}

export function handleLogout(req: Request, res: Response): void {
  const sessionId = req.cookies?.[SESSION_COOKIE];
  if (sessionId) {
    destroySession(sessionId);
  }
  res.clearCookie(SESSION_COOKIE, { path: '/' });
  res.json({ success: true, message: 'Sessão encerrada.' });
}
