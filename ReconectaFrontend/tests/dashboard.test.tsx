import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { App } from '../src/app/App';
import { downloadResumePdf } from '../src/features/career/services/resumePdfService';

vi.mock('../src/features/career/services/resumePdfService', () => ({
  downloadResumePdf: vi.fn().mockResolvedValue(undefined),
}));

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/dashboard');
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function navigate(label: string) {
  const navigation = screen.getByRole('navigation', { name: 'Navegação do painel' });
  fireEvent.click(within(navigation).getByRole('link', { name: label }));
}

describe('Dashboard', () => {
  it('protege a edição manual durante a geração e libera os campos ao cancelar', async () => {
    window.history.replaceState({}, '', '/curriculo');
    vi.stubEnv('VITE_RESUME_GENERATE_URL', '/resume/generate');
    let complete!: (response: Response) => void;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(
        () =>
          new Promise<Response>((resolve) => {
            complete = resolve;
          }),
      ),
    );
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Preencher currículo manualmente' }));
    const summary = screen.getByLabelText('Apresentação profissional') as HTMLTextAreaElement;
    fireEvent.change(summary, { target: { value: 'Meu rascunho manual.' } });
    fireEvent.change(screen.getByLabelText('Texto revisável: 1. Função que você procura'), {
      target: { value: 'Recepcionista' },
    });
    fireEvent.change(screen.getByLabelText('Texto revisável: 2. Experiências profissionais'), {
      target: { value: 'Meu relato profissional.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Criar currículo com os textos das etapas' }));
    expect((summary.closest('fieldset') as HTMLFieldSetElement).disabled).toBe(true);
    expect(
      screen.getByRole('button', { name: 'Baixar currículo em PDF' }).hasAttribute('disabled'),
    ).toBe(true);
    fireEvent.change(summary, { target: { value: 'Alteração durante a geração.' } });
    expect(summary.value).toBe('Meu rascunho manual.');
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar criação' }));
    expect((summary.closest('fieldset') as HTMLFieldSetElement).disabled).toBe(false);
    await act(async () =>
      complete(
        new Response(
          JSON.stringify({ resume: { summary: 'Resposta atrasada.', role: 'Recepcionista' } }),
        ),
      ),
    );
    expect(summary.value).toBe('Meu rascunho manual.');
  });

  it('abre o formulário manual pelo botão e mantém o rascunho ao recolher', () => {
    window.history.replaceState({}, '', '/curriculo');
    render(<App />);
    const toggle = screen.getByRole('button', { name: 'Preencher currículo manualmente' });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('heading', { name: 'Vamos organizar sua história' })).toBeNull();
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    const summary = screen.getByRole('textbox', { name: 'Apresentação profissional' });
    expect(document.activeElement).toBe(summary);
    fireEvent.change(summary, { target: { value: 'Meu rascunho de experiência.' } });
    fireEvent.click(toggle);
    expect(screen.queryByRole('textbox', { name: 'Apresentação profissional' })).toBeNull();
    fireEvent.click(toggle);
    expect(
      (screen.getByRole('textbox', { name: 'Apresentação profissional' }) as HTMLTextAreaElement)
        .value,
    ).toBe('Meu rascunho de experiência.');
  });

  it('atualiza o currículo automaticamente com a IA, exibe o banner de pronto e o disponibiliza para as recomendações', async () => {
    window.history.replaceState({}, '', '/curriculo');
    vi.stubEnv('VITE_RESUME_GENERATE_URL', '/resume/generate');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            resume: { summary: 'Experiência em atendimento.', role: 'Recepcionista' },
          }),
        ),
      ),
    );
    render(<App />);
    fireEvent.change(screen.getByLabelText('Texto revisável: 1. Função que você procura'), {
      target: { value: 'Recepcionista' },
    });
    fireEvent.change(screen.getByLabelText('Texto revisável: 2. Experiências profissionais'), {
      target: { value: 'Trabalhei como recepcionista.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Criar currículo com os textos das etapas' }));
    await screen.findByRole('heading', { name: '🎉 Seu currículo Reconecta 50+ está pronto!' });
    expect(
      screen.getByRole('link', { name: 'Ver vagas recomendadas para meu perfil ➜' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', {
        name: '🎙️ Quer refazer ou atualizar seu currículo com a IA? Clique aqui',
      }),
    ).toBeTruthy();
    const manualToggle = screen.getByRole('button', { name: 'Fazer ajustes manuais no texto' });
    expect(manualToggle.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(manualToggle);
    expect(manualToggle.getAttribute('aria-expanded')).toBe('true');
    expect(
      (screen.getByRole('textbox', { name: 'Função ou trabalho' }) as HTMLInputElement).value,
    ).toBe('Recepcionista');
    expect(
      (screen.getByLabelText('Função ou trabalho').closest('fieldset') as HTMLFieldSetElement)
        .disabled,
    ).toBe(false);
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByLabelText('Apresentação profissional')),
    );
    navigate('Vagas recomendadas');
    expect(screen.getByRole('button', { name: 'Encontrar vagas para meu currículo' })).toBeTruthy();
    expect(
      screen.queryByRole('heading', { name: '🔒 Esta área requer seu currículo pronto' }),
    ).toBeNull();
    navigate('Meu currículo');
    expect(
      screen.getByRole('heading', { name: '🎉 Seu currículo Reconecta 50+ está pronto!' }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Fazer ajustes manuais no texto' }));
    expect(
      (screen.getByRole('textbox', { name: 'Função ou trabalho' }) as HTMLInputElement).value,
    ).toBe('Recepcionista');
  });

  it('explica vagas recomendadas, canais de contato e candidaturas na ajuda inicial', () => {
    render(<App />);
    const help = screen.getByRole('list', { name: 'Como usar o painel' });
    expect(
      within(help).getByRole('link', { name: 'Vagas recomendadas:' }).getAttribute('href'),
    ).toBe('/vagas-recomendadas');
    expect(help.textContent).toContain('Gupy, Indeed ou LinkedIn');
    expect(help.textContent).toContain('e-mail, celular/WhatsApp');
    expect(help.textContent).toContain('candidaturas já enviadas');
    fireEvent.click(screen.getByRole('button', { name: 'Precisa de ajuda para começar?' }));
    expect(screen.queryByRole('list', { name: 'Como usar o painel' })).toBeNull();
  });

  it('não permite atualizar a prévia com resumo e função contendo apenas espaços', () => {
    window.history.replaceState({}, '', '/curriculo');
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Preencher currículo manualmente' }));
    fireEvent.change(screen.getByLabelText('Apresentação profissional'), {
      target: { value: '   ' },
    });
    fireEvent.change(screen.getByLabelText('Função ou trabalho'), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Atualizar prévia do currículo' }));
    expect(screen.getByText('Escreva uma apresentação profissional.')).toBeTruthy();
    expect(screen.getByText('Informe uma função ou trabalho.')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('Apresentação profissional'));
    expect(
      screen.getByRole('button', { name: 'Baixar currículo em PDF' }).hasAttribute('disabled'),
    ).toBe(true);
  });

  it('permite abrir o painel pelo login sem simular uma autenticação', () => {
    window.history.replaceState({}, '', '/dashboard');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Que bom ter você por aqui!',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('navega pelas áreas do painel com indicação da página atual e preserva a fonte', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Diminuir texto' }));
    for (const label of ['Meu perfil', 'Meu currículo', 'Minhas vagas', 'Capacitação']) {
      navigate(label);
      expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(label);
      expect(screen.getByRole('heading', { level: 1 })).toBe(document.activeElement);
      expect(document.documentElement.style.fontSize).toBe('120%');
      const nav = screen.getByRole('navigation', { name: 'Navegação do painel' });
      expect(within(nav).getByRole('link', { name: label }).getAttribute('aria-current')).toBe(
        'page',
      );
    }
  });

  it('mantém perfil e currículo durante a navegação e persiste o currículo contra F5 sem gravar dados pessoais no localStorage', async () => {
    render(<App />);
    navigate('Meu perfil');
    fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: 'Ana Souza' } });
    fireEvent.change(screen.getByLabelText('Telefone com DDD'), {
      target: { value: '85999999999' },
    });
    fireEvent.change(screen.getByLabelText('Data de nascimento'), {
      target: { value: '1960-01-01' },
    });
    fireEvent.change(screen.getByLabelText('Endereço'), {
      target: { value: 'Rua das Flores, 10, Fortaleza, CE' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Atualizar meu perfil' }));
    expect(screen.getByRole('status').textContent).toContain('Perfil atualizado');
    navigate('Meu currículo');
    fireEvent.click(screen.getByRole('button', { name: 'Preencher currículo manualmente' }));
    fireEvent.change(screen.getByLabelText('Apresentação profissional'), {
      target: { value: 'Tenho experiência em atendimento.' },
    });
    fireEvent.change(screen.getByLabelText('Função ou trabalho'), {
      target: { value: 'Recepcionista' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Atualizar prévia do currículo' }));
    expect(screen.getByRole('heading', { name: 'Ana Souza' })).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Baixar currículo em PDF' }).hasAttribute('disabled'),
    ).toBe(false);
    fireEvent.change(screen.getByLabelText('Apresentação profissional'), {
      target: { value: 'Resumo profissional revisado.' },
    });
    expect(
      screen.getByRole('button', { name: 'Baixar currículo em PDF' }).hasAttribute('disabled'),
    ).toBe(true);
    expect(
      screen.getByText('Atualize o currículo para incluir suas alterações no PDF.'),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Atualizar prévia do currículo' }));
    expect(
      screen.getByRole('button', { name: 'Baixar currículo em PDF' }).hasAttribute('disabled'),
    ).toBe(false);
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    vi.mocked(downloadResumePdf).mockRejectedValueOnce(new Error('Falha de download'));
    fireEvent.click(screen.getByRole('button', { name: 'Baixar currículo em PDF' }));
    await screen.findByText('Não foi possível baixar o PDF. Tente novamente.');
    fireEvent.click(screen.getByRole('button', { name: 'Baixar currículo em PDF' }));
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Baixar currículo em PDF' }).hasAttribute('disabled'),
      ).toBe(false),
    );
    expect(downloadResumePdf).toHaveBeenLastCalledWith(
      expect.objectContaining({ fullName: 'Ana Souza' }),
      expect.objectContaining({ summary: 'Resumo profissional revisado.' }),
    );
    expect(print).not.toHaveBeenCalled();
    navigate('Visão geral');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Olá, Ana!');
    navigate('Meu currículo');
    fireEvent.click(screen.getByRole('button', { name: 'Fazer ajustes manuais no texto' }));
    expect((screen.getByLabelText('Função ou trabalho') as HTMLInputElement).value).toBe(
      'Recepcionista',
    );
    expect(Object.keys(localStorage).sort()).toEqual(
      ['reconecta.fontScale', 'reconecta_resume_guest'].sort(),
    );
  });

  it('apresenta Minhas vagas sem candidaturas ou status inventados', () => {
    window.history.replaceState({}, '', '/minhas-vagas');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    render(<App />);
    expect(
      screen.getByRole('heading', { name: 'Suas próximas oportunidades vão aparecer aqui' }),
    ).toBeTruthy();
    expect(
      screen.getByText('O acompanhamento de candidaturas ainda não está disponível nesta prévia.'),
    ).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sincroniza e restaura candidaturas salvas no backend e localStorage na página Minhas vagas após F5', async () => {
    window.history.replaceState({}, '', '/minhas-vagas');
    vi.stubEnv('VITE_CANDIDATURAS_URL', '/api/candidaturas');
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          sucesso: true,
          total: 1,
          candidaturas: [
            {
              applicationId: 'REC-998877',
              jobId: 'vaga-farmamais-50',
              jobTitle: 'Assistente de Atendimento e Relacionamento',
              company: 'Rede FarmaMais (Programa 50+ Ativo)',
              location: 'São Paulo, SP',
              workMode: 'Presencial',
              compensation: 'R$ 2.350 por mês',
              recruiterName: 'Patrícia Almeida',
              recruiterContact: 'WhatsApp: (11) 98765-4321',
              whatsappPhone: '11987654321',
              availability: 'Imediata',
              salaryExpectation: 'Compatível com a vaga',
              appliedAt: '25/10/2026',
              status: 'submitted',
            },
          ],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    const view = render(<App />);
    await screen.findByText('Protocolo: REC-998877');
    expect(
      screen.getByRole('heading', { name: 'Assistente de Atendimento e Relacionamento' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Falar com o recrutador no WhatsApp' }).getAttribute('href'),
    ).toContain('wa.me/5511987654321');
    view.unmount();

    // Simula F5 mesmo sem rede (lendo do localStorage)
    vi.stubEnv('VITE_CANDIDATURAS_URL', '');
    render(<App />);
    expect(screen.getByText('Protocolo: REC-998877')).toBeTruthy();
    expect(
      screen.getByRole('heading', { name: 'Assistente de Atendimento e Relacionamento' }),
    ).toBeTruthy();
  });

  it('valida os novos dados do perfil e foca o primeiro erro', () => {
    window.history.replaceState({}, '', '/perfil');
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Atualizar meu perfil' }));
    expect(document.activeElement).toBe(screen.getByLabelText('Nome completo'));
    expect(screen.getByText('Informe uma data de nascimento válida.')).toBeTruthy();
    expect(screen.getByText('Informe seu endereço.')).toBeTruthy();
  });

  it('valida a confirmação da nova senha sem alterar os dados do perfil', () => {
    window.history.replaceState({}, '', '/perfil');
    render(<App />);
    fireEvent.change(screen.getByLabelText('Senha atual'), { target: { value: 'senha antiga' } });
    fireEvent.change(screen.getByLabelText('Nova senha'), {
      target: { value: 'nova senha segura' },
    });
    fireEvent.change(screen.getByLabelText('Confirme a nova senha'), {
      target: { value: 'senha diferente' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Alterar minha senha' }));
    expect(screen.getByText('As senhas precisam ser iguais.')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('Confirme a nova senha'));
  });
});
