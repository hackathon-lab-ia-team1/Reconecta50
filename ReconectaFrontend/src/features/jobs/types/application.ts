export type ApplicationPlan =
  | { type: 'automatic'; planId: string; summary: string }
  | { type: 'external'; url: string }
  | { type: 'email'; to: string; subject: string; body: string; source: 'ai' | 'template' }
  | {
      type: 'whatsapp';
      phone: string;
      instructions: string;
      body: string;
      source: 'ai' | 'template';
    }
  | { type: 'manual'; instructions: string };

export type ApplicationResult =
  { status: 'submitted'; applicationId: string } | { status: 'external'; url: string };
