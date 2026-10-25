import type { ApplicationTracking, JobApplicationChannel, JobOpportunity } from '../types/job';
import type { JobRecommendation } from '../types/recommendation';
import { isValidApplicationEmail, safeApplicationUrl } from './applicationLinks';

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('O serviço devolveu recomendações em formato inválido.');
  return value as Record<string, unknown>;
}

function text(value: unknown, fallback?: string): string {
  if (value == null && fallback !== undefined) return fallback;
  if (typeof value !== 'string' || !value.trim() || value.length > 30000)
    throw new Error('Faltaram informações para apresentar uma vaga recomendada.');
  return value.trim();
}

function list(value: unknown): string[] {
  if (value == null) return [];
  if (!Array.isArray(value) || value.length > 100)
    throw new Error('O serviço devolveu uma lista de informações inválida.');
  return value.map((item) => text(item));
}

function tracking(value: unknown): ApplicationTracking {
  const source = object(value);
  const instructions = text(source.instructions);
  if (source.channel === 'email')
    return {
      channel: 'email',
      instructions,
      ...(source.email ? { email: text(source.email) } : {}),
    };
  if (source.channel === 'phone')
    return {
      channel: 'phone',
      instructions,
      acceptsWhatsApp: source.acceptsWhatsApp === true,
      ...(source.phone ? { phone: text(source.phone) } : {}),
    };
  if (
    source.channel === 'external' &&
    (source.platform === 'Gupy' || source.platform === 'Indeed' || source.platform === 'LinkedIn')
  )
    return { channel: 'external', instructions, platform: source.platform };
  throw new Error('O canal de acompanhamento de uma vaga não foi informado corretamente.');
}

function application(value: unknown): JobApplicationChannel {
  const source = object(value);
  if (source.channel === 'external') {
    const url = safeApplicationUrl(text(source.url));
    if (url) return { channel: 'external', url };
  }
  if (source.channel === 'email') {
    const email = text(source.email);
    if (isValidApplicationEmail(email)) return { channel: 'email', email };
  }
  if (source.channel === 'phone')
    return {
      channel: 'phone',
      phone: text(source.phone),
      instructions: text(source.instructions),
      acceptsWhatsApp: source.acceptsWhatsApp === true,
    };
  if (source.channel === 'manual')
    return { channel: 'manual', instructions: text(source.instructions) };
  throw new Error('O canal de inscrição de uma vaga não foi informado corretamente.');
}

function parseJob(source: Record<string, unknown>): JobOpportunity {
  if (
    source.workMode !== 'Presencial' &&
    source.workMode !== 'Híbrido' &&
    source.workMode !== 'Remoto'
  )
    throw new Error('A modalidade de trabalho de uma vaga não foi informada corretamente.');
  const recruiter = source.recruiter == null ? {} : object(source.recruiter);
  return {
    id: text(source.id),
    title: text(source.title),
    company: text(source.company),
    location: text(source.location),
    workMode: source.workMode,
    schedule: text(source.schedule, 'Jornada não informada'),
    compensation: text(source.compensation, 'Remuneração não informada'),
    description: text(source.description),
    benefits: list(source.benefits),
    requirements: list(source.requirements),
    recruiter: {
      name: text(recruiter.name, 'Contato não informado'),
      contact: text(recruiter.contact, 'Consulte as orientações do anúncio original.'),
    },
    tracking: tracking(source.tracking),
    ...(source.application != null ? { application: application(source.application) } : {}),
    ...(source.applicationUrl ? { applicationUrl: text(source.applicationUrl) } : {}),
    isDemo: false,
  };
}
export function parseRecommendations(value: unknown): JobRecommendation[] {
  const response = object(value);
  if (!Array.isArray(response.recommendations) || response.recommendations.length > 200)
    throw new Error('O serviço não devolveu uma lista válida de recomendações.');
  const recommendations: JobRecommendation[] = [];
  const ids = new Set<string>();
  for (const item of response.recommendations) {
    const candidate = object(item);
    if (typeof candidate.isCompatible !== 'boolean')
      throw new Error('O serviço não informou a compatibilidade de uma vaga.');
    if (!candidate.isCompatible) continue;
    const sourceJob = object(candidate.job);
    if (sourceJob.isDemo === true) continue;
    const job = parseJob(sourceJob);
    if (ids.has(job.id)) continue;
    recommendations.push({
      job,
      reason: text(candidate.reason),
      matchedSkills: list(candidate.matchedSkills),
    });
    ids.add(job.id);
  }
  return recommendations;
}
