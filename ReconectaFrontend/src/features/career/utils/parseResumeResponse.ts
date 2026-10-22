import type { ResumeDraft } from '../types/career';
import { normalizeResume, validateResume } from './validateResume';

export function parseResumeResponse(value: unknown): ResumeDraft {
  if (!value || typeof value !== 'object' || !('resume' in value)) {
    throw new Error('O serviço não devolveu um currículo válido. Tente novamente.');
  }
  const candidate = value.resume;
  if (!candidate || typeof candidate !== 'object') {
    throw new Error('O serviço não devolveu um currículo válido. Tente novamente.');
  }
  const fields = ['summary', 'role', 'company', 'period', 'activities', 'skills'] as const;
  const resume = {} as ResumeDraft;
  for (const field of fields) {
    const content = field in candidate ? candidate[field as keyof typeof candidate] : '';
    if (typeof content !== 'string' || content.length > 15000) {
      throw new Error('O serviço devolveu dados em um formato inesperado. Tente novamente.');
    }
    resume[field] = content;
  }
  if (Object.keys(validateResume(resume)).length) {
    throw new Error(
      'Faltaram informações para montar o currículo. Conte também qual era sua função.',
    );
  }
  return normalizeResume(resume);
}
