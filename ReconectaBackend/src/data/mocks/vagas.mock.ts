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

// [MOCK] Dados simulados de vagas afirmativas para o público 50+
export const VAGAS_AFIRMATIVAS: Vaga[] = [
  {
    id: 1,
    titulo: 'Assistente de Atendimento e Relacionamento',
    empresa: 'Rede FarmaMais (Programa 50+ Ativo)',
    modelo: 'Presencial / Híbrido',
    localizacao: 'São Paulo - SP',
    descricao: 'Buscamos profissionais com maturidade e facilidade de lidar com pessoas para atendimento ao cliente e suporte presencial.',
    requisitos: ['Boa comunicação', 'Empatia', 'Pontualidade'],
    beneficios: ['Vale Refeição', 'Plano de Saúde', 'Ambiente Acolhedor']
  },
  {
    id: 2,
    titulo: 'Recepcionista e Apoio Administrativo',
    empresa: 'Clínica Bem Viver',
    modelo: 'Presencial',
    localizacao: 'São Paulo - SP',
    descricao: 'Acolhimento de pacientes, agendamento de consultas simples e organização da recepção.',
    requisitos: ['Simpatia', 'Organização', 'Desejo de aprender ferramentas digitais básicas'],
    beneficios: ['Vale Transporte', 'Vale Alimentação']
  },
  {
    id: 3,
    titulo: 'Auxiliar de Controle de Estoque e Expedição',
    empresa: 'LogiCenter Distribuidora',
    modelo: 'Presencial',
    localizacao: 'Guarulhos - SP',
    descricao: 'Conferência de mercadorias, conferência de notas simples e organização de prateleiras.',
    requisitos: ['Atenção aos detalhes', 'Responsabilidade', 'Experiência prévia em comércio ou logística'],
    beneficios: ['Plano Odontológico', 'Refeitório no local']
  }
];
