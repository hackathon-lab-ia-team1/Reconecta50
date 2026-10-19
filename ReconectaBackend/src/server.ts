import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { gerarCurriculoComIA } from './services/geminiService.js';
import { VAGAS_AFIRMATIVAS } from './data/mocks/vagas.mock.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.json({
    projeto: 'Reconecta 50+ API',
    status: 'online',
    versao: '1.0.0'
  });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    chaveGeminiConfigurada: Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('sua_chave'))
  });
});

app.post('/api/curriculo/gerar', async (req: Request, res: Response) => {
  try {
    const resultado = await gerarCurriculoComIA(req.body);
    res.json(resultado);
  } catch (error) {
    console.error('Erro na rota /api/curriculo/gerar:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Não foi possível gerar o currículo no momento.'
    });
  }
});

app.get('/api/vagas', (_req: Request, res: Response) => {
  res.json({
    sucesso: true,
    total: VAGAS_AFIRMATIVAS.length,
    vagas: VAGAS_AFIRMATIVAS
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Reconecta 50+ Backend (TypeScript) rodando em http://localhost:${PORT}`);
});
