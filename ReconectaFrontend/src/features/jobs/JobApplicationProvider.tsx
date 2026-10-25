import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { JobApplicationContext } from './JobApplicationContext';
import { createApplicationStore } from './state/applicationStore';

export function JobApplicationProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createApplicationStore);
  useEffect(() => () => store.cancelPending(), [store]);
  return <JobApplicationContext.Provider value={store}>{children}</JobApplicationContext.Provider>;
}
