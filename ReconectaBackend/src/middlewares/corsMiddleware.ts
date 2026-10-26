import cors from 'cors';

function buildAllowedOrigins(): Set<string> {
  const origins = new Set<string>([
    'https://reconecta50-five.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ]);

  const envOrigins = process.env.CORS_ORIGIN;
  if (envOrigins) {
    for (const o of envOrigins.split(',')) {
      const trimmed = o.trim().replace(/\/+$/, '');
      if (trimmed) origins.add(trimmed);
    }
  }

  return origins;
}

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    const normalizedOrigin = origin.trim().replace(/\/+$/, '');
    const allowedOrigins = buildAllowedOrigins();

    if (allowedOrigins.has(normalizedOrigin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origem não autorizada pelo CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
