import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render as renderOriginal, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { JobApplicationProvider } from '../src/features/jobs/JobApplicationProvider';
import { JobApplicationActions } from '../src/features/jobs/components/JobApplicationActions';
import {
  prepareApplication,
  submitApplication,
} from '../src/features/jobs/services/jobApplicationService';
import { isValidApplicationEmail } from '../src/features/jobs/utils/applicationLinks';
import { parseRecommendations } from '../src/features/jobs/utils/parseRecommendations';
import type { JobOpportunity } from '../src/features/jobs/types/job';
import { demoJobs } from './fixtures/jobs';

const job = { ...demoJobs[0], id: 'job-1', isDemo: false };
const automaticJob: JobOpportunity = {
  ...job,
  application: { channel: 'external', url: 'https://example.com/inscricao' },
  tracking: {
    channel: 'external',
    platform: 'Gupy',
    instructions: 'Conclua a candidatura na plataforma.',
  },
};
const profile = {
  fullName: 'Ana Souza',
  phone: '85999999999',
  birthDate: '1980-01-01',
  address: 'Endereço privado',
};
const resume = {
  summary: 'Experiência com atendimento.',
  role: 'Recepcionista',
  company: '',
  period: '',
  activities: '',
  skills: 'Organização',
};
const whatsappJob: JobOpportunity = {
  ...job,
  application: {
    channel: 'phone',
    phone: '85999990000',
    acceptsWhatsApp: true,
    instructions: 'Envie sua apresentação pelo WhatsApp.',
  },
};

function render(ui: ReactNode) {
  return renderOriginal(ui, { wrapper: JobApplicationProvider });
}

beforeEach(() => {
  vi.stubEnv('VITE_JOB_APPLICATION_PLAN_URL', '');
  vi.stubEnv('VITE_JOB_APPLICATION_SUBMIT_URL', '');
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function renderActions(selectedJob: JobOpportunity = job) {
  const onDismiss = vi.fn();
  render(
    <JobApplicationActions
      job={selectedJob}
      resume={resume}
      profile={profile}
      onDismiss={onDismiss}
    />,
  );
  return onDismiss;
}

it('oferece mensagem de WhatsApp editável para copiar sem enviar automaticamente', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  const request = vi.fn();
  vi.stubGlobal('navigator', { clipboard: { writeText } });
  vi.stubGlobal('fetch', request);
  renderActions(whatsappJob);
  fireEvent.click(screen.getByRole('button', { name: 'Quero me candidatar' }));
  await screen.findByRole('heading', { name: 'Prepare sua mensagem para o WhatsApp' });
  expect((screen.getByLabelText('WhatsApp do recrutador') as HTMLInputElement).value).toBe(
    '85999990000',
  );
  const field = screen.getByLabelText('Mensagem para o recrutador') as HTMLTextAreaElement;
  expect(field.value).toContain(profile.fullName);
  expect(field.value).toContain(resume.summary);
  expect(field.value).toContain(job.title);
  expect(screen.queryByLabelText('Assunto do e-mail')).toBeNull();
  fireEvent.change(field, { target: { value: 'Olá, tenho interesse nesta oportunidade!' } });
  fireEvent.click(screen.getByRole('button', { name: 'Copiar mensagem' }));
  await screen.findByText(/Mensagem copiada. Cole no WhatsApp/);
  expect(writeText).toHaveBeenCalledExactlyOnceWith('Olá, tenho interesse nesta oportunidade!');
  expect(request).not.toHaveBeenCalled();
  expect(screen.queryByRole('button', { name: 'Confirmar candidatura automática' })).toBeNull();
});

it('não sugere WhatsApp quando apenas o acompanhamento aceita mensagens', async () => {
  const plan = await prepareApplication(
    {
      ...whatsappJob,
      application: {
        channel: 'phone',
        phone: '85999990000',
        instructions: 'Ligue para se candidatar.',
      },
      tracking: {
        channel: 'phone',
        acceptsWhatsApp: true,
        instructions: 'Acompanhe pelo WhatsApp.',
      },
    },
    resume,
    profile,
  );
  expect(plan.type).toBe('manual');
});

it('valida sugestões da IA para WhatsApp contra o telefone de inscrição', async () => {
  vi.stubEnv('VITE_JOB_APPLICATION_PLAN_URL', '/application/plan');
  const request = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        type: 'whatsapp',
        phone: '85999990000',
        body: 'Olá, tenho interesse!',
        source: 'ai',
      }),
    ),
  );
  vi.stubGlobal('fetch', request);
  const plan = await prepareApplication(whatsappJob, resume, profile);
  expect(plan).toMatchObject({ type: 'whatsapp', body: 'Olá, tenho interesse!', source: 'ai' });
  expect(JSON.parse(request.mock.calls[0][1].body).allowAutomatic).toBe(false);
  request.mockResolvedValue(
    new Response(
      JSON.stringify({
        type: 'whatsapp',
        phone: '85911112222',
        body: 'Outra mensagem',
        source: 'ai',
      }),
    ),
  );
  await expect(prepareApplication(whatsappJob, resume, profile)).rejects.toThrow(/incompatível/);
});

it('mantém a mensagem selecionável quando a cópia do WhatsApp falha', async () => {
  vi.stubGlobal('navigator', {
    clipboard: { writeText: vi.fn().mockRejectedValue(new Error('Negado')) },
  });
  renderActions(whatsappJob);
  fireEvent.click(screen.getByRole('button', { name: 'Quero me candidatar' }));
  await screen.findByRole('heading', { name: 'Prepare sua mensagem para o WhatsApp' });
  fireEvent.click(screen.getByRole('button', { name: 'Copiar mensagem' }));
  await screen.findByText('Selecione e copie a mensagem no campo acima.');
  expect(
    (screen.getByLabelText('Mensagem para o recrutador') as HTMLTextAreaElement).readOnly,
  ).toBe(false);
});

it('prepara um modelo de e-mail editável sem simular IA ou enviar a candidatura', async () => {
  const request = vi.fn();
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal('navigator', { clipboard: { writeText } });
  vi.stubGlobal('fetch', request);
  renderActions();
  fireEvent.click(screen.getByRole('button', { name: 'Quero me candidatar' }));
  await screen.findByRole('heading', { name: 'Prepare seu e-mail de candidatura' });
  expect(screen.getByText(/modelo inicial/)).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Mensagem para o recrutador'), {
    target: { value: 'Minha mensagem revisada.' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Copiar mensagem' }));
  await screen.findByText(/Mensagem copiada/);
  expect(writeText).toHaveBeenCalledExactlyOnceWith('Minha mensagem revisada.');
  expect(screen.queryByRole('link', { name: 'Abrir no meu aplicativo de e-mail' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Confirmar candidatura automática' })).toBeNull();
  expect(request).not.toHaveBeenCalled();
  expect(screen.queryByText(/Candidatura enviada e confirmada/)).toBeNull();
});

it('encaminha para inscrição externa quando não há integração automática', async () => {
  const plan = await prepareApplication(
    {
      ...job,
      application: undefined,
      tracking: { channel: 'external', platform: 'Gupy', instructions: 'Conclua no site.' },
      applicationUrl: 'https://example.com/vaga/1',
    },
    resume,
    profile,
  );
  expect(plan).toEqual({ type: 'external', url: 'https://example.com/vaga/1' });
});

it('só envia automaticamente depois da confirmação explícita e da resposta do servidor', async () => {
  vi.stubEnv('VITE_JOB_APPLICATION_PLAN_URL', '/applications/prepare');
  vi.stubEnv('VITE_JOB_APPLICATION_SUBMIT_URL', '/applications/submit');
  const request = vi.fn(async (url: string, options?: RequestInit) => {
    expect(options?.credentials).toBe('include');
    return new Response(
      JSON.stringify(
        url.endsWith('prepare')
          ? {
              type: 'automatic',
              planId: 'plan-1',
              summary: 'Enviar nome, telefone e currículo para esta vaga.',
            }
          : { status: 'submitted', applicationId: 'application-1' },
      ),
    );
  });
  vi.stubGlobal('fetch', request);
  renderActions(automaticJob);
  fireEvent.click(screen.getByRole('button', { name: 'Quero me candidatar' }));
  const confirm = await screen.findByRole('button', { name: 'Confirmar candidatura automática' });
  expect(request).toHaveBeenCalledTimes(1);
  expect(JSON.parse(request.mock.calls[0][1]?.body as string).profile).toEqual({
    fullName: profile.fullName,
    phone: profile.phone,
  });
  fireEvent.click(confirm);
  fireEvent.click(confirm);
  await screen.findByText('Candidatura enviada e confirmada. Protocolo: application-1');
  expect(request).toHaveBeenCalledTimes(2);
  expect(request).toHaveBeenLastCalledWith(
    '/applications/submit',
    expect.objectContaining({
      credentials: 'include',
      headers: expect.objectContaining({ 'Idempotency-Key': expect.any(String) }),
    }),
  );
});

it('mantém a mesma chave ao tentar novamente sem afirmar sucesso após falha', async () => {
  vi.stubEnv('VITE_JOB_APPLICATION_PLAN_URL', '/applications/prepare');
  vi.stubEnv('VITE_JOB_APPLICATION_SUBMIT_URL', '/applications/submit');
  const request = vi
    .fn()
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({ type: 'automatic', planId: 'plan-1', summary: 'Enviar currículo.' }),
      ),
    )
    .mockRejectedValueOnce(new TypeError('Falha de conexão'))
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ status: 'submitted', applicationId: 'application-1' })),
    );
  vi.stubGlobal('fetch', request);
  renderActions(automaticJob);
  fireEvent.click(screen.getByRole('button', { name: 'Quero me candidatar' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Confirmar candidatura automática' }));
  await screen.findByRole('alert');
  expect(screen.queryByText(/Candidatura enviada e confirmada/)).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar candidatura automática' }));
  await screen.findByText(/Candidatura enviada e confirmada/);
  expect(request.mock.calls[1][1].headers['Idempotency-Key']).toBe(
    request.mock.calls[2][1].headers['Idempotency-Key'],
  );
});

it('oferece o site de inscrição quando o servidor não consegue concluir a automação', async () => {
  vi.stubEnv('VITE_JOB_APPLICATION_PLAN_URL', '/applications/prepare');
  vi.stubEnv('VITE_JOB_APPLICATION_SUBMIT_URL', '/applications/submit');
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ type: 'automatic', planId: 'plan-1', summary: 'Enviar currículo.' }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: 'external', url: 'https://example.com/inscricao' })),
      ),
  );
  renderActions(automaticJob);
  fireEvent.click(screen.getByRole('button', { name: 'Quero me candidatar' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Confirmar candidatura automática' }));
  const link = await screen.findByRole('link', { name: /Continuar inscrição no site de origem/ });
  expect(link.getAttribute('href')).toBe('https://example.com/inscricao');
  expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  expect(screen.queryByText(/Candidatura enviada e confirmada/)).toBeNull();
});

it('mostra e permite editar a sugestão de e-mail recebida da IA', async () => {
  vi.stubEnv('VITE_JOB_APPLICATION_PLAN_URL', '/applications/prepare');
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          type: 'email',
          to: 'candidaturas@clinica.example',
          subject: 'Minha candidatura',
          body: 'Mensagem sugerida com base no currículo.',
          source: 'ai',
        }),
      ),
    ),
  );
  renderActions();
  fireEvent.click(screen.getByRole('button', { name: 'Quero me candidatar' }));
  expect(await screen.findByText(/A IA sugeriu esta mensagem/)).toBeTruthy();
  expect((screen.getByLabelText('Mensagem para o recrutador') as HTMLTextAreaElement).value).toBe(
    'Mensagem sugerida com base no currículo.',
  );
});

it('aciona a opção de não ter interesse sem preparar ou enviar candidatura', () => {
  const request = vi.fn();
  vi.stubGlobal('fetch', request);
  const onDismiss = renderActions();
  fireEvent.click(screen.getByRole('button', { name: 'Não tenho interesse' }));
  expect(onDismiss).toHaveBeenCalledTimes(1);
  expect(request).not.toHaveBeenCalled();
});

it('cancela o preparo ao sair do card e ignora a resposta atrasada', async () => {
  vi.stubEnv('VITE_JOB_APPLICATION_PLAN_URL', '/applications/prepare');
  let complete!: (response: Response) => void;
  const request = vi.fn().mockImplementation(
    () =>
      new Promise<Response>((resolve) => {
        complete = resolve;
      }),
  );
  vi.stubGlobal('fetch', request);
  const view = render(
    <JobApplicationActions job={job} resume={resume} profile={profile} onDismiss={vi.fn()} />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Quero me candidatar' }));
  view.unmount();
  expect(request.mock.calls[0][1].signal.aborted).toBe(true);
  await act(async () =>
    complete(
      new Response(
        JSON.stringify({ type: 'automatic', planId: 'plan-1', summary: 'Enviar currículo.' }),
      ),
    ),
  );
  expect(request).toHaveBeenCalledTimes(1);
});

it('rejeita links inseguros, destinatários inválidos e respostas sem confirmação', async () => {
  expect(isValidApplicationEmail('selecao@example.com\r\nBcc:x@example.com')).toBe(false);
  vi.stubEnv('VITE_JOB_APPLICATION_PLAN_URL', '/applications/prepare');
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ type: 'external', url: 'javascript:alert(1)' })),
      ),
  );
  await expect(prepareApplication(job, resume, profile)).rejects.toThrow('endereço de inscrição');
  vi.stubEnv('VITE_JOB_APPLICATION_SUBMIT_URL', '/applications/submit');
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: 'pending' }))),
  );
  await expect(submitApplication(job.id, 'plan-1', 'key-1')).rejects.toThrow('não confirmou');
});

it('não permite candidaturas em vagas de demonstração', async () => {
  await expect(prepareApplication(demoJobs[0], resume, profile)).rejects.toThrow('demonstração');
});

it('recusa destinatário da IA diferente do e-mail de inscrição da vaga', async () => {
  vi.stubEnv('VITE_JOB_APPLICATION_PLAN_URL', '/applications/prepare');
  const request = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        type: 'email',
        to: 'outro@example.com',
        subject: 'Candidatura',
        body: 'Mensagem sugerida.',
        source: 'ai',
      }),
    ),
  );
  vi.stubGlobal('fetch', request);
  renderActions();
  fireEvent.click(screen.getByRole('button', { name: 'Quero me candidatar' }));
  expect((await screen.findByRole('alert')).textContent).toContain('não corresponde');
  fireEvent.click(screen.getByRole('button', { name: 'Continuar por outro canal' }));
  expect((screen.getByLabelText('E-mail do recrutador') as HTMLInputElement).value).toBe(
    'candidaturas@clinica.example',
  );
  expect(request).toHaveBeenCalledTimes(1);
});

it('descarta um plano não enviado se o canal de inscrição da vaga mudar', async () => {
  vi.stubEnv('VITE_JOB_APPLICATION_PLAN_URL', '/applications/prepare');
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          type: 'automatic',
          planId: 'plan-1',
          summary: 'Inscrição pela plataforma.',
        }),
      ),
    ),
  );
  const view = render(
    <JobApplicationActions
      job={automaticJob}
      resume={resume}
      profile={profile}
      onDismiss={vi.fn()}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Quero me candidatar' }));
  await screen.findByRole('button', { name: 'Confirmar candidatura automática' });
  view.rerender(
    <JobApplicationActions
      job={{ ...automaticJob, application: job.application }}
      resume={resume}
      profile={profile}
      onDismiss={vi.fn()}
    />,
  );
  expect(screen.queryByRole('button', { name: 'Confirmar candidatura automática' })).toBeNull();
  expect(screen.getByRole('button', { name: 'Quero me candidatar' })).toBeTruthy();
});

it('usa a plataforma de inscrição mesmo quando o acompanhamento é por e-mail', async () => {
  const plan = await prepareApplication(
    { ...job, application: { channel: 'external', url: 'https://example.com/vaga' } },
    resume,
    profile,
  );
  expect(plan).toEqual({ type: 'external', url: 'https://example.com/vaga' });
});

it('permite automação na plataforma sem usar o e-mail de acompanhamento como destino', async () => {
  vi.stubEnv('VITE_JOB_APPLICATION_PLAN_URL', '/applications/prepare');
  vi.stubEnv('VITE_JOB_APPLICATION_SUBMIT_URL', '/applications/submit');
  const request = vi
    .fn()
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          type: 'automatic',
          planId: 'plan-1',
          summary: 'Inscrição pela plataforma.',
        }),
      ),
    )
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ status: 'submitted', applicationId: 'application-1' })),
    );
  vi.stubGlobal('fetch', request);
  renderActions({ ...job, application: automaticJob.application });
  fireEvent.click(screen.getByRole('button', { name: 'Quero me candidatar' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Confirmar candidatura automática' }));
  await screen.findByText(/Protocolo: application-1/);
  expect(JSON.parse(request.mock.calls[0][1].body).allowAutomatic).toBe(true);
});

it('não usa um e-mail de acompanhamento como destinatário quando falta o canal de inscrição', async () => {
  const plan = await prepareApplication(
    { ...job, application: undefined, applicationUrl: undefined },
    resume,
    profile,
  );
  expect(plan.type).toBe('manual');
});

it('usa apenas o destinatário declarado para inscrição por e-mail, independentemente do acompanhamento', async () => {
  const plan = await prepareApplication(
    { ...job, tracking: automaticJob.tracking },
    resume,
    profile,
  );
  expect(plan.type).toBe('email');
  if (plan.type === 'email') expect(plan.to).toBe('candidaturas@clinica.example');
});

it.each([401, 429])(
  'mantém um envio anterior incerto se a nova tentativa receber %s',
  async (status) => {
    vi.stubEnv('VITE_JOB_APPLICATION_PLAN_URL', '/applications/prepare');
    vi.stubEnv('VITE_JOB_APPLICATION_SUBMIT_URL', '/applications/submit');
    const request = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ type: 'automatic', planId: 'plan-1', summary: 'Enviar currículo.' }),
        ),
      )
      .mockRejectedValueOnce(new TypeError('Conexão perdida após envio'))
      .mockResolvedValueOnce(new Response(null, { status }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: 'submitted', applicationId: 'application-1' })),
      );
    vi.stubGlobal('fetch', request);
    renderActions(automaticJob);
    fireEvent.click(screen.getByRole('button', { name: 'Quero me candidatar' }));
    fireEvent.click(
      await screen.findByRole('button', { name: 'Confirmar candidatura automática' }),
    );
    await screen.findByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar candidatura automática' }));
    await screen.findByText(
      status === 401
        ? 'Entre na sua conta para continuar a candidatura.'
        : 'Aguarde um momento antes de tentar novamente.',
    );
    expect(
      screen
        .getByRole('button', { name: 'Usar outro canal de inscrição' })
        .hasAttribute('disabled'),
    ).toBe(true);
    expect(
      screen.getByRole('button', { name: 'Continuar por outro canal' }).hasAttribute('disabled'),
    ).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar candidatura automática' }));
    await screen.findByText(/Protocolo: application-1/);
    const keys = request.mock.calls
      .slice(1)
      .map(([, options]) => options.headers['Idempotency-Key']);
    expect(new Set(keys).size).toBe(1);
  },
);

it('valida o canal de inscrição separadamente do acompanhamento recebido da API', () => {
  const result = parseRecommendations({
    recommendations: [
      {
        isCompatible: true,
        reason: 'Atende aos requisitos.',
        matchedSkills: [],
        job: { ...job, application: { channel: 'external', url: 'https://example.com/vaga' } },
      },
    ],
  });
  expect(result[0].job.tracking.channel).toBe('email');
  expect(result[0].job.application).toEqual({
    channel: 'external',
    url: 'https://example.com/vaga',
  });
  expect(() =>
    parseRecommendations({
      recommendations: [
        {
          isCompatible: true,
          reason: 'Atende aos requisitos.',
          job: { ...job, application: { channel: 'external', url: 'javascript:alert(1)' } },
        },
      ],
    }),
  ).toThrow('canal de inscrição');
});

it('preserva o protocolo quando um card sai da lista e volta a aparecer', async () => {
  vi.stubEnv('VITE_JOB_APPLICATION_PLAN_URL', '/applications/prepare');
  vi.stubEnv('VITE_JOB_APPLICATION_SUBMIT_URL', '/applications/submit');
  const request = vi
    .fn()
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({ type: 'automatic', planId: 'plan-1', summary: 'Enviar currículo.' }),
      ),
    )
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ status: 'submitted', applicationId: 'application-1' })),
    );
  vi.stubGlobal('fetch', request);
  const card = (
    <JobApplicationActions
      job={automaticJob}
      resume={resume}
      profile={profile}
      onDismiss={vi.fn()}
    />
  );
  const view = render(card);
  fireEvent.click(screen.getByRole('button', { name: 'Quero me candidatar' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Confirmar candidatura automática' }));
  await screen.findByText(/Protocolo: application-1/);
  view.rerender(null);
  view.rerender(card);
  expect(screen.getByText(/Protocolo: application-1/)).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Quero me candidatar' })).toBeNull();
  expect(request).toHaveBeenCalledTimes(2);
});

it('mantém a chave de envio depois de uma falha e da remontagem do card', async () => {
  vi.stubEnv('VITE_JOB_APPLICATION_PLAN_URL', '/applications/prepare');
  vi.stubEnv('VITE_JOB_APPLICATION_SUBMIT_URL', '/applications/submit');
  const request = vi
    .fn()
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({ type: 'automatic', planId: 'plan-1', summary: 'Enviar currículo.' }),
      ),
    )
    .mockRejectedValueOnce(new TypeError('Conexão perdida'))
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ status: 'submitted', applicationId: 'application-1' })),
    );
  vi.stubGlobal('fetch', request);
  const card = (
    <JobApplicationActions
      job={automaticJob}
      resume={resume}
      profile={profile}
      onDismiss={vi.fn()}
    />
  );
  const view = render(card);
  fireEvent.click(screen.getByRole('button', { name: 'Quero me candidatar' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Confirmar candidatura automática' }));
  await screen.findByRole('alert');
  expect(
    screen.getByRole('button', { name: 'Usar outro canal de inscrição' }).hasAttribute('disabled'),
  ).toBe(true);
  view.rerender(null);
  view.rerender(card);
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar candidatura automática' }));
  await screen.findByText(/Protocolo: application-1/);
  expect(request.mock.calls[1][1].headers['Idempotency-Key']).toBe(
    request.mock.calls[2][1].headers['Idempotency-Key'],
  );
  expect(request).toHaveBeenCalledTimes(3);
});

it('mantém o envio em andamento quando o card é filtrado', async () => {
  vi.stubEnv('VITE_JOB_APPLICATION_PLAN_URL', '/applications/prepare');
  vi.stubEnv('VITE_JOB_APPLICATION_SUBMIT_URL', '/applications/submit');
  let finish!: (response: Response) => void;
  const request = vi
    .fn()
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({ type: 'automatic', planId: 'plan-1', summary: 'Enviar currículo.' }),
      ),
    )
    .mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          finish = resolve;
        }),
    );
  vi.stubGlobal('fetch', request);
  const card = (
    <JobApplicationActions
      job={automaticJob}
      resume={resume}
      profile={profile}
      onDismiss={vi.fn()}
    />
  );
  const view = render(card);
  fireEvent.click(screen.getByRole('button', { name: 'Quero me candidatar' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Confirmar candidatura automática' }));
  view.rerender(null);
  expect(request.mock.calls[1][1].signal.aborted).toBe(false);
  await act(async () =>
    finish(new Response(JSON.stringify({ status: 'submitted', applicationId: 'application-1' }))),
  );
  view.rerender(card);
  expect(screen.getByText(/Protocolo: application-1/)).toBeTruthy();
});

it('descarta um plano ainda não enviado se o currículo mudar', async () => {
  vi.stubEnv('VITE_JOB_APPLICATION_PLAN_URL', '/applications/prepare');
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ type: 'automatic', planId: 'plan-1', summary: 'Enviar currículo.' }),
        ),
      ),
  );
  const view = render(
    <JobApplicationActions
      job={automaticJob}
      resume={resume}
      profile={profile}
      onDismiss={vi.fn()}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Quero me candidatar' }));
  await screen.findByRole('button', { name: 'Confirmar candidatura automática' });
  view.rerender(
    <JobApplicationActions
      job={automaticJob}
      resume={{ ...resume, summary: 'Outra experiência profissional.' }}
      profile={profile}
      onDismiss={vi.fn()}
    />,
  );
  expect(screen.queryByRole('button', { name: 'Confirmar candidatura automática' })).toBeNull();
  expect(screen.getByRole('button', { name: 'Quero me candidatar' })).toBeTruthy();
});

it('mantém o canal manual disponível quando não existe endpoint de envio automático', async () => {
  vi.stubEnv('VITE_JOB_APPLICATION_PLAN_URL', '/applications/prepare');
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ type: 'automatic', planId: 'plan-1', summary: 'Enviar currículo.' }),
        ),
      ),
  );
  renderActions({ ...automaticJob, applicationUrl: 'https://example.com/inscricao' });
  fireEvent.click(screen.getByRole('button', { name: 'Quero me candidatar' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Confirmar candidatura automática' }));
  await screen.findByRole('alert');
  const fallback = screen.getByRole('button', { name: 'Usar outro canal de inscrição' });
  expect(fallback.hasAttribute('disabled')).toBe(false);
  fireEvent.click(fallback);
  expect(
    screen
      .getByRole('link', { name: /Continuar inscrição no site de origem/ })
      .getAttribute('href'),
  ).toBe('https://example.com/inscricao');
});

it('preserva as edições de e-mail ao esconder e mostrar o card', async () => {
  const card = (
    <JobApplicationActions job={job} resume={resume} profile={profile} onDismiss={vi.fn()} />
  );
  const view = render(card);
  fireEvent.click(screen.getByRole('button', { name: 'Quero me candidatar' }));
  const body = await screen.findByLabelText('Mensagem para o recrutador');
  fireEvent.change(body, { target: { value: 'Minha mensagem revisada.' } });
  view.rerender(null);
  view.rerender(card);
  expect((screen.getByLabelText('Mensagem para o recrutador') as HTMLTextAreaElement).value).toBe(
    'Minha mensagem revisada.',
  );
});

it('bloqueia envio automático de e-mail mesmo se o backend devolver um plano automático', async () => {
  vi.stubEnv('VITE_JOB_APPLICATION_PLAN_URL', '/applications/prepare');
  vi.stubEnv('VITE_JOB_APPLICATION_SUBMIT_URL', '/applications/submit');
  const request = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        type: 'automatic',
        planId: 'email-plan',
        summary: 'Enviar e-mail automaticamente.',
      }),
    ),
  );
  vi.stubGlobal('fetch', request);
  renderActions();
  fireEvent.click(screen.getByRole('button', { name: 'Quero me candidatar' }));
  await screen.findByRole('button', { name: 'Copiar mensagem' });
  expect(screen.queryByRole('button', { name: 'Confirmar candidatura automática' })).toBeNull();
  expect(JSON.parse(request.mock.calls[0][1].body).allowAutomatic).toBe(false);
  expect(request).toHaveBeenCalledTimes(1);
});
