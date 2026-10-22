import cors from 'cors';

/**
 * CORS restrito a origens explicitamente autorizadas.
 *
 * - Origens permitidas são definidas via CORS_ORIGIN no .env (separadas por vírgula).
 * - Localhost do Vite (5173) é incluído por padrão em desenvolvimento.
 * - Requisições sem origin (e.g. ferramentas CLI, health checks) são permitidas.
 * - Origens não autorizadas são REJEITADAS com erro.
 */
function buildAllowedOrigins(): string[] {
  const origins = new Set<string>();

  // Origens padrão de desenvolvimento
  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:5173');
    origins.add('http://127.0.0.1:5173');
  }

  // Origens configuradas via variável de ambiente (suporta lista separada por vírgula)
  const envOrigins = process.env.CORS_ORIGIN;
  if (envOrigins) {
    for (const o of envOrigins.split(',')) {
      const trimmed = o.trim();
      if (trimmed) origins.add(trimmed);
    }
  }

  return [...origins];
}

const allowedOrigins = buildAllowedOrigins();

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Requisições sem origin (curl, Postman, server-to-server) são permitidas
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origem não autorizada pelo CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
});
