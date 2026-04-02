// Types
export {QUOTE_STATUSES, EMIRATES, INDUSTRIES, COVERAGE_TYPES} from './types/quote';
export type {QuoteInput, PricingResult, PricingProvider} from './types/pricing';
export type {ApiError, PaginatedResponse, AdminStatsResponse} from './types/api';

// Schemas
export {createQuoteSchema, updateQuoteSchema, quoteFormSchema} from './schemas/quote';
export type {CreateQuoteInput, UpdateQuoteInput, QuoteFormData} from './schemas/quote';

export {acceptQuoteSchema} from './schemas/policy';
export type {AcceptQuoteInput} from './schemas/policy';

export {uploadMetadataSchema, ALLOWED_FILE_TYPES, MAX_FILE_SIZE} from './schemas/upload';
export type {UploadMetadata} from './schemas/upload';

export {aiRecommendRequestSchema, recommendationSchema} from './schemas/ai';
export type {AiRecommendRequest, Recommendation} from './schemas/ai';

// Customer
export {createCustomerSchema, updateCustomerSchema, CUSTOMER_STAGES, PAYMENT_STATUSES} from './schemas/customer';
export type {CreateCustomerInput, UpdateCustomerInput} from './schemas/customer';

// Incident
export {createIncidentSchema, updateIncidentSchema, INCIDENT_SEVERITIES, INCIDENT_STATUSES} from './schemas/incident';
export type {CreateIncidentInput, UpdateIncidentInput} from './schemas/incident';

// Action
export {dispatchActionSchema, ACTION_TYPES} from './schemas/action';
export type {DispatchActionInput} from './schemas/action';

// Platform
export {updateServiceSchema, SERVICE_CATEGORIES, SERVICE_STATUSES} from './schemas/platform';
export type {UpdateServiceInput} from './schemas/platform';

// Intelligence
export {createSignalSchema, updateSignalSchema, updateTriggerSchema, SIGNAL_CATEGORIES, SIGNAL_SEVERITIES, TRIGGER_STATUSES} from './schemas/intelligence';
export type {CreateSignalInput, UpdateSignalInput, UpdateTriggerInput} from './schemas/intelligence';

// Admin Dashboard Types
export type {DashboardStatsResponse, CustomerPlatformContext, PlaybookResult} from './types/admin-dashboard';

// Data
export {INSURERS} from './data/insurers';
export type {InsurerInfo} from './data/insurers';
