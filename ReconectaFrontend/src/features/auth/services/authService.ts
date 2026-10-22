import type { LoginCredentials } from '../types/login';
import type { RegistrationData } from '../types/registration';
import type { SessionUser } from '../types/session';

function parseUser(value: unknown): SessionUser {
  if (
    !value ||
    typeof value !== 'object' ||
    !('id' in value) ||
    typeof value.id !== 'string' ||
    !value.id.trim() ||
    !('fullName' in value) ||
    typeof value.fullName !== 'string' ||
    !value.fullName.trim()
  )
    throw new Error('O serviço devolveu dados de sessão inválidos.');
  const source = value as Record<string, unknown>;
  const user: SessionUser = { id: value.id, fullName: value.fullName };
  for (const field of ['phone', 'birthDate', 'address', 'email'] as const) {
    if (source[field] !== undefined) {
      if (typeof source[field] !== 'string')
        throw new Error('O serviço devolveu dados de sessão inválidos.');
      user[field] = source[field];
    }
  }
  return user;
}

export async function getSession(signal?: AbortSignal): Promise<SessionUser | null> {
  const endpoint = import.meta.env.VITE_AUTH_ME_URL;
  if (!endpoint) return null;
  try {
    const response = await fetch(endpoint, {
      credentials: 'include',
      cache: 'no-store',
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(15000)])
        : AbortSignal.timeout(15000),
    });
    if (response.status === 401) return null;
    if (!response.ok) throw new Error('Não foi possível verificar sua sessão. Tente novamente.');
    const body: unknown = await response.json();
    if (
      !body ||
      typeof body !== 'object' ||
      !('authenticated' in body) ||
      typeof body.authenticated !== 'boolean'
    )
      throw new Error('O serviço devolveu uma sessão inválida.');
    if (!body.authenticated) return null;
    return parseUser('user' in body ? body.user : undefined);
  } catch (error) {
    if (signal?.aborted) throw error;
    if (error instanceof TypeError || error instanceof DOMException)
      throw new Error(
        'Não foi possível verificar sua sessão. Confira sua conexão e tente novamente.',
      );
    if (error instanceof SyntaxError) throw new Error('O serviço devolveu uma sessão inválida.');
    throw error;
  }
}

export async function register(data: RegistrationData): Promise<SessionUser> {
  const endpoint = import.meta.env.VITE_AUTH_REGISTER_URL;
  if (!endpoint)
    throw new Error(
      'A criação de contas ainda não está conectada. Seus dados não foram enviados nem salvos.',
    );
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(15000),
    });
    if (response.status === 409)
      throw new Error(
        'Já existe uma conta com este CPF ou telefone. Entre na sua conta ou confira os dados.',
      );
    if (response.status === 400) throw new Error('Confira os dados do cadastro e tente novamente.');
    if (response.status === 429)
      throw new Error('Muitas tentativas. Aguarde alguns minutos e tente novamente.');
    if (!response.ok)
      throw new Error('Não foi possível criar a conta agora. Tente novamente em instantes.');
    const body: unknown = await response.json();
    if (
      !body ||
      typeof body !== 'object' ||
      !('success' in body) ||
      body.success !== true ||
      !('user' in body)
    )
      throw new Error('O serviço não confirmou o cadastro em um formato válido.');
    return parseUser(body.user);
  } catch (error) {
    if (error instanceof TypeError || error instanceof DOMException)
      throw new Error(
        'Não foi possível confirmar o cadastro. Confira sua conexão e tente entrar na conta antes de repetir o cadastro.',
      );
    if (error instanceof SyntaxError)
      throw new Error('O serviço não confirmou o cadastro em um formato válido.');
    throw error;
  }
}

export async function logout(): Promise<void> {
  const endpoint = import.meta.env.VITE_AUTH_LOGOUT_URL;
  if (!endpoint && !import.meta.env.VITE_AUTH_LOGIN_URL) return;
  try {
    if (!endpoint) throw new Error('Logout não configurado.');
    const response = await fetch(endpoint, {
      method: 'POST',
      credentials: 'include',
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok && response.status !== 401) throw new Error('Falha ao sair.');
  } catch {
    throw new Error('Não foi possível encerrar sua sessão agora. Tente novamente em instantes.');
  }
}
export async function login(credentials: LoginCredentials): Promise<SessionUser | null> {
  const endpoint = import.meta.env.VITE_AUTH_LOGIN_URL;
  if (!endpoint)
    throw new Error(
      'Esta é uma demonstração. O acesso à conta estará disponível quando o serviço de autenticação for conectado.',
    );
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(credentials),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    if (response.status === 401)
      throw new Error('Não foi possível entrar. Confira seus dados e tente novamente.');
    if (response.status === 429)
      throw new Error('Muitas tentativas. Aguarde alguns minutos e tente novamente.');
    throw new Error('O serviço está indisponível no momento. Tente novamente em instantes.');
  }
  if (response.status === 204) return null;
  const body: unknown = await response.json();
  if (
    !body ||
    typeof body !== 'object' ||
    !('success' in body) ||
    body.success !== true ||
    !('user' in body)
  )
    throw new Error('O serviço não confirmou o acesso em um formato válido.');
  return parseUser(body.user);
}
