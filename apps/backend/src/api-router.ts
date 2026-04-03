import {Hono} from 'hono';
import {corsMiddleware} from './middleware/cors';
import {quotesRouter} from './routes/quotes';
import {uploadsRouter} from './routes/uploads';
import {aiRouter} from './routes/ai';
import {adminRouter} from './routes/admin';
import {adminAuthRouter} from './routes/admin-auth';
import {catalogRouter} from './routes/catalog';
import {notificationsRouter} from './routes/notifications';
import {userAuthRouter} from './routes/user-auth';
import {userPoliciesRouter} from './routes/user-policies';

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
