import cors from 'cors';

function buildAllowedOrigins(): string[] {
  const origins = new Set<string>([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ]);

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
const VERCEL_ORIGIN_REGEX = /\.vercel\.app$/;

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin) || VERCEL_ORIGIN_REGEX.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origem não autorizada pelo CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
