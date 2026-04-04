import {Hono} from 'hono';
import {apiRouter} from './api-router.js';

const app = new Hono();

app.get('/', (c) =>
  c.json({
    name: 'Shory SME Backend',
    status: 'ok',
    health: '/api/health',
    ready: '/api/readyz',
  }),
);

app.get('/api/health', (c) =>
  c.json({
    status: 'ok',
  }),
);

app.get('/api/readyz', (c) => {
  const missing = ['DATABASE_URL'].filter((key) => !process.env[key]);

  return c.json(
    {
      status: missing.length === 0 ? 'ready' : 'not_ready',
      missing,
      services: {
        databaseConfigured: Boolean(process.env.DATABASE_URL),
        aiConfigured: Boolean(process.env.GEMINI_API_KEY),
        blobConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      },
    },
    missing.length === 0 ? 200 : 503,
  );
});

app.all('/api', (c) => apiRouter.fetch(c.req.raw));
app.all('/api/*', (c) => apiRouter.fetch(c.req.raw));

export default app;
