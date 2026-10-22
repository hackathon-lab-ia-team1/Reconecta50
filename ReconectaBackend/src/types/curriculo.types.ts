// ─── Tipos do módulo de currículo (reexportados do geminiService) ───

export interface FormularioCurriculo {
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

export interface CurriculoEstruturado {
  nome: string;
  resumoProfissional: string;
  competenciasChave: string[];
  experienciaFormatada: Array<{
    cargo: string;
    periodo: string;
    responsabilidades: string[];
  }>;
  mensagemApoio: string;
}

export interface RespostaCurriculo {
  sucesso: boolean;
  origem: 'gemini_api' | 'mock_desenvolvimento';
  curriculo: CurriculoEstruturado;
  aviso?: string;
}
