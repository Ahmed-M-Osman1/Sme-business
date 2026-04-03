import {cors} from 'hono/cors';

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'https://sme-business-web.vercel.app',
  'https://sme-business-admin.vercel.app',
  'https://sme-business-backend.vercel.app',
];

function isAllowedOrigin(origin: string): boolean {
  if (allowedOrigins.includes(origin)) return true;
  // Allow Vercel preview deployments for this project
  return /^https:\/\/sme-business-[a-z0-9]+-akiid777s-projects\.vercel\.app$/.test(origin);
}

export const corsMiddleware = cors({
  origin: (origin) => (isAllowedOrigin(origin) ? origin : allowedOrigins[0]),
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS', 'PUT'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposeHeaders: ['Content-Length'],
  maxAge: 86400,
  credentials: true,
});
