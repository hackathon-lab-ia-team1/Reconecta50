export interface CareerProfile {
  fullName: string;
  phone: string;
  birthDate: string;
  address: string;
  email?: string;
}

export interface ResumeDraft {
  summary: string;
  role: string;
  company: string;
  period: string;
  activities: string;
  skills: string;
  targetRole?: string;
  education?: string;
  languages?: string;
  additionalContacts?: string;
}
