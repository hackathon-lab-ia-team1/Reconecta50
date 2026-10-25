export interface Vaga {
  id: number;
  titulo: string;
  empresa: string;
  modelo: string;
  localizacao: string;
  descricao: string;
  requisitos: string[];
  beneficios: string[];
}

export type ApplicationTrackingMock =
  | { channel: 'email'; instructions: string; email?: string }
  | { channel: 'phone'; instructions: string; phone?: string; acceptsWhatsApp: boolean }
  | { channel: 'external'; instructions: string; platform: 'Gupy' | 'Indeed' | 'LinkedIn' };

export type JobApplicationChannelMock =
  | { channel: 'external'; url: string }
  | { channel: 'email'; email: string }
  | { channel: 'phone'; phone: string; instructions: string; acceptsWhatsApp?: boolean }
  | { channel: 'manual'; instructions: string };

export interface JobOpportunityMock {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: 'Presencial' | 'Híbrido' | 'Remoto';
  schedule: string;
  compensation: string;
  benefits: string[];
  description: string;
  requirements: string[];
  recruiter: { name: string; contact: string };
  tracking: ApplicationTrackingMock;
  application?: JobApplicationChannelMock;
  applicationUrl?: string;
  isDemo: boolean;
}

// [MOCK] Dados de vagas afirmativas para o público 50+ (Catálogo estático GET /api/vagas)
export const VAGAS_AFIRMATIVAS: Vaga[] = [
  {
    id: 1,
    titulo: 'Assistente de Atendimento e Relacionamento',
    empresa: 'Rede FarmaMais (Programa 50+ Ativo)',
    modelo: 'Presencial',
    localizacao: 'São Paulo - SP',
    descricao:
      'Buscamos profissionais com maturidade e facilidade de lidar com pessoas para atendimento acolhedor ao cliente, orientação no balcão e suporte presencial.',
    requisitos: ['Boa comunicação e escuta ativa', 'Empatia no atendimento', 'Pontualidade e organização'],
    beneficios: ['Vale Refeição', 'Plano de Saúde sem coparticipação', 'Desconto em farmácia', 'Ambiente Acolhedor 50+'],
  },
  {
    id: 2,
    titulo: 'Recepcionista e Apoio Administrativo',
    empresa: 'Clínica Bem Viver',
    modelo: 'Presencial',
    localizacao: 'São Paulo - SP',
    descricao:
      'Acolhimento humanizado de pacientes, confirmação e agendamento de consultas, atendimento telefônico e organização da recepção.',
    requisitos: ['Simpatia e paciência com o público', 'Organização de rotina e agendas', 'Noções básicas de computador ou WhatsApp'],
    beneficios: ['Vale Transporte', 'Vale Alimentação', 'Convênio Médico e Odontológico'],
  },
  {
    id: 3,
    titulo: 'Operador(a) de Atendimento e Loja Sênior',
    empresa: 'Pão de Açúcar (Programa Maturidade GPA)',
    modelo: 'Presencial',
    localizacao: 'São Paulo - SP',
    descricao:
      'Atendimento consultivo aos clientes nas seções da loja, apoio na organização de produtos e orientação sobre ofertas com cordialidade.',
    requisitos: ['Gosto por lidar com pessoas', 'Trabalho em equipe', 'Comprometimento e estabilidade'],
    beneficios: ['Vale Transporte', 'Refeitório no local', 'Plano de Saúde', 'Cartão de desconto nas lojas'],
  },
  {
    id: 4,
    titulo: 'Auxiliar de Controle de Estoque e Expedição',
    empresa: 'LogiCenter Distribuidora (Vaga Afirmativa 50+)',
    modelo: 'Presencial',
    localizacao: 'Guarulhos - SP',
    descricao:
      'Conferência de entrada e saída de mercadorias, verificação de notas fiscais simples e organização de prateleiras leves.',
    requisitos: ['Atenção aos detalhes', 'Responsabilidade e pontualidade', 'Vivência com organização ou comércio'],
    beneficios: ['Vale Transporte', 'Plano Odontológico', 'Refeitório no local', 'Seguro de Vida'],
  },
  {
    id: 5,
    titulo: 'Consultor(a) de Relacionamento e Ouvidoria',
    empresa: 'Conecta Saúde Sênior',
    modelo: 'Híbrido',
    localizacao: 'São Paulo - SP',
    descricao:
      'Contato ativo e receptivo por telefone e WhatsApp para acompanhamento de clientes 50+, esclarecimento de dúvidas e registro de solicitações.',
    requisitos: ['Clareza na comunicação', 'Maturidade emocional e paciência', 'Facilidade com WhatsApp e teclado'],
    beneficios: ['Auxílio Home Office', 'Vale Refeição', 'Plano de Saúde', 'Horário flexível'],
  },
];

// Vagas completas no formato JobOpportunity para recomendações por IA e candidaturas
export const VAGAS_OPORTUNIDADES: JobOpportunityMock[] = [
  {
    id: 'vaga-farmamais-50',
    title: 'Assistente de Atendimento e Relacionamento',
    company: 'Rede FarmaMais (Programa 50+ Ativo)',
    location: 'São Paulo, SP · Centro / Paulista',
    workMode: 'Presencial',
    schedule: 'Segunda a sexta · das 08h às 17h',
    compensation: 'R$ 2.350 por mês',
    benefits: ['Vale-refeição', 'Plano de saúde', 'Desconto em medicamentos', 'Vale-transporte'],
    description:
      'Buscamos profissionais 50+ com maturidade e facilidade de lidar com pessoas para atendimento acolhedor ao cliente, recepção na loja e apoio no relacionamento diário.',
    requirements: ['Boa comunicação e escuta ativa', 'Empatia no atendimento', 'Pontualidade e organização'],
    recruiter: {
      name: 'Patrícia Almeida (RH Inclusão 50+)',
      contact: 'WhatsApp: (11) 98765-4321 · rh50mais@farmamais.com.br',
    },
    tracking: {
      channel: 'phone',
      phone: '11987654321',
      acceptsWhatsApp: true,
      instructions:
        'A equipe de RH da Rede FarmaMais entra em contato pelo WhatsApp em até 3 dias úteis para agendar uma conversa presencial ou por vídeo.',
    },
    application: {
      channel: 'phone',
      phone: '11987654321',
      acceptsWhatsApp: true,
      instructions:
        'Envie sua apresentação pelo WhatsApp ou confirme sua inscrição direta pelo painel.',
    },
    isDemo: false,
  },
  {
    id: 'vaga-clinica-bem-viver',
    title: 'Recepcionista e Apoio Administrativo',
    company: 'Clínica Bem Viver',
    location: 'São Paulo, SP · Vila Mariana',
    workMode: 'Presencial',
    schedule: 'Segunda a sexta · das 08h às 17h',
    compensation: 'R$ 2.200 por mês',
    benefits: ['Vale-transporte', 'Vale-alimentação', 'Convênio médico e odontológico'],
    description:
      'Acolhimento humanizado de pacientes, confirmação e agendamento de consultas, atendimento telefônico e organização da recepção da clínica.',
    requirements: ['Simpatia e paciência com o público', 'Organização de rotina e agendas', 'Noções básicas de informática ou WhatsApp'],
    recruiter: {
      name: 'Dra. Helena Ribeiro · Gestão de Pessoas',
      contact: 'WhatsApp: (11) 97654-3210 · selecao@clinicabemviver.com.br',
    },
    tracking: {
      channel: 'phone',
      phone: '11976543210',
      acceptsWhatsApp: true,
      instructions:
        'Acompanhe o retorno pelo WhatsApp da clínica. A equipe confirma o recebimento do currículo e agenda uma conversa.',
    },
    application: {
      channel: 'phone',
      phone: '11976543210',
      acceptsWhatsApp: true,
      instructions:
        'Envie sua mensagem de apresentação pelo WhatsApp para a equipe de seleção da clínica.',
    },
    isDemo: false,
  },
  {
    id: 'vaga-pao-de-acucar-gpa',
    title: 'Operador(a) de Atendimento e Loja Sênior',
    company: 'Pão de Açúcar (Programa Maturidade GPA)',
    location: 'São Paulo, SP · Diversas unidades',
    workMode: 'Presencial',
    schedule: 'Meio período ou integral · escala 5x2',
    compensation: 'R$ 2.150 por mês',
    benefits: ['Vale-transporte', 'Refeitório no local', 'Plano de saúde', 'Desconto em compras'],
    description:
      'Atendimento consultivo e cordial aos clientes, orientação sobre produtos nas seções da loja e apoio na organização do ambiente.',
    requirements: ['Gosto por lidar com pessoas', 'Trabalho em equipe', 'Comprometimento e pontualidade'],
    recruiter: {
      name: 'Carlos Eduardo · Recrutamento Sênior GPA',
      contact: 'WhatsApp: (11) 96543-2109 · maturidade@gpa.com.br',
    },
    tracking: {
      channel: 'phone',
      phone: '11965432109',
      acceptsWhatsApp: true,
      instructions:
        'O time do Programa Maturidade entra em contato por WhatsApp para indicar a unidade mais próxima da sua residência.',
    },
    application: {
      channel: 'phone',
      phone: '11965432109',
      acceptsWhatsApp: true,
      instructions:
        'Apresente seu perfil pelo WhatsApp do Programa Maturidade ou confirme sua candidatura.',
    },
    isDemo: false,
  },
  {
    id: 'vaga-logicenter-estoque',
    title: 'Auxiliar de Controle de Estoque e Expedição',
    company: 'LogiCenter Distribuidora (Vaga Afirmativa 50+)',
    location: 'Guarulhos, SP · Centro Empresarial',
    workMode: 'Presencial',
    schedule: 'Segunda a sexta · das 07h30 às 16h30',
    compensation: 'R$ 2.400 por mês',
    benefits: ['Vale-transporte', 'Refeitório no local', 'Plano odontológico', 'Seguro de vida'],
    description:
      'Conferência de entrada e saída de mercadorias, verificação de notas fiscais simples, controle de inventário e organização do setor.',
    requirements: ['Atenção aos detalhes', 'Responsabilidade e organização', 'Vivência em comércio, almoxarifado ou operações'],
    recruiter: {
      name: 'Roberto Nascimento · Supervisão de RH',
      contact: 'WhatsApp: (11) 95432-1098 · rh@logicenter.com.br',
    },
    tracking: {
      channel: 'phone',
      phone: '11954321098',
      acceptsWhatsApp: true,
      instructions:
        'O retorno sobre a análise do currículo é enviado diretamente pelo WhatsApp do RH da LogiCenter.',
    },
    application: {
      channel: 'phone',
      phone: '11954321098',
      acceptsWhatsApp: true,
      instructions:
        'Envie sua apresentação para o WhatsApp do RH ou registre sua inscrição pelo painel.',
    },
    isDemo: false,
  },
  {
    id: 'vaga-conecta-saude-hibrido',
    title: 'Consultor(a) de Relacionamento e Ouvidoria',
    company: 'Conecta Saúde Sênior',
    location: 'São Paulo, SP · Híbrido (3x em casa)',
    workMode: 'Híbrido',
    schedule: 'Segunda a sexta · 6h diárias',
    compensation: 'R$ 2.500 por mês',
    benefits: ['Auxílio home office', 'Vale-refeição', 'Plano de saúde', 'Horário reduzido'],
    description:
      'Relacionamento telefônico e por WhatsApp com beneficiários 50+, acolhimento de dúvidas, agendamento de exames e acompanhamento de solicitações.',
    requirements: ['Clareza na comunicação', 'Maturidade emocional e escuta ativa', 'Familiaridade com WhatsApp e computador'],
    recruiter: {
      name: 'Fernanda Prado · Talentos 50+',
      contact: 'WhatsApp: (11) 94321-0987 · talentos@conectasaude.com.br',
    },
    tracking: {
      channel: 'phone',
      phone: '11943210987',
      acceptsWhatsApp: true,
      instructions:
        'A equipe envia todas as etapas do processo seletivo pelo WhatsApp informado no seu perfil.',
    },
    application: {
      channel: 'phone',
      phone: '11943210987',
      acceptsWhatsApp: true,
      instructions:
        'Confirme sua inscrição e envie uma mensagem de apresentação pelo WhatsApp do recrutador.',
    },
    isDemo: false,
  },
];
