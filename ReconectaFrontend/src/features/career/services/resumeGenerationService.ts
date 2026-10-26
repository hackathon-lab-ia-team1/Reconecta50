import type { GenerateResume } from '../types/resumeGeneration';
import { parseResumeResponse } from '../utils/parseResumeResponse';

const HIGH_DEMAND_FALLBACK_MSG =
  'Nossos assistentes de IA estão temporariamente com alta demanda. Por favor, tente novamente em alguns instantes ou use a edição manual.';

export const generateResume: GenerateResume = async (input, signal) => {
  const endpoint =
    input.source === 'audio'
      ? import.meta.env.VITE_RESUME_AUDIO_GENERATE_URL
      : import.meta.env.VITE_RESUME_GENERATE_URL;
  if (input.source === 'audio' && !endpoint)
    throw new Error(
      'O serviço atual não recebe gravações de áudio. Conte sua experiência por texto ou preencha o currículo manualmente. Nenhum áudio foi enviado.',
    );
  if (!endpoint) {
    throw new Error(
      'A criação com IA ainda não está conectada. Você pode gravar para conhecer o recurso ou preencher o currículo manualmente abaixo. Nenhum áudio ou texto foi enviado.',
    );
  }
  let body: FormData | string;
  if (input.source === 'audio') {
    body = new FormData();
    body.set('source', input.source);
    if (!input.audio.size || !input.audio.type.startsWith('audio/')) {
      throw new Error('Use uma gravação de áudio válida ou conte sua experiência por texto.');
    }
    const extension = input.audio.type.includes('mp4')
      ? 'm4a'
      : input.audio.type.includes('ogg')
        ? 'ogg'
        : input.audio.type.includes('webm')
          ? 'webm'
          : 'audio';
    body.set('audio', input.audio, `experiencia.${extension}`);
  } else {
    const text = input.text.trim();
    if (!text || text.length > 12000)
      throw new Error('Conte sua experiência em um texto de até 12.000 caracteres.');
    body = JSON.stringify({
      historico: { ultimaExperiencia: { atividadesTextoOuAudio: text } },
      ...(input.sections ? { sections: input.sections } : {}),
    });
  }

  const controller = new AbortController();
  let timedOut = false;
  const abort = () => controller.abort();
  if (signal?.aborted) throw new DOMException('Solicitação cancelada.', 'AbortError');
  signal?.addEventListener('abort', abort, { once: true });
  const timeout = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 60000);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      ...(input.source === 'text' ? { headers: { 'Content-Type': 'application/json' } } : {}),
      body,
      credentials: 'include',
      signal: controller.signal,
    });
    if (response.status === 401) throw new Error('Entre na sua conta para usar a criação com IA.');
    if (response.status === 413)
      throw new Error('O áudio ficou muito grande. Faça uma gravação mais curta ou use texto.');
    if (response.status === 429)
      throw new Error('Aguarde um momento antes de tentar criar o currículo novamente.');
    if (response.status === 503) {
      const errJson = (await response.json().catch(() => null)) as
        | { erro?: string; error?: string }
        | null;
      throw new Error(errJson?.erro || errJson?.error || HIGH_DEMAND_FALLBACK_MSG);
    }
    if (!response.ok)
      throw new Error(
        'Não foi possível criar o currículo agora. Tente novamente ou preencha os campos manualmente.',
      );
    return parseResumeResponse(await response.json());
  } catch (error) {
    if (timedOut)
      throw new Error('A criação demorou mais que o esperado. Tente novamente em instantes.');
    if (signal?.aborted) throw new DOMException('Solicitação cancelada.', 'AbortError');
    if (error instanceof TypeError)
      throw new Error(
        'Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.',
      );
    if (error instanceof SyntaxError)
      throw new Error('O serviço não devolveu um currículo válido. Tente novamente.');
    throw error;
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
};
