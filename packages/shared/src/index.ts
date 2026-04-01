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

// Data
export {INSURERS} from './data/insurers';
export type {InsurerInfo} from './data/insurers';
