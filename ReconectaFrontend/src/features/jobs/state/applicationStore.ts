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

export function createApplicationStore() {
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

  const notify = () => {
    rebuildSnapshot();
    listeners.forEach((listener) => listener());
  };

  const get = (jobId: string) => records.get(jobId) ?? emptyState;
  const update = (jobId: string, changes: Partial<ApplicationState>) => {
    records.set(jobId, { ...get(jobId), ...changes });
    notify();
  };
  return {
    get,
    getAppliedJobs: () => appliedSnapshot,
    update,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    reset: (jobId: string) => {
      records.delete(jobId);
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
