import { createContext } from 'react';
import type { CareerProfile, ResumeDraft } from './types/career';
import type { ProfileStatus } from './hooks/useAccountProfile';

export interface CareerContextValue {
  profile: CareerProfile;
  resume: ResumeDraft;
  updateProfile: (profile: CareerProfile) => void;
  updateResume: (resume: ResumeDraft) => void;
  resetCareer: () => void;
  profileStatus: ProfileStatus;
  profileError: string;
  reloadProfile: () => Promise<void>;
}

export const CareerContext = createContext<CareerContextValue | null>(null);
