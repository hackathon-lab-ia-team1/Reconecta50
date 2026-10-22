import type { LoginCredentials } from '../types/login';

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
export async function login(credentials: LoginCredentials): Promise<void> {
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
}
