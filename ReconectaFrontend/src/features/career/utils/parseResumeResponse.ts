import type { ResumeDraft } from '../types/career';
import { normalizeResume, validateResume } from './validateResume';

export function parseResumeResponse(value: unknown): ResumeDraft {
  if (value && typeof value === 'object' && 'sucesso' in value) {
    if (
      value.sucesso !== true ||
      !('curriculo' in value) ||
      !value.curriculo ||
      typeof value.curriculo !== 'object'
    )
      throw new Error('O serviço não devolveu um currículo válido. Tente novamente.');
    if (!('origem' in value) || value.origem !== 'gemini_api')
      throw new Error(
        'O serviço retornou um currículo de demonstração, sem geração real por IA. Seu currículo anterior foi preservado. Use o preenchimento manual ou tente novamente quando a IA estiver disponível.',
      );
    const source = value.curriculo as Record<string, unknown>;
    const experiences = source.experienciaFormatada;
    if (!Array.isArray(experiences) || experiences.length === 0 || experiences.length > 50)
      throw new Error(
        'O serviço não informou experiências válidas. Nenhuma informação foi substituída.',
      );
    const experience = experiences[0];
    if (!experience || typeof experience !== 'object' || Array.isArray(experience))
      throw new Error('O serviço devolveu uma experiência inválida.');
    const list = (items: unknown): string[] => {
      if (
        !Array.isArray(items) ||
        items.length > 100 ||
        items.some((item) => typeof item !== 'string' || item.length > 15000)
      )
        throw new Error('O serviço devolveu dados em um formato inesperado. Tente novamente.');
      return items as string[];
    };
    const formatted = experiences.map((entry: unknown) => {
      if (
        !entry ||
        typeof entry !== 'object' ||
        !('cargo' in entry) ||
        typeof entry.cargo !== 'string' ||
        !('periodo' in entry) ||
        typeof entry.periodo !== 'string' ||
        !('responsabilidades' in entry)
      )
        throw new Error('O serviço devolveu uma experiência inválida.');
      return {
        cargo: entry.cargo,
        periodo: entry.periodo,
        atividades: list(entry.responsabilidades).join('\n'),
      };
    });
    return parseResumeResponse({
      resume: {
        summary: source.resumoProfissional,
        role: formatted.map((item) => item.cargo).join(' / '),
        company: '',
        period: formatted.length === 1 ? formatted[0].periodo : '',
        activities:
          formatted.length === 1
            ? formatted[0].atividades
            : formatted
                .map((item) => `${item.cargo} · ${item.periodo}\n${item.atividades}`)
                .join('\n\n'),
        skills: list(source.competenciasChave).join(', '),
      },
    });
  }
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
  for (const field of ['targetRole', 'education', 'languages', 'additionalContacts'] as const) {
    if (field in candidate) {
      const content = (candidate as Record<string, unknown>)[field];
      if (typeof content !== 'string' || content.length > 15000)
        throw new Error('O serviço devolveu dados em um formato inesperado.');
      resume[field] = content;
    }
  }
  if (Object.keys(validateResume(resume)).length) {
    throw new Error(
      'Faltaram informações para montar o currículo. Conte também qual era sua função.',
    );
  }
  return normalizeResume(resume);
}
