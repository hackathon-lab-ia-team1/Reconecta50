import crypto from 'node:crypto';
import type { Request, Response } from 'express';
import { db } from '../data/db.js';
import { VAGAS_OPORTUNIDADES } from '../data/mocks/vagas.mock.js';
import { SESSION_COOKIE } from '../middlewares/authMiddleware.js';
import { getPublicUserBySession } from '../services/authService.js';

export interface CandidaturaRegistrada {
  applicationId: string;
  userId?: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  workMode: string;
  compensation: string;
  recruiterName: string;
  recruiterContact: string;
  whatsappPhone: string;
  availability: string;
  salaryExpectation: string;
  appliedAt?: string;
  status: 'submitted';
  createdAt: string;
}

interface CandidaturaRow {
  applicationId: string;
  userId: string | null;
  jobId: string;
  jobTitle: string;
  company: string;
  data: string;
  createdAt: string;
}

function mapRowToCandidatura(row: CandidaturaRow): CandidaturaRegistrada | null {
  try {
    const parsed = JSON.parse(row.data) as CandidaturaRegistrada;
    return {
      ...parsed,
      applicationId: parsed.applicationId || row.applicationId,
      ...(row.userId ? { userId: row.userId } : {}),
      jobId: parsed.jobId || row.jobId,
      jobTitle: parsed.jobTitle || row.jobTitle,
      company: parsed.company || row.company,
      createdAt: parsed.createdAt || row.createdAt,
    };
  } catch {
    return null;
  }
}

export function loadCandidaturas(): void {
  // Inicialização gerenciada pelo SQLite (db.ts)
}

export function getCandidaturasCount(): number {
  const stmt = db.prepare('SELECT COUNT(*) as total FROM candidaturas');
  const row = stmt.get() as { total: number } | undefined;
  return Number(row?.total ?? 0);
}

export function handlePrepararCandidatura(req: Request, res: Response): void {
  const { jobId, allowAutomatic, resume, profile } = req.body ?? {};
  const job = VAGAS_OPORTUNIDADES.find((v) => v.id === jobId);

  const nome = profile?.fullName || 'Candidato(a)';
  const resumo = resume?.summary || 'Tenho experiência profissional e interesse na oportunidade.';

  if (job?.application?.channel === 'phone' && job.application.acceptsWhatsApp) {
    res.json({
      type: 'whatsapp',
      phone: job.application.phone,
      body: `Olá, equipe de seleção da ${job.company}! Meu nome é ${nome} e tenho interesse na vaga de ${job.title}.\n\n${resumo}\n\nGostaria de participar do processo seletivo e enviar meu currículo completo. Obrigado(a) pela atenção!`,
      source: 'ai',
    });
    return;
  }

  if (job?.application?.channel === 'email') {
    res.json({
      type: 'email',
      to: job.application.email,
      subject: `Candidatura à vaga de ${job.title}`,
      body: `Olá, equipe de seleção da ${job.company}!\n\nGostaria de me candidatar à vaga de ${job.title}.\n\n${resumo}\n\nAtenciosamente,\n${nome}`,
      source: 'ai',
    });
    return;
  }

  if (allowAutomatic) {
    res.json({
      type: 'automatic',
      planId: `plan-${crypto.randomUUID().slice(0, 8)}`,
      summary: `Enviar currículo e respostas rápidas para a vaga de ${job?.title || 'emprego'}.`,
    });
    return;
  }

  res.json({
    type: 'manual',
    instructions: 'Siga as orientações de contato do recrutador informadas na vaga.',
  });
}

export function handleEnviarCandidatura(req: Request, res: Response): void {
  const body = req.body ?? {};
  const jobId = typeof body.jobId === 'string' && body.jobId.trim() ? body.jobId.trim() : '';

  if (!jobId) {
    res.status(400).json({ error: 'Identificador da vaga é obrigatório.' });
    return;
  }

  const sessionId = req.cookies?.[SESSION_COOKIE];
  const user = sessionId ? getPublicUserBySession(sessionId) : null;
  const userId = user?.id;
  const vaga = VAGAS_OPORTUNIDADES.find((v) => v.id === jobId);

  const protocolNumber = crypto.randomUUID().slice(0, 8).toUpperCase();
  const applicationId = `REC-${protocolNumber}`;

  const whatsappPhone =
    typeof body.whatsappPhone === 'string' && body.whatsappPhone.trim()
      ? body.whatsappPhone.replace(/\D/g, '')
      : vaga?.tracking.channel === 'phone' && vaga.tracking.phone
        ? vaga.tracking.phone.replace(/\D/g, '')
        : '11987654321';

  const createdAt = new Date().toISOString();

  const novaCandidatura: CandidaturaRegistrada = {
    applicationId,
    userId,
    jobId,
    jobTitle:
      typeof body.jobTitle === 'string' && body.jobTitle.trim()
        ? body.jobTitle.trim()
        : vaga?.title || 'Vaga Afirmativa 50+',
    company:
      typeof body.company === 'string' && body.company.trim()
        ? body.company.trim()
        : vaga?.company || 'Empresa Parceira 50+',
    location:
      typeof body.location === 'string' && body.location.trim()
        ? body.location.trim()
        : vaga?.location || 'São Paulo, SP',
    workMode:
      typeof body.workMode === 'string' && body.workMode.trim()
        ? body.workMode.trim()
        : vaga?.workMode || 'Presencial',
    compensation:
      typeof body.compensation === 'string' && body.compensation.trim()
        ? body.compensation.trim()
        : vaga?.compensation || 'A combinar',
    recruiterName:
      typeof body.recruiterName === 'string' && body.recruiterName.trim()
        ? body.recruiterName.trim()
        : vaga?.recruiter.name || 'Equipe de RH 50+',
    recruiterContact:
      typeof body.recruiterContact === 'string' && body.recruiterContact.trim()
        ? body.recruiterContact.trim()
        : vaga?.recruiter.contact || 'Contato via WhatsApp',
    whatsappPhone,
    availability:
      typeof body.availability === 'string' && body.availability.trim()
        ? body.availability.trim().slice(0, 200)
        : 'Disponibilidade imediata',
    salaryExpectation:
      typeof body.salaryExpectation === 'string' && body.salaryExpectation.trim()
        ? body.salaryExpectation.trim().slice(0, 200)
        : 'Compatível com a vaga',
    appliedAt:
      typeof body.appliedAt === 'string' && body.appliedAt.trim()
        ? body.appliedAt.trim().slice(0, 40)
        : new Date().toLocaleDateString('pt-BR'),
    status: 'submitted',
    createdAt,
  };

  const insertStmt = db.prepare(`
    INSERT INTO candidaturas (
      applicationId, userId, jobId, jobTitle, company, data, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertStmt.run(
    applicationId,
    userId ?? null,
    novaCandidatura.jobId,
    novaCandidatura.jobTitle,
    novaCandidatura.company,
    JSON.stringify(novaCandidatura),
    createdAt
  );

  res.status(201).json({
    status: 'submitted',
    applicationId,
    candidatura: novaCandidatura,
  });
}

export function handleListarCandidaturas(req: Request, res: Response): void {
  const sessionId = req.cookies?.[SESSION_COOKIE];
  const user = sessionId ? getPublicUserBySession(sessionId) : null;
  const queryUserId =
    typeof req.query?.userId === 'string' && req.query.userId.trim()
      ? req.query.userId.trim()
      : undefined;
  const activeUserId = user?.id || queryUserId;

  let rows: CandidaturaRow[];
  if (activeUserId) {
    const stmt = db.prepare(
      'SELECT * FROM candidaturas WHERE userId IS NULL OR userId = ? ORDER BY createdAt ASC'
    );
    rows = stmt.all(activeUserId) as unknown as CandidaturaRow[];
  } else {
    const stmt = db.prepare('SELECT * FROM candidaturas ORDER BY createdAt ASC');
    rows = stmt.all() as unknown as CandidaturaRow[];
  }

  const lista = rows
    .map(mapRowToCandidatura)
    .filter((item): item is CandidaturaRegistrada => item !== null);

  res.json({
    sucesso: true,
    total: lista.length,
    candidaturas: lista,
  });
}
