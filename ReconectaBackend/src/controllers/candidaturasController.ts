import crypto from 'node:crypto';
import type { Request, Response } from 'express';
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
  status: 'submitted';
  createdAt: string;
}

const candidaturasStore: CandidaturaRegistrada[] = [];

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
  const vaga = VAGAS_OPORTUNIDADES.find((v) => v.id === jobId);

  const protocolNumber = crypto.randomUUID().slice(0, 8).toUpperCase();
  const applicationId = `REC-${protocolNumber}`;

  const whatsappPhone =
    typeof body.whatsappPhone === 'string' && body.whatsappPhone.trim()
      ? body.whatsappPhone.replace(/\D/g, '')
      : vaga?.tracking.channel === 'phone' && vaga.tracking.phone
        ? vaga.tracking.phone.replace(/\D/g, '')
        : '11987654321';

  const novaCandidatura: CandidaturaRegistrada = {
    applicationId,
    userId: user?.id,
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
    status: 'submitted',
    createdAt: new Date().toISOString(),
  };

  const existingIndex = candidaturasStore.findIndex(
    (c) => c.jobId === jobId && c.userId === user?.id
  );
  if (existingIndex >= 0) {
    candidaturasStore[existingIndex] = novaCandidatura;
  } else {
    candidaturasStore.push(novaCandidatura);
  }

  res.status(201).json({
    status: 'submitted',
    applicationId,
    candidatura: novaCandidatura,
  });
}

export function handleListarCandidaturas(req: Request, res: Response): void {
  const sessionId = req.cookies?.[SESSION_COOKIE];
  const user = sessionId ? getPublicUserBySession(sessionId) : null;

  const lista = user
    ? candidaturasStore.filter((c) => !c.userId || c.userId === user.id)
    : candidaturasStore;

  res.json({
    sucesso: true,
    total: lista.length,
    candidaturas: lista,
  });
}
