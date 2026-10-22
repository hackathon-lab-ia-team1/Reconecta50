import { useEffect, useRef, useState } from 'react';
import type { ResumeDraft } from '../../career/types/career';
import type { JobRecommendation, RecommendJobs } from '../types/recommendation';
import { normalizeResume, validateResume } from '../../career/utils/validateResume';
import { recommendJobs } from '../services/jobRecommendationsService';

export function useJobRecommendations(resume: ResumeDraft, request: RecommendJobs = recommendJobs) {
  const resumeKey = JSON.stringify(normalizeResume(resume));
  const ready = Object.keys(validateResume(resume)).length === 0;
  const [result, setResult] = useState<{ key: string; items: JobRecommendation[] } | null>(null);
  const [error, setError] = useState<{ key: string; message: string } | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const requests = requestRef;
    setBusyKey(null);
    return () => {
      requests.current?.abort();
      requests.current = null;
    };
  }, [resumeKey]);

  function cancel() {
    requestRef.current?.abort();
    requestRef.current = null;
    setBusyKey(null);
  }

  async function refresh() {
    if (!ready || requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setBusyKey(resumeKey);
    setError(null);
    setResult(null);
    try {
      const items = await request(resume, controller.signal);
      if (requestRef.current === controller && !controller.signal.aborted)
        setResult({ key: resumeKey, items });
    } catch (cause) {
      if (requestRef.current === controller && !controller.signal.aborted)
        setError({
          key: resumeKey,
          message:
            cause instanceof Error ? cause.message : 'Não foi possível consultar as recomendações.',
        });
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setBusyKey(null);
      }
    }
  }

  return {
    ready,
    loading: busyKey === resumeKey,
    completed: result?.key === resumeKey,
    recommendations: result?.key === resumeKey ? result.items : [],
    error: error?.key === resumeKey ? error.message : '',
    refresh,
    cancel,
  };
}
