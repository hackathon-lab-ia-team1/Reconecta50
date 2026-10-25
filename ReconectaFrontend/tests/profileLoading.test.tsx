import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { App } from '../src/app/App';
import { getAccountProfile } from '../src/features/career/services/profileService';

const profile = {
  fullName: 'Ana Souza',
  phone: '85999999999',
  birthDate: '1986-06-15',
  address: 'Rua das Flores, 10, Fortaleza, CE',
};

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/login');
  vi.stubEnv('VITE_AUTH_LOGIN_URL', '/auth/login');
  vi.stubEnv('VITE_AUTH_LOGOUT_URL', '/auth/logout');
  vi.stubEnv('VITE_PROFILE_URL', '/account/profile');
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

async function login() {
  render(<App />);
  fireEvent.change(screen.getByLabelText('CPF ou telefone'), { target: { value: profile.phone } });
  fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'minha senha' } });
  fireEvent.click(screen.getByRole('button', { name: 'Entrar na minha conta' }));
  await screen.findByRole('button', { name: 'Sair' }, { timeout: 5000 });
  fireEvent.click(screen.getByRole('link', { name: 'Meu perfil' }));
}

it('carrega os quatro campos após login e mantém os dados não alterados ao editar', async () => {
  const request = vi.fn(async (url: string) =>
    url === '/account/profile'
      ? new Response(JSON.stringify({ profile }))
      : new Response(null, { status: 204 }),
  );
  vi.stubGlobal('fetch', request);
  await login();
  const name = await screen.findByLabelText('Nome completo');
  expect((name as HTMLInputElement).value).toBe(profile.fullName);
  expect((screen.getByLabelText('Telefone com DDD') as HTMLInputElement).value).toBe(profile.phone);
  expect((screen.getByLabelText('Data de nascimento') as HTMLInputElement).value).toBe(
    profile.birthDate,
  );
  expect((screen.getByLabelText('Endereço') as HTMLInputElement).value).toBe(profile.address);
  expect((screen.getByLabelText('Senha atual') as HTMLInputElement).value).toBe('');
  fireEvent.change(name, { target: { value: 'Ana Souza Silva' } });
  fireEvent.click(screen.getByRole('button', { name: 'Atualizar meu perfil' }));
  fireEvent.click(screen.getByRole('link', { name: 'Visão geral' }));
  fireEvent.click(screen.getByRole('link', { name: 'Meu perfil' }));
  expect((screen.getByLabelText('Nome completo') as HTMLInputElement).value).toBe(
    'Ana Souza Silva',
  );
  expect((screen.getByLabelText('Endereço') as HTMLInputElement).value).toBe(profile.address);
  expect(request.mock.calls.filter(([url]) => url === '/account/profile')).toHaveLength(1);
  expect(request).toHaveBeenCalledWith(
    '/account/profile',
    expect.objectContaining({ method: 'GET', credentials: 'include' }),
  );
  expect(Object.keys(localStorage)).toEqual(['reconecta.fontScale']);
});

it('aguarda os dados antes de montar o formulário editável', async () => {
  let complete!: (response: Response) => void;
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) =>
      url === '/account/profile'
        ? new Promise<Response>((resolve) => {
            complete = resolve;
          })
        : new Response(null, { status: 204 }),
    ),
  );
  await login();
  expect(screen.getByText('Carregando seus dados…')).toBeTruthy();
  expect(screen.queryByLabelText('Nome completo')).toBeNull();
  await act(async () => complete(new Response(JSON.stringify({ profile }))));
  expect(((await screen.findByLabelText('Nome completo')) as HTMLInputElement).value).toBe(
    profile.fullName,
  );
});

it('permite tentar novamente se não conseguir carregar os dados', async () => {
  let attempts = 0;
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url !== '/account/profile') return new Response(null, { status: 204 });
      attempts++;
      return attempts === 1
        ? new Response(null, { status: 503 })
        : new Response(JSON.stringify({ profile }));
    }),
  );
  await login();
  expect(await screen.findByRole('alert')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Tentar carregar novamente' }));
  expect(((await screen.findByLabelText('Nome completo')) as HTMLInputElement).value).toBe(
    profile.fullName,
  );
});

it('não consulta dados da conta na prévia', () => {
  vi.stubEnv('VITE_AUTH_LOGIN_URL', '');
  window.history.replaceState({}, '', '/perfil');
  const request = vi.fn();
  vi.stubGlobal('fetch', request);
  render(<App />);
  expect((screen.getByLabelText('Nome completo') as HTMLInputElement).value).toBe('');
  expect(request).not.toHaveBeenCalled();
});

it('descarta uma resposta atrasada após sair da conta', async () => {
  let complete!: (response: Response) => void;
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) =>
      url === '/account/profile'
        ? new Promise<Response>((resolve) => {
            complete = resolve;
          })
        : new Response(null, { status: 204 }),
    ),
  );
  await login();
  fireEvent.click(screen.getByRole('button', { name: 'Sair' }));
  await screen.findByRole('button', { name: 'Entrar na minha conta' });
  await act(async () => complete(new Response(JSON.stringify({ profile }))));
  expect(window.location.pathname).toBe('/login');
  expect(screen.queryByLabelText('Nome completo')).toBeNull();
});

it('recusa um perfil malformado sem preencher campos com valores inválidos', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ profile: { ...profile, phone: 123 } }))),
  );
  await expect(getAccountProfile()).rejects.toThrow('formato válido');
});

it('não reaproveita o currículo da prévia nem de outra conta após um novo login', async () => {
  let account = 0;
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url === '/auth/login') {
        account++;
        return new Response(null, { status: 204 });
      }
      return new Response(
        JSON.stringify({
          profile: { ...profile, fullName: account === 1 ? 'Ana Souza' : 'Bruno Silva' },
        }),
      );
    }),
  );
  window.history.replaceState({}, '', '/login');
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Diminuir texto' }));
  function openLogin() {
    act(() => {
      window.history.pushState({}, '', '/login');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
  }
  async function enterAccount() {
    fireEvent.change(screen.getByLabelText('CPF ou telefone'), {
      target: { value: profile.phone },
    });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'minha senha' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar na minha conta' }));
    await screen.findByRole('button', { name: 'Sair' });
    fireEvent.click(screen.getByRole('link', { name: 'Meu currículo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Preencher currículo manualmente' }));
    expect((screen.getByLabelText('Apresentação profissional') as HTMLTextAreaElement).value).toBe(
      '',
    );
    expect(document.documentElement.style.fontSize).toBe('120%');
  }
  await enterAccount();
  fireEvent.change(screen.getByLabelText('Apresentação profissional'), {
    target: { value: 'Currículo da primeira conta.' },
  });
  fireEvent.change(screen.getByLabelText('Função ou trabalho'), {
    target: { value: 'Recepcionista' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Atualizar prévia do currículo' }));
  openLogin();
  expect(screen.queryByRole('link', { name: 'Conhecer o painel de demonstração' })).toBeNull();
  await enterAccount();
  fireEvent.click(screen.getByRole('link', { name: 'Meu perfil' }));
  expect(((await screen.findByLabelText('Nome completo')) as HTMLInputElement).value).toBe(
    'Bruno Silva',
  );
  expect(account).toBe(2);
});
