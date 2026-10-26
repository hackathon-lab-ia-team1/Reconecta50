import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const DEFAULT_DATA_DIR = fs.existsSync(path.resolve(process.cwd(), 'ReconectaBackend'))
  ? path.resolve(process.cwd(), 'ReconectaBackend', 'data')
  : path.resolve(process.cwd(), 'data');

export const DATA_DIR = process.env.DATA_DIR || DEFAULT_DATA_DIR;

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const DB_PATH = path.join(DATA_DIR, 'reconecta.db');
export const db = new DatabaseSync(DB_PATH);

export function initDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      fullName TEXT NOT NULL,
      phone TEXT NOT NULL,
      cpf TEXT NOT NULL,
      birthDate TEXT,
      address TEXT,
      passwordHash TEXT NOT NULL,
      passwordHint TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      sessionId TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      createdAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS curriculos (
      userId TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS candidaturas (
      applicationId TEXT PRIMARY KEY,
      userId TEXT,
      jobId TEXT NOT NULL,
      jobTitle TEXT NOT NULL,
      company TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);
}

initDatabase();
