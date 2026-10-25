import type { Request, Response } from 'express';
import { VAGAS_AFIRMATIVAS } from '../data/mocks/vagas.mock.js';
import { recomendarVagasComIA } from '../services/geminiService.js';

export function handleListarVagas(_req: Request, res: Response): void {
  res.json({
    sucesso: true,
    total: VAGAS_AFIRMATIVAS.length,
    vagas: VAGAS_AFIRMATIVAS,
  });
}

/**
 * POST /api/vagas/recomendadas
 * Recebe { resume: { summary, role, skills, activities, ... } }
 * e retorna { recommendations: [{ isCompatible, job, reason, matchedSkills }] }
 */
export async function handleRecomendarVagas(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      res.status(400).json({ error: 'Currículo inválido para recomendação.' });
      return;
    }

    const resume =
      body.resume && typeof body.resume === 'object' && !Array.isArray(body.resume)
        ? body.resume
        : body;

    const resultado = await recomendarVagasComIA(resume);
    res.json(resultado);
  } catch (error) {
    console.error('[vagas/recomendadas] Erro:', error);
    res.status(500).json({ error: 'Não foi possível analisar as vagas no momento.' });
  }
}
