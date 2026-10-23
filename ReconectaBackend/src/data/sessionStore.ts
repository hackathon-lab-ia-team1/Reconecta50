import fs from 'node:fs';
import path from 'node:path';

interface SessionEntry {
  userId: string;
  createdAt: number;
}

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const DEFAULT_DATA_DIR = path.resolve(process.cwd(), 'node_modules', '.cache', 'reconecta-data');
const DATA_DIR = process.env.DATA_DIR || DEFAULT_DATA_DIR;
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

let sessions: Record<string, SessionEntry> = {};

export function loadSessions(): void {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        sessions = parsed;
        pruneExpired();
      }
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
