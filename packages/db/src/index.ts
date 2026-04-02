export {db} from './client';

export {webUsers} from './schema/web-users';
export type {WebUser, NewWebUser} from './schema/web-users';

export {quoteStatusEnum, quotes} from './schema/quotes';
export type {Quote, NewQuote} from './schema/quotes';

export {quoteResults} from './schema/quote-results';
export type {QuoteResult, NewQuoteResult} from './schema/quote-results';

export {policyStatusEnum, policies} from './schema/policies';
export type {Policy, NewPolicy} from './schema/policies';

export {documents} from './schema/documents';
export type {Document, NewDocument} from './schema/documents';

export {aiRecommendations} from './schema/ai-recommendations';
export type {AiRecommendation, NewAiRecommendation} from './schema/ai-recommendations';

export {adminRoleEnum, adminUsers} from './schema/admin-users';
export type {AdminUser, NewAdminUser} from './schema/admin-users';

export {riskLevelEnum, businessTypes} from './schema/business-types';
export type {BusinessType, NewBusinessType} from './schema/business-types';

export {products} from './schema/products';
export type {Product, NewProduct} from './schema/products';

export {insurers} from './schema/insurers';
export type {Insurer, NewInsurer} from './schema/insurers';

export {quoteOptions} from './schema/quote-options';
export type {QuoteOption, NewQuoteOption} from './schema/quote-options';

export {customerStageEnum, paymentStatusEnum, customers} from './schema/customers';
export type {Customer, NewCustomer} from './schema/customers';

export {incidentSeverityEnum, incidentStatusEnum, incidents} from './schema/incidents';
export type {Incident, NewIncident} from './schema/incidents';

export {alertSeverityEnum, portfolioAlerts} from './schema/portfolio-alerts';
export type {PortfolioAlert, NewPortfolioAlert} from './schema/portfolio-alerts';

export {actionStatusEnum, actions} from './schema/actions';
export type {Action, NewAction} from './schema/actions';

export {notifications} from './schema/notifications';
export type {Notification, NewNotification} from './schema/notifications';

export {commsTypeEnum, commsChannelEnum, commsSequences} from './schema/comms-sequences';
export type {CommsSequence, NewCommsSequence} from './schema/comms-sequences';

export {serviceCategoryEnum, serviceStatusEnum, apiServices} from './schema/api-services';
export type {ApiService, NewApiService} from './schema/api-services';

export {serviceHealthLogs} from './schema/service-health-logs';
export type {ServiceHealthLog, NewServiceHealthLog} from './schema/service-health-logs';

export {funnelEvents} from './schema/funnel-events';
export type {FunnelEvent, NewFunnelEvent} from './schema/funnel-events';

export {behaviourMetrics} from './schema/behaviour-metrics';
export type {BehaviourMetric, NewBehaviourMetric} from './schema/behaviour-metrics';

export {signalCategoryEnum, signalSeverityEnum, externalSignals} from './schema/external-signals';
export type {ExternalSignal, NewExternalSignal} from './schema/external-signals';

export {triggerTypeEnum, triggerStatusEnum, midtermTriggers} from './schema/midterm-triggers';
export type {MidtermTrigger, NewMidtermTrigger} from './schema/midterm-triggers';

export {peerBenchmarks} from './schema/peer-benchmarks';
export type {PeerBenchmark, NewPeerBenchmark} from './schema/peer-benchmarks';

export {platformCorrelations} from './schema/platform-correlations';
export type {PlatformCorrelation, NewPlatformCorrelation} from './schema/platform-correlations';

export {claimStatusEnum, claims} from './schema/claims';
export type {Claim, NewClaim} from './schema/claims';

export {interactionTypeEnum, customerInteractions} from './schema/customer-interactions';
export type {CustomerInteraction, NewCustomerInteraction} from './schema/customer-interactions';
