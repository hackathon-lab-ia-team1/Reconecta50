import { createContext } from 'react';
import type { SessionUser } from './types/session';

export interface AuthContextValue {
  isAuthenticated: boolean;
  sessionVersion: number;
  user: SessionUser | null;
  checkingSession: boolean;
  sessionError: string;
  retrySession: () => void;
  isDemo: boolean;
  enterDemo: () => void;
  setAuthenticated: (authenticated: boolean, user?: SessionUser | null) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
