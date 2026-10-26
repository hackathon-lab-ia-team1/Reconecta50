import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../auth/useAuth';
import { CareerContext } from './CareerContext';
import type { ResumeDraft } from './types/career';
import { useAccountProfile } from './hooks/useAccountProfile';

const emptyResume: ResumeDraft = {
  summary: '',
  role: '',
  company: '',
  period: '',
  activities: '',
  skills: '',
};

function sanitizeDraft(raw: unknown): ResumeDraft | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const source = raw as Record<string, unknown>;
  const draft: ResumeDraft = {
    summary: typeof source.summary === 'string' ? source.summary : '',
    role: typeof source.role === 'string' ? source.role : '',
    company: typeof source.company === 'string' ? source.company : '',
    period: typeof source.period === 'string' ? source.period : '',
    activities: typeof source.activities === 'string' ? source.activities : '',
    skills: typeof source.skills === 'string' ? source.skills : '',
    ...(typeof source.targetRole === 'string' ? { targetRole: source.targetRole } : {}),
    ...(typeof source.education === 'string' ? { education: source.education } : {}),
    ...(typeof source.languages === 'string' ? { languages: source.languages } : {}),
    ...(typeof source.additionalContacts === 'string'
      ? { additionalContacts: source.additionalContacts }
      : {}),
  };
  return draft;
}

function hasResumeContent(draft: ResumeDraft): boolean {
  return Boolean(
    draft.summary.trim() ||
      draft.role.trim() ||
      draft.company.trim() ||
      draft.period.trim() ||
      draft.activities.trim() ||
      draft.skills.trim() ||
      draft.targetRole?.trim() ||
      draft.education?.trim() ||
      draft.languages?.trim() ||
      draft.additionalContacts?.trim(),
  );
}

function loadResumeFromStorage(key: string): ResumeDraft {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return emptyResume;
    const parsed = sanitizeDraft(JSON.parse(raw));
    return parsed ?? emptyResume;
  } catch {
    return emptyResume;
  }
}

function getResumeMeUrl(): string {
  if (import.meta.env.VITE_RESUME_ME_URL) return import.meta.env.VITE_RESUME_ME_URL;
  if (import.meta.env.MODE !== 'test') return 'http://localhost:3001/api/curriculo/meu';
  return '';
}

function getResumeSaveUrl(): string {
  if (import.meta.env.VITE_RESUME_SAVE_URL) return import.meta.env.VITE_RESUME_SAVE_URL;
  if (import.meta.env.MODE !== 'test') return 'http://localhost:3001/api/curriculo/salvar';
  return '';
}

export function CareerProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, sessionVersion } = useAuth();
  const { profile, updateProfile, resetProfile, profileStatus, profileError, reloadProfile } =
    useAccountProfile();

  const userId = user?.id;
  const storageKey = userId
    ? `reconecta_resume_${userId}`
    : isAuthenticated && sessionVersion > 0
      ? `reconecta_resume_session_${sessionVersion}`
      : 'reconecta_resume_guest';

  const [resume, setResumeState] = useState<ResumeDraft>(() => loadResumeFromStorage(storageKey));

  useEffect(() => {
    setResumeState(loadResumeFromStorage(storageKey));
  }, [storageKey]);

  useEffect(() => {
    const meUrl = getResumeMeUrl();
    if (!meUrl) return;

    const controller = new AbortController();
    const requestUrl = userId
      ? `${meUrl}${meUrl.includes('?') ? '&' : '?'}userId=${encodeURIComponent(userId)}`
      : meUrl;

    void fetch(requestUrl, {
      method: 'GET',
      credentials: 'include',
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok || controller.signal.aborted) return;
        const body: unknown = await response.json();
        if (!body || typeof body !== 'object') return;
        const remote = sanitizeDraft((body as Record<string, unknown>).resume);
        if (remote && hasResumeContent(remote)) {
          setResumeState(remote);
          try {
            localStorage.setItem(storageKey, JSON.stringify(remote));
          } catch {
            // ignore storage quota errors
          }
        } else {
          const local = loadResumeFromStorage(storageKey);
          const saveUrl = getResumeSaveUrl();
          if (hasResumeContent(local) && saveUrl) {
            void fetch(saveUrl, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ resume: local, userId }),
              signal: controller.signal,
            }).catch(() => {});
          }
        }
      })
      .catch(() => {});

    return () => {
      controller.abort();
    };
  }, [storageKey, userId]);

  const updateResume = useCallback(
    (nextResume: ResumeDraft) => {
      setResumeState(nextResume);
      try {
        if (hasResumeContent(nextResume)) {
          localStorage.setItem(storageKey, JSON.stringify(nextResume));
        } else {
          localStorage.removeItem(storageKey);
        }
      } catch {
        // ignore storage quota errors
      }

      const saveUrl = getResumeSaveUrl();
      if (saveUrl) {
        void fetch(saveUrl, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resume: nextResume, userId }),
        }).catch(() => {});
      }
    },
    [storageKey, userId],
  );

  function resetCareer() {
    resetProfile();
    setResumeState(emptyResume);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
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
