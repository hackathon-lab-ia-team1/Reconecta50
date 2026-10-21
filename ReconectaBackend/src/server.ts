import express from 'express';
import type { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { corsMiddleware } from './middlewares/corsMiddleware.js';
import routes from './routes/index.js';
import { seedDemoUser } from './data/mocks/users.mock.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middlewares Globais ───
app.use(corsMiddleware);
app.use(express.json());
app.use(cookieParser());

// ─── Health & Info ───
app.get('/', (_req: Request, res: Response) => {
  res.json({
    projeto: 'Reconecta 50+ API',
    status: 'online',
    versao: '2.0.0',
    endpoints: {
      auth: ['/auth/login', '/auth/register', '/auth/me', '/auth/logout'],
      api: ['/api/curriculo/gerar', '/api/vagas'],
      health: ['/api/health'],
    },
  });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    chaveGeminiConfigurada: Boolean(
      process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('sua_chave')
    ),
  });
});

// ─── Rotas da Aplicação ───
app.use(routes);

// ─── Seed de dados demo ───
seedDemoUser();

// ─── Inicialização ───
app.listen(PORT, () => {
  console.log(`🚀 Reconecta 50+ Backend v2.0 rodando em http://localhost:${PORT}`);
  console.log(`📋 CORS habilitado para: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
  console.log(`🔑 Gemini API: ${process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('sua_chave') ? 'Configurada ✓' : 'Modo mock (sem chave)'}`);
  console.log(`👤 Usuário demo: CPF 52998224725 / Senha: senha1234`);
});
