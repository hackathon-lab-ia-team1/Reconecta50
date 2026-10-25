import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from '../src/app/App';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { AppErrorFallback } from '../src/app/AppErrorFallback';

const failures = vi.hoisted(() => ({ resume: false }));
vi.mock('../src/pages/ResumePage', async (importOriginal) => {
  const original = await importOriginal<typeof import('../src/pages/ResumePage')>();
  return {
    ResumePage: () => {
      if (failures.resume) throw new Error('Detalhe técnico que não deve aparecer na tela');
      return <original.ResumePage />;
    },
  };
});

beforeEach(() => {
  failures.resume = false;
  localStorage.clear();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  window.history.replaceState({}, '', '/pagina-inexistente');
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('exibe 404 para um endereço desconhecido e permite voltar ao login', async () => {
  render(<App />);
  const title = screen.getByRole('heading', { level: 1, name: 'Não encontramos esta página' });
  expect(document.activeElement).toBe(title);
  expect(document.title).toBe('Não encontramos esta página | Reconecta 50+');
  expect(window.location.pathname).toBe('/pagina-inexistente');
  fireEvent.click(screen.getByRole('button', { name: 'Diminuir texto' }));
  expect(document.documentElement.style.fontSize).toBe('120%');
  fireEvent.click(screen.getByRole('link', { name: 'Voltar ao início' }));
  await screen.findByRole('button', { name: 'Entrar na minha conta' });
  expect(window.location.pathname).toBe('/login');
});

it('mantém o endereço inicial funcionando sem mostrar 404', async () => {
  window.history.replaceState({}, '', '/');
  render(<App />);
  await screen.findByRole('button', { name: 'Entrar na minha conta' });
  expect(screen.queryByText('404 · PÁGINA NÃO ENCONTRADA')).toBeNull();
});

it('substitui falhas de renderização por recuperação e permite tentar novamente', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  failures.resume = true;
  window.history.replaceState({}, '', '/curriculo');
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Não foi possível abrir esta tela' })).toBeTruthy();
  expect(screen.queryByText('Detalhe técnico que não deve aparecer na tela')).toBeNull();
  failures.resume = false;
  fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
  expect(await screen.findByRole('heading', { level: 1, name: 'Meu currículo' })).toBeTruthy();
});

it('permite sair de uma tela com erro sem ficar preso na recuperação', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  failures.resume = true;
  window.history.replaceState({}, '', '/curriculo');
  render(<App />);
  fireEvent.click(screen.getByRole('link', { name: 'Voltar ao início' }));
  await screen.findByRole('button', { name: 'Entrar na minha conta' });
  expect(screen.queryByRole('button', { name: 'Tentar novamente' })).toBeNull();
});

it('mantém erros de formulário no formulário em vez de abrir uma página de erro', () => {
  window.history.replaceState({}, '', '/login');
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Entrar na minha conta' }));
  expect(screen.getByText('Informe seu CPF ou telefone.')).toBeTruthy();
  expect(window.location.pathname).toBe('/login');
});

it('exibe a recuperação global sem depender de roteador ou providers', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  function BrokenApp(): never {
    throw new Error('Provider indisponível');
  }
  render(
    <ErrorBoundary fallback={() => <AppErrorFallback />}>
      <BrokenApp />
    </ErrorBoundary>,
  );
  await waitFor(() =>
    expect(screen.getByRole('heading', { name: 'Vamos reabrir o aplicativo?' })).toBeTruthy(),
  );
  expect(screen.getByRole('link', { name: 'Ir para o login' }).getAttribute('href')).toBe('/login');
  expect(screen.getByRole('button', { name: 'Recarregar aplicativo' })).toBeTruthy();
});
