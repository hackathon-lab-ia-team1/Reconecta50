import type { RecommendJobs } from '../types/recommendation';
import { normalizeResume, validateResume } from '../../career/utils/validateResume';
import { parseRecommendations } from '../utils/parseRecommendations';

export const recommendJobs: RecommendJobs = async (resume, signal) => {
  if (Object.keys(validateResume(resume)).length)
    throw new Error('Atualize seu currículo antes de buscar recomendações.');
  const endpoint = import.meta.env.VITE_JOB_RECOMMENDATIONS_URL;
  if (!endpoint)
    throw new Error(
      'As recomendações por IA ainda não estão conectadas. Seu currículo não foi enviado e nenhuma vaga genérica será exibida como recomendação.',
    );
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) throw new DOMException('Busca cancelada.', 'AbortError');
  signal?.addEventListener('abort', abort, { once: true });
  let timedOut = false;
  const timeout = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 60000);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ resume: normalizeResume(resume) }),
      signal: controller.signal,
    });
    if (response.status === 401)
      throw new Error('Entre na sua conta para consultar recomendações para seu currículo.');
    if (response.status === 429)
      throw new Error('Aguarde um momento antes de buscar novas recomendações.');
    if (!response.ok)
      throw new Error('Não foi possível analisar as vagas agora. Tente novamente em instantes.');
    return parseRecommendations(await response.json());
  } catch (error) {
    if (timedOut) throw new Error('A análise demorou mais que o esperado. Tente novamente.');
    if (signal?.aborted) throw new DOMException('Busca cancelada.', 'AbortError');
    if (error instanceof TypeError)
      throw new Error(
        'Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.',
      );
    if (error instanceof SyntaxError)
      throw new Error('O serviço devolveu uma resposta inválida. Tente novamente.');
    throw error;
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
};
