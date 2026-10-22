import type { JobOpportunity, JobTrackingFilter } from '../types/job';

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');
}

export function filterJobs(
  jobs: readonly JobOpportunity[],
  query: string,
  channel: JobTrackingFilter,
): JobOpportunity[] {
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  return jobs.filter((job) => {
    const content = normalize(
      [job.title, job.company, job.location, job.workMode, ...job.requirements].join(' '),
    );
    const matchesChannel =
      channel === 'all' ||
      job.tracking.channel === channel ||
      (job.tracking.channel === 'external' && job.tracking.platform === channel);
    return matchesChannel && terms.every((term) => content.includes(term));
  });
}
