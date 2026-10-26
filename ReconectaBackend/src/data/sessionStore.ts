import { db } from './db.js';

interface SessionRow {
  sessionId: string;
  userId: string;
  createdAt: number;
}

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function pruneExpired(): void {
  const cutoff = Date.now() - SESSION_TTL_MS;
  const stmt = db.prepare('DELETE FROM sessions WHERE createdAt < ?');
  stmt.run(cutoff);
}

export function loadSessions(): void {
  try {
    pruneExpired();
  } catch (err) {
    console.error('[sessionStore] Erro ao limpar sessões expiradas no SQLite:', err);
  }
}

export function createSession(sessionId: string, userId: string): void {
  const stmt = db.prepare(
    'INSERT OR REPLACE INTO sessions (sessionId, userId, createdAt) VALUES (?, ?, ?)'
  );
  stmt.run(sessionId, userId, Date.now());
}

export function getSessionUserId(sessionId: string): string | null {
  const stmt = db.prepare('SELECT sessionId, userId, createdAt FROM sessions WHERE sessionId = ? LIMIT 1');
  const row = stmt.get(sessionId) as SessionRow | undefined;
  if (!row) return null;

  if (Date.now() - Number(row.createdAt) > SESSION_TTL_MS) {
    deleteSession(sessionId);
    return null;
  }

  return row.userId;
}

export function deleteSession(sessionId: string): void {
  const stmt = db.prepare('DELETE FROM sessions WHERE sessionId = ?');
  stmt.run(sessionId);
}

export function getSessionCount(): number {
  const stmt = db.prepare('SELECT COUNT(*) as total FROM sessions');
  const row = stmt.get() as { total: number } | undefined;
  return Number(row?.total ?? 0);
}
