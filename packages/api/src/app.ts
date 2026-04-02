import {Hono} from 'hono';
import {corsMiddleware} from './middleware/cors.js';
import {quotesRouter} from './routes/quotes.js';
import {uploadsRouter} from './routes/uploads.js';
import {aiRouter} from './routes/ai.js';
import {adminRouter} from './routes/admin.js';
import {catalogRouter} from './routes/catalog.js';

const app = new Hono().basePath('/api');

app.use('*', corsMiddleware);

app.get('/health', (c) => c.json({status: 'ok'}));
app.route('/quotes', quotesRouter);
app.route('/uploads', uploadsRouter);
app.route('/ai', aiRouter);
app.route('/admin', adminRouter);
app.route('/catalog', catalogRouter);

export default app;
