import type { ResumeDraft } from '../types/career';

export type ResumeErrors = Partial<Record<keyof ResumeDraft, string>>;

export function validateResume(resume: ResumeDraft): ResumeErrors {
  const errors: ResumeErrors = {};
  if (!resume.summary.trim()) errors.summary = 'Escreva uma apresentação profissional.';
  if (!resume.role.trim()) errors.role = 'Informe uma função ou trabalho.';
  return errors;
}

export function normalizeResume(resume: ResumeDraft): ResumeDraft {
  return {
    summary: resume.summary.trim(),
    role: resume.role.trim(),
    company: resume.company.trim(),
    period: resume.period.trim(),
    activities: resume.activities.trim(),
    skills: resume.skills
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean)
      .join(', '),
    ...(resume.targetRole !== undefined ? { targetRole: resume.targetRole.trim() } : {}),
    ...(resume.education !== undefined ? { education: resume.education.trim() } : {}),
    ...(resume.languages !== undefined ? { languages: resume.languages.trim() } : {}),
    ...(resume.additionalContacts !== undefined
      ? { additionalContacts: resume.additionalContacts.trim() }
      : {}),
  };
}
