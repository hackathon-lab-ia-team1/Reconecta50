import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ResumeVoiceInterview } from '../src/features/career/components/ResumeVoiceInterview';
import { useSpeechTranscription } from '../src/features/career/hooks/useSpeechTranscription';
import type {
  RecognitionResultEvent,
  SpeechRecognizer,
} from '../src/features/career/hooks/useSpeechTranscription';
import { useState } from 'react';
import { validateProfile } from '../src/features/career/utils/validateProfile';
import { ResumePreview } from '../src/features/career/components/ResumePreview';

const resume = {
  summary: 'Experiência em atendimento.',
  role: 'Recepcionista',
  company: '',
  period: '',
  activities: '',
  skills: 'Excel',
};
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('oferece seis etapas com texto revisável sem exigir suporte a voz', async () => {
  const generate = vi.fn().mockResolvedValue(resume);
  const generated = vi.fn();
  render(<ResumeVoiceInterview onGenerate={generate} onGenerated={generated} />);
  expect(screen.getAllByRole('textbox')).toHaveLength(6);
  expect(screen.getAllByText(/Este navegador não oferece transcrição/)).toHaveLength(5);
  expect(screen.queryByRole('button', { name: /Gravar áudio: 6\./ })).toBeNull();
  fireEvent.change(screen.getByLabelText('Texto revisável: 1. Função que você procura'), {
    target: { value: 'Recepcionista' },
  });
  fireEvent.change(screen.getByLabelText('Texto revisável: 2. Formação e cursos'), {
    target: { value: 'Ensino médio e curso de informática' },
  });
  fireEvent.change(screen.getByLabelText('Texto revisável: 3. Idiomas'), {
    target: { value: 'Português e inglês básico' },
  });
  fireEvent.change(screen.getByLabelText('Texto revisável: 4. Experiências profissionais'), {
    target: { value: 'Atendi clientes na clínica.' },
  });
  fireEvent.change(screen.getByLabelText('Texto revisável: 5. Habilidades'), {
    target: { value: 'Excel e Word' },
  });
  fireEvent.change(screen.getByLabelText('Links de contato (opcional)'), {
    target: { value: 'linkedin.com/in/ana' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Criar currículo com os textos das etapas' }));
  await waitFor(() => expect(generated).toHaveBeenCalled());
  expect(generate.mock.calls[0][0]).toMatchObject({
    source: 'text',
    sections: {
      education: 'Ensino médio e curso de informática',
      languages: 'Português e inglês básico',
    },
  });
  expect(generate.mock.calls[0][0].text).toContain('Excel e Word');
  expect(generated).toHaveBeenCalledWith(
    expect.objectContaining({
      education: 'Ensino médio e curso de informática',
      languages: 'Português e inglês básico',
      additionalContacts: 'linkedin.com/in/ana',
    }),
  );
});

it('valida as etapas necessárias e preserva o conteúdo ao cancelar uma geração', async () => {
  let complete!: (value: typeof resume) => void;
  const generated = vi.fn();
  const generate = vi.fn(
    () =>
      new Promise<typeof resume>((resolve) => {
        complete = resolve;
      }),
  );
  render(<ResumeVoiceInterview onGenerate={generate} onGenerated={generated} />);
  fireEvent.click(screen.getByRole('button', { name: 'Criar currículo com os textos das etapas' }));
  expect(screen.getByRole('alert').textContent).toContain('Informe a função');
  fireEvent.change(screen.getByLabelText('Texto revisável: 1. Função que você procura'), {
    target: { value: 'Recepcionista' },
  });
  fireEvent.change(screen.getByLabelText('Texto revisável: 4. Experiências profissionais'), {
    target: { value: 'Atendimento.' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Criar currículo com os textos das etapas' }));
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar criação' }));
  await act(async () => complete(resume));
  expect(generated).not.toHaveBeenCalled();
  expect(
    (screen.getByLabelText('Texto revisável: 4. Experiências profissionais') as HTMLTextAreaElement)
      .value,
  ).toBe('Atendimento.');
});

class RecognitionMock implements SpeechRecognizer {
  static instances: RecognitionMock[] = [];
  lang = '';
  continuous = false;
  interimResults = false;
  onresult: ((event: RecognitionResultEvent) => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;
  start = vi.fn();
  stop = vi.fn();
  abort = vi.fn();
  constructor() {
    RecognitionMock.instances.push(this);
  }
}

function TranscriptionHarness() {
  const [text, setText] = useState('Texto anterior.');
  const speech = useSpeechTranscription(setText, vi.fn());
  return (
    <>
      <button onClick={() => speech.start(text)}>Gravar</button>
      <p>{text}</p>
      <p>{speech.interim}</p>
      {speech.error && <p role="alert">{speech.error}</p>}
    </>
  );
}

it('transcreve sem duplicar resultados, separa parciais e ignora respostas após sair', () => {
  vi.stubGlobal('SpeechRecognition', RecognitionMock);
  const view = render(<TranscriptionHarness />);
  fireEvent.click(screen.getByRole('button', { name: 'Gravar' }));
  const recognition = RecognitionMock.instances.at(-1)!;
  const result = {
    results: [
      { isFinal: true, 0: { transcript: 'Sei usar Excel.' } },
      { isFinal: false, 0: { transcript: 'e Word' } },
    ],
  };
  act(() => {
    recognition.onresult?.(result);
    recognition.onresult?.(result);
  });
  expect(screen.getByText('Texto anterior. Sei usar Excel.', { exact: false }).textContent).toBe(
    'Texto anterior.\nSei usar Excel.',
  );
  expect(screen.getByText('e Word')).toBeTruthy();
  expect(recognition.lang).toBe('pt-BR');
  view.unmount();
  expect(recognition.abort).toHaveBeenCalled();
  act(() => recognition.onresult?.(result));
});

it('trata permissão negada sem perder o texto existente', () => {
  vi.stubGlobal('webkitSpeechRecognition', RecognitionMock);
  render(<TranscriptionHarness />);
  fireEvent.click(screen.getByRole('button', { name: 'Gravar' }));
  act(() => RecognitionMock.instances.at(-1)!.onerror?.({ error: 'not-allowed' }));
  expect(screen.getByRole('alert').textContent).toContain('não foi autorizada');
  expect(screen.getByText('Texto anterior.')).toBeTruthy();
});

it('valida e exibe o e-mail opcional do perfil no currículo', () => {
  const profile = {
    fullName: 'Ana Souza',
    phone: '85999999999',
    address: 'Rua A',
    birthDate: '1970-01-01',
    email: 'ana@example.com',
  };
  expect(validateProfile(profile).email).toBeUndefined();
  expect(validateProfile({ ...profile, email: 'inválido' }).email).toBeTruthy();
  render(
    <ResumePreview
      profile={profile}
      resume={{ ...resume, education: 'Curso de informática', languages: 'Inglês básico' }}
    />,
  );
  expect(screen.getByText('ana@example.com')).toBeTruthy();
  expect(screen.getByText('Curso de informática')).toBeTruthy();
  expect(screen.getByText('Inglês básico')).toBeTruthy();
});

it.each([true, false])(
  'grava uma etapa por vez com suporte à transcrição: %s',
  async (supported) => {
    class RecorderMock {
      static isTypeSupported = () => true;
      state = 'inactive';
      mimeType = 'audio/mp4';
      ondataavailable: ((event: { data: Blob }) => void) | null = null;
      onstop: (() => void) | null = null;
      start() {
        this.state = 'recording';
      }
      stop() {
        this.state = 'inactive';
        this.ondataavailable?.({ data: new Blob(['recording'], { type: 'audio/mp4' }) });
        this.onstop?.();
      }
    }
    const stopTrack = vi.fn();
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: stopTrack }] }),
      },
    });
    vi.stubGlobal('MediaRecorder', RecorderMock);
    vi.stubGlobal('SpeechRecognition', supported ? RecognitionMock : undefined);
    vi.stubGlobal('webkitSpeechRecognition', undefined);
    const revoke = vi.fn();
    class MockURL extends URL {
      static createObjectURL = () => 'blob:voice-step';
      static revokeObjectURL = revoke;
    }
    vi.stubGlobal('URL', MockURL);
    const view = render(<ResumeVoiceInterview onGenerate={vi.fn()} onGenerated={vi.fn()} />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Gravar áudio: 1. Função que você procura' }),
    );
    const finish = await screen.findByRole('button', {
      name: 'Concluir áudio: 1. Função que você procura',
    });
    expect(
      screen
        .getByRole('button', { name: 'Gravar áudio: 2. Formação e cursos' })
        .hasAttribute('disabled'),
    ).toBe(true);
    expect(
      screen
        .getByRole('button', { name: 'Criar currículo com os textos das etapas' })
        .hasAttribute('disabled'),
    ).toBe(true);
    const recognition = RecognitionMock.instances.at(-1)!;
    if (supported)
      act(() =>
        recognition.onresult?.({
          results: [{ isFinal: true, 0: { transcript: 'Quero trabalhar como recepcionista.' } }],
        }),
      );
    fireEvent.click(finish);
    if (supported) act(() => recognition.onend?.());
    await waitFor(() =>
      expect(
        screen
          .getByRole('button', { name: 'Gravar áudio: 2. Formação e cursos' })
          .hasAttribute('disabled'),
      ).toBe(false),
    );
    expect(
      (screen.getByLabelText('Texto revisável: 1. Função que você procura') as HTMLTextAreaElement)
        .value,
    ).toBe(supported ? 'Quero trabalhar como recepcionista.' : '');
    expect(screen.getByLabelText('Ouvir áudio: 1. Função que você procura')).toBeTruthy();
    expect(stopTrack).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Gravar áudio: 2. Formação e cursos' }));
    await screen.findByRole('button', { name: 'Concluir áudio: 2. Formação e cursos' });
    const current = RecognitionMock.instances.at(-1)!;
    view.unmount();
    if (supported) expect(current.abort).toHaveBeenCalled();
    expect(revoke).toHaveBeenCalled();
  },
);
