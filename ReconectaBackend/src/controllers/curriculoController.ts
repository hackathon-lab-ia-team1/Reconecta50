import type { Request, Response } from 'express';
import { gerarCurriculoComIA } from '../services/geminiService.js';

/**
 * POST /api/curriculo/gerar
 * Aceita texto digitado ou texto de transcrição de áudio.
 */
export async function handleGerarCurriculo(req: Request, res: Response): Promise<void> {
  try {
    const resultado = await gerarCurriculoComIA(req.body);
    res.json(resultado);
  } catch (error) {
    console.error('[curriculo/gerar] Erro:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Não foi possível gerar o currículo no momento.',
    });
  }
}
