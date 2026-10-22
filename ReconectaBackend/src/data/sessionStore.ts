import fs from 'node:fs';
import path from 'node:path';

/**
 * Store de sessões com persistência em arquivo JSON.
 *
 * - Cada sessão mapeia sessionId → userId.
 * - As sessões têm TTL configurável (padrão: 7 dias).
 * - Sessões expiradas são removidas automaticamente na leitura.
 */

interface SessionEntry {
  userId: string;
  createdAt: number; // timestamp em ms
}

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias
const DATA_DIR = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

let sessions: Record<string, SessionEntry> = {};

/** Carrega sessões do disco. */
export function loadSessions(): void {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
      sessions = JSON.parse(raw);
      // Limpa sessões expiradas ao carregar
      pruneExpired();
    }
  } catch (err) {
    console.error('[sessionStore] Erro ao carregar sessions.json:', err);
    sessions = {};
  }
}

function persist(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
  } catch (err) {
    console.error('[sessionStore] Erro ao persistir sessions.json:', err);
  }
}

function pruneExpired(): void {
  const now = Date.now();
  let changed = false;
  for (const [sid, entry] of Object.entries(sessions)) {
    if (now - entry.createdAt > SESSION_TTL_MS) {
      delete sessions[sid];
      changed = true;
    }
  }
  if (changed) persist();
}

export function createSession(sessionId: string, userId: string): void {
  sessions[sessionId] = { userId, createdAt: Date.now() };
  persist();
}

export function getSessionUserId(sessionId: string): string | null {
  const entry = sessions[sessionId];
  if (!entry) return null;

  // Verifica expiração
  if (Date.now() - entry.createdAt > SESSION_TTL_MS) {
    delete sessions[sessionId];
    persist();
    return null;
  }

  return entry.userId;
}

export function deleteSession(sessionId: string): void {
  if (sessions[sessionId]) {
    delete sessions[sessionId];
    persist();
  }
}

export function getSessionCount(): number {
  return Object.keys(sessions).length;
}
