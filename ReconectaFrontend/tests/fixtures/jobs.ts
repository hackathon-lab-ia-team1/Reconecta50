import type { JobOpportunity } from '../../src/features/jobs/types/job';
export const demoJobs: JobOpportunity[] = [
  {
    id: 'demo-recepcao',
    application: { channel: 'email', email: 'candidaturas@clinica.example' },
    title: 'Recepcionista',
    company: 'Clínica Acolher (exemplo)',
    location: 'Fortaleza, CE · Centro',
    workMode: 'Presencial',
    schedule: 'Segunda a sexta · horário comercial',
    compensation: 'R$ 1.850 por mês',
    benefits: ['Vale-transporte', 'Vale-alimentação'],
    description:
      'Atendimento presencial e telefônico, agendamento de consultas e organização da recepção.',
    requirements: ['Boa comunicação', 'Organização', 'Experiência com atendimento ao público'],
    recruiter: {
      name: 'Equipe de seleção da clínica',
      contact: 'selecao@clinica.example (e-mail fictício)',
    },
    tracking: {
      channel: 'email',
      email: 'selecao@clinica.example',
      instructions:
        'As atualizações e o convite para entrevista seriam enviados ao e-mail informado na candidatura. Consulte também a caixa de spam.',
    },
    isDemo: true,
  },
  {
    id: 'demo-administrativo',
    application: {
      channel: 'phone',
      phone: '85999990000',
      instructions: 'Consulte as instruções para inscrição com a equipe de seleção.',
    },
    title: 'Auxiliar administrativo',
    company: 'Conecta Serviços (exemplo)',
    location: 'Fortaleza, CE · Aldeota',
    workMode: 'Presencial',
    schedule: 'Meio período · manhã',
    compensation: 'R$ 1.600 por mês',
    benefits: ['Vale-transporte'],
    description:
      'Organização de documentos, conferência de informações e apoio às rotinas do escritório.',
    requirements: ['Atenção aos detalhes', 'Organização de documentos', 'Informática básica'],
    recruiter: {
      name: 'Equipe de recursos humanos',
      contact: '(DDD) 9XXXX-XXXX (telefone ilustrativo)',
    },
    tracking: {
      channel: 'phone',
      acceptsWhatsApp: true,
      instructions:
        'A equipe de seleção faria contato pelo telefone informado na candidatura, por ligação ou WhatsApp. As orientações para entrevista seriam enviadas por esse canal.',
    },
    isDemo: true,
  },
  {
    id: 'demo-gupy',
    application: { channel: 'external', url: 'https://gupy.example/vaga-demo' },
    title: 'Atendente de loja',
    company: 'Rede Boa Compra (exemplo)',
    location: 'Recife, PE · Boa Vista',
    workMode: 'Presencial',
    schedule: 'Tempo integral · escala informada na seleção',
    compensation: 'R$ 1.900 por mês',
    benefits: ['Vale-refeição', 'Vale-transporte'],
    description: 'Orientação aos clientes, organização de produtos e apoio ao atendimento da loja.',
    requirements: [
      'Atendimento ao cliente',
      'Trabalho em equipe',
      'Disponibilidade para o horário da vaga',
    ],
    recruiter: {
      name: 'Time de recrutamento da empresa',
      contact: 'Contato direto não informado. Atendimento pela plataforma da seleção.',
    },
    tracking: {
      channel: 'external',
      platform: 'Gupy',
      instructions:
        'A candidatura seria realizada fora do Reconecta 50+. Acesse sua conta na Gupy para consultar as etapas e as mensagens da seleção. As atualizações não seriam sincronizadas automaticamente com este painel.',
    },
    isDemo: true,
  },
  {
    id: 'demo-indeed',
    application: { channel: 'external', url: 'https://indeed.example/vaga-demo' },
    title: 'Assistente de atendimento',
    company: 'Ponto de Apoio (exemplo)',
    location: 'São Paulo, SP · Centro',
    workMode: 'Híbrido',
    schedule: 'Segunda a sexta · tempo integral',
    compensation: 'R$ 2.200 por mês',
    benefits: ['Vale-alimentação', 'Auxílio-transporte'],
    description:
      'Atendimento a clientes por telefone e mensagens, com registro e encaminhamento de solicitações.',
    requirements: ['Escuta e comunicação', 'Uso de computador', 'Organização da rotina'],
    recruiter: {
      name: 'Equipe de recrutamento',
      contact: 'recrutamento@apoio.example (e-mail fictício)',
    },
    tracking: {
      channel: 'external',
      platform: 'Indeed',
      instructions:
        'O anúncio e as instruções de candidatura ficariam no Indeed. Acompanhe pela plataforma e siga o canal indicado pela empresa no anúncio original. Este exemplo não envia sua candidatura.',
    },
    isDemo: true,
  },
  {
    id: 'demo-linkedin',
    application: { channel: 'external', url: 'https://linkedin.example/vaga-demo' },
    title: 'Assistente de relacionamento',
    company: 'Novos Caminhos (exemplo)',
    location: 'Brasil · trabalho remoto',
    workMode: 'Remoto',
    schedule: 'Horário comercial',
    compensation: 'A combinar com a empresa',
    benefits: ['Benefícios a confirmar na seleção'],
    description:
      'Relacionamento com clientes, esclarecimento de dúvidas e acompanhamento de solicitações.',
    requirements: [
      'Empatia no atendimento',
      'Comunicação escrita',
      'Familiaridade com ferramentas digitais',
    ],
    recruiter: {
      name: 'Equipe de talentos',
      contact: 'Contato direto não informado. Consulte o anúncio original.',
    },
    tracking: {
      channel: 'external',
      platform: 'LinkedIn',
      instructions:
        'Consulte o anúncio original no LinkedIn para saber como se candidatar. Algumas seleções continuam em outro site indicado pela empresa. O acompanhamento deve seguir as orientações desse anúncio.',
    },
    isDemo: true,
  },
];
