import type { ResumeDraft } from '../../career/types/career';
import type { JobOpportunity } from './job';

export interface JobRecommendation {
  job: JobOpportunity;
  reason: string;
  matchedSkills: string[];
}

export type RecommendJobs = (
  resume: ResumeDraft,
  signal?: AbortSignal,
) => Promise<JobRecommendation[]>;
