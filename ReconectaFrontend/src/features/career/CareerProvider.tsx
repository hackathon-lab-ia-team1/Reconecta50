import { useState } from 'react';
import type { ReactNode } from 'react';
import { CareerContext } from './CareerContext';
import type { ResumeDraft } from './types/career';
import { useAccountProfile } from './hooks/useAccountProfile';
export function CareerProvider({ children }: { children: ReactNode }) {
  const { profile, updateProfile, resetProfile, profileStatus, profileError, reloadProfile } =
    useAccountProfile();
  const [resume, updateResume] = useState<ResumeDraft>({
    summary: '',
    role: '',
    company: '',
    period: '',
    activities: '',
    skills: '',
  });
  function resetCareer() {
    resetProfile();
    updateResume({ summary: '', role: '', company: '', period: '', activities: '', skills: '' });
  }
  return (
    <CareerContext.Provider
      value={{
        profile,
        resume,
        updateProfile,
        updateResume,
        resetCareer,
        profileStatus,
        profileError,
        reloadProfile,
      }}
    >
      {children}
    </CareerContext.Provider>
  );
}
