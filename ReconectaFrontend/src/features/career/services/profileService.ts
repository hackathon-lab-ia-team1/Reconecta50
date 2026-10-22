import type { CareerProfile } from '../types/career';
import { getBirthDateError } from '../../../utils/personalDataValidation';

export async function getAccountProfile(signal?: AbortSignal): Promise<CareerProfile> {
  const endpoint = import.meta.env.VITE_PROFILE_URL;
  if (!endpoint) throw new Error('O carregamento dos dados da conta ainda não está conectado.');
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      credentials: 'include',
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(15000)])
        : AbortSignal.timeout(15000),
    });
    if (response.status === 401)
      throw new Error('Entre novamente na sua conta para carregar seu perfil.');
    if (!response.ok) throw new Error('Não foi possível carregar seus dados. Tente novamente.');
    const body: unknown = await response.json();
    if (
      !body ||
      typeof body !== 'object' ||
      !('profile' in body) ||
      !body.profile ||
      typeof body.profile !== 'object'
    )
      throw new Error('O serviço não devolveu os dados do perfil em um formato válido.');
    const source = body.profile as Record<string, unknown>;
    const profile = {} as CareerProfile;
    for (const field of ['fullName', 'phone', 'birthDate', 'address'] as const) {
      const value = source[field];
      if (typeof value !== 'string' || value.length > 5000)
        throw new Error('O serviço não devolveu os dados do perfil em um formato válido.');
      profile[field] = value;
    }
    if (profile.birthDate && getBirthDateError(profile.birthDate))
      throw new Error('O serviço devolveu uma data de nascimento inválida.');
    if (source.email !== undefined) {
      if (typeof source.email !== 'string' || source.email.length > 254)
        throw new Error('O serviço devolveu um e-mail inválido.');
      profile.email = source.email;
    }
    return profile;
  } catch (error) {
    if (signal?.aborted) throw error;
    if (
      error instanceof TypeError ||
      (error instanceof DOMException && error.name === 'TimeoutError')
    )
      throw new Error('Não foi possível conectar para carregar seu perfil. Tente novamente.');
    if (error instanceof SyntaxError) throw new Error('O serviço não devolveu um perfil válido.');
    throw error;
  }
}
