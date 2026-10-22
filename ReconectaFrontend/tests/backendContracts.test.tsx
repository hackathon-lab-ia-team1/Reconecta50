import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { generateResume } from '../src/features/career/services/resumeGenerationService';
import { parseResumeResponse } from '../src/features/career/utils/parseResumeResponse';
import { JobCatalog } from '../src/features/jobs/components/JobCatalog';
import { getJobCatalog } from '../src/features/jobs/services/jobCatalogService';

const response = {
  sucesso: true,
  origem: 'gemini_api',
  curriculo: {
    nome: 'Ana',
    resumoProfissional: 'Experiência em atendimento.',
    competenciasChave: ['Organização', 'Comunicação'],
    experienciaFormatada: [
      {
        cargo: 'Recepcionista',
        periodo: '2020–2024',
        responsabilidades: ['Atendimento ao público.', 'Agendamento de consultas.'],
      },
    ],
    mensagemApoio: 'Sua experiência tem valor.',
  },
};
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it('gera currículo em JSON e adapta o contrato português do backend ao editor', async () => {
  vi.stubEnv('VITE_RESUME_GENERATE_URL', '/api/curriculo/gerar');
  const request = vi.fn().mockResolvedValue(new Response(JSON.stringify(response)));
  vi.stubGlobal('fetch', request);
  expect(
    await generateResume({ source: 'text', text: 'Fui recepcionista de 2020 a 2024.' }),
  ).toEqual({
    summary: 'Experiência em atendimento.',
    role: 'Recepcionista',
    company: '',
    period: '2020–2024',
    activities: 'Atendimento ao público.\nAgendamento de consultas.',
    skills: 'Organização, Comunicação',
  });
  expect(request.mock.calls[0][0]).toBe('/api/curriculo/gerar');
  expect(request.mock.calls[0][1].headers).toEqual({ 'Content-Type': 'application/json' });
});

it('não substitui o currículo por um mock ou descarta experiências silenciosamente', () => {
  expect(() => parseResumeResponse({ ...response, origem: 'mock_desenvolvimento' })).toThrow(
    /demonstração/,
  );
  expect(
    parseResumeResponse({
      ...response,
      curriculo: {
        ...response.curriculo,
        experienciaFormatada: [
          ...response.curriculo.experienciaFormatada,
          ...response.curriculo.experienciaFormatada,
        ],
      },
    }).activities,
  ).toContain('Recepcionista');
});

it('não envia áudio à rota JSON quando o servidor não suporta arquivos', async () => {
  vi.stubEnv('VITE_RESUME_GENERATE_URL', '/api/curriculo/gerar');
  vi.stubEnv('VITE_RESUME_AUDIO_GENERATE_URL', '');
  const request = vi.fn();
  vi.stubGlobal('fetch', request);
  await expect(
    generateResume({ source: 'audio', audio: new Blob(['audio'], { type: 'audio/webm' }) }),
  ).rejects.toThrow(/Nenhum áudio foi enviado/);
  expect(request).not.toHaveBeenCalled();
});

it('carrega vagas estáticas por GET e identifica os exemplos sem oferecer candidatura', async () => {
  vi.stubEnv('VITE_JOBS_URL', '/api/vagas');
  const request = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        sucesso: true,
        total: 1,
        vagas: [
          {
            id: 1,
            titulo: 'Recepcionista',
            empresa: 'Clínica',
            modelo: 'Presencial',
            localizacao: 'São Paulo',
            descricao: 'Atendimento ao público.',
            requisitos: ['Organização'],
            beneficios: ['Vale-transporte'],
          },
        ],
      }),
    ),
  );
  vi.stubGlobal('fetch', request);
  render(<JobCatalog />);
  await screen.findByRole('heading', { name: 'Recepcionista' });
  expect(screen.getByRole('heading', { name: 'Vagas de demonstração' })).toBeTruthy();
  expect(screen.getByText(/Não são recomendações da IA/)).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Quero me candidatar' })).toBeNull();
  expect(request.mock.calls[0][0]).toBe('/api/vagas');
  expect(request.mock.calls[0][1].method).toBeUndefined();
  expect(request.mock.calls[0][1].body).toBeUndefined();
});

it('recusa vagas estáticas malformadas', async () => {
  vi.stubEnv('VITE_JOBS_URL', '/api/vagas');
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response(JSON.stringify({ sucesso: true, vagas: [{ id: 1 }] }))),
  );
  await expect(getJobCatalog(new AbortController().signal)).rejects.toThrow(/Faltaram informações/);
});
