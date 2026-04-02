import {serve} from '@hono/node-server';
import app from './app.js';

const port = Number(process.env.PORT) || 3002;

console.log(`Shory API running on http://localhost:${port}`);
serve({fetch: app.fetch, port});

export default app;
