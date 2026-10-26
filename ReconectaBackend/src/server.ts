import express from 'express';
import type { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { corsMiddleware } from './middlewares/corsMiddleware.js';
import routes from './routes/index.js';
import { initDatabase, DB_PATH } from './data/db.js';
import { seedDatabase } from './data/seed.js';
import { loadUsers, getUserCount } from './data/mocks/users.mock.js';
import { loadSessions, getSessionCount } from './data/sessionStore.js';
import { loadCandidaturas, getCandidaturasCount } from './controllers/candidaturasController.js';
import { loadCurriculos, getCurriculosCount } from './controllers/curriculoController.js';

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
    versao: '2.4.0',
    endpoints: {
      auth: ['/auth/login', '/auth/register', '/auth/me', '/auth/profile', '/auth/logout'],
      api: [
        '/api/curriculo/gerar',
        '/api/curriculo/salvar',
        '/api/curriculo/meu',
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
    chaveGroqConfigurada: Boolean(
      process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('sua_chave')
    ),
    chaveGeminiConfigurada: Boolean(
      process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('sua_chave')
    ),
  });
});

app.use(routes);

initDatabase();
seedDatabase();
loadUsers();
loadSessions();
loadCandidaturas();
loadCurriculos();

app.listen(PORT, () => {
  const env = process.env.NODE_ENV || 'development';
  const groqOk = Boolean(process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('sua_chave'));
  const geminiOk = Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('sua_chave'));
  console.log(`🚀 Reconecta 50+ Backend v2.4 rodando em http://localhost:${PORT} [${env}]`);
  console.log(`📋 CORS habilitado para origens autorizadas (${process.env.CORS_ORIGIN || 'http://localhost:5173'})`);
  console.log(
    `🤖 Motor Dual-Engine IA: Groq (${groqOk ? (process.env.GROQ_MODEL || 'openai/gpt-oss-120b') + ' ✓' : 'ausente'}) ➔ Gemini (${geminiOk ? (process.env.GEMINI_MODEL || 'gemini-flash-lite-latest') + ' ✓' : 'ausente'})`
  );
  console.log(`🗄️ SQLite nativo ativo em: ${DB_PATH}`);
  console.log(
    `💾 Dados: ${getUserCount()} usuário(s), ${getCurriculosCount()} currículo(s), ${getSessionCount()} sessão(ões) e ${getCandidaturasCount()} candidatura(s) no banco`
  );
});
