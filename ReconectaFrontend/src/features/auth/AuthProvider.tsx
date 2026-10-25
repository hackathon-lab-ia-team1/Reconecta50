import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { getSession } from './services/authService';
import type { SessionUser } from './types/session';
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{
    isAuthenticated: boolean;
    sessionVersion: number;
    user: SessionUser | null;
  }>({ isAuthenticated: false, sessionVersion: 0, user: null });
  const [checkingSession, setCheckingSession] = useState(!!import.meta.env.VITE_AUTH_ME_URL);
  const [sessionError, setSessionError] = useState('');
  const [isDemo, setDemo] = useState(false);
  const enterDemo = useCallback(() => setDemo(true), []);
  const [attempt, retry] = useState(0);
  const requestRef = useRef<AbortController | null>(null);
  const retrySession = useCallback(() => retry((value) => value + 1), []);
  const setAuthenticated = useCallback(
    (isAuthenticated: boolean, user: SessionUser | null = null) => {
      requestRef.current?.abort();
      requestRef.current = null;
      setCheckingSession(false);
      setDemo(false);
      setSessionError('');
      setSession((current) => ({
        isAuthenticated,
        user: isAuthenticated ? user : null,
        sessionVersion: current.sessionVersion + 1,
      }));
    },
    [],
  );
  useEffect(() => {
    if (!import.meta.env.VITE_AUTH_ME_URL) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setCheckingSession(true);
    setSessionError('');
    void getSession(controller.signal)
      .then((user) => {
        if (controller.signal.aborted || requestRef.current !== controller) return;
        setSession((current) => ({
          isAuthenticated: !!user,
          user,
          sessionVersion: current.sessionVersion + 1,
        }));
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted && requestRef.current === controller)
          setSessionError(
            error instanceof Error ? error.message : 'Não foi possível verificar sua sessão.',
          );
      })
      .finally(() => {
        if (requestRef.current === controller) {
          requestRef.current = null;
          setCheckingSession(false);
        }
      });
    return () => {
      controller.abort();
      if (requestRef.current === controller) requestRef.current = null;
    };
  }, [attempt]);
  return (
    <AuthContext.Provider
      value={{
        ...session,
        checkingSession,
        sessionError,
        retrySession,
        isDemo,
        enterDemo,
        setAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
