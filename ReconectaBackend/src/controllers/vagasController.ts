import type { Request, Response } from 'express';
import { VAGAS_AFIRMATIVAS } from '../data/mocks/vagas.mock.js';

export function handleListarVagas(_req: Request, res: Response): void {
  res.json({
    sucesso: true,
    total: VAGAS_AFIRMATIVAS.length,
    vagas: VAGAS_AFIRMATIVAS,
  });
}
