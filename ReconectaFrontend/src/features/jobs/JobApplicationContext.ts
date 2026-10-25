import { createContext } from 'react';
import type { ApplicationStore } from './state/applicationStore';

export const JobApplicationContext = createContext<ApplicationStore | null>(null);
