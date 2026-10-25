import type { JobApplicationChannel, JobOpportunity } from '../types/job';
import { safeApplicationUrl } from './applicationLinks';

export function getApplicationChannel(job: JobOpportunity): JobApplicationChannel {
  if (job.application) return job.application;
  const url = safeApplicationUrl(job.applicationUrl);
  if (url) return { channel: 'external', url };
  return {
    channel: 'manual',
    instructions:
      'O canal de inscrição não foi informado. Consulte o anúncio original ou o recrutador para saber como se candidatar.',
  };
}

export function allowsAutomaticApplication(job: JobOpportunity): boolean {
  const application = getApplicationChannel(job);
  return application.channel === 'external' && !!safeApplicationUrl(application.url);
}
