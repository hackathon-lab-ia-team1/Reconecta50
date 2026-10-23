import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { App } from '../src/app/App';
import { register } from '../src/features/auth/services/authService';

const user = {
  id: 'account-1',
  fullName: 'Ana Souza',
  phone: '85999999999',
  birthDate: '1970-01-01',
  address: 'Rua das Flores, 10',
};
const data = { ...user, cpf: '52998224725', password: 'minha senha' };
beforeEach(() => {
  vi.stubEnv('VITE_AUTH_ME_URL', '/auth/me');
  vi.stubEnv('VITE_AUTH_LOGIN_URL', '/auth/login');
  vi.stubEnv('VITE_AUTH_REGISTER_URL', '/auth/register');
  vi.stubEnv('VITE_PROFILE_URL', '');
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  window.history.replaceState({}, '', '/dashboard');
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it('restaura a sessão após recarregar e preenche o perfil com os dados de auth/me', async () => {
  const request = vi
    .fn()
    .mockImplementation(async () => new Response(JSON.stringify({ authenticated: true, user })));
  vi.stubGlobal('fetch', request);
  const view = render(<App />);
  expect(screen.getByRole('status').textContent).toContain('Verificando');
  await screen.findByRole('button', { name: 'Sair' });
  fireEvent.click(screen.getByRole('link', { name: 'Meu perfil' }));
  expect(((await screen.findByLabelText('Nome completo')) as HTMLInputElement).value).toBe(
    user.fullName,
  );
  expect((screen.getByLabelText('Telefone com DDD') as HTMLInputElement).value).toBe(user.phone);
  view.unmount();
  render(<App />);
  await screen.findByRole('button', { name: 'Sair' });
  expect(request).toHaveBeenCalledTimes(2);
  expect(request.mock.calls[0][1]).toMatchObject({ credentials: 'include', cache: 'no-store' });
});

it('redireciona sessão expirada e permite entrar na demonstração explicitamente', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 401 })));
  render(<App />);
  await screen.findByRole('heading', { name: 'Vamos nos reconectar?' });
  expect(window.location.pathname).toBe('/login');
  fireEvent.click(screen.getByRole('link', { name: 'Conhecer o painel de demonstração' }));
  await screen.findByRole('heading', { name: /o que você quer fazer hoje/i });
  expect(screen.queryByRole('button', { name: 'Sair' })).toBeNull();
});

it('não transforma falha de conexão em sessão anônima e permite repetir a consulta', async () => {
  const request = vi
    .fn()
    .mockRejectedValueOnce(new TypeError('Offline'))
    .mockResolvedValue(new Response(JSON.stringify({ authenticated: true, user })));
  vi.stubGlobal('fetch', request);
  render(<App />);
  await screen.findByRole('alert');
  expect(screen.queryByRole('link', { name: 'Conhecer o painel de demonstração' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Tentar verificar novamente' }));
  await screen.findByRole('button', { name: 'Sair' });
});

it('ignora a resposta de restauração após desmontar o aplicativo', async () => {
  let complete!: (response: Response) => void;
  const request = vi.fn().mockImplementation(
    () =>
      new Promise<Response>((resolve) => {
        complete = resolve;
      }),
  );
  vi.stubGlobal('fetch', request);
  const view = render(<App />);
  const signal = request.mock.calls[0][1].signal as AbortSignal;
  view.unmount();
  expect(signal.aborted).toBe(true);
  await act(async () => complete(new Response(JSON.stringify({ authenticated: true, user }))));
});

it('conecta o formulário de cadastro e entra no painel com a sessão criada pelo backend', async () => {
  window.history.replaceState({}, '', '/cadastro');
  const request = vi
    .fn()
    .mockImplementation(async (url: string) =>
      url === '/auth/me'
        ? new Response(null, { status: 401 })
        : new Response(JSON.stringify({ success: true, user }), { status: 201 }),
    );
  vi.stubGlobal('fetch', request);
  render(<App />);
  await screen.findByLabelText('Nome completo');
  for (const [label, value] of [
    ['Nome completo', user.fullName],
    ['Telefone com DDD', user.phone],
    ['CPF', data.cpf],
    ['Data de nascimento', user.birthDate],
    ['Endereço', user.address],
    ['Crie uma senha', data.password],
  ]) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  }
  fireEvent.click(screen.getByRole('button', { name: 'Criar minha conta' }));
  await screen.findByRole('button', { name: 'Sair' });
  expect(window.location.pathname).toBe('/dashboard');
  expect(request.mock.calls[1][1]).toMatchObject({ method: 'POST', credentials: 'include' });
  expect(JSON.parse(request.mock.calls[1][1].body)).toEqual({
    fullName: user.fullName,
    phone: user.phone,
    cpf: data.cpf,
    birthDate: user.birthDate,
    address: user.address,
    password: data.password,
  });
});

it('trata cadastro duplicado sem simular sucesso', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 409 })));
  await expect(register(data)).rejects.toThrow(/Já existe uma conta/);
});

it('recusa respostas de sessão autenticada sem usuário válido', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response(JSON.stringify({ authenticated: true, user: {} }))),
  );
  render(<App />);
  expect((await screen.findByRole('alert')).textContent).toContain('inválidos');
  expect(screen.queryByRole('button', { name: 'Sair' })).toBeNull();
});
