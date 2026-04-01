import {Hono} from 'hono';
import {serve} from '@hono/node-server';
import {corsMiddleware} from './middleware/cors';
import {quotesRouter} from './routes/quotes';
import {uploadsRouter} from './routes/uploads';
import {aiRouter} from './routes/ai';
import {adminRouter} from './routes/admin';

const app = new Hono().basePath('/api');

app.use('*', corsMiddleware);

app.get('/health', (c) => c.json({status: 'ok'}));
app.route('/quotes', quotesRouter);
app.route('/uploads', uploadsRouter);
app.route('/ai', aiRouter);
app.route('/admin', adminRouter);

const port = Number(process.env.PORT) || 3002;

console.log(`Shory API running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });

export default app;
