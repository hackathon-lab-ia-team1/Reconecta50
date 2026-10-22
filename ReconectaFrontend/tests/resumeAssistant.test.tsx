import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { ResumeAssistant } from '../src/features/career/components/ResumeAssistant';
import { useAudioRecorder } from '../src/features/career/hooks/useAudioRecorder';
import { generateResume } from '../src/features/career/services/resumeGenerationService';
import { ResumePreview } from '../src/features/career/components/ResumePreview';
import { fixWebmDuration } from '@fix-webm-duration/fix';

vi.mock('@fix-webm-duration/fix', () => ({
  fixWebmDuration: vi.fn(async (blob: Blob) => blob),
}));

const resume = {
  summary: 'Experiência em atendimento.',
  role: 'Recepcionista',
  company: '',
  period: '',
  activities: 'Atendimento ao público.',
  skills: 'Organização',
};
const profile = { fullName: 'Ana Souza', phone: '', birthDate: '', address: '' };

beforeEach(() => {
  vi.mocked(fixWebmDuration)
    .mockReset()
    .mockImplementation(async (blob) => blob);
  vi.stubEnv('VITE_RESUME_GENERATE_URL', 'https://api.example/resume');
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe('Criação assistida de currículo', () => {
  it('atribui um título único a cada prévia de currículo na mesma página', () => {
    render(
      <>
        <ResumePreview profile={profile} resume={resume} />
        <ResumePreview profile={profile} resume={resume} />
      </>,
    );
    const articles = screen.getAllByRole('article', { name: profile.fullName });
    const ids = articles.map((article) => article.getAttribute('aria-labelledby'));
    expect(new Set(ids).size).toBe(2);
    for (const id of ids) expect(document.getElementById(id!)?.textContent).toBe(profile.fullName);
  });

  it('limpa o aviso da geração anterior quando a pessoa altera o relato', async () => {
    render(
      <ResumeAssistant onGenerate={vi.fn().mockResolvedValue(resume)} onGenerated={vi.fn()} />,
    );
    fireEvent.change(screen.getByLabelText('Conte sua experiência para a IA'), {
      target: { value: 'Minha primeira experiência.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Criar currículo com IA' }));
    await screen.findByText(
      'Currículo atualizado automaticamente. Você pode revisar e editar os campos abaixo.',
    );
    fireEvent.change(screen.getByLabelText('Conte sua experiência para a IA'), {
      target: { value: 'Outra experiência.' },
    });
    expect(
      screen.queryByText(
        'Currículo atualizado automaticamente. Você pode revisar e editar os campos abaixo.',
      ),
    ).toBeNull();
  });
  it('não envia nada sem a integração e mantém a alternativa de texto', async () => {
    vi.stubEnv('VITE_RESUME_GENERATE_URL', '');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    render(<ResumeAssistant onGenerate={generateResume} onGenerated={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Escrever minha experiência' }));
    fireEvent.change(screen.getByLabelText('Conte sua experiência para a IA'), {
      target: { value: 'Trabalhei como recepcionista.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Criar currículo com IA' }));
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain('Nenhum áudio ou texto foi enviado'),
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('atualiza o currículo automaticamente ao concluir a geração', async () => {
    const onGenerated = vi.fn();
    render(
      <ResumeAssistant onGenerate={vi.fn().mockResolvedValue(resume)} onGenerated={onGenerated} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Escrever minha experiência' }));
    fireEvent.change(screen.getByLabelText('Conte sua experiência para a IA'), {
      target: { value: 'Trabalhei com atendimento.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Criar currículo com IA' }));
    await waitFor(() => expect(onGenerated).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('button', { name: 'Usar este currículo' })).toBeNull();
    expect(onGenerated).toHaveBeenCalledExactlyOnceWith(resume);
  });

  it('não altera o currículo quando uma geração cancelada retorna depois', async () => {
    const onGenerated = vi.fn();
    let complete!: (value: typeof resume) => void;
    render(
      <ResumeAssistant
        onGenerate={() =>
          new Promise((resolve) => {
            complete = resolve;
          })
        }
        onGenerated={onGenerated}
      />,
    );
    fireEvent.change(screen.getByLabelText('Conte sua experiência para a IA'), {
      target: { value: 'Minha experiência.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Criar currículo com IA' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar criação' }));
    await act(async () => complete(resume));
    expect(onGenerated).not.toHaveBeenCalled();
  });

  it('envia texto em JSON no contrato do backend com credenciais', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ resume }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    expect(await generateResume({ source: 'text', text: 'Minha experiência.' })).toEqual(resume);
    const request = fetchMock.mock.calls[0][1];
    expect(request.credentials).toBe('include');
    expect(JSON.parse(request.body)).toEqual({
      historico: { ultimaExperiencia: { atividadesTextoOuAudio: 'Minha experiência.' } },
    });
    expect(request.headers).toEqual({ 'Content-Type': 'application/json' });
  });

  it('envia áudio como arquivo e não coloca dados pessoais no pedido', async () => {
    vi.stubEnv('VITE_RESUME_AUDIO_GENERATE_URL', 'https://api.example/audio');
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ resume }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    await generateResume({ source: 'audio', audio: new Blob(['audio'], { type: 'audio/webm' }) });
    const body = fetchMock.mock.calls[0][1].body as FormData;
    expect(body.get('source')).toBe('audio');
    expect((body.get('audio') as File).name).toBe('experiencia.webm');
    expect(body.get('profile')).toBeNull();
  });

  it('recusa resposta com campos ausentes ou inválidos', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ resume: { summary: 'texto', role: 123 } }), {
          status: 200,
        }),
      ),
    );
    await expect(generateResume({ source: 'text', text: 'Minha história' })).rejects.toThrow(
      'formato inesperado',
    );
  });

  it('não inicia uma requisição que já foi cancelada', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const controller = new AbortController();
    controller.abort();
    await expect(
      generateResume({ source: 'text', text: 'Minha história' }, controller.signal),
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('Gravação de áudio', () => {
  it('grava a duração ausente no cabeçalho WebM sem alterar o tipo do áudio', async () => {
    const actual =
      await vi.importActual<typeof import('@fix-webm-duration/fix')>('@fix-webm-duration/fix');
    const original = new Blob(
      [
        new Uint8Array([
          0x18, 0x53, 0x80, 0x67, 0x8c, 0x15, 0x49, 0xa9, 0x66, 0x87, 0x2a, 0xd7, 0xb1, 0x83, 0x0f,
          0x42, 0x40,
        ]),
      ],
      { type: 'audio/webm' },
    );
    const fixed = await actual.fixWebmDuration(original, 12500, { logger: false });
    expect(fixed.type).toBe('audio/webm');
    expect(fixed.size).toBeGreaterThan(original.size);
    const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(fixed);
    });
    const bytes = new Uint8Array(buffer);
    const durationIndex = bytes.findIndex(
      (byte, index) => byte === 0x44 && bytes[index + 1] === 0x89,
    );
    expect(durationIndex).toBeGreaterThan(0);
    expect(new DataView(buffer).getFloat64(durationIndex + 3)).toBe(12500);
  });

  class RecorderMock {
    state = 'inactive';
    mimeType = 'audio/webm';
    ondataavailable?: (event: { data: Blob }) => void;
    onstop?: () => void;
    static isTypeSupported() {
      return true;
    }
    start() {
      this.state = 'recording';
    }
    stop() {
      this.state = 'inactive';
      this.ondataavailable?.({ data: new Blob(['audio'], { type: 'audio/webm' }) });
      this.onstop?.();
    }
  }

  function mockRecording(getUserMedia: ReturnType<typeof vi.fn>) {
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });
    vi.stubGlobal('MediaRecorder', RecorderMock);
    vi.stubGlobal(
      'URL',
      class extends URL {
        static createObjectURL() {
          return 'blob:recording';
        }
        static revokeObjectURL() {}
      },
    );
  }

  it('continua gravando depois de dois minutos até a pessoa concluir', async () => {
    vi.useFakeTimers();
    const stopTrack = vi.fn();
    mockRecording(vi.fn().mockResolvedValue({ getTracks: () => [{ stop: stopTrack }] }));
    const { result } = renderHook(() => useAudioRecorder());
    await act(async () => result.current.start());
    act(() => vi.advanceTimersByTime(10 * 60 * 1000));
    expect(result.current.duration).toBe(600);
    expect(result.current.status).toBe('recording');
    expect(stopTrack).not.toHaveBeenCalled();
    await act(async () => result.current.stop());
    expect(result.current.status).toBe('ready');
    expect(stopTrack).toHaveBeenCalled();
    expect(fixWebmDuration).toHaveBeenCalledWith(expect.any(Blob), 600000, { logger: false });
  });

  it('aguarda a duração corrigida e não recupera uma gravação descartada durante o preparo', async () => {
    const preparedAudio = new Blob(['prepared'], { type: 'audio/webm' });
    let complete!: (audio: Blob) => void;
    vi.mocked(fixWebmDuration).mockImplementationOnce(
      () =>
        new Promise<Blob>((resolve) => {
          complete = resolve;
        }),
    );
    const getUserMedia = vi.fn().mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] });
    mockRecording(getUserMedia);
    const { result } = renderHook(() => useAudioRecorder());
    await act(async () => result.current.start());
    act(() => result.current.stop());
    expect(result.current.status).toBe('stopping');
    expect(result.current.audio).toBeNull();
    await act(async () => result.current.start());
    expect(getUserMedia).toHaveBeenCalledTimes(1);
    act(() => result.current.reset());
    await act(async () => complete(preparedAudio));
    expect(result.current.status).toBe('idle');
    expect(result.current.audio).toBeNull();
  });

  it('disponibiliza o arquivo corrigido para reprodução e envio', async () => {
    const preparedAudio = new Blob(['prepared'], { type: 'audio/webm' });
    vi.mocked(fixWebmDuration).mockResolvedValueOnce(preparedAudio);
    mockRecording(vi.fn().mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] }));
    const { result } = renderHook(() => useAudioRecorder());
    await act(async () => result.current.start());
    await act(async () => result.current.stop());
    expect(result.current.audio).toBe(preparedAudio);
    expect(result.current.status).toBe('ready');
  });

  it('só pede microfone ao iniciar e libera as faixas ao concluir', async () => {
    const stopTrack = vi.fn();
    const getUserMedia = vi.fn().mockResolvedValue({ getTracks: () => [{ stop: stopTrack }] });
    mockRecording(getUserMedia);
    const { result } = renderHook(() => useAudioRecorder());
    expect(getUserMedia).not.toHaveBeenCalled();
    await act(async () => result.current.start());
    expect(result.current.status).toBe('recording');
    await act(async () => result.current.stop());
    expect(result.current.audio?.size).toBeGreaterThan(0);
    expect(result.current.status).toBe('ready');
    expect(stopTrack).toHaveBeenCalled();
  });

  it('libera o microfone quando a pessoa sai da página durante a gravação', async () => {
    const stopTrack = vi.fn();
    mockRecording(vi.fn().mockResolvedValue({ getTracks: () => [{ stop: stopTrack }] }));
    const { result, unmount } = renderHook(() => useAudioRecorder());
    await act(async () => result.current.start());
    unmount();
    expect(stopTrack).toHaveBeenCalled();
  });

  it('explica a recusa de permissão sem simular uma transcrição', async () => {
    mockRecording(vi.fn().mockRejectedValue(new DOMException('Negado', 'NotAllowedError')));
    const { result } = renderHook(() => useAudioRecorder());
    await act(async () => result.current.start());
    expect(result.current.error).toContain('microfone não foi autorizado');
    expect(result.current.audio).toBeNull();
  });
});
