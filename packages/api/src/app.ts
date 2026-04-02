import {Hono} from 'hono';
import {corsMiddleware} from './middleware/cors';
import {quotesRouter} from './routes/quotes';
import {uploadsRouter} from './routes/uploads';
import {aiRouter} from './routes/ai';
import {adminRouter} from './routes/admin';
import {catalogRouter} from './routes/catalog';
import {notificationsRouter} from './routes/notifications';
import {userAuthRouter} from './routes/user-auth';
import {userPoliciesRouter} from './routes/user-policies';

const app = new Hono();
const api = new Hono().basePath('/api');

app.get('/', (c) =>
  c.json({
    name: 'Shory SME API',
    status: 'ok',
    health: '/api/health',
  }),
);

api.use('*', corsMiddleware);

api.get('/health', (c) => c.json({status: 'ok'}));
api.route('/quotes', quotesRouter);
api.route('/uploads', uploadsRouter);
api.route('/ai', aiRouter);
api.route('/admin', adminRouter);
api.route('/catalog', catalogRouter);
api.route('/notifications', notificationsRouter);
api.route('/user/auth', userAuthRouter);
api.route('/user', userPoliciesRouter);

app.route('/', api);

export default app;
