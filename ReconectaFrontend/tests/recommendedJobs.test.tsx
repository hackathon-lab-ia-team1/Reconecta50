import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../src/app/App';
import { JobCard } from '../src/features/jobs/components/JobCard';
import { demoJobs } from './fixtures/jobs';
import { filterJobs } from '../src/features/jobs/utils/filterJobs';
import { recommendJobs } from '../src/features/jobs/services/jobRecommendationsService';
import { useJobRecommendations } from '../src/features/jobs/hooks/useJobRecommendations';
import { CareerContext } from '../src/features/career/CareerContext';
import { RecommendedJobsPage } from '../src/pages/RecommendedJobsPage';
import { JobApplicationProvider } from '../src/features/jobs/JobApplicationProvider';

const resume = {
  summary: 'Experiência em atendimento.',
  role: 'Recepcionista',
  company: '',
  period: '',
  activities: '',
  skills: 'Organização',
};
const profile = { fullName: '', phone: '', birthDate: '', address: '' };
const recommendations = demoJobs.map((job) => ({
  isCompatible: true,
  reason: `Compatibilidade profissional para ${job.title}.`,
  matchedSkills: ['Organização'],
  job: { ...job, isDemo: false },
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <JobApplicationProvider>
        <CareerContext.Provider
          value={{
            resume,
            profile,
            updateProfile: vi.fn(),
            updateResume: vi.fn(),
            resetCareer: vi.fn(),
            profileStatus: 'idle',
            profileError: '',
            reloadProfile: vi.fn().mockResolvedValue(undefined),
          }}
        >
          <RecommendedJobsPage />
        </CareerContext.Provider>
      </JobApplicationProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/vagas-recomendadas');
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  vi.stubEnv('VITE_JOB_RECOMMENDATIONS_URL', 'https://api.example/recommendations');
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('Vagas recomendadas por currículo', () => {
  it('exige um currículo e não mostra vagas genéricas nem busca catálogo ao abrir a página', () => {
    vi.stubEnv('VITE_JOBS_URL', 'http://localhost:3001/api/vagas');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    render(<App />);
    expect(
      screen.getByRole('heading', { name: '🔒 Esta área requer seu currículo pronto' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Criar meu currículo agora (Passo 2) ➜' }),
    ).toBeTruthy();
    expect(screen.queryByRole('article')).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('informa a integração pendente sem enviar o currículo ou inventar recomendações', async () => {
    vi.stubEnv('VITE_JOB_RECOMMENDATIONS_URL', '');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Encontrar vagas para meu currículo' }));
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain('Seu currículo não foi enviado'),
    );
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.queryByRole('article')).toBeNull();
  });

  it('envia apenas o currículo profissional e exibe somente itens compatíveis, reais e únicos', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          recommendations: [
            recommendations[0],
            { ...recommendations[1], isCompatible: false },
            { ...recommendations[2], job: { ...recommendations[2].job, isDemo: true } },
            recommendations[0],
          ],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Encontrar vagas para meu currículo' }));
    await screen.findByRole('article');
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByText(recommendations[0].reason)).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Auxiliar administrativo' })).toBeNull();
    const request = fetchMock.mock.calls[0][1];
    expect(request.credentials).toBe('include');
    expect(JSON.parse(request.body)).toEqual({ resume });
  });

  it('filtra apenas o conjunto compatível e permite limpar os filtros', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ recommendations }), { status: 200 })),
    );
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Encontrar vagas para meu currículo' }));
    await screen.findByRole('heading', { name: 'Recepcionista' });
    fireEvent.change(screen.getByLabelText('Onde acompanhar'), { target: { value: 'Gupy' } });
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByRole('heading', { name: 'Atendente de loja' })).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Buscar por função, empresa ou local'), {
      target: { value: 'sem resultado' },
    });
    expect(screen.getByRole('heading', { name: 'Nenhuma vaga com esses filtros' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }));
    expect(screen.getAllByRole('article')).toHaveLength(5);
  });

  it('oculta vagas sem interesse e permite mostrá-las novamente', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ recommendations }))),
    );
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Encontrar vagas para meu currículo' }));
    await screen.findByRole('heading', { name: 'Recepcionista' });
    const card = screen.getByRole('article', { name: 'Recepcionista' });
    expect(within(card).getByRole('button', { name: 'Quero me candidatar' })).toBeTruthy();
    fireEvent.click(within(card).getByRole('button', { name: 'Não tenho interesse' }));
    expect(screen.queryByRole('article', { name: 'Recepcionista' })).toBeNull();
    expect(screen.getAllByRole('article')).toHaveLength(4);
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar vagas ocultadas (1)' }));
    expect(screen.getByRole('article', { name: 'Recepcionista' })).toBeTruthy();
    expect(screen.getAllByRole('article')).toHaveLength(5);
  });

  it('retira os resultados anteriores quando o currículo muda', async () => {
    const request = vi
      .fn()
      .mockResolvedValue([
        { job: recommendations[0].job, reason: recommendations[0].reason, matchedSkills: [] },
      ]);
    const { result, rerender } = renderHook(({ draft }) => useJobRecommendations(draft, request), {
      initialProps: { draft: resume },
    });
    await act(async () => result.current.refresh());
    expect(result.current.recommendations).toHaveLength(1);
    rerender({ draft: { ...resume, role: 'Auxiliar administrativo' } });
    expect(result.current.recommendations).toHaveLength(0);
    expect(result.current.completed).toBe(false);
  });

  it('não mantém a busca carregando ao retornar a um currículo cuja solicitação foi cancelada', async () => {
    let previousSignal: AbortSignal | undefined;
    let finish!: () => void;
    const request = vi.fn().mockImplementation((_draft, signal?: AbortSignal) => {
      previousSignal = signal;
      return new Promise<[]>((resolve) => {
        finish = () => resolve([]);
      });
    });
    const { result, rerender } = renderHook(({ draft }) => useJobRecommendations(draft, request), {
      initialProps: { draft: resume },
    });
    act(() => {
      void result.current.refresh();
    });
    expect(result.current.loading).toBe(true);
    rerender({ draft: { ...resume, role: 'Auxiliar administrativo' } });
    expect(previousSignal?.aborted).toBe(true);
    rerender({ draft: resume });
    expect(result.current.loading).toBe(false);
    await act(async () => finish());
    expect(result.current.completed).toBe(false);
    expect(result.current.recommendations).toHaveLength(0);
  });

  it('não substitui ausência de compatibilidade por vagas genéricas', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ recommendations: [{ isCompatible: false }] }), {
          status: 200,
        }),
      ),
    );
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Encontrar vagas para meu currículo' }));
    await screen.findByRole('heading', { name: 'Ainda não encontramos vagas compatíveis' });
    expect(screen.queryByRole('article')).toBeNull();
  });

  it('recusa respostas sem a informação explícita de compatibilidade', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ recommendations: [{ job: recommendations[0].job }] }), {
          status: 200,
        }),
      ),
    );
    await expect(recommendJobs(resume)).rejects.toThrow('compatibilidade');
  });

  it('busca por local sem acentos sem modificar os dados originais', () => {
    const originalOrder = demoJobs.map((job) => job.id);
    expect(filterJobs(demoJobs, 'sao paulo', 'external').map((job) => job.id)).toEqual([
      'demo-indeed',
    ]);
    expect(demoJobs.map((job) => job.id)).toEqual(originalOrder);
  });

  it('mantém Minhas vagas como área separada na navegação', () => {
    render(<App />);
    const nav = screen.getByRole('navigation', { name: 'Navegação do painel' });
    expect(
      within(nav).getByRole('link', { name: 'Vagas recomendadas' }).getAttribute('aria-current'),
    ).toBe('page');
    fireEvent.click(within(nav).getByRole('link', { name: 'Minhas vagas' }));
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Minhas vagas');
  });

  it('só oferece candidatura externa para vaga real com URL HTTPS', () => {
    const view = render(
      <JobCard
        job={{
          ...demoJobs[0],
          application: undefined,
          isDemo: false,
          applicationUrl: 'javascript:alert(1)',
        }}
      />,
    );
    expect(screen.queryByRole('link')).toBeNull();
    view.rerender(
      <JobCard
        job={{
          ...demoJobs[0],
          application: undefined,
          isDemo: false,
          applicationUrl: 'https://example.com/vaga/1',
        }}
      />,
    );
    expect(
      screen.getByRole('link', { name: /Ver anúncio e candidatura/ }).getAttribute('rel'),
    ).toBe('noopener noreferrer');
  });
});
