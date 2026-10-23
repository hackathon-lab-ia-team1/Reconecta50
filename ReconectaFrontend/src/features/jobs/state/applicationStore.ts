import type { CareerProfile, ResumeDraft } from '../../career/types/career';
import type { ApplicationPlan } from '../types/application';

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
};

export function createApplicationStore() {
  const records = new Map<string, ApplicationState>();
  const requests = new Map<string, AbortController>();
  const listeners = new Set<() => void>();
  const get = (jobId: string) => records.get(jobId) ?? emptyState;
  const update = (jobId: string, changes: Partial<ApplicationState>) => {
    records.set(jobId, { ...get(jobId), ...changes });
    listeners.forEach((listener) => listener());
  };
  return {
    get,
    update,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    reset: (jobId: string) => {
      records.delete(jobId);
      listeners.forEach((listener) => listener());
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
        update(jobId, {
          pending: false,
          error: get(jobId).attempted
            ? 'O envio não foi confirmado. Consulte o andamento antes de usar outro canal.'
            : '',
        });
      });
      requests.clear();
    },
  };
}

export type ApplicationStore = ReturnType<typeof createApplicationStore>;
