import { cors } from "hono/cors";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.WEB_URL,
  process.env.ADMIN_URL,
].filter(Boolean) as string[];

export const corsMiddleware = cors({
  origin: ALLOWED_ORIGINS,
  allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
});
