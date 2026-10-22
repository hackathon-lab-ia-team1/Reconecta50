import express from 'express';
import type { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { corsMiddleware } from './middlewares/corsMiddleware.js';
import routes from './routes/index.js';
import { loadUsers, getUserCount } from './data/mocks/users.mock.js';
import { loadSessions, getSessionCount } from './data/sessionStore.js';

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
    versao: '2.1.0',
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

// ─── Carregar dados persistidos ───
loadUsers();
loadSessions();

// ─── Inicialização ───
app.listen(PORT, () => {
  const env = process.env.NODE_ENV || 'development';
  console.log(`🚀 Reconecta 50+ Backend v2.1 rodando em http://localhost:${PORT} [${env}]`);
  console.log(`📋 CORS: origens autorizadas via CORS_ORIGIN`);
  console.log(`🔑 Gemini API: ${process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('sua_chave') ? 'Configurada ✓' : 'Modo mock (sem chave)'}`);
  console.log(`💾 Dados: ${getUserCount()} usuário(s) e ${getSessionCount()} sessão(ões) carregados`);
});
