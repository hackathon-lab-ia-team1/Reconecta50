import type { ResumeDraft } from './career';

export type ResumeGenerationInput =
  { source: 'audio'; audio: Blob } | { source: 'text'; text: string };

export type GenerateResume = (
  input: ResumeGenerationInput,
  signal?: AbortSignal,
) => Promise<ResumeDraft>;
