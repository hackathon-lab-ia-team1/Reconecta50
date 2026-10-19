import { GoogleGenAI } from '@google/genai';

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

// [MOCK] Retorno simulado quando a chave do Gemini não for fornecida ou falhar
function gerarCurriculoMock(dados?: FormularioCurriculo): RespostaCurriculo {
  const nome = dados?.usuario?.nome || 'Profissional Reconecta';
  const cargoInformado = dados?.historico?.ultimaExperiencia?.cargo || 'Atendimento ao Cliente';
  const relato = dados?.historico?.ultimaExperiencia?.atividadesTextoOuAudio || 'Experiência sólida na área de atendimento, organização e relacionamento com clientes.';

  return {
    sucesso: true,
    origem: 'mock_desenvolvimento',
    curriculo: {
      nome,
      resumoProfissional: `Profissional dedicado e maduro, com trajetória comprovada em ${cargoInformado}. Reconhecido pela pontualidade, facilidade de comunicação interpessoal e foco na resolução prática de problemas diários.`,
      competenciasChave: [
        'Comunicação Clara e Empatia',
        'Organização e Atenção a Detalhes',
        'Comprometimento e Pontualidade',
        'Facilidade para Trabalho em Equipe'
      ],
      experienciaFormatada: [
        {
          cargo: cargoInformado,
          periodo: dados?.historico?.ultimaExperiencia?.periodo || 'Experiência Anterior',
          responsabilidades: [
            'Atendimento cordial a clientes e fornecedores, garantindo suporte e agilidade.',
            'Gestão de rotinas operacionais e apoio nas atividades diárias do setor.',
            relato
          ]
        }
      ],
      mensagemApoio: 'Seu currículo foi estruturado com base nas suas vivências! Lembre-se de que sua maturidade e experiência de vida são diferenciais valiosos no mercado.'
    }
  };
}

export async function gerarCurriculoComIA(dadosFormulario: FormularioCurriculo): Promise<RespostaCurriculo> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('sua_chave')) {
    // [MOCK] Executando fallback por ausência de chave
    return gerarCurriculoMock(dadosFormulario);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
Você é um especialista em recrutamento, recolocação profissional e combate ao etarismo no mercado de trabalho.
Sua missão é transformar o relato informal e simples de uma pessoa com mais de 50 anos (50+) em um currículo profissional valorizado, bem estruturado e moderno.

Dados fornecidos pelo candidato:
${JSON.stringify(dadosFormulario, null, 2)}

Instruções obrigatórias:
1. Extraia o nome e dados principais. Se não informados, utilize títulos genéricos profissionais.
2. Destaque a maturidade, responsabilidade e estabilidade emocional no resumo.
3. Transforme o relato informal de atividades em tópicos formais e de impacto.
4. Responda ESTRITAMENTE em formato JSON com o seguinte formato, sem texto antes ou depois:

{
  "nome": "Nome do Candidato",
  "resumoProfissional": "Síntese de 2 a 3 frases valorizando a maturidade e habilidades",
  "competenciasChave": [
    "Competência 1",
    "Competência 2",
    "Competência 3",
    "Competência 4"
  ],
  "experienciaFormatada": [
    {
      "cargo": "Cargo / Função",
      "periodo": "Período informado",
      "responsabilidades": [
        "Ação realizada com impacto",
        "Rotina operacional ou atendimento"
      ]
    }
  ],
  "mensagemApoio": "Uma mensagem curta e motivadora em tom respeitoso e acolhedor"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const respostaTexto = response.text || '{}';
    const jsonCurriculo: CurriculoEstruturado = JSON.parse(respostaTexto);

    return {
      sucesso: true,
      origem: 'gemini_api',
      curriculo: jsonCurriculo
    };
  } catch (error) {
    // [MOCK] Fallback acionado por erro na API
    const mock = gerarCurriculoMock(dadosFormulario);
    mock.aviso = 'Falha ao consultar a IA real. Exibindo currículo simulado offline.';
    return mock;
  }
}
