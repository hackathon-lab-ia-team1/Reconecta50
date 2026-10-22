import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState({ isAuthenticated: false, sessionVersion: 0 });
  const setAuthenticated = useCallback((isAuthenticated: boolean) => {
    setSession((current) => ({ isAuthenticated, sessionVersion: current.sessionVersion + 1 }));
  }, []);
  return (
    <AuthContext.Provider value={{ ...session, setAuthenticated }}>{children}</AuthContext.Provider>
  );
}
