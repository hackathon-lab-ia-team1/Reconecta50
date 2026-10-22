import type { CareerProfile, ResumeDraft } from '../../career/types/career';
import { normalizeResume, validateResume } from '../../career/utils/validateResume';
import type { ApplicationPlan, ApplicationResult } from '../types/application';
import type { JobOpportunity } from '../types/job';
import { isValidApplicationEmail, safeApplicationUrl } from '../utils/applicationLinks';
import { allowsAutomaticApplication, getApplicationChannel } from '../utils/applicationChannel';

export class ApplicationSubmissionError extends Error {
  constructor(
    message: string,
    readonly outcome: 'notSubmitted' | 'unknown',
  ) {
    super(message);
    this.name = 'ApplicationSubmissionError';
  }
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('O serviço devolveu uma resposta de candidatura inválida.');
  return value as Record<string, unknown>;
}

function text(value: unknown): string {
  if (typeof value !== 'string' || !value.trim() || value.length > 30000)
    throw new Error('Faltaram informações para preparar a candidatura.');
  return value.trim();
}

function external(value: unknown): string {
  const url = safeApplicationUrl(text(value));
  if (!url) throw new Error('O endereço de inscrição não é válido. Consulte o anúncio original.');
  return url;
}

async function post(
  endpoint: string,
  body: unknown,
  signal?: AbortSignal,
  key?: string,
): Promise<unknown> {
  if (signal?.aborted) throw new DOMException('Solicitação cancelada.', 'AbortError');
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(key ? { 'Idempotency-Key': key } : {}) },
      body: JSON.stringify(body),
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(60000)])
        : AbortSignal.timeout(60000),
    });
    if (response.status === 401)
      throw new ApplicationSubmissionError(
        'Entre na sua conta para continuar a candidatura.',
        'notSubmitted',
      );
    if (response.status === 429)
      throw new ApplicationSubmissionError(
        'Aguarde um momento antes de tentar novamente.',
        'notSubmitted',
      );
    if (!response.ok)
      throw new Error(
        'Não foi possível confirmar a operação. Tente novamente ou use o site de origem.',
      );
    return await response.json();
  } catch (error) {
    if (signal?.aborted) throw error;
    if (error instanceof TypeError || error instanceof DOMException)
      throw new Error(
        'Não foi possível confirmar a operação. Verifique sua conexão antes de tentar novamente.',
      );
    if (error instanceof SyntaxError)
      throw new Error('O serviço não confirmou a candidatura em um formato válido.');
    throw error;
  }
}

export function getManualApplicationPlan(
  job: JobOpportunity,
  resume: ResumeDraft,
  profile: CareerProfile,
): ApplicationPlan {
  if (job.isDemo) throw new Error('Vagas de demonstração não recebem candidaturas.');
  const application = getApplicationChannel(job);
  if (application.channel === 'phone' && application.acceptsWhatsApp)
    return {
      type: 'whatsapp',
      phone: application.phone,
      instructions: application.instructions,
      body: `Olá, equipe de seleção da ${job.company}! Meu nome é ${profile.fullName || 'Seu nome'} e tenho interesse na vaga de ${job.title}.\n\n${resume.summary.trim()}\n\nGostaria de saber como posso participar da seleção. Fico à disposição para enviar meu currículo e conversar. Obrigado pela atenção!`,
      source: 'template',
    };
  if (application.channel === 'email' && isValidApplicationEmail(application.email)) {
    return {
      type: 'email',
      to: application.email,
      subject: `Candidatura à vaga de ${job.title.replace(/[\r\n]/g, ' ')}`,
      body: `Olá, equipe de seleção da ${job.company}!\n\nGostaria de me candidatar à vaga de ${job.title}.\n\n${resume.summary.trim()}\n\nFico à disposição para uma conversa e para compartilhar mais informações sobre minha experiência.\n\nAtenciosamente,\n${profile.fullName || 'Seu nome'}${profile.phone ? `\nTelefone: ${profile.phone}` : ''}`,
      source: 'template',
    };
  }
  const url = application.channel === 'external' ? safeApplicationUrl(application.url) : undefined;
  if (url) return { type: 'external', url };
  if (application.channel === 'phone')
    return {
      type: 'manual',
      instructions: `Telefone para inscrição: ${application.phone}. ${application.instructions}`,
    };
  if (application.channel === 'manual')
    return { type: 'manual', instructions: application.instructions };
  return {
    type: 'manual',
    instructions: 'O canal de inscrição não é válido. Consulte o anúncio original ou o recrutador.',
  };
}

export async function prepareApplication(
  job: JobOpportunity,
  resume: ResumeDraft,
  profile: CareerProfile,
  signal?: AbortSignal,
): Promise<ApplicationPlan> {
  if (job.isDemo) throw new Error('Vagas de demonstração não recebem candidaturas.');
  if (Object.keys(validateResume(resume)).length)
    throw new Error('Preencha seu currículo antes de se candidatar.');
  const endpoint = import.meta.env.VITE_JOB_APPLICATION_PLAN_URL;
  if (!endpoint) return getManualApplicationPlan(job, resume, profile);
  const plan = object(
    await post(
      endpoint,
      {
        jobId: job.id,
        allowAutomatic: allowsAutomaticApplication(job),
        resume: normalizeResume(resume),
        profile: { fullName: profile.fullName, phone: profile.phone },
      },
      signal,
    ),
  );
  if (plan.type === 'automatic' && !allowsAutomaticApplication(job))
    return getManualApplicationPlan(job, resume, profile);
  if (plan.type === 'automatic')
    return { type: 'automatic', planId: text(plan.planId), summary: text(plan.summary) };
  if (plan.type === 'external') return { type: 'external', url: external(plan.url) };
  if (plan.type === 'manual') return { type: 'manual', instructions: text(plan.instructions) };
  if (plan.type === 'whatsapp') {
    const application = getApplicationChannel(job);
    const phone = text(plan.phone);
    if (
      application.channel !== 'phone' ||
      !application.acceptsWhatsApp ||
      phone !== application.phone ||
      plan.source !== 'ai'
    )
      throw new Error(
        'O serviço devolveu uma sugestão de WhatsApp incompatível com o contato de inscrição da vaga.',
      );
    return {
      type: 'whatsapp',
      phone,
      instructions: application.instructions,
      body: text(plan.body),
      source: 'ai',
    };
  }
  if (plan.type === 'email') {
    const to = text(plan.to);
    const subject = text(plan.subject);
    if (!isValidApplicationEmail(to) || /[\r\n]/.test(subject) || plan.source !== 'ai')
      throw new Error('O serviço devolveu uma sugestão de e-mail inválida.');
    const application = getApplicationChannel(job);
    if (application.channel !== 'email' || to !== application.email)
      throw new Error(
        'O destinatário sugerido não corresponde ao e-mail de inscrição da vaga. Use o contato informado no anúncio.',
      );
    return { type: 'email', to, subject, body: text(plan.body), source: 'ai' };
  }
  throw new Error('O serviço não informou como continuar a candidatura.');
}

export async function submitApplication(
  jobId: string,
  planId: string,
  idempotencyKey: string,
  signal?: AbortSignal,
): Promise<ApplicationResult> {
  const endpoint = import.meta.env.VITE_JOB_APPLICATION_SUBMIT_URL;
  if (!endpoint)
    throw new ApplicationSubmissionError(
      'A candidatura automática ainda não está conectada. Use o site ou o contato informado na vaga.',
      'notSubmitted',
    );
  try {
    const result = object(await post(endpoint, { jobId, planId }, signal, idempotencyKey));
    if (result.status === 'submitted')
      return { status: 'submitted', applicationId: text(result.applicationId) };
    if (result.status === 'external') return { status: 'external', url: external(result.url) };
    throw new Error('O serviço ainda não confirmou o envio da candidatura.');
  } catch (error) {
    if (error instanceof ApplicationSubmissionError) throw error;
    throw new ApplicationSubmissionError(
      error instanceof Error ? error.message : 'Não foi possível confirmar o envio.',
      'unknown',
    );
  }
}
