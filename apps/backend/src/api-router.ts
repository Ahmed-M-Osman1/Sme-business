import {Hono} from 'hono';
import {corsMiddleware} from './middleware/cors.js';
import {quotesRouter} from './routes/quotes.js';
import {uploadsRouter} from './routes/uploads.js';
import {aiRouter} from './routes/ai.js';
import {adminRouter} from './routes/admin.js';
import {adminAuthRouter} from './routes/admin-auth.js';
import {catalogRouter} from './routes/catalog.js';
import {notificationsRouter} from './routes/notifications.js';
import {userAuthRouter} from './routes/user-auth.js';
import {userPoliciesRouter} from './routes/user-policies.js';

export const apiRouter = new Hono().basePath('/api');

apiRouter.use('*', corsMiddleware);

apiRouter.route('/quotes', quotesRouter);
apiRouter.route('/uploads', uploadsRouter);
apiRouter.route('/ai', aiRouter);
apiRouter.route('/admin/auth', adminAuthRouter);
apiRouter.route('/admin', adminRouter);
apiRouter.route('/catalog', catalogRouter);
apiRouter.route('/notifications', notificationsRouter);
apiRouter.route('/user/auth', userAuthRouter);
apiRouter.route('/user', userPoliciesRouter);
