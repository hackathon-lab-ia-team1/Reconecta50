import type { Request, Response } from 'express';
import { db } from '../data/db.js';
import {
  gerarCurriculoComIA,
  sanitizarTextoCandidato,
  MAX_RELATO_LENGTH,
  AIUnavailableError,
} from '../services/geminiService.js';
import { SESSION_COOKIE } from '../middlewares/authMiddleware.js';
import { getPublicUserBySession } from '../services/authService.js';
import type { FormularioCurriculo } from '../types/curriculo.types.js';

export interface CurriculoSalvoDraft {
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
  updatedAt?: string;
}

interface CurriculoRow {
  userId: string;
  data: string;
  updatedAt: string;
}

export function loadCurriculos(): void {
  // Inicialização gerenciada pelo SQLite (db.ts e seed.ts)
}

export function getCurriculosCount(): number {
  const stmt = db.prepare('SELECT COUNT(*) as total FROM curriculos');
  const row = stmt.get() as { total: number } | undefined;
  return Number(row?.total ?? 0);
}

function resolveOwnerKey(req: Request): string {
  const sessionId = req.cookies?.[SESSION_COOKIE];
  const user = sessionId ? getPublicUserBySession(sessionId) : null;
  if (user?.id) return user.id;

  const bodyUserId =
    typeof req.body?.userId === 'string' && req.body.userId.trim() ? req.body.userId.trim() : '';
  if (bodyUserId) return bodyUserId;

  const queryUserId =
    typeof req.query?.userId === 'string' && req.query.userId.trim() ? req.query.userId.trim() : '';
  if (queryUserId) return queryUserId;

  if (sessionId) return `session:${sessionId}`;
  return 'guest';
}

function sanitizeDraftField(value: unknown, maxLength = 4000): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

/**
 * POST /api/curriculo/salvar
 * Salva o ResumeDraft associado ao usuário logado (ou anônimo/sessionId) na tabela curriculos do SQLite.
 */
export function handleSalvarCurriculo(req: Request, res: Response): void {
  try {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      res.status(400).json({ sucesso: false, erro: 'Formato de currículo inválido.' });
      return;
    }

    const source =
      body.resume && typeof body.resume === 'object' && !Array.isArray(body.resume)
        ? (body.resume as Record<string, unknown>)
        : (body as Record<string, unknown>);

    const updatedAt = new Date().toISOString();

    const draft: CurriculoSalvoDraft = {
      summary: sanitizeDraftField(source.summary, 4000),
      role: sanitizeDraftField(source.role, 300),
      company: sanitizeDraftField(source.company, 300),
      period: sanitizeDraftField(source.period, 200),
      activities: sanitizeDraftField(source.activities, 6000),
      skills: sanitizeDraftField(source.skills, 2000),
      ...(typeof source.targetRole === 'string'
        ? { targetRole: sanitizeDraftField(source.targetRole, 300) }
        : {}),
      ...(typeof source.education === 'string'
        ? { education: sanitizeDraftField(source.education, 1000) }
        : {}),
      ...(typeof source.languages === 'string'
        ? { languages: sanitizeDraftField(source.languages, 500) }
        : {}),
      ...(typeof source.additionalContacts === 'string'
        ? { additionalContacts: sanitizeDraftField(source.additionalContacts, 500) }
        : {}),
      updatedAt,
    };

    const ownerKey = resolveOwnerKey(req);
    const stmt = db.prepare(
      'INSERT OR REPLACE INTO curriculos (userId, data, updatedAt) VALUES (?, ?, ?)'
    );
    stmt.run(ownerKey, JSON.stringify(draft), updatedAt);

    res.status(200).json({
      sucesso: true,
      ownerKey,
      resume: draft,
    });
  } catch (error) {
    console.error('[curriculo/salvar] Erro:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Não foi possível salvar o currículo no momento.',
    });
  }
}

/**
 * GET /api/curriculo/meu
 * Retorna o currículo salvo do usuário autenticado (ou sessão/guest) a partir do SQLite.
 */
export function handleObterMeuCurriculo(req: Request, res: Response): void {
  try {
    const ownerKey = resolveOwnerKey(req);
    const stmt = db.prepare('SELECT userId, data, updatedAt FROM curriculos WHERE userId = ? LIMIT 1');
    const row = stmt.get(ownerKey) as CurriculoRow | undefined;

    let saved: CurriculoSalvoDraft | null = null;
    if (row?.data) {
      try {
        const parsed = JSON.parse(row.data) as CurriculoSalvoDraft;
        saved = {
          ...parsed,
          updatedAt: parsed.updatedAt || row.updatedAt,
        };
      } catch {
        saved = null;
      }
    }

    res.status(200).json({
      sucesso: true,
      resume: saved,
    });
  } catch (error) {
    console.error('[curriculo/meu] Erro:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Não foi possível carregar o currículo salvo.',
    });
  }
}

/**
 * POST /api/curriculo/gerar
 * Compatível com ambos os formatos do frontend:
 * 1) { source: 'text', text: '...', sections?: {...} }
 * 2) { usuario: {...}, historico: { ultimaExperiencia: { atividadesTextoOuAudio: '...' } } }
 */
export async function handleGerarCurriculo(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      res.status(400).json({
        sucesso: false,
        erro: 'Formato de requisição inválido.',
      });
      return;
    }

    const payload: FormularioCurriculo = {};

    if (typeof body.text === 'string') {
      const textoLimpo = sanitizarTextoCandidato(body.text);
      payload.source = 'text';
      payload.text = textoLimpo;
      payload.historico = {
        ultimaExperiencia: {
          atividadesTextoOuAudio: textoLimpo,
        },
      };
    }

    if (body.sections && typeof body.sections === 'object') {
      const s = body.sections as Record<string, unknown>;
      payload.sections = {
        targetRole:
          typeof s.targetRole === 'string'
            ? sanitizarTextoCandidato(s.targetRole).slice(0, 200)
            : undefined,
        education:
          typeof s.education === 'string'
            ? sanitizarTextoCandidato(s.education).slice(0, 400)
            : undefined,
        languages:
          typeof s.languages === 'string'
            ? sanitizarTextoCandidato(s.languages).slice(0, 300)
            : undefined,
        experience:
          typeof s.experience === 'string'
            ? sanitizarTextoCandidato(s.experience).slice(0, MAX_RELATO_LENGTH)
            : undefined,
        skills:
          typeof s.skills === 'string'
            ? sanitizarTextoCandidato(s.skills).slice(0, 500)
            : undefined,
        additionalContacts:
          typeof s.additionalContacts === 'string'
            ? sanitizarTextoCandidato(s.additionalContacts).slice(0, 300)
            : undefined,
      };
    }

    if (body.usuario && typeof body.usuario === 'object') {
      payload.usuario = {
        nome:
          typeof body.usuario.nome === 'string'
            ? sanitizarTextoCandidato(body.usuario.nome).slice(0, 120)
            : undefined,
        email:
          typeof body.usuario.email === 'string'
            ? sanitizarTextoCandidato(body.usuario.email).slice(0, 120)
            : undefined,
        telefone:
          typeof body.usuario.telefone === 'string'
            ? sanitizarTextoCandidato(body.usuario.telefone).slice(0, 40)
            : undefined,
      };
    }

    if (body.historico && typeof body.historico === 'object') {
      const exp = body.historico.ultimaExperiencia;
      const atividadesBrutas =
        typeof exp?.atividadesTextoOuAudio === 'string'
          ? exp.atividadesTextoOuAudio
          : payload.text || '';

      payload.historico = {
        ultimaExperiencia: {
          periodo:
            typeof exp?.periodo === 'string'
              ? sanitizarTextoCandidato(exp.periodo).slice(0, 120)
              : undefined,
          cargo:
            typeof exp?.cargo === 'string'
              ? sanitizarTextoCandidato(exp.cargo).slice(0, 120)
              : undefined,
          atividadesTextoOuAudio: sanitizarTextoCandidato(atividadesBrutas).slice(
            0,
            MAX_RELATO_LENGTH
          ),
        },
        outrasHabilidades:
          typeof body.historico.outrasHabilidades === 'string'
            ? sanitizarTextoCandidato(body.historico.outrasHabilidades).slice(0, 500)
            : undefined,
        preferenciaTrabalho:
          typeof body.historico.preferenciaTrabalho === 'string'
            ? sanitizarTextoCandidato(body.historico.preferenciaTrabalho).slice(0, 500)
            : undefined,
      };
    }

    const resultado = await gerarCurriculoComIA(payload);
    res.json(resultado);
  } catch (error) {
    if (error instanceof AIUnavailableError) {
      res.status(error.statusCode).json({
        sucesso: false,
        erro: error.message,
        error: error.message,
      });
      return;
    }
    console.error('[curriculo/gerar] Erro:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Não foi possível gerar o currículo no momento.',
    });
  }
}
