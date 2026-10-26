import { useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { JobApplicationContext } from './JobApplicationContext';
import { createApplicationStore } from './state/applicationStore';

export function JobApplicationProvider({ children }: { children: ReactNode }) {
  const auth = useContext(AuthContext);
  const userId = auth?.user?.id;
  const storageKey = !auth
    ? ''
    : userId
      ? `reconecta_applications_${userId}`
      : auth.isAuthenticated && auth.sessionVersion > 0
        ? `reconecta_applications_session_${auth.sessionVersion}`
        : 'reconecta_applications_guest';

  const [store] = useState(() => createApplicationStore(storageKey));

  useEffect(() => {
    store.setStorageKey(storageKey);
    const controller = new AbortController();
    void store.syncFromBackend(controller.signal, userId);
    return () => {
      controller.abort();
    };
  }, [store, storageKey, userId]);

  useEffect(() => () => store.cancelPending(), [store]);
  return <JobApplicationContext.Provider value={store}>{children}</JobApplicationContext.Provider>;
}
