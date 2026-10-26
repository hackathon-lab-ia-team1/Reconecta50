export interface EntradaTextoDireto {
  source?: 'text';
  text?: string;
}

export interface SecoesEntrevista {
  targetRole?: string;
  education?: string;
  languages?: string;
  experience?: string;
  skills?: string;
  additionalContacts?: string;
}

export interface FormularioCurriculo {
  source?: 'text';
  text?: string;
  sections?: SecoesEntrevista;
  usuario?: {
    nome?: string;
    email?: string;
    telefone?: string;
  };
  historico?: {
    ultimaExperiencia?: {
      periodo?: string;
      cargo?: string;
      atividadesTextoOuAudio?: string;
    };
    outrasHabilidades?: string;
    preferenciaTrabalho?: string;
  };
}

export interface ExperienciaFormatadaItem {
  cargo: string;
  periodo: string;
  responsabilidades: string[];
}

export interface CurriculoEstruturado {
  nome: string;
  resumoProfissional: string;
  competenciasChave: string[];
  experienciaFormatada: ExperienciaFormatadaItem[];
  mensagemApoio: string;
  cargoDesejado?: string;
  formacao?: string;
  idiomas?: string;
}

export interface RespostaCurriculo {
  sucesso: boolean;
  origem: 'groq_ai' | 'gemini_api' | 'mock_desenvolvimento';
  curriculo: CurriculoEstruturado;
  aviso?: string;
}
