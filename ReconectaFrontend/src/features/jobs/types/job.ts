export type TrackingPlatform = 'Gupy' | 'Indeed' | 'LinkedIn';
export type JobTrackingFilter = 'all' | 'email' | 'phone' | 'external' | TrackingPlatform;

export type ApplicationTracking =
  | { channel: 'email'; instructions: string; email?: string }
  | { channel: 'phone'; instructions: string; phone?: string; acceptsWhatsApp: boolean }
  | { channel: 'external'; instructions: string; platform: TrackingPlatform };

export type JobApplicationChannel =
  | { channel: 'external'; url: string }
  | { channel: 'email'; email: string }
  | { channel: 'phone'; phone: string; instructions: string; acceptsWhatsApp?: boolean }
  | { channel: 'manual'; instructions: string };

export interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: 'Presencial' | 'Híbrido' | 'Remoto';
  schedule: string;
  compensation: string;
  benefits: string[];
  description: string;
  requirements: string[];
  recruiter: { name: string; contact: string };
  tracking: ApplicationTracking;
  application?: JobApplicationChannel;
  applicationUrl?: string;
  isDemo: boolean;
}
