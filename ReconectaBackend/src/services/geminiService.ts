import { GoogleGenAI } from '@google/genai';
import type { FormularioCurriculo, CurriculoEstruturado, RespostaCurriculo } from '../types/curriculo.types.js';

// Re-exporta os tipos para backwards compatibility
export type { FormularioCurriculo, CurriculoEstruturado, RespostaCurriculo };

// ─── MOCK: Retorno simulado quando a chave do Gemini não está configurada ───
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
    // Fallback por ausência de chave
    return gerarCurriculoMock(dadosFormulario);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // ─── PROMPT FIEL AO RELATO (Feedback do Mentor) ───
    // O prompt é estritamente fiel ao relato da pessoa, sem alucinar ou inventar
    // competências/cargos que o usuário não mencionou.
    const prompt = `
Você é um especialista em recrutamento e recolocação profissional para pessoas com mais de 50 anos.
Sua tarefa é organizar o relato informal do candidato em um currículo profissional bem estruturado.

REGRAS OBRIGATÓRIAS:
1. Use SOMENTE as informações que o candidato forneceu. NÃO invente cargos, competências, períodos ou responsabilidades.
2. Se o candidato não mencionou uma habilidade, NÃO a inclua.
3. Reformule o relato informal em linguagem profissional, mas mantenha o conteúdo fiel ao original.
4. Destaque a maturidade e experiência de vida como pontos positivos, sem exagerar.
5. Se algum campo estiver vazio ou incompleto, use "Não informado" em vez de inventar.

Dados fornecidos pelo candidato:
${JSON.stringify(dadosFormulario, null, 2)}

Responda ESTRITAMENTE no formato JSON abaixo, sem texto antes ou depois:

{
  "nome": "Nome conforme informado pelo candidato",
  "resumoProfissional": "Síntese de 2 a 3 frases baseada EXCLUSIVAMENTE no que foi relatado",
  "competenciasChave": [
    "Competência mencionada ou claramente implícita no relato 1",
    "Competência mencionada ou claramente implícita no relato 2",
    "Competência mencionada ou claramente implícita no relato 3"
  ],
  "experienciaFormatada": [
    {
      "cargo": "Cargo conforme informado",
      "periodo": "Período conforme informado ou 'Não informado'",
      "responsabilidades": [
        "Atividade relatada pelo candidato, reformulada em linguagem profissional"
      ]
    }
  ],
  "mensagemApoio": "Uma mensagem curta motivadora em tom respeitoso e acolhedor"
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
    // Fallback acionado por erro na API
    console.error('[geminiService] Erro ao consultar Gemini:', error);
    const mock = gerarCurriculoMock(dadosFormulario);
    mock.aviso = 'Falha ao consultar a IA real. Exibindo currículo simulado offline.';
    return mock;
  }
}
