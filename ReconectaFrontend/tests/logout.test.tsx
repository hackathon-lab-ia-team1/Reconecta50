import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from '../src/app/App';
import { logout } from '../src/features/auth/services/authService';

beforeEach(() => {
  vi.stubEnv('VITE_AUTH_LOGIN_URL', '');
  vi.stubEnv('VITE_AUTH_LOGOUT_URL', '');
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  window.history.replaceState({}, '', '/curriculo');
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

async function openAccount(logoutStatus = 204) {
  vi.stubEnv('VITE_AUTH_LOGIN_URL', '/auth/login');
  vi.stubEnv('VITE_AUTH_LOGOUT_URL', '/auth/logout');
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockImplementation(
        async (url: string) =>
          new Response(null, { status: url === '/auth/login' ? 204 : logoutStatus }),
      ),
  );
  window.history.replaceState({}, '', '/login');
  render(<App />);
  fireEvent.change(screen.getByLabelText('CPF ou telefone'), { target: { value: '85999999999' } });
  fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'minha senha' } });
  fireEvent.click(screen.getByRole('button', { name: 'Entrar na minha conta' }));
  await screen.findByRole('button', { name: 'Sair' });
  fireEvent.click(screen.getByRole('link', { name: 'Meu currículo' }));
  fireEvent.click(screen.getByRole('button', { name: 'Preencher currículo manualmente' }));
}

it('não mostra Sair na prévia mesmo com endpoints de autenticação configurados', () => {
  vi.stubEnv('VITE_AUTH_LOGIN_URL', '/auth/login');
  window.history.replaceState({}, '', '/login');
  render(<App />);
  fireEvent.click(screen.getByRole('link', { name: 'Conhecer o painel de demonstração' }));
  expect(window.location.pathname).toBe('/dashboard');
  expect(screen.queryByRole('button', { name: 'Sair' })).toBeNull();
  fireEvent.click(screen.getByRole('link', { name: 'Meu currículo' }));
  expect(screen.queryByRole('button', { name: 'Sair' })).toBeNull();
});

it('sai da conta, limpa o currículo e preserva o tamanho da fonte', async () => {
  await openAccount();
  fireEvent.click(screen.getByRole('button', { name: 'Diminuir texto' }));
  fireEvent.change(screen.getByLabelText('Apresentação profissional'), {
    target: { value: 'Atendimento ao público.' },
  });
  fireEvent.change(screen.getByLabelText('Função ou trabalho'), {
    target: { value: 'Recepcionista' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Atualizar prévia do currículo' }));
  fireEvent.click(screen.getByRole('button', { name: 'Sair' }));
  await waitFor(() => expect(window.location.pathname).toBe('/login'));
  fireEvent.click(await screen.findByRole('link', { name: 'Conhecer o painel de demonstração' }));
  expect(screen.queryByRole('button', { name: 'Sair' })).toBeNull();
  fireEvent.click(screen.getByRole('link', { name: 'Meu currículo' }));
  fireEvent.click(screen.getByRole('button', { name: 'Preencher currículo manualmente' }));
  expect((screen.getByLabelText('Apresentação profissional') as HTMLTextAreaElement).value).toBe(
    '',
  );
  expect(document.documentElement.style.fontSize).toBe('120%');
});

it.each([204, 401])('encerra a sessão pelo servidor com resposta %s', async (status) => {
  vi.stubEnv('VITE_AUTH_LOGOUT_URL', '/auth/logout');
  const request = vi.fn().mockResolvedValue(new Response(null, { status }));
  vi.stubGlobal('fetch', request);
  await logout();
  expect(request).toHaveBeenCalledWith(
    '/auth/logout',
    expect.objectContaining({ method: 'POST', credentials: 'include' }),
  );
});

it('mantém a página e o rascunho quando o logout falha', async () => {
  await openAccount(500);
  fireEvent.change(screen.getByLabelText('Apresentação profissional'), {
    target: { value: 'Meu rascunho' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Sair' }));
  expect(await screen.findByRole('alert')).toBeTruthy();
  expect(window.location.pathname).toBe('/curriculo');
  expect((screen.getByLabelText('Apresentação profissional') as HTMLTextAreaElement).value).toBe(
    'Meu rascunho',
  );
  expect(screen.getByRole('button', { name: 'Sair' }).hasAttribute('disabled')).toBe(false);
});

it('não trata sessão real como encerrada se faltar configurar o logout', async () => {
  vi.stubEnv('VITE_AUTH_LOGIN_URL', '/auth/login');
  await expect(logout()).rejects.toThrow('Não foi possível encerrar sua sessão');
});
