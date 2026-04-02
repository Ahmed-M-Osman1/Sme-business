import {drizzle} from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/quotes';
import * as adminSchema from './schema/admin-users';
import * as customersSchema from './schema/customers';
import * as incidentsSchema from './schema/incidents';
import * as alertsSchema from './schema/portfolio-alerts';
import * as actionsSchema from './schema/actions';
import * as notificationsSchema from './schema/notifications';
import * as commsSchema from './schema/comms-sequences';
import * as apiServicesSchema from './schema/api-services';
import * as serviceHealthLogsSchema from './schema/service-health-logs';
import * as funnelEventsSchema from './schema/funnel-events';
import * as behaviourMetricsSchema from './schema/behaviour-metrics';
import * as externalSignalsSchema from './schema/external-signals';
import * as midtermTriggersSchema from './schema/midterm-triggers';
import * as peerBenchmarksSchema from './schema/peer-benchmarks';
import * as platformCorrelationsSchema from './schema/platform-correlations';
import * as claimsSchema from './schema/claims';
import * as customerInteractionsSchema from './schema/customer-interactions';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

export const db = drizzle(client, {
  schema: {
    ...schema,
    ...adminSchema,
    ...customersSchema,
    ...incidentsSchema,
    ...alertsSchema,
    ...actionsSchema,
    ...notificationsSchema,
    ...commsSchema,
    ...apiServicesSchema,
    ...serviceHealthLogsSchema,
    ...funnelEventsSchema,
    ...behaviourMetricsSchema,
    ...externalSignalsSchema,
    ...midtermTriggersSchema,
    ...peerBenchmarksSchema,
    ...platformCorrelationsSchema,
    ...claimsSchema,
    ...customerInteractionsSchema,
  },
});
