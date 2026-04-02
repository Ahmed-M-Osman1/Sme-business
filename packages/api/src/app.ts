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

const app = new Hono().basePath('/api');

app.use('*', corsMiddleware);

app.get('/health', (c) => c.json({status: 'ok'}));
app.route('/quotes', quotesRouter);
app.route('/uploads', uploadsRouter);
app.route('/ai', aiRouter);
app.route('/admin', adminRouter);
app.route('/catalog', catalogRouter);
app.route('/notifications', notificationsRouter);
app.route('/user/auth', userAuthRouter);
app.route('/user', userPoliciesRouter);

export default app;
