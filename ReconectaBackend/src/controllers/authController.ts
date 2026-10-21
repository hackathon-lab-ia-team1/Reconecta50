import type { Request, Response } from 'express';
import { loginUser, registerUser, getUserBySession, destroySession, AuthError } from '../services/authService.js';
import { SESSION_COOKIE } from '../middlewares/authMiddleware.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
};

/**
 * POST /auth/login
 * Body: { identifier: string, password: string }
 */
export function handleLogin(req: Request, res: Response): void {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      res.status(400).json({ error: 'Informe seu CPF/telefone e senha.' });
      return;
    }

    const result = loginUser({ identifier, password });
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

/**
 * POST /auth/register
 * Body: { fullName, phone, cpf, birthDate, address, password }
 */
export function handleRegister(req: Request, res: Response): void {
  try {
    const { fullName, phone, cpf, birthDate, address, password } = req.body;

    if (!fullName || !phone || !cpf || !birthDate || !address || !password) {
      res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'A senha deve ter pelo menos 8 caracteres.' });
      return;
    }

    const result = registerUser({ fullName, phone, cpf, birthDate, address, password });
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

/**
 * GET /auth/me
 * Retorna dados do usuário logado baseado no cookie de sessão.
 */
export function handleMe(req: Request, res: Response): void {
  const sessionId = req.cookies?.[SESSION_COOKIE];
  if (!sessionId) {
    res.status(401).json({ authenticated: false });
    return;
  }
  const user = getUserBySession(sessionId);
  if (!user) {
    res.clearCookie(SESSION_COOKIE, { path: '/' });
    res.status(401).json({ authenticated: false });
    return;
  }
  res.json({ authenticated: true, user });
}

/**
 * POST /auth/logout
 * Limpa o cookie de sessão.
 */
export function handleLogout(req: Request, res: Response): void {
  const sessionId = req.cookies?.[SESSION_COOKIE];
  if (sessionId) {
    destroySession(sessionId);
  }
  res.clearCookie(SESSION_COOKIE, { path: '/' });
  res.json({ success: true, message: 'Sessão encerrada.' });
}
