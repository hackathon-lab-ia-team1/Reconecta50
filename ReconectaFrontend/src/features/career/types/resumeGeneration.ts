import type { ResumeDraft } from './career';
import type { ResumeInterview } from './resumeInterview';

export type ResumeGenerationInput =
  { source: 'audio'; audio: Blob } | { source: 'text'; text: string; sections?: ResumeInterview };

export type GenerateResume = (
  input: ResumeGenerationInput,
  signal?: AbortSignal,
) => Promise<ResumeDraft>;
