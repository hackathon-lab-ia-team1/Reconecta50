import { useRef } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { usePageReader } from '../src/features/accessibility/usePageReader';
import { collectReadableText } from '../src/features/accessibility/utils/collectReadableText';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

class SpeechMock {
  onend?: () => void;
  onerror?: () => void;
  constructor(readonly text: string) {}
}

function Reader() {
  const ref = useRef<HTMLDivElement>(null);
  const { audioAvailable, speaking, readingError, readPage } = usePageReader(ref);
  return (
    <div ref={ref}>
      <p>Conteúdo para leitura.</p>
      <button disabled={!audioAvailable} aria-pressed={speaking} onClick={readPage}>
        Ouvir
      </button>
      {readingError && <p role="alert">{readingError}</p>}
    </div>
  );
}

it('lê apenas o resumo de detalhes fechados e inclui o conteúdo quando abertos', () => {
  const element = document.createElement('div');
  element.innerHTML =
    '<details><summary>Conferir currículo</summary><p>Experiência profissional</p></details>';
  expect(collectReadableText(element)).toContain('Conferir currículo');
  expect(collectReadableText(element)).not.toContain('Experiência profissional');
  element.querySelector('details')!.open = true;
  expect(collectReadableText(element)).toContain('Experiência profissional');
});

it('não habilita a leitura quando o navegador fornece apenas parte da API', () => {
  vi.stubGlobal('speechSynthesis', { speak: vi.fn(), cancel: vi.fn() });
  vi.stubGlobal('SpeechSynthesisUtterance', undefined);
  render(<Reader />);
  expect(screen.getByRole('button', { name: 'Ouvir' }).hasAttribute('disabled')).toBe(true);
});

it('mostra um erro recuperável quando o navegador falha ao iniciar a voz', () => {
  const speak = vi.fn().mockImplementationOnce(() => {
    throw new Error('Falha no dispositivo');
  });
  vi.stubGlobal('speechSynthesis', { speak, cancel: vi.fn() });
  vi.stubGlobal('SpeechSynthesisUtterance', SpeechMock);
  render(<Reader />);
  fireEvent.click(screen.getByRole('button', { name: 'Ouvir' }));
  expect(screen.getByRole('alert').textContent).toContain('Não foi possível iniciar');
  expect(screen.getByRole('button', { name: 'Ouvir' }).getAttribute('aria-pressed')).toBe('false');
  speak.mockImplementation((utterance: SpeechMock) => utterance.onend?.());
  fireEvent.click(screen.getByRole('button', { name: 'Ouvir' }));
  expect(screen.queryByRole('alert')).toBeNull();
});

it('não continua a fila se o navegador emitir fim de fala depois de um erro', () => {
  const speak = vi.fn();
  vi.stubGlobal('speechSynthesis', { speak, cancel: vi.fn() });
  vi.stubGlobal('SpeechSynthesisUtterance', SpeechMock);
  render(<Reader />);
  fireEvent.click(screen.getByRole('button', { name: 'Ouvir' }));
  const utterance = speak.mock.calls[0][0] as SpeechMock;
  act(() => {
    utterance.onerror?.();
    utterance.onend?.();
  });
  expect(screen.getByRole('alert').textContent).toContain('Não foi possível concluir');
  expect(screen.getByRole('button', { name: 'Ouvir' }).getAttribute('aria-pressed')).toBe('false');
  expect(speak).toHaveBeenCalledTimes(1);
});
