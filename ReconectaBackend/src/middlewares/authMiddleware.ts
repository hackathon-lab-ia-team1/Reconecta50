import type { Request, Response, NextFunction } from 'express';
import { getUserBySession } from '../services/authService.js';
import type { SessionUser } from '../types/auth.types.js';

declare global {
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}

export const SESSION_COOKIE = 'reconecta_session';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const sessionId = req.cookies?.[SESSION_COOKIE];
  if (!sessionId) {
    res.status(401).json({ error: 'Sessão não encontrada. Faça login.' });
    return;
  }

  const user = getUserBySession(sessionId);
  if (!user) {
    res.clearCookie(SESSION_COOKIE, { path: '/' });
    res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
    return;
  }

  req.user = user;
  next();
}
