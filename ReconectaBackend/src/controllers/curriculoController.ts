import type { Request, Response } from 'express';
import {
  gerarCurriculoComIA,
  sanitizarTextoCandidato,
  MAX_RELATO_LENGTH,
} from '../services/geminiService.js';
import type { FormularioCurriculo } from '../types/curriculo.types.js';

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
    console.error('[curriculo/gerar] Erro:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Não foi possível gerar o currículo no momento.',
    });
  }
}
