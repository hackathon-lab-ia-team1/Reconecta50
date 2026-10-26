import type { CareerProfile, ResumeDraft } from '../../career/types/career';
import type { ApplicationPlan } from '../types/application';
import type { JobOpportunity } from '../types/job';

export interface ApplicationState {
  plan: ApplicationPlan | null;
  pending: boolean;
  error: string;
  message: string;
  applicationId: string;
  idempotencyKey: string;
  applicationRevision: string;
  attempted: boolean;
  resume: ResumeDraft | null;
  profile: CareerProfile | null;
  job?: JobOpportunity | null;
  availability?: string;
  salaryExpectation?: string;
  appliedAt?: string;
}

interface StoredApplicationEntry {
  jobId: string;
  applicationId: string;
  job: JobOpportunity;
  availability?: string;
  salaryExpectation?: string;
  appliedAt?: string;
  resume?: ResumeDraft | null;
  profile?: CareerProfile | null;
}

interface BackendCandidaturaRecord {
  applicationId?: string;
  userId?: string;
  jobId?: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  workMode?: string;
  compensation?: string;
  recruiterName?: string;
  recruiterContact?: string;
  whatsappPhone?: string;
  availability?: string;
  salaryExpectation?: string;
  appliedAt?: string;
  createdAt?: string;
}

const emptyState: ApplicationState = {
  plan: null,
  pending: false,
  error: '',
  message: '',
  applicationId: '',
  idempotencyKey: '',
  applicationRevision: '',
  attempted: false,
  resume: null,
  profile: null,
  job: null,
  availability: 'Imediata',
  salaryExpectation: '',
  appliedAt: '',
};

export function getCandidaturasUrl(): string {
  if (import.meta.env.VITE_CANDIDATURAS_URL) return import.meta.env.VITE_CANDIDATURAS_URL;
  if (import.meta.env.MODE !== 'test') return 'http://localhost:3001/api/candidaturas';
  return '';
}

function mapBackendRecordToJob(record: BackendCandidaturaRecord): JobOpportunity {
  const rawPhone = (record.whatsappPhone || '11987654321').replace(/\D/g, '') || '11987654321';
  const workMode =
    record.workMode === 'Híbrido' || record.workMode === 'Remoto' ? record.workMode : 'Presencial';

  return {
    id: record.jobId || 'vaga-afirmativa',
    title: record.jobTitle || 'Vaga Afirmativa 50+',
    company: record.company || 'Empresa Parceira 50+',
    location: record.location || 'São Paulo, SP',
    workMode,
    schedule: 'Segunda a sexta · horário comercial',
    compensation: record.compensation || 'A combinar',
    benefits: [],
    description: '',
    requirements: [],
    recruiter: {
      name: record.recruiterName || 'Equipe de RH 50+',
      contact: record.recruiterContact || 'Contato via WhatsApp',
    },
    tracking: {
      channel: 'phone',
      phone: rawPhone,
      acceptsWhatsApp: true,
      instructions: 'Acompanhe o retorno pelo WhatsApp do recrutador.',
    },
    application: {
      channel: 'phone',
      phone: rawPhone,
      acceptsWhatsApp: true,
      instructions: 'Contato via WhatsApp.',
    },
    isDemo: false,
  };
}

export function createApplicationStore(initialStorageKey = 'reconecta_applications_guest') {
  let currentStorageKey = initialStorageKey;
  const records = new Map<string, ApplicationState>();
  const requests = new Map<string, AbortController>();
  const listeners = new Set<() => void>();
  let appliedSnapshot: Array<ApplicationState & { jobId: string }> = [];

  const rebuildSnapshot = () => {
    const next: Array<ApplicationState & { jobId: string }> = [];
    records.forEach((state, jobId) => {
      if (state.applicationId && state.job) {
        next.push({ ...state, jobId });
      }
    });
    appliedSnapshot = next;
  };

  const persistToStorage = () => {
    if (!currentStorageKey) return;
    try {
      const toSave: StoredApplicationEntry[] = [];
      records.forEach((state, jobId) => {
        if (state.applicationId && state.job) {
          toSave.push({
            jobId,
            applicationId: state.applicationId,
            job: state.job,
            availability: state.availability,
            salaryExpectation: state.salaryExpectation,
            appliedAt: state.appliedAt,
            resume: state.resume,
            profile: state.profile,
          });
        }
      });
      if (toSave.length > 0) {
        localStorage.setItem(currentStorageKey, JSON.stringify(toSave));
      } else {
        localStorage.removeItem(currentStorageKey);
      }
    } catch {
      // ignore localStorage errors
    }
  };

  const loadFromStorage = (key: string) => {
    if (!key) return;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      for (const item of parsed as StoredApplicationEntry[]) {
        if (
          item &&
          typeof item.jobId === 'string' &&
          typeof item.applicationId === 'string' &&
          item.applicationId &&
          item.job &&
          typeof item.job === 'object'
        ) {
          records.set(item.jobId, {
            ...emptyState,
            applicationId: item.applicationId,
            job: item.job,
            availability: item.availability || 'Imediata',
            salaryExpectation: item.salaryExpectation || '',
            appliedAt: item.appliedAt || '',
            resume: item.resume ?? null,
            profile: item.profile ?? null,
          });
        }
      }
      rebuildSnapshot();
    } catch {
      // ignore corrupted storage
    }
  };

  loadFromStorage(currentStorageKey);

  const notify = () => {
    rebuildSnapshot();
    listeners.forEach((listener) => listener());
  };

  const get = (jobId: string) => records.get(jobId) ?? emptyState;
  const update = (jobId: string, changes: Partial<ApplicationState>) => {
    const next = { ...get(jobId), ...changes };
    records.set(jobId, next);
    if (next.applicationId && next.job) {
      persistToStorage();
    }
    notify();
  };

  const setStorageKey = (nextKey: string) => {
    if (nextKey === currentStorageKey) return;
    currentStorageKey = nextKey;
    records.clear();
    loadFromStorage(currentStorageKey);
    notify();
  };

  const persistCandidaturaToBackend = (jobId: string, userId?: string) => {
    const endpoint = getCandidaturasUrl();
    if (!endpoint) return;
    const state = records.get(jobId);
    if (!state || !state.applicationId || !state.job) return;

    const job = state.job;
    const whatsappPhone =
      job.application?.channel === 'phone'
        ? job.application.phone
        : job.tracking.channel === 'phone' && job.tracking.phone
          ? job.tracking.phone
          : '11987654321';

    void fetch(endpoint, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicationId: state.applicationId,
        userId,
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        location: job.location,
        workMode: job.workMode,
        compensation: job.compensation,
        recruiterName: job.recruiter.name,
        recruiterContact: job.recruiter.contact,
        whatsappPhone,
        availability: state.availability || 'Imediata',
        salaryExpectation: state.salaryExpectation || 'Compatível com a vaga',
        appliedAt: state.appliedAt || new Date().toLocaleDateString('pt-BR'),
      }),
    }).catch(() => {});
  };

  const syncFromBackend = async (signal?: AbortSignal, userId?: string): Promise<void> => {
    const endpoint = getCandidaturasUrl();
    if (!endpoint) return;
    try {
      const requestUrl = userId
        ? `${endpoint}${endpoint.includes('?') ? '&' : '?'}userId=${encodeURIComponent(userId)}`
        : endpoint;
      const response = await fetch(requestUrl, {
        method: 'GET',
        credentials: 'include',
        signal,
      });
      if (!response.ok || signal?.aborted) return;
      const body: unknown = await response.json();
      if (!body || typeof body !== 'object') return;
      const list = (body as { candidaturas?: unknown }).candidaturas;
      if (!Array.isArray(list)) return;

      let changed = false;
      for (const raw of list as BackendCandidaturaRecord[]) {
        if (!raw || typeof raw.jobId !== 'string' || !raw.jobId || !raw.applicationId) continue;
        const existing = records.get(raw.jobId);
        const job = existing?.job ?? mapBackendRecordToJob(raw);
        const appliedAt =
          raw.appliedAt ||
          existing?.appliedAt ||
          (raw.createdAt
            ? new Date(raw.createdAt).toLocaleDateString('pt-BR')
            : new Date().toLocaleDateString('pt-BR'));

        records.set(raw.jobId, {
          ...(existing ?? emptyState),
          applicationId: raw.applicationId,
          job,
          availability: raw.availability || existing?.availability || 'Imediata',
          salaryExpectation:
            raw.salaryExpectation || existing?.salaryExpectation || 'Compatível com a vaga',
          appliedAt,
        });
        changed = true;
      }

      if (changed) {
        persistToStorage();
        notify();
      }
    } catch {
      // ignore offline or aborted sync
    }
  };

  return {
    get,
    getAppliedJobs: () => appliedSnapshot,
    update,
    setStorageKey,
    persistCandidaturaToBackend,
    syncFromBackend,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    reset: (jobId: string) => {
      records.delete(jobId);
      persistToStorage();
      notify();
    },
    startRequest: (jobId: string) => {
      if (requests.has(jobId)) return null;
      const controller = new AbortController();
      requests.set(jobId, controller);
      return controller;
    },
    isCurrent: (jobId: string, controller: AbortController) =>
      requests.get(jobId) === controller && !controller.signal.aborted,
    endRequest: (jobId: string, controller: AbortController) => {
      if (requests.get(jobId) !== controller) return;
      requests.delete(jobId);
      update(jobId, { pending: false });
    },
    cancelPending: () => {
      requests.forEach((controller, jobId) => {
        controller.abort();
        records.set(jobId, {
          ...get(jobId),
          pending: false,
          error: get(jobId).attempted
            ? 'O envio não foi confirmado. Consulte o andamento antes de usar outro canal.'
            : '',
        });
      });
      requests.clear();
      notify();
    },
  };
}

export type ApplicationStore = ReturnType<typeof createApplicationStore>;
