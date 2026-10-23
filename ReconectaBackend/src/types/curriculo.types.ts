export interface EntradaTextoDireto {
  source?: 'text';
  text?: string;
}

export interface FormularioCurriculo {
  source?: 'text';
  text?: string;
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
}

export interface RespostaCurriculo {
  sucesso: boolean;
  origem: 'gemini_api' | 'mock_desenvolvimento';
  curriculo: CurriculoEstruturado;
  aviso?: string;
}
