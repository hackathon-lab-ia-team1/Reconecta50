import { useContext, useEffect, useSyncExternalStore } from 'react';
import { AuthContext } from '../../auth/AuthContext';
import type { CareerProfile, ResumeDraft } from '../../career/types/career';
import { JobApplicationContext } from '../JobApplicationContext';
import type { JobOpportunity } from '../types/job';
import { allowsAutomaticApplication, getApplicationChannel } from '../utils/applicationChannel';
import {
  getManualApplicationPlan,
  prepareApplication,
  submitApplication,
  ApplicationSubmissionError,
} from '../services/jobApplicationService';

function revision(resume: ResumeDraft, profile: CareerProfile) {
  return JSON.stringify({ resume, fullName: profile.fullName, phone: profile.phone });
}

export function useJobApplication(
  job: JobOpportunity,
  resume: ResumeDraft,
  profile: CareerProfile,
) {
  const context = useContext(JobApplicationContext);
  const auth = useContext(AuthContext);
  if (!context)
    throw new Error('useJobApplication deve ser usado dentro de JobApplicationProvider.');
  const store = context;
  const state = useSyncExternalStore(store.subscribe, () => store.get(job.id));
  const inputRevision = revision(resume, profile);
  const applicationRevision = JSON.stringify(getApplicationChannel(job));

  useEffect(() => {
    if (
      !state.pending &&
      !state.attempted &&
      !state.applicationId &&
      state.resume &&
      state.profile &&
      (revision(state.resume, state.profile) !== inputRevision ||
        state.applicationRevision !== applicationRevision)
    )
      store.reset(job.id);
  }, [
    store,
    job.id,
    inputRevision,
    applicationRevision,
    state.applicationRevision,
    state.pending,
    state.attempted,
    state.applicationId,
    state.resume,
    state.profile,
  ]);

  async function prepare() {
    if (store.get(job.id).pending || store.get(job.id).applicationId || store.get(job.id).attempted)
      return;
    const controller = store.startRequest(job.id);
    if (!controller) return;
    store.update(job.id, { pending: true, error: '' });
    try {
      const plan = await prepareApplication(job, resume, profile, controller.signal);
      if (!store.isCurrent(job.id, controller)) return;
      store.update(job.id, {
        plan,
        idempotencyKey: crypto.randomUUID(),
        applicationRevision,
        resume: { ...resume },
        profile: { ...profile },
        job: { ...job },
      });
    } catch (cause) {
      if (store.isCurrent(job.id, controller))
        store.update(job.id, {
          error:
            cause instanceof Error ? cause.message : 'Não foi possível preparar a candidatura.',
        });
    } finally {
      store.endRequest(job.id, controller);
    }
  }

  async function confirm() {
    const current = store.get(job.id);
    if (
      current.plan?.type !== 'automatic' ||
      (!current.attempted &&
        (!allowsAutomaticApplication(job) ||
          current.applicationRevision !== applicationRevision)) ||
      current.pending ||
      current.applicationId
    )
      return;
    const controller = store.startRequest(job.id);
    if (!controller) return;
    store.update(job.id, { pending: true, error: '', attempted: true });
    try {
      const result = await submitApplication(
        job.id,
        current.plan.planId,
        current.idempotencyKey,
        controller.signal,
      );
      if (!store.isCurrent(job.id, controller)) return;
      if (result.status === 'submitted') {
        store.update(job.id, {
          applicationId: result.applicationId,
          job: { ...job },
          appliedAt: new Date().toLocaleDateString('pt-BR'),
        });
        store.persistCandidaturaToBackend(job.id, auth?.user?.id);
      } else {
        store.update(job.id, { plan: { type: 'external', url: result.url }, attempted: false });
      }
    } catch (cause) {
      if (store.isCurrent(job.id, controller))
        store.update(job.id, {
          error: cause instanceof Error ? cause.message : 'Não foi possível confirmar o envio.',
          attempted:
            current.attempted ||
            !(cause instanceof ApplicationSubmissionError && cause.outcome === 'notSubmitted'),
        });
    } finally {
      store.endRequest(job.id, controller);
    }
  }

  function showManualChannel() {
    const current = store.get(job.id);
    if (current.pending || current.attempted || current.applicationId) return;
    store.update(job.id, {
      plan: getManualApplicationPlan(job, resume, profile),
      applicationRevision,
      resume: { ...resume },
      profile: { ...profile },
      job: { ...job },
      error: '',
      message: '',
    });
  }

  function updateMessage(field: 'subject' | 'body', value: string) {
    const current = store.get(job.id);
    if (current.plan?.type !== 'email' && !(current.plan?.type === 'whatsapp' && field === 'body'))
      return;
    store.update(job.id, { plan: { ...current.plan, [field]: value }, message: '' });
  }

  function updateQuestionnaire(field: 'availability' | 'salaryExpectation', value: string) {
    store.update(job.id, { [field]: value });
  }

  function confirmQuickApplication() {
    const current = store.get(job.id);
    if (current.pending || current.applicationId) return;
    const protocol = `REC-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    store.update(job.id, {
      applicationId: protocol,
      job: { ...job },
      resume: { ...resume },
      profile: { ...profile },
      availability: current.availability?.trim() || 'Imediata',
      salaryExpectation: current.salaryExpectation?.trim() || 'Compatível com o valor da vaga',
      appliedAt: new Date().toLocaleDateString('pt-BR'),
      error: '',
    });
    store.persistCandidaturaToBackend(job.id, auth?.user?.id);
  }

  async function copyMessage() {
    const current = store.get(job.id);
    if (current.plan?.type !== 'email' && current.plan?.type !== 'whatsapp') return;
    try {
      await navigator.clipboard.writeText(current.plan.body);
      store.update(job.id, {
        message:
          current.plan.type === 'whatsapp'
            ? 'Mensagem copiada. Cole no WhatsApp do recrutador e envie quando quiser.'
            : 'Mensagem copiada. Cole no seu e-mail, anexe o currículo e envie quando quiser.',
      });
    } catch {
      store.update(job.id, {
        message:
          current.plan.type === 'whatsapp'
            ? 'Selecione e copie a mensagem no campo acima.'
            : 'Selecione e copie o assunto e a mensagem nos campos acima.',
      });
    }
  }

  return {
    ...state,
    prepare,
    confirm,
    confirmQuickApplication,
    showManualChannel,
    updateMessage,
    updateQuestionnaire,
    copyMessage,
  };
}
