import { createContext } from 'react';

export interface AuthContextValue {
  isAuthenticated: boolean;
  sessionVersion: number;
  setAuthenticated: (authenticated: boolean) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
