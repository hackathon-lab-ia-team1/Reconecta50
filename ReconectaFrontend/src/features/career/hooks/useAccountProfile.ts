import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../auth/useAuth';
import { getAccountProfile } from '../services/profileService';
import type { CareerProfile } from '../types/career';

export type ProfileStatus = 'idle' | 'loading' | 'ready' | 'error';
const emptyProfile: CareerProfile = { fullName: '', phone: '', birthDate: '', address: '' };

export function useAccountProfile() {
  const { isAuthenticated, user } = useAuth();
  const [profile, updateProfile] = useState(emptyProfile);
  const [profileStatus, setStatus] = useState<ProfileStatus>('idle');
  const [profileError, setError] = useState('');
  const requestRef = useRef<AbortController | null>(null);

  const resetProfile = useCallback(() => {
    requestRef.current?.abort();
    requestRef.current = null;
    updateProfile(emptyProfile);
    setStatus('idle');
    setError('');
  }, []);

  const reloadProfile = useCallback(async () => {
    if (!isAuthenticated || requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setStatus('loading');
    setError('');
    try {
      const loaded =
        !import.meta.env.VITE_PROFILE_URL && user
          ? {
              fullName: user.fullName,
              phone: user.phone ?? '',
              birthDate: user.birthDate ?? '',
              address: user.address ?? '',
              ...(user.email ? { email: user.email } : {}),
            }
          : await getAccountProfile(controller.signal);
      if (requestRef.current !== controller || controller.signal.aborted) return;
      updateProfile(loaded);
      setStatus('ready');
    } catch (error) {
      if (requestRef.current !== controller || controller.signal.aborted) return;
      setError(error instanceof Error ? error.message : 'Não foi possível carregar seu perfil.');
      setStatus('error');
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated) {
      resetProfile();
      void reloadProfile();
    }
    return () => {
      requestRef.current?.abort();
      requestRef.current = null;
    };
  }, [isAuthenticated, reloadProfile, resetProfile]);

  return { profile, updateProfile, resetProfile, profileStatus, profileError, reloadProfile };
}
