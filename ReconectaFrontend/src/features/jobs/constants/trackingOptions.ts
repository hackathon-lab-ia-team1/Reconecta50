import type { JobTrackingFilter } from '../types/job';

export const trackingOptions: ReadonlyArray<{ value: JobTrackingFilter; label: string }> = [
  { value: 'all', label: 'Todos os canais' },
  { value: 'email', label: 'E-mail' },
  { value: 'phone', label: 'Celular / WhatsApp' },
  { value: 'external', label: 'Plataformas externas' },
  { value: 'Gupy', label: 'Gupy' },
  { value: 'Indeed', label: 'Indeed' },
  { value: 'LinkedIn', label: 'LinkedIn' },
];
