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

app.use(corsMiddleware);
app.use(express.json({ limit: '64kb' }));
app.use(cookieParser());

app.get('/', (_req: Request, res: Response) => {
  res.json({
    projeto: 'Reconecta 50+ API',
    status: 'online',
    versao: '2.2.0',
    endpoints: {
      auth: ['/auth/login', '/auth/register', '/auth/me', '/auth/profile', '/auth/logout'],
      api: [
        '/api/curriculo/gerar',
        '/api/vagas',
        '/api/vagas/recomendadas',
        '/api/candidaturas',
      ],
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

app.use(routes);

loadUsers();
loadSessions();

app.listen(PORT, () => {
  const env = process.env.NODE_ENV || 'development';
  console.log(`🚀 Reconecta 50+ Backend v2.2 rodando em http://localhost:${PORT} [${env}]`);
  console.log(`📋 CORS habilitado para origens autorizadas (${process.env.CORS_ORIGIN || 'http://localhost:5173'})`);
  console.log(`🔑 Gemini API: ${process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('sua_chave') ? 'Configurada ✓' : 'Modo mock seguro (sem chave)'}`);
  console.log(`💾 Dados: ${getUserCount()} usuário(s) e ${getSessionCount()} sessão(ões) carregados`);
});
